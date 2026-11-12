# Evermore — Wedding Countdown & Guestbook

## Original problem statement
A website which has a live countdown as its dominant feature. Countdown for a wedding. It should also feature a guestbook where guests can post messages and pictures.

## Architecture
- **Frontend**: React single-page app (`/app/frontend/src/`) — Hero (kinetic line-by-line name reveal + live countdown + parallax photo), floating petals (CSS keyframes), editorial marquee, guestbook (form + masonry wall + admin mode), footer. Fonts: Cormorant Garamond / Plus Jakarta Sans / JetBrains Mono. Palette: ivory #FAF7F2, blush #F5ECE8, wine #4A1525, gold #D4AF37.
- **Backend**: FastAPI (`/app/backend/server.py`) — `POST /api/guestbook` (name + message + optional photo via Emergent object storage), `GET /api/guestbook`, `DELETE /api/guestbook/{id}` (password-protected), `GET /api/photos/{path}` (streams stored photos, cache headers). MongoDB for entries, Emergent object storage for photos.
- **Config**: Wedding details hardcoded in `WEDDING` const in `/app/frontend/src/App.js` (names, date, venue). Admin password in `ADMIN_PASSWORD` env var in `/app/backend/.env`.

## User personas
- **The couple** (placeholder "Emma & Liam", June 12, 2027): own the admin password, moderate the guestbook.
- **Guests**: visit, watch the countdown, leave a name + wish + optional photo. No login.

## Implemented (2026-11-12)
- Kinetic hero: line-by-line name reveal, live ticking countdown (days/hours/min/sec, digit tick animation), parallax hero photo, scroll cue button.
- Floating rose petals across the whole page (pointer-events-none), editorial marquee strips, scroll-reveal animations, grain overlay, custom monogram favicon.
- Guestbook: name + message + optional photo upload (≤8MB, jpg/png/webp/gif), instant insert into polaroid-style masonry wall, photos served via backend proxy with caching.
- Admin "Couple sign-in": password unlocks delete buttons on every wish; wrong password rejected.
- Verified end-to-end: post with photo + photo display, text-only post, delete with correct password, 403 with wrong password, countdown ticking, mobile/tablet/desktop layouts.

## Backlog
- **P0**: Real couple names/date/venue (currently placeholder) — change `WEDDING` const or build a settings panel.
- **P1**: RSVP form (attending/declined + meal choice) with a private responses list for the couple.
- **P1**: Wedding day schedule section (ceremony, reception, dancing timeline).
- **P2**: Photo-only gallery view of all uploaded guest photos; downloadable keepsake PDF of all wishes.
- **P2**: Email notification to the couple on each new guestbook post (Resend integration).

## Test credentials
- Couple/admin password: `evermore2026` (test credential, see /app/memory/test_credentials.md; change via ADMIN_PASSWORD env var).
