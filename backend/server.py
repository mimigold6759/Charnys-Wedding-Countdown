import asyncio
import os
import re
import ipaddress
import logging
import uuid
from contextlib import suppress
from datetime import datetime, timezone
from html import escape
from html.parser import HTMLParser
from pathlib import Path
from typing import List, Optional
from urllib.parse import urlparse

import httpx
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

EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ.get("EMERGENT_EMAIL_KEY")
EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "Evermore")
WISH_ALERT_EMAIL = os.environ.get("WISH_ALERT_EMAIL")

_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = ("reply with your password", "reply with the code", "send your password", "cvv",
             "send us your password", "enter your password below", "confirm your card number",
             "your full card number", "seed phrase", "recovery phrase", "verify your card",
             "social security number", "confirm your bank details")
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)


def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)


def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)


class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []

    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []


def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan()
    scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} != real link host {real!r} (G3)")


async def send_email(*, to: str, subject: str, html: str) -> Optional[str]:
    _assert_safe_email(subject, html)
    payload = {"to": [to], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
    if WISH_ALERT_EMAIL:
        payload["contact_email"] = WISH_ALERT_EMAIL
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{EMAIL_BASE_URL}/api/v1/email/send",
                headers={"X-Email-Key": EMAIL_KEY},
                json=payload,
            )
        resp.raise_for_status()
        return resp.json().get("id")
    except httpx.HTTPStatusError as e:
        try:
            code = e.response.json().get("code", "")
        except ValueError:
            code = ""
        if code in ("insufficient_credits", "integration_disabled", "daily_limit_reached"):
            logging.getLogger(__name__).warning("Email paused: %s", code)
        else:
            logging.getLogger(__name__).error("Email send failed: %s %s", e.response.status_code, e.response.text)
        return None
    except Exception as e:
        logging.getLogger(__name__).error("Email send error: %s", e)
        return None


def wish_alert_html(name: str, message: str, has_photo: bool) -> str:
    photo_line = (
        '<p style="font-size:14px;color:#7A5965">They attached a photo — open the guestbook wall to see it.</p>'
        if has_photo else ""
    )
    return (
        '<table role="presentation" width="100%"><tr><td style="padding:24px;'
        'font-family:Georgia,serif;background:#FFF9FB">'
        f'<p style="font-size:12px;letter-spacing:3px;color:#D87093;text-transform:uppercase">A new wish on the wall</p>'
        f'<p style="font-size:20px;color:#3B1E28;font-style:italic">&ldquo;{escape(message)}&rdquo;</p>'
        f'<p style="font-size:16px;color:#C75B80;font-style:italic">&mdash; {escape(name)}</p>'
        f"{photo_line}"
        f'<p style="font-size:12px;color:#8C827A;margin-top:24px">Sent by {escape(EMAIL_FROM_NAME)}. We never '
        "ask for your password or card details by email.</p></td></tr></table>"
    )

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
    if EMAIL_KEY and WISH_ALERT_EMAIL:
        asyncio.create_task(
            send_email(
                to=WISH_ALERT_EMAIL,
                subject=f"New wish on the wall from {name}",
                html=wish_alert_html(name, message, bool(photo_path)),
            )
        )
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
