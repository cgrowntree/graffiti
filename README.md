# graffiti
Presence-only digital graffiti: read/leave text notes only when physically present.

## Tech
- Static site: Cloudflare Pages (or GitHub Pages)
- API: Cloudflare Worker (routes under `/api/*`)
- DB: Cloudflare D1 (SQLite)
- Style: Airbnb JS + Prettier; EditorConfig

## Quick start
1. Provision D1 + KV in Cloudflare; apply `db/schema.sql`.
2. Deploy Worker with `wrangler deploy`.
3. Create a Cloudflare Pages project for `/public` and attach custom domain `graffiti.<your-domain>`.
4. Add a Worker Route: `graffiti.<your-domain>/api/*` → your worker.
5. Push this repo to GitHub; connect to Pages for CI/CD.

## Dev
```bash
npm i
npm run lint
npm run format
```

## Config knobs
- Cell size: `GEOHASH_PRECISION` in `public/js/main.js` (7 ≈ 153 m; 8 ≈ 38 m)
