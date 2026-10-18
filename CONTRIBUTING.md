# Contributing to YourAppIsDead

YourAppIsDead is a marketplace of free, open-source clones of the SaaS you rent. Each clone is called `<Product>IsDead` (CalendlyIsDead, SuperhumanIsDead, ...) and lives at `yourappisdead.com/<product>isdead`.

## Ways to help
- **Request an app:** use the "Submit an app to kill" form on the homepage, or open an issue with the *Submit an app to kill* template (label `app-request`).
- **Build a clone:** see below.
- **Fix the homepage / game:** PRs welcome. Use the PR template.

## Adding a new `<Product>IsDead`

Every clone follows the same shape:

1. **One page that mirrors the original's homepage** at `/<product>isdead`. It should feel like the product's own marketing page: same section order and tone, with our own words.
2. **A login page** at `/<product>isdead/login`.
3. **The app itself** behind that login.

Rules:

- **Its own repo.** One repo per app (`<product>isdead`). The marketplace repo (this one) only holds the homepage, `apps.json` and shared docs.
- **Shared auth.** Use the shared Firebase auth backend (email/password + Google). Don't roll your own accounts. Ask a maintainer for the config; never commit keys or secrets.
- **Shared design system, own font.** Use the shared design-system tokens (colours, spacing, components) so the page matches the original's look, and pick a lookalike font that is unique to this app (open-licence fonts only: OFL / Apache / MIT).
- **Original assets only.** No copied logos, icons, illustrations, screenshots, marketing copy or source code from the product you're cloning. Recreate the look with your own art. Use the product name only to say what you replace ("replaces Calendly").
- **Free.** The app and its hosted version are free, with no paywalled features. Licence: MIT.
- **Good citizen.** Works on mobile (360px up), keyboard accessible, respects `prefers-reduced-motion`.

## Getting listed
Open a PR that adds an entry to `apps.json`:

```json
{"name":"ExampleIsDead","slug":"exampleisdead","replaces":"Example","category":"Scheduling",
 "blurb":"One sentence about what it does.","status":"soon","href":"/exampleisdead",
 "sprite":"ghost","repo":null}
```

- `status`: `live`, `soon` (coming soon) or `community` (built by the community).
- `repo`: the URL of the **public** repo, or `null` to show "REPO COMING SOON". Only link repos that are already public.
- Routing (`vercel.json`) is added by a maintainer once your app is deployed: two rewrites to `https://<slug>.vercel.app/<slug>`. Every app shares the yourappisdead.com origin, so CI (`node scripts/check-config.mjs`) rejects rewrites or redirects to any other host.
- `sprite` (optional): one of `ghost`, `ghost2`, `skull`, `bat`, `pumpkin`, `zombie`, `spider`, `cat`, `mummy`, `vampire`, `eyeball`, `frank`, `slime`, `witch`, `imp`, `crow`, `jelly`. Leave it out and one is picked from your slug, avoiding repeats next to its neighbours. Want a new sprite? Add a 16x16 grid to `sprites.js`.

## Pull requests
Keep them small and focused, fill in the PR template, and be nice (see [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)). By contributing to this repo you agree your work is licensed under the Apache-2.0 licence (see [LICENSE](LICENSE)); each clone's own repo uses MIT.
