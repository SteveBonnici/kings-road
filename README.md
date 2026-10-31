# 87 Kings Road open home

Registration page for the 87 Kings Road, Panmure open home (Saturday 7 November 2026, 2:00-3:30pm).

- Page: `index.html`, served by GitHub Pages at https://stevebonnici.github.io/kings-road/
- Registrations: Cloudflare Worker `kings-road-viewing` (`worker/`), D1 database `kings-road-viewing`
- Admin list + CSV: `https://kings-road-viewing.steve-b8b.workers.dev/admin?key=ADMIN_KEY` (key is a Worker secret, not in this repo)

To change the date or details, edit `index.html` and the subtitle in `worker/src/index.js`, then `npx wrangler deploy` in `worker/`.
