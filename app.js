const SPRITES = {
  ghost: '<path fill="#e8fff0" d="M5 1h6v1h2v2h1v11h-2v-1h-1v1H9v-1H7v1H5v-1H4v1H2V4h1V2h2z"/><path fill="#05070a" d="M5 5h2v3H5zM9 5h2v3H9z"/><path fill="#39ff14" d="M6 6h1v1H6zM10 6h1v1h-1z"/>',
  bat: '<path fill="#b14bff" d="M1 5h2v1h2v-1h1V4h1v1h2V4h1v1h1v1h2V5h2v4h-1v1h-2v1h-1v1h-1v1H7v-1H6v-1H5v-1H3V9H2V8H1z"/><path fill="#ff2a3d" d="M6 7h1v1H6zM9 7h1v1H9z"/>',
  skull: '<path fill="#f5f0c8" d="M4 1h8v1h1v1h1v6h-1v2h-1v3H4v-3H3V9H2V3h1V2h1z"/><path fill="#05070a" d="M4 5h3v3H4zM9 5h3v3H9zM7 9h2v1H7zM6 12h1v2H6zM9 12h1v2H9z"/><path fill="#ff8c1a" d="M5 6h1v1H5zM10 6h1v1h-1z"/>'
};
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
fetch('/apps.json').then(r => r.json()).then(apps => {
  const grid = document.getElementById('grid'), q = document.getElementById('q'),
        count = document.getElementById('count'), empty = document.getElementById('empty');
  grid.innerHTML = apps.map(a => `
    <li class="tile ${a.status}" data-search="${esc((a.name+' '+a.replaces+' '+a.category+' '+a.blurb).toLowerCase())}">
      <a href="${esc(a.href)}">
        <svg class="sprite" viewBox="0 0 16 16" aria-hidden="true" shape-rendering="crispEdges">${SPRITES[a.sprite]||SPRITES.ghost}</svg>
        <span class="rip" aria-hidden="true">R.I.P.</span>
        <h2>${esc(a.name)}</h2>
        <p class="replaces">REPLACES <strong>${esc(a.replaces)}</strong></p>
        <p class="blurb">${esc(a.blurb)}</p>
        <p class="tags"><span>FREE</span><span>OPEN SOURCE</span><span>${esc(a.category)}</span></p>
        <span class="status">${a.status === 'live' ? '▶ PLAY NOW' : '… COMING SOON'}</span>
      </a>
    </li>`).join('');
  const tiles = [...grid.children];
  const filter = () => {
    const t = q.value.trim().toLowerCase(); let n = 0;
    tiles.forEach(el => { const show = !t || el.dataset.search.includes(t); el.hidden = !show; n += show; });
    empty.hidden = n > 0;
    count.textContent = t ? `${n} ${n === 1 ? 'SOUL' : 'SOULS'} FOUND` : `${apps.length} APPS IN THE GRAVEYARD`;
  };
  q.addEventListener('input', filter);
  q.addEventListener('keydown', e => { if (e.key === 'Enter') { const f = tiles.find(x => !x.hidden); f && f.querySelector('a').focus(); } });
  filter();
});
(() => { const q = document.getElementById('q'), mq = matchMedia('(max-width: 600px)');
  const set = () => { q.placeholder = mq.matches ? 'KILL WHICH APP?' : 'WHICH APP DO YOU WANT DEAD?'; };
  set(); mq.addEventListener('change', set); })();
