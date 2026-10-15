const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const STATUS = { live: ['▶ OPEN APP', 'LIVE'], soon: ['… COMING SOON', 'COMING SOON'], community: ['★ COMMUNITY-BUILT', 'COMMUNITY'] };
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
