const track = (e, p) => window.yad && window.yad.track(e, p);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const X = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>';
// Epitaphs: one consistent graveyard voice, picked per app by slug hash so each app always shares the same line.
const EPITAPHS = [
  (r, n) => `Ding dong, ${r} is dead. ${n} does the job for $0 and the code is open.`,
  (r, n) => `Here lies ${r}, dearly departed. Survived by ${n}: free, open source, no seats.`,
  (r, n) => `R.I.P. ${r}. Cause of death: ${n}, a free open-source replacement.`,
  (r, n) => `In loving memory of my ${r} subscription. Laid to rest by ${n}. Free forever.`,
  (r, n) => `Gone but not forgotten: ${r}. Buried by ${n}. Open source, no monthly toll.`,
  (r, n) => `Pour one out for ${r}. ${n} is free, open source, and never sends an invoice.`,
];
// Closing line that sends people to the whole graveyard. Rotates too.
const CLOSERS = [
  'Pay your respects to the other dearly departed:',
  'The rest of the graveyard is this way:',
  'More subscriptions, six feet under:',
  'Visit the graves of its friends:',
  'See who else we buried:',
];
const HUB = 'https://yourappisdead.com';
const appUrl = a => `${HUB}${a.href}`;
// A different line every click: walk the lists starting at a random offset, never repeating until the list is exhausted.
const seq = (n, start) => { let i = start; return () => { i = (i + 1) % n; return i; }; };
const nextEp = {}, nextCl = seq(CLOSERS.length, Math.floor(Math.random() * CLOSERS.length));
const compose = a => {
  nextEp[a.slug] = nextEp[a.slug] || seq(EPITAPHS.length, Math.floor(Math.random() * EPITAPHS.length));
  const id = nextEp[a.slug](), cid = nextCl();
  let line = EPITAPHS[id](a.replaces, a.name); if (a.status !== 'live') line += ' Coming soon.';
  return { id, cid, text: `${line}\n${appUrl(a)}\n\n${CLOSERS[cid]} ${HUB}` };
};
const xUrl = text => `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
const fbUrl = a => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl(a))}`;
const FB = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"/></svg>';
const liUrl = a => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(appUrl(a))}`;
const LI = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>';
const GH = '<svg class="gh-ico" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>';
const STATUS = { live: ['OPEN APP →', 'LIVE'], soon: ['COMING SOON', 'COMING SOON'], community: ['COMMUNITY-BUILT', 'COMMUNITY'] };
const safePath = h => /^\/[a-z0-9][a-z0-9-]*(\/app)?$/.test(String(h)) ? h : '#';
const safeRepo = r => /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(String(r)) ? r : null;
const safeGuide = g => /^\/alternatives\/[a-z0-9-]+$/.test(String(g)) ? g : null;
fetch('/apps.json').then(r => r.json()).then(apps => {
  apps = apps.map(a => ({ ...a, href: safePath(a.app || a.href), repo: safeRepo(a.repo), guide: safeGuide(a.guide), status: ['live', 'soon', 'community'].includes(a.status) ? a.status : 'soon' }));
  const grid = document.getElementById('grid'), q = document.getElementById('q'),
        count = document.getElementById('count'), empty = document.getElementById('empty');
  const sprites = TOMB.assign(apps);
  grid.innerHTML = apps.map((a, i) => `
    <li class="tile ${esc(a.status)}" style="--d:${(i * 0.37 % 2.4).toFixed(2)}s" data-status="${esc(a.status)}" data-search="${esc((a.name+' '+a.replaces+' '+a.category+' '+a.blurb+' '+(STATUS[a.status]||[,''])[1]).toLowerCase())}">
      <a class="main" href="${esc(a.href)}">
        ${TOMB.svg(sprites[i])}
        <span class="rip" aria-hidden="true">R.I.P.</span>
        <h2>${esc(a.name)}</h2>
        <p class="replaces">REPLACES <strong>${esc(a.replaces)}</strong></p>
        <p class="blurb">${esc(a.blurb)}</p>
        <p class="tags"><span>${esc(a.category)}</span></p>
        <span class="status">${(STATUS[a.status]||STATUS.soon)[0]}</span>
      </a>
      ${a.guide ? `<a class="repo guide" href="${esc(a.guide)}">Read the full write-up →</a>` : ''}
      ${a.repo ? `<a class="repo" href="${esc(a.repo)}" target="_blank" rel="noopener">${GH} Open Source on GitHub</a>` : `<span class="repo none">${GH} Repo coming soon</span>`}
      <div class="tfoot">
        <div class="shares">
          <a class="share x" href="https://x.com/intent/post" target="_blank" rel="noopener" aria-label="Share ${esc(a.name)} on X">${X} Share on X</a>
          <a class="share li" href="${esc(liUrl(a))}" target="_blank" rel="noopener" aria-label="Share ${esc(a.name)} on LinkedIn" title="Share on LinkedIn">${LI}</a>
          <a class="share fb" href="${esc(fbUrl(a))}" target="_blank" rel="noopener" aria-label="Share ${esc(a.name)} on Facebook" title="Share on Facebook">${FB}</a>
        </div>
      </div>
    </li>`).join('');
  const tiles = [...grid.children];
  const filter = () => {
    const t = q.value.trim().toLowerCase(); let n = 0;
    tiles.forEach(el => { const show = !t || el.dataset.search.includes(t); el.hidden = !show; n += show; });
    empty.hidden = n > 0;
    count.textContent = t ? `${n} ${n === 1 ? 'SOUL' : 'SOULS'} FOUND` : `${apps.length} APPS IN THE GRAVEYARD`;
  };
  const shown = () => tiles.filter(x => !x.hidden).length;
  let qt = 0;
  q.addEventListener('input', () => { filter(); clearTimeout(qt); const len = q.value.trim().length; if (len) qt = setTimeout(() => track('hub_search_performed', { query_length: len, results_count: shown() }), 700); });
  grid.addEventListener('click', e => {
    const a = e.target.closest('a'); if (!a) return; const li = a.closest('.tile'); if (!li) return;
    const app = apps[tiles.indexOf(li)]; if (!app) return;
    if (a.classList.contains('main')) track('hub_app_opened', { app_slug: app.slug, app_status: app.status, position: tiles.indexOf(li) });
    else if (a.classList.contains('guide')) track('hub_app_guide_clicked', { app_slug: app.slug });
    else if (a.classList.contains('repo')) track('hub_app_repo_clicked', { app_slug: app.slug });
    else if (a.classList.contains('share')) {
      if (a.classList.contains('x')) { const m = compose(app); a.href = xUrl(m.text); track('hub_app_shared', { app_slug: app.slug, channel: 'x', message_id: m.id, closer_id: m.cid }); }
      else track('hub_app_shared', { app_slug: app.slug, channel: a.classList.contains('li') ? 'linkedin' : 'facebook' });
    }
  });
  q.addEventListener('keydown', e => { if (e.key === 'Enter') { const f = tiles.find(x => !x.hidden); f && f.querySelector('a.main').focus(); } });
  filter();
});

// Submit an app: opens a prefilled GitHub issue. Nothing is sent to any server of ours.
(() => {
  const f = document.getElementById('submitform'); if (!f) return;
  f.addEventListener('submit', e => {
    e.preventDefault();
    const v = n => f.elements[n].value.trim();
    const name = v('app').slice(0, 80);
    const p = new URLSearchParams({ template: 'submit-an-app.yml', labels: 'app-request', title: `[App request] ${name}`,
      'app-name': name, 'app-url': v('url').slice(0, 300), why: v('why').slice(0, 1500), github: v('gh').replace(/^@/, '').slice(0, 39), build: v('build') });
    track('hub_app_requested', { wants_to_build: /^Yes/.test(v('build')) ? 'yes' : /^Maybe/.test(v('build')) ? 'maybe' : 'no' });
    window.open('https://github.com/tommy-muckstack/yourappisdead/issues/new?' + p.toString(), '_blank', 'noopener');
  });
})();

// Links marked data-track="<event>" data-target="<target>" (nav, contribute cards)
document.addEventListener('click', e => { const el = e.target.closest('[data-track]'); if (el) track(el.dataset.track, { target: el.dataset.target }); });
