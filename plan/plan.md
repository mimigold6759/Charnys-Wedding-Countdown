# Wedding Countdown & Guestbook — "Evermore"

## What it is
A single-page wedding website whose dominant feature is a live countdown to the big day, paired with a guestbook where guests post messages and photos. Elegant, romantic, cinematic — built to feel like a keepsake, not a template.

## Who it's for
- The couple (placeholder names "Emma & Liam" and a placeholder wedding date, easily changeable later)
- Their guests, who visit to leave wishes and photos without any login

## Core features and experience
- **Kinetic hero countdown**: a full-screen hero with the couple's names revealed line-by-line on load, and a large live countdown (days / hours / minutes / seconds) ticking in real time toward the wedding date. A subtle parallax moment as you scroll.
- **Floating petals**: soft rose petals drift across the screen at all times — the signature ambient touch the user asked for.
- **Editorial marquee**: one slow, elegant scrolling line (e.g. "Emma & Liam — forever begins") separating sections.
- **Guestbook**: guests post a name, a message, and optionally a photo uploaded from their device (no account needed). Entries appear immediately in an elegant masonry-style wall of wishes with photos.
- **Admin delete**: a private password (held by the couple) unlocks the ability to remove unwanted guestbook posts.
- **Motion & craft**: smooth momentum scrolling, scroll-reveal animations on each section, micro-interactions on buttons and cards, and a custom monogram logo used as the favicon. Typography-led, romantic palette (ivory, blush, deep wine/charcoal), generous whitespace.

## Phase 1: what gets built now
1. Single-page site: hero countdown, marquee, guestbook wall, footer with wedding date/venue placeholder.
2. Guestbook backend: post message + optional photo upload, list all entries, admin delete with password.
3. Floating petals animation, smooth scroll, scroll reveals, on-load hero reveal.
4. Admin password set as an environment secret; a test admin password documented for preview.
5. Verified end-to-end: posting a message with a photo, deleting it as admin, countdown ticking correctly.
