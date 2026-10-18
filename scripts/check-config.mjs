// Guards the config that decides what runs on the yourappisdead.com origin.
// Every app is proxied under one domain, so a rewrite to an outside host would share its cookies and storage.
// Run: node scripts/check-config.mjs   (CI runs it on every PR)
import { readFileSync } from 'node:fs';

const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url)));
const apps = JSON.parse(readFileSync(new URL('../apps.json', import.meta.url)));
const errors = [];
const fail = msg => errors.push(msg);
const SLUG = /^[a-z0-9]+isdead$/;
const slugs = new Set(apps.map(a => a.slug));

// Rewrites: only /<slug> and /<slug>/:path* -> https://<slug>.vercel.app/<slug>[/:path*], for slugs listed in apps.json.
for (const r of vercel.rewrites || []) {
  const m = /^\/([a-z0-9]+)(\/:path\*)?$/.exec(r.source || '');
  const slug = m && m[1];
  if (!slug || !SLUG.test(slug)) { fail(`rewrite source ${JSON.stringify(r.source)} must be /<slug>isdead or /<slug>isdead/:path*`); continue; }
  const want = `https://${slug}.vercel.app/${slug}${m[2] || ''}`;
  if (r.destination !== want) fail(`rewrite ${r.source} must point to ${want}, got ${JSON.stringify(r.destination)}`);
  if (!slugs.has(slug)) fail(`rewrite ${r.source} has no matching app in apps.json`);
  const extra = Object.keys(r).filter(k => k !== 'source' && k !== 'destination');
  if (extra.length) fail(`rewrite ${r.source} has unexpected keys: ${extra.join(', ')}`);
}

// Redirects: stay on this site.
for (const r of vercel.redirects || []) {
  const d = String(r.destination || '');
  if (!(d.startsWith('/') && !d.startsWith('//')) && !d.startsWith('https://yourappisdead.com/')) fail(`redirect ${r.source} leaves the site: ${JSON.stringify(d)}`);
}

// Security headers must stay on every path.
const REQUIRED = { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'X-Frame-Options': 'SAMEORIGIN' };
const all = (vercel.headers || []).find(h => h.source === '/(.*)');
for (const [k, v] of Object.entries(REQUIRED)) {
  if (!all?.headers?.some(h => h.key === k && h.value === v)) fail(`missing security header ${k}: ${v} on /(.*)`);
}

// apps.json links stay on the app's own path.
for (const a of apps) {
  if (!SLUG.test(a.slug || '')) { fail(`apps.json slug ${JSON.stringify(a.slug)} must look like <name>isdead`); continue; }
  if (a.href !== `/${a.slug}`) fail(`apps.json ${a.slug}: href must be /${a.slug}`);
  if (a.app != null && !String(a.app).startsWith(`/${a.slug}/`)) fail(`apps.json ${a.slug}: app must start with /${a.slug}/`);
  if (a.repo != null && !/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(a.repo)) fail(`apps.json ${a.slug}: repo must be a github.com repo URL`);
}

if (errors.length) { console.error(errors.map(e => '✗ ' + e).join('\n')); process.exit(1); }
console.log(`✓ ${vercel.rewrites.length} rewrites, ${apps.length} apps, headers OK`);
