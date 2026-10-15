const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const X = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>';
const shareUrl = a => { const url = `https://yourappisdead.com${a.href}`;
  const text = a.status === 'live' ? `${a.replaces} is dead. ${a.name} is a free, open-source replacement. No seats, no monthly toll.` : `${a.replaces} is dead. ${a.name} is a free, open-source replacement, coming soon.`;
  return `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`; };
const GH = '<svg class="gh-ico" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>';
const STATUS = { live: ['OPEN APP →', 'LIVE'], soon: ['COMING SOON', 'COMING SOON'], community: ['COMMUNITY-BUILT', 'COMMUNITY'] };
fetch('/apps.json').then(r => r.json()).then(apps => {
  const grid = document.getElementById('grid'), q = document.getElementById('q'),
        count = document.getElementById('count'), empty = document.getElementById('empty'), chips = [...document.querySelectorAll('#chips [data-f]')];
  let sf = 'all';
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
      <div class="tfoot">
        ${a.repo ? `<a class="repo" href="${esc(a.repo)}" target="_blank" rel="noopener">${GH} Source on GitHub</a>` : `<span class="repo none">${GH} Repo coming soon</span>`}
        <a class="share" href="${esc(shareUrl(a))}" target="_blank" rel="noopener" aria-label="Share ${esc(a.name)} on X">${X} Share on X</a>
      </div>
    </li>`).join('');
  const tiles = [...grid.children];
  const filter = () => {
    const t = q.value.trim().toLowerCase(); let n = 0;
    tiles.forEach(el => { const show = (!t || el.dataset.search.includes(t)) && (sf === 'all' || el.dataset.status === sf); el.hidden = !show; n += show; });
    empty.hidden = n > 0;
    count.textContent = (t || sf !== 'all') ? `${n} ${n === 1 ? 'SOUL' : 'SOULS'} FOUND` : `${apps.length} APPS IN THE GRAVEYARD`;
  };
  q.addEventListener('input', filter);
  chips.forEach(c => c.addEventListener('click', () => { sf = c.dataset.f; chips.forEach(x => x.setAttribute('aria-pressed', x === c)); filter(); }));
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
    window.open('https://github.com/tommy-muckstack/yourappisdead/issues/new?' + p.toString(), '_blank', 'noopener');
  });
})();
