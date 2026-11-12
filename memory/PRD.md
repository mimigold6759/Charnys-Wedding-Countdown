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

## Updates
- 2026-11-12: Background fully redesigned per user request — whimsical light-pink floral world: hero is a full-bleed blush peony macro photo with a soft pink scrim, all page sections sit over a fixed repeating peony backdrop (opacity ~16%), glassmorphism wish cards and form (white/80 + backdrop-blur + rose shadows), palette shifted to rose/blush (#D87093 primary, #7A2E4B deep rose text, #3B1E28 dark), petals recolored to pink family, footer deep burgundy. Reference image provided by user (blush peonies). Countdown, guestbook, admin delete all re-verified.

## Updates (continued)
- 2026-11-12 (user agentic edits): Site personalized — hero is now "Charny" in huge font with "is getting married!!" pill tagline underneath (single name, no couple names); nav monogram is "YD&C"; marquees read "Charny is getting married!! • January 24, 2027" (Rosewood Hall / forever begins removed); wedding date moved to January 24, 2027 (countdown retargeted); footer and guestbook copy updated to Charny. Venue remains "Rosewood Hall, Napa Valley" placeholder.

## Updates (continued 2)
- 2026-11-12 (user agentic edits, batch 2): Venue changed to "Tiferes Elka 2 School Terrace, Monsey, New York 10977" (hero + footer); both marquees now identical ("Charny is getting married!! • January 24, 2027"); "is getting married!!" tagline taken out of pill bubble (plain italic text); "until forever begins" line removed from hero; "Leave a few words…" subtitle removed from guestbook header; admin button renamed "Couple sign-in" → "Sign in". All verified by screenshot.

## Updates (continued 3)
- 2026-11-12 (user request): Hero restructured per reference screenshot — removed top date/venue line; added "Can't wait to dance together!!" under the countdown; added two-column "The Day" (Sunday, 24 January 2027, Ceremony at 4:30 PM) / "The Venue" (Tiferes Elka, 2 School Terrace, Monsey, New York 10977, with Open in Maps link + Copy address button) block between the dance line and the Leave a wish button. Countdown target set to 2027-01-24T16:30:00. Footer venue line updated to match. Guestbook header: "The Guestbook" label removed, intro sentence restored. Verified via screenshots (desktop + mobile).

## Updates (continued 4)
- 2026-11-12 (user request): Petal shower — posting a wish now triggers a burst of ~40 pink petals raining across the screen for a few seconds (custom "evermore:wish-posted" event fired by GuestbookForm, rendered by a burst layer in Petals.jsx, auto-clears). Verified: posted a test wish, 40 burst petals appeared, wish landed on the wall, burst cleared. Also since last PRD update: "Save the date!" glass pill above hero name; "Charny" restyled in Great Vibes script with soft grey drop shadow; "Ceremony at 4:30 PM" line removed; admin mode now has an Exit link.

## Updates (continued 5)
- 2026-11-12 (user agentic edits, batch 3): Footer now reads "Yaakov Duvid & Charny" in Great Vibes script (pink ampersand), venue removed from footer (date only), and "evermore" replaced with "made with love for Charny ♥". Verified by screenshot.

## Updates (continued 6)
- 2026-11-12 (user request): Wish alerts — every new guestbook wish now emails mimigold6759@gmail.com via Emergent-managed email (EMERGENT_EMAIL_KEY, EMAIL_FROM_NAME=Evermore, WISH_ALERT_EMAIL in backend/.env), fire-and-forget so posting never blocks. Test send returned 202 Accepted; test wish removed after. Requires Deploy for live site; add credits under Universal Key if sends ever show insufficient_credits.

## Backlog
- **P0**: Real couple names/date/venue (currently placeholder) — change `WEDDING` const or build a settings panel.
- **P1**: RSVP form (attending/declined + meal choice) with a private responses list for the couple.
- **P1**: Wedding day schedule section (ceremony, reception, dancing timeline).
- **P2**: Photo-only gallery view of all uploaded guest photos; downloadable keepsake PDF of all wishes.
- **P2**: Email notification to the couple on each new guestbook post (Resend integration).

## Test credentials
- Couple/admin password: `evermore2026` (test credential, see /app/memory/test_credentials.md; change via ADMIN_PASSWORD env var).
