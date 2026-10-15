# YourAppIsDead

The open-source SaaS marketplace at https://yourappisdead.com: free, open-source replacements for the apps you rent every month.

Every app listed has a public repo under a permissive license. So does this site. Anyone can contribute to either.

## Contribute

- **Build a new clone.** See [CONTRIBUTING.md](CONTRIBUTING.md) for naming, licensing and what a listing needs.
- **Improve an existing app.** Each tile links to its repo. Issues and pull requests are open on all of them.
- **Improve this site.** Add a listing to `apps.json`, add the two rewrite entries in `vercel.json`, fix copy, or make the graveyard better.
- **Request an app.** Use the form on the site or [open an issue](https://github.com/tommy-muckstack/yourappisdead/issues/new?template=submit-an-app.yml).

## How it works

Static HTML, no build step. `apps.json` drives the grid; `vercel.json` rewrites each `/<slug>` path to that app's own Vercel project. Two small functions render the share card and OG image for the SaaS Slayer game.

Apache-2.0.
