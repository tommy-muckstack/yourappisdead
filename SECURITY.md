# Security

Please report vulnerabilities privately through GitHub: open the **Security** tab of this repo and choose **Report a vulnerability**. Do not open a public issue for security problems.

What is in scope: this site, its two edge functions (`api/og.js`, `api/share.js`), the leaderboard API (`api/scores.js`) and the Vercel rewrites in `vercel.json`. Each IsDead app has its own repo; report app issues there.

What you should know about the design:

- The site is static. The only server code is the three functions above.
- Nothing users type is stored by this site. Search and the request form never leave the browser (the form opens a GitHub issue). Analytics sends lengths and enums only; see `ANALYTICS.md`.
- The PostHog token in `analytics.js` is a publishable key by design.
- Leaderboard submissions are anonymous three-letter initials plus a score. The API validates and rate-limits them but cannot prove a score was earned; treat the board as fun, not authoritative.
