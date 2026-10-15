const SPRITES = {
  ghost: '<path fill="#e8fff0" d="M5 1h6v1h2v2h1v11h-2v-1h-1v1H9v-1H7v1H5v-1H4v1H2V4h1V2h2z"/><path fill="#05070a" d="M5 5h2v3H5zM9 5h2v3H9z"/><path fill="#39ff14" d="M6 6h1v1H6zM10 6h1v1h-1z"/>',
  bat: '<path fill="#b14bff" d="M1 5h2v1h2v-1h1V4h1v1h2V4h1v1h1v1h2V5h2v4h-1v1h-2v1h-1v1h-1v1H7v-1H6v-1H5v-1H3V9H2V8H1z"/><path fill="#ff2a3d" d="M6 7h1v1H6zM9 7h1v1H9z"/>',
  pumpkin: '<path fill="#ff8c1a" d="M4 4h8v1h2v1h1v6h-1v1h-2v1H4v-1H2v-1H1V6h1V5h2z"/><path fill="#39ff14" d="M7 1h2v3H7z"/><path fill="#05070a" d="M4 6h3v2H4zM9 6h3v2H9zM5 10h1v1H5zM7 10h2v1H7zM10 10h1v1h-1z"/>',
  skull: '<path fill="#f5f0c8" d="M4 1h8v1h1v1h1v6h-1v2h-1v3H4v-3H3V9H2V3h1V2h1z"/><path fill="#05070a" d="M4 5h3v3H4zM9 5h3v3H9zM7 9h2v1H7zM6 12h1v2H6zM9 12h1v2H9z"/><path fill="#ff8c1a" d="M5 6h1v1H5zM10 6h1v1h-1z"/>'
};
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const STATUS = { live: ['▶ OPEN APP', 'LIVE'], soon: ['… COMING SOON', 'COMING SOON'], community: ['★ COMMUNITY-BUILT', 'COMMUNITY'] };
fetch('/apps.json').then(r => r.json()).then(apps => {
  const grid = document.getElementById('grid'), q = document.getElementById('q'),
        count = document.getElementById('count'), empty = document.getElementById('empty'), chips = [...document.querySelectorAll('#chips [data-f]')];
  let sf = 'all';
  grid.innerHTML = apps.map(a => `
    <li class="tile ${esc(a.status)}" data-status="${esc(a.status)}" data-search="${esc((a.name+' '+a.replaces+' '+a.category+' '+a.blurb+' '+(STATUS[a.status]||[,''])[1]).toLowerCase())}">
      <a class="main" href="${esc(a.href)}">
        <svg class="sprite" viewBox="0 0 16 16" aria-hidden="true" shape-rendering="crispEdges">${SPRITES[a.sprite]||SPRITES.ghost}</svg>
        <span class="rip" aria-hidden="true">R.I.P.</span>
        <h2>${esc(a.name)}</h2>
        <p class="replaces">REPLACES <strong>${esc(a.replaces)}</strong></p>
        <p class="blurb">${esc(a.blurb)}</p>
        <p class="tags"><span>FREE</span><span>OPEN SOURCE</span><span>${esc(a.category)}</span></p>
        <span class="status">${(STATUS[a.status]||STATUS.soon)[0]}</span>
      </a>
      ${a.repo ? `<a class="repo" href="${esc(a.repo)}" target="_blank" rel="noopener">OPEN SOURCE</a>` : `<span class="repo none">REPO COMING SOON</span>`}
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
