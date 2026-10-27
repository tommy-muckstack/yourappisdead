// Writes the parts of the static site that are derived from apps.json and the page files:
//   1. the server-rendered app grid inside index.html (between <!--grid--> markers), so the
//      homepage HTML lists every app before any JavaScript runs (app.js re-renders it with sprites);
//   2. sitemap.xml, listing every public page.
// Run: node scripts/render-static.mjs          (writes files)
//      node scripts/render-static.mjs --check  (CI: fails if the files are out of date)
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = p => readFileSync(new URL(p, root), 'utf8');
const check = process.argv.includes('--check');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const STATUS = { live: 'OPEN APP →', soon: 'COMING SOON', community: 'COMMUNITY-BUILT' };

const apps = JSON.parse(read('apps.json'));
const tile = a => `<li class="tile ${esc(a.status)}"><a class="main" href="${esc(a.app || a.href)}"><h2>${esc(a.name)}</h2>` +
  `<p class="replaces">REPLACES <strong>${esc(a.replaces)}</strong></p><p class="blurb">${esc(a.blurb)}</p>` +
  `<p class="tags"><span>${esc(a.category)}</span></p><span class="status">${STATUS[a.status] || STATUS.soon}</span></a>` +
  (a.guide ? `<a class="repo guide" href="${esc(a.guide)}">Read the full write-up →</a>` : '') + `</li>`;
const grid = `<!--grid-->\n${apps.map(tile).join('\n')}\n<!--/grid-->`;

const index = read('index.html');
const re = /<!--grid-->[\s\S]*?<!--\/grid-->/;
if (!re.test(index)) { console.error('✗ index.html is missing the <!--grid--> … <!--/grid--> markers'); process.exit(1); }
const nextIndex = index.replace(re, grid);

const pages = ['/', '/about', '/contact', '/privacy'];
for (const dir of ['alternatives', 'guides']) {
  if (!existsSync(new URL(dir + '/', root))) continue;
  const files = readdirSync(new URL(dir + '/', root)).filter(f => f.endsWith('.html')).sort();
  for (const f of files) pages.push(f === 'index.html' ? `/${dir}` : `/${dir}/${f.slice(0, -5)}`);
}
for (const a of apps) if (a.status === 'live') pages.push(a.href);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  pages.map(p => `  <url><loc>https://yourappisdead.com${p === '/' ? '/' : p}</loc></url>`).join('\n') + `\n</urlset>\n`;

const out = [['index.html', nextIndex], ['sitemap.xml', sitemap]];
const stale = out.filter(([f, body]) => !existsSync(new URL(f, root)) || read(f) !== body).map(([f]) => f);
if (check) {
  if (stale.length) { console.error(`✗ out of date: ${stale.join(', ')}. Run: node scripts/render-static.mjs`); process.exit(1); }
  console.log(`✓ static grid (${apps.length} apps) and sitemap (${pages.length} URLs) up to date`);
} else {
  for (const [f, body] of out) writeFileSync(new URL(f, root), body);
  console.log(`wrote ${stale.length ? stale.join(', ') : 'nothing (already up to date)'}; ${apps.length} apps, ${pages.length} URLs`);
}
