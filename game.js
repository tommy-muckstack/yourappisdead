(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const P = new URLSearchParams(location.search);
  const ban = document.getElementById('banner');
  const qs = parseInt(P.get('score'), 10), qn = (P.get('name') || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
  if (qs >= 0 && qs <= 999999) { ban.textContent = `${qn || '???'} SLAYED ${qs} POINTS OF SAAS. CAN YOU BEAT IT? ↓ PLAY BELOW`; ban.hidden = false; }

  const cv = document.getElementById('game'), cx = cv.getContext('2d'), W = 640, H = 320, G = 268;
  const KEY = 'yad.scores.v1', boardEl = document.getElementById('board'), form = document.getElementById('initials'),
        ini = document.getElementById('ini'), shareBtn = document.getElementById('share');
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const save = l => localStorage.setItem(KEY, JSON.stringify(l.slice(0, 10)));
  const render = () => { const l = load(); boardEl.innerHTML = (l.length ? l : [{n:'YAD',s:500},{n:'RIP',s:250},{n:'BOO',s:100}])
      .map(e => `<li>${e.n.replace(/[^A-Z]/g,'')} ${String(e.s|0).padStart(6,'0')}</li>`).join(''); };
  render();

  // Fake, original SaaS names + colors. Never real brands.
  const FAKES = [['SYNERGIX','#4aa3ff'],['DASHLY','#ff5fa2'],['TIKTRAK','#ffd23f'],['SEATSY','#7cf'],['PIPELYNK','#9b7bff'],
    ['FORMULO','#ff8c1a'],['CHURNIO','#5cf2b5'],['UPSELLR','#ff2a3d'],['LOGINZ','#c0ff4a'],['INVOYCE','#f0a']];
  const S = { st: 'title', t: 0, score: 0, slain: 0, started: 0, enemies: [], parts: [], spawn: 0, last: 0, vis: true };
  const hero = { x: 80, y: G, vx: 0, vy: 0, w: 20, h: 24 };
  const keys = {};
  const reset = () => { Object.assign(S, { st: 'play', score: 0, slain: 0, enemies: [], parts: [], spawn: 60, started: performance.now() });
    Object.assign(hero, { x: 80, y: G, vx: 0, vy: 0 }); form.hidden = true; shareBtn.hidden = true; };
  const jump = () => { if (S.st !== 'play') return reset(); if (hero.y >= G) hero.vy = -9.5; };

  addEventListener('keydown', e => {
    if (document.activeElement === ini || document.activeElement?.id === 'q') return;
    const inView = cv.getBoundingClientRect().top < innerHeight && cv.getBoundingClientRect().bottom > 0;
    if (!inView) return;
    const k = e.key;
    if (['ArrowLeft','ArrowRight','ArrowUp',' ','a','d','w'].includes(k)) { e.preventDefault(); }
    if (k === 'ArrowUp' || k === ' ' || k === 'w') jump(); else if (S.st !== 'play' && k === 'Enter' && document.activeElement === cv) reset();
    keys[k] = true;
  });
  addEventListener('keyup', e => { keys[e.key] = false; });
  let ts = null;
  cv.addEventListener('touchstart', e => { const t = e.touches[0]; ts = { x: t.clientX, y: t.clientY }; const r = cv.getBoundingClientRect();
    if (S.st !== 'play') { reset(); return; } keys.touch = t.clientX - r.left < r.width / 2 ? -1 : 1; e.preventDefault(); }, { passive: false });
  cv.addEventListener('touchmove', e => { const t = e.touches[0]; if (ts && ts.y - t.clientY > 30) { jump(); ts = null; } e.preventDefault(); }, { passive: false });
  cv.addEventListener('touchend', () => { keys.touch = 0; ts = null; });
  cv.addEventListener('click', () => { if (S.st !== 'play') reset(); });

  function over() {
    S.st = 'over';
    const l = load(), dur = (performance.now() - S.started) / 1000;
    // sanity: score is bounded by slain count and play time
    const ok = S.score <= S.slain * 100 + dur * 12 + 10;
    if (ok && S.score > 0 && (l.length < 10 || S.score > l[l.length - 1].s)) { form.hidden = false; ini.value = ''; ini.focus({ preventScroll: true }); }
    shareBtn.hidden = S.score <= 0;
  }
  form.addEventListener('submit', e => { e.preventDefault(); const n = ini.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3); if (!n) return;
    const l = load(); l.push({ n, s: S.score, d: Date.now() }); l.sort((a, b) => b.s - a.s); save(l); render(); form.hidden = true; S.name = n; cv.focus(); });
  shareBtn.addEventListener('click', () => {
    const n = S.name || (load()[0]?.n) || 'YAD';
    const url = `https://yourappisdead.com/?score=${S.score}&name=${n}`;
    const text = `I slayed ${S.slain} SaaS subscriptions for ${S.score} points in SAAS SLAYER 👻🪦 SaaS is dead.`;
    open(`https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'noopener');
  });

  function step() {
    S.t++;
    const dir = (keys.ArrowLeft || keys.a ? -1 : 0) + (keys.ArrowRight || keys.d ? 1 : 0) + (keys.touch || 0);
    hero.vx = dir * 4; hero.x = Math.max(10, Math.min(W - 30, hero.x + hero.vx));
    hero.vy += 0.5; hero.y = Math.min(G, hero.y + hero.vy); if (hero.y >= G) hero.vy = 0;
    const lvl = 1 + S.score / 800;
    if (--S.spawn <= 0) { const [n, c] = FAKES[Math.floor(Math.random() * FAKES.length)];
      const fly = Math.random() < Math.min(0.35, 0.1 * lvl);
      S.enemies.push({ x: W + 10, y: fly ? G - 70 : G, n, c, vx: -(2 + Math.random() * lvl), fly, ph: Math.random() * 6 });
      S.spawn = Math.max(28, 90 - lvl * 10) + Math.random() * 40; }
    for (const e of S.enemies) { e.x += e.vx; if (e.fly && !RM) e.y = G - 70 + Math.sin(S.t / 15 + e.ph) * 12; }
    for (const e of S.enemies) {
      if (e.dead) continue;
      if (Math.abs(hero.x - e.x) < 22 && Math.abs((hero.y - 12) - (e.y - 12)) < 24) {
        if (hero.vy > 0 && hero.y < e.y - 6) { e.dead = true; hero.vy = -7; S.slain++; S.score += 100;
          for (let i = 0; i < (RM ? 0 : 10); i++) S.parts.push({ x: e.x, y: e.y - 12, vx: (Math.random() - .5) * 5, vy: -Math.random() * 4, l: 30, c: e.c }); }
        else return over();
      }
    }
    S.enemies = S.enemies.filter(e => !e.dead && e.x > -40);
    for (const p of S.parts) { p.x += p.vx; p.y += p.vy; p.vy += .2; p.l--; } S.parts = S.parts.filter(p => p.l > 0);
    if (S.t % 10 === 0) S.score += 1;
  }
  const px = (x, y, w, h, c) => { cx.fillStyle = c; cx.fillRect(x | 0, y | 0, w, h); };
  function drawHero(x, y) { // original pixel slayer: hooded figure with a scythe
    px(x - 8, y - 24, 16, 18, '#2b2f38'); px(x - 6, y - 22, 12, 8, '#05070a'); px(x - 4, y - 19, 2, 2, '#39ff14'); px(x + 2, y - 19, 2, 2, '#39ff14');
    px(x - 8, y - 6, 6, 6, '#2b2f38'); px(x + 2, y - 6, 6, 6, '#2b2f38'); px(x + 9, y - 30, 2, 26, '#8a6a3a'); px(x + 3, y - 32, 10, 3, '#cfd3da'); }
  function drawFake(e) { // generic rounded-square app icon with a made-up glyph
    const x = e.x - 14, y = e.y - 28; px(x + 2, y, 24, 28, e.c); px(x, y + 2, 28, 24, e.c);
    px(x + 6, y + 6, 16, 3, '#fff'); px(x + 6, y + 12, 10, 3, '#fff'); px(x + 6, y + 18, 13, 3, '#fff');
    px(x + 18, y + 12, 4, 4, '#05070a'); if (e.fly) { px(x - 8, y + 8, 8, 4, '#b14bff'); px(x + 28, y + 8, 8, 4, '#b14bff'); }
    cx.fillStyle = '#f5f0c8'; cx.font = '8px "Press Start 2P"'; cx.textAlign = 'center'; cx.fillText(e.n, e.x, y - 4); }
  function draw() {
    px(0, 0, W, H, '#07040f');
    for (let i = 0; i < 40; i++) px((i * 97 + (RM ? 0 : -S.t * 0.2)) % W + (i * 97 < 0 ? W : 0), (i * 53) % 150, 2, 2, i % 3 ? '#3b2a5a' : '#f5f0c8');
    px(540, 30, 40, 40, '#f5f0c8'); px(552, 40, 6, 6, '#d8d09a');
    for (let i = 0; i < 6; i++) { const tx = ((i * 130 - (RM ? 0 : S.t * 0.6)) % 780 + 780) % 780 - 70; px(tx, G - 30, 26, 30, '#2b2f38'); px(tx + 4, G - 34, 18, 4, '#2b2f38'); px(tx + 6, G - 22, 14, 2, '#555c6b'); }
    px(0, G, W, H - G, '#0f2a14'); px(0, G, W, 3, '#1f5a27');
    S.enemies.forEach(drawFake); S.parts.forEach(p => px(p.x, p.y, 3, 3, p.c)); drawHero(hero.x, hero.y);
    cx.textAlign = 'left'; cx.font = '12px "Press Start 2P"'; cx.fillStyle = '#39ff14'; cx.fillText('SCORE ' + String(S.score).padStart(6, '0'), 14, 24);
    cx.fillStyle = '#ff8c1a'; cx.fillText('SLAIN ' + S.slain, 14, 44);
    if (S.st !== 'play') { cx.fillStyle = 'rgba(0,0,0,.6)'; cx.fillRect(0, 0, W, H); cx.textAlign = 'center';
      cx.fillStyle = S.st === 'over' ? '#ff2a3d' : '#39ff14'; cx.font = '24px "Press Start 2P"'; cx.fillText(S.st === 'over' ? 'GAME OVER' : 'SAAS SLAYER', W / 2, 130);
      cx.font = '11px "Press Start 2P"'; cx.fillStyle = '#f5f0c8';
      cx.fillText(S.st === 'over' ? `${S.slain} SUBSCRIPTIONS CANCELLED` : 'STOMP THE SUBSCRIPTIONS', W / 2, 170);
      if (RM || (S.t >> 5) % 2) cx.fillText('PRESS ↑ / SPACE OR TAP TO START', W / 2, 210); if (S.st !== 'play') S.t++; }
  }
  let raf = 0;
  function loop(now) { raf = 0; if (!S.vis || document.hidden) return;
    if (now - S.last > 1000 / 60 - 2) { S.last = now; if (S.st === 'play') step(); draw(); }
    raf = requestAnimationFrame(loop); }
  const kick = () => { if (!raf && S.vis && !document.hidden) raf = requestAnimationFrame(loop); };
  new IntersectionObserver(([e]) => { S.vis = e.isIntersecting; kick(); }).observe(cv);
  document.addEventListener('visibilitychange', kick);
  document.fonts?.ready.then(draw); draw(); kick();
  window.__yadGame = { S, reset, jump };
})();
