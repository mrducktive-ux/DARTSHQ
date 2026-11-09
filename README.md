# DARTS HQ

A mobile-first darts scoring app for GitHub Pages.

## Files
- `index.html` — app structure and screens
- `styles.css` — professional dark styling and responsive layout
- `app.js` — dartboard, scoring, profiles, history, practice, checkout and tournaments
- `manifest.json` — installable web app metadata

## Run locally
Open `index.html` in a browser.

## Publish with GitHub Pages
1. Create a repository called `darts-hq`.
2. Upload all four files to the repository root (not inside another folder).
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select `main` and `/ (root)`, then Save.
6. Wait for GitHub Pages to publish the site.

Your site will be at `https://YOUR-USERNAME.github.io/darts-hq/`.

## Notes
- Match history, profiles and tournaments are stored in this browser on this device using localStorage.
- No account or server is required.
- V1.0 is a starter build. Tournament brackets, cloud sync, richer statistics and fully validated checkout routes are good next upgrades.
