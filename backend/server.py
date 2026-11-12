import asyncio
import os
import logging
import uuid
from contextlib import suppress
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, File, Form, HTTPException, Response, UploadFile
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from pymongo import ASCENDING, DESCENDING, IndexModel
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', '')
APP_NAME = "evermore"
MAX_UPLOAD_BYTES = 8 * 1024 * 1024
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}

STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
storage_key = None


def init_storage(force: bool = False):
    global storage_key
    if storage_key and not force:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


INDEXES: dict[str, list[IndexModel]] = {
    "guestbook_entries": [
        IndexModel([("id", ASCENDING)], name="id", unique=True),
        IndexModel([("created_at", DESCENDING)], name="created_at_desc"),
    ],
}


async def ensure_indexes() -> None:
    for collection, models in INDEXES.items():
        for model in models:
            try:
                await db[collection].create_indexes([model])
            except Exception as exc:
                logging.getLogger(__name__).error("ensure_indexes(%s.%s): %s", collection, model.document["name"], exc)


app = FastAPI()
api_router = APIRouter(prefix="/api")


class Entry(BaseModel):
    id: str
    name: str
    message: str
    photo_path: Optional[str] = None
    created_at: str


class AdminDeleteRequest(BaseModel):
    password: str


def serialize(doc: dict) -> dict:
    return {
        "id": doc["id"],
        "name": doc["name"],
        "message": doc["message"],
        "photo_path": doc.get("photo_path"),
        "created_at": doc["created_at"],
    }


@api_router.get("/")
async def root():
    return {"message": "Evermore API"}


@api_router.post("/guestbook", response_model=Entry)
async def create_entry(
    name: str = Form(...),
    message: str = Form(...),
    photo: Optional[UploadFile] = File(None),
):
    name = name.strip()[:80]
    message = message.strip()[:1000]
    if not name or not message:
        raise HTTPException(status_code=400, detail="Name and message are required")

    photo_path = None
    if photo and photo.filename:
        content_type = photo.content_type or "application/octet-stream"
        if content_type not in ALLOWED_TYPES:
            raise HTTPException(status_code=400, detail="Only JPG, PNG, WebP or GIF images are allowed")
        data = await photo.read()
        if len(data) > MAX_UPLOAD_BYTES:
            raise HTTPException(status_code=400, detail="Photo must be under 8MB")
        ext = photo.filename.rsplit(".", 1)[-1].lower() if "." in photo.filename else "jpg"
        path = f"{APP_NAME}/guestbook/{uuid.uuid4()}.{ext}"
        try:
            result = put_object(path, data, content_type)
            photo_path = result["path"]
        except Exception as e:
            logging.getLogger(__name__).error("photo upload failed: %s", e)
            raise HTTPException(status_code=502, detail="Photo upload failed, please try again")

    doc = {
        "id": str(uuid.uuid4()),
        "name": name,
        "message": message,
        "photo_path": photo_path,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.guestbook_entries.insert_one(doc)
    return serialize(doc)


@api_router.get("/guestbook", response_model=List[Entry])
async def list_entries():
    docs = await db.guestbook_entries.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [serialize(d) for d in docs]


@api_router.delete("/guestbook/{entry_id}")
async def delete_entry(entry_id: str, body: AdminDeleteRequest):
    if not ADMIN_PASSWORD or body.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=403, detail="Incorrect password")
    result = await db.guestbook_entries.update_one(
        {"id": entry_id}, {"$set": {"is_deleted": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Entry not found")
    await db.guestbook_entries.delete_one({"id": entry_id})
    return {"ok": True}


@api_router.get("/photos/{path:path}")
async def serve_photo(path: str):
    try:
        data, content_type = get_object(path)
    except Exception:
        raise HTTPException(status_code=404, detail="Photo not found")
    return Response(
        content=data,
        media_type=content_type,
        headers={"Cache-Control": "public, max-age=86400"},
    )


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup():
    app.state.index_task = asyncio.create_task(ensure_indexes())
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.error("Storage init failed: %s", e)


@app.on_event("shutdown")
async def shutdown_db_client():
    app.state.index_task.cancel()
    with suppress(asyncio.CancelledError):
        await app.state.index_task
    client.close()
