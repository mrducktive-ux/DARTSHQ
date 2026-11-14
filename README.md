# DARTS HQ 2.0 — Elite Offline Edition

A mobile-first, offline-first darts dashboard. No account, Supabase project, API key or paid service is required.

## Run it
- Open `index.html` in a browser for a quick local preview.
- For PWA installation and reliable offline caching, host the folder on GitHub Pages or another static HTTPS host.
- On GitHub: create a repository, upload all files and folders, then enable Pages from the repository's Settings.

## Included
- Dashboard and local player profiles
- X01 match setup (301/501/701), AI opponent and local pass-and-play
- Dart entry, visit totals, bust checks and match records
- Cricket mode selection and basic target mark tracking
- Training session log
- Round-robin and first-round knockout fixture creation
- Checkout route finder
- Learning guides
- Match history and basic statistics
- Custom appearance and match settings
- JSON backup export/import and local reset
- PWA manifest and service worker

## Important limitations
This is an offline starter build, not certified tournament software. The AI uses simulated scoring rather than a trained model. Online multiplayer between separate devices is not included; that requires a server or realtime backend. Cricket scoring, tournament progression, checkout suggestions and statistics are useful starter implementations but should be validated and expanded before competitive use. The current build does not implement full official Cricket closure/points victory logic or automatic later knockout rounds.

## Data and privacy
Application data is stored in the current browser's local storage. It does not sync to another device. Export a JSON backup before clearing browser data. External font loading may require internet; the app itself remains usable with system fonts if unavailable.
