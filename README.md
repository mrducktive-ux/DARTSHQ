# DARTS HQ 2.0

Premium dark-and-gold darts scoring web app, designed for GitHub Pages and mobile browsers.

## Install on GitHub
1. Upload the contents of this folder to the root of your existing `darts-hq` repository.
2. In GitHub, open **Settings → Pages**.
3. Set the source to **Deploy from a branch**, choose `main` and `/ (root)`.
4. Open the published Pages URL.

## Supabase
The browser app is configured with the project's Supabase URL and publishable key. Never put a Supabase secret/service-role key in browser code. The SQL schema and RLS policies must be installed before cloud data operations can work.

## Current implementation status
Working in this build:
- Responsive premium dark-and-gold dashboard and navigation
- Local player profiles
- X01 setup for 301, 501 and 701
- One-to-four-player local pass-and-play
- Manual visit scoring, quick score selector, bust rollback and undo
- Match history and JSON export
- Training session log
- Tournament creation and learning-guide completion tracking
- Supabase email/password sign-in, registration and password reset UI

Not yet complete:
- Server-side cloud sync for match history, visits, training and tournaments
- Dart-by-dart scoring and true double-out final-dart validation
- Full legs/sets, Cricket, advanced player statistics and tournament bracket/round-robin progression
- Full installable PWA offline cache

This is an honest working foundation, not a claim that every planned DARTS HQ 2.0 feature is complete. Test before relying on match results. The project uses localStorage for the current offline/local data store.
