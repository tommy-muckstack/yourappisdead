(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COARSE = matchMedia('(pointer: coarse)').matches;
  const P = new URLSearchParams(location.search);
  const $ = id => document.getElementById(id);
  const track = (e, p) => window.yad && window.yad.track(e, p);
  const ban = $('banner'), bantxt = $('bantxt'), beat = $('beat');
  const clean = s => (s || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
  const qs = parseInt(P.get('score'), 10), qn = clean(P.get('name')), qk = parseInt(P.get('slain'), 10);
  const cv = $('game'), cx = cv.getContext('2d'), W = 640, H = 320, G = 268;
  const toGame = (focus) => { $('arcade').scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' }); if (focus) setTimeout(() => cv.focus({ preventScroll: true }), RM ? 0 : 500); };
  if (qs >= 0 && qs <= 999999) {
    bantxt.textContent = `${qn || '???'} SLAYED ${qk > 0 && qk < 10000 ? qk + ' SAAS FOR ' : ''}${qs} POINTS. SEE IF YOUR APP IS IN THE GRAVEYARD!`;
    ban.hidden = false;
    beat.addEventListener('click', () => toGame(true));
    if (location.hash === '#game' || location.hash === '#arcade') addEventListener('load', () => setTimeout(() => toGame(false), 50));
  } else beat.hidden = true;

  const KEY = 'yad.scores.v1', SEEN = 'yad.seen.v1', boardEl = $('board'), form = $('initials'),
        ini = $('ini'), shareBtn = $('share'), shareLi = $('shareli'), shareFb = $('sharefb'), saveBtn = $('savepng');
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const save = l => { try { localStorage.setItem(KEY, JSON.stringify(l.slice(0, 10))); } catch {} };
  let seen = false; try { seen = !!localStorage.getItem(SEEN); } catch {}
  const markSeen = () => { seen = true; try { localStorage.setItem(SEEN, '1'); } catch {} };
  // Server-side run ticket so the leaderboard can bound play time by its own clock.
  const startRun = game => fetch('/api/scores', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ game, start: true }) }).then(r => r.ok ? r.json() : null).then(j => j && j.run).catch(() => null);
  let gtop = null; // global top 10 from /api/scores, null until loaded (or if unavailable)
  const render = () => { const l = gtop || load(); boardEl.innerHTML = (l.length ? l : [{n:'YAD',s:500},{n:'RIP',s:250},{n:'BOO',s:100}])
      .map(e => `<li>${e.n.replace(/[^A-Z]/g,'')} ${String(e.s|0).padStart(6,'0')}</li>`).join(''); };
  const fetchTop = () => fetch('/api/scores?game=slayer').then(r => r.ok ? r.json() : null).then(j => { if (j && j.top) { gtop = j.top; render(); } }).catch(() => {});
  const qualifies = s => { const l = gtop || load(); return s > 0 && (l.length < 10 || s > l[l.length - 1].s); };
  render(); fetchTop();

  // Fake, original SaaS names + colors. Never real brands.
  const FAKES = [['SYNERGIX','#4aa3ff'],['DASHLY','#ff5fa2'],['TIKTRAK','#ffd23f'],['SEATSY','#7cf'],['PIPELYNK','#9b7bff'],
    ['FORMULO','#ff8c1a'],['CHURNIO','#5cf2b5'],['UPSELLR','#ff2a3d'],['LOGINZ','#c0ff4a'],['INVOYCE','#f0a']];
  // Blockers: not stompable, never lethal. They cap how high you can jump (head bumps the underside).
  const BLOCK_AT = 1500;
  const BTYPES = [ // clear = gap between ground and underside. Hero is 32px tall with scythe, so clear-32 = max jump height.
    { k: 'slab',   clear: 84, w: 90,  th: 12, from: 0 },
    { k: 'bar',    clear: 64, w: 150, th: 14, from: 0 },
    { k: 'tunnel', clear: 54, w: 230, th: 18, from: 2400 } ];
  const S = { st: 'title', t: 0, frames: 0, score: 0, slain: 0, enemies: [], blocks: [], parts: [], spawn: 0, bspawn: 0, bump: 0, last: 0, vis: true, msg: '', msgT: 0, firstBlock: true, firstRun: false };
  const hero = { x: 80, y: G, vx: 0, vy: 0 };
  const keys = {};
  // text scale so labels stay readable when the canvas is shrunk on phones
  let T = 1; const fit = () => { const w = cv.getBoundingClientRect().width || W; T = Math.max(1, Math.min(2, (W / w) * 0.78)); };
  fit(); new ResizeObserver(() => { fit(); if (S.st !== 'play') draw(); }).observe(cv);
  const txt = (s, x, y, size, color, align = 'center', maxW = W - 24) => {
    let f = size * T; cx.font = `${f}px "Press Start 2P"`;
    const w = cx.measureText(s).width; if (w > maxW) { f = f * maxW / w; cx.font = `${f}px "Press Start 2P"`; }
    cx.fillStyle = color; cx.textAlign = align; cx.fillText(s, x, y); };

  const reset = () => { Object.assign(S, { st: 'play', frames: 0, score: 0, slain: 0, enemies: [], blocks: [], parts: [], spawn: 60, bspawn: 0, bump: 0, msg: '', msgT: 0, firstBlock: true, firstRun: !seen });
    Object.assign(hero, { x: 80, y: G, vx: 0, vy: 0 }); form.hidden = true; shareBtn.hidden = true; shareLi.hidden = true; shareFb.hidden = true; saveBtn.hidden = true; S.name = null; pauseBtn.textContent = 'PAUSE';
    S.startedAt = Date.now(); S.run = startRun('slayer'); track('arcade_game_started', { game: 'slayer', input: COARSE ? 'touch' : 'keyboard' }); };
  const pauseBtn = $('pause');
  const togglePause = () => { if (S.st === 'play') { S.st = 'pause'; pauseBtn.textContent = 'RESUME'; draw(); } else if (S.st === 'pause') { S.st = 'play'; pauseBtn.textContent = 'PAUSE'; kick(); } };
  const jump = () => { if (S.st === 'pause') return togglePause(); if (S.st !== 'play') return reset(); if (hero.y >= G) hero.vy = -9.5; };
  const inView = () => { const r = cv.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; };

  addEventListener('keydown', e => {
    const ae = document.activeElement;
    if (ae === ini || ae?.id === 'q' || ae?.tagName === 'INPUT') return;
    if (!inView()) return;
    const k = e.key;
    if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','a','d','w'].includes(k) && (ae === cv || ae === document.body || !ae)) e.preventDefault();
    if (k === 'p' || k === 'P' || k === 'Escape') { if (S.st === 'play' || S.st === 'pause') togglePause(); return; }
    if (ae && ae !== cv && ae !== document.body) return; // don't hijack buttons/links
    if (k === 'ArrowUp' || k === ' ' || k === 'w') { if (!e.repeat) jump(); } else if (S.st !== 'play' && k === 'Enter') reset();
    keys[k] = true;
  });
  addEventListener('keyup', e => { keys[e.key] = false; });
  const releaseAll = () => { for (const k in keys) keys[k] = false; };
  addEventListener('blur', () => { releaseAll(); if (S.st === 'play') togglePause(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { releaseAll(); if (S.st === 'play') togglePause(); } kick(); });

  let ts = null;
  cv.addEventListener('touchstart', e => { const t = e.touches[0]; ts = { x: t.clientX, y: t.clientY }; const r = cv.getBoundingClientRect();
    if (S.st !== 'play') { jump(); e.preventDefault(); return; } keys.touch = t.clientX - r.left < r.width / 2 ? -1 : 1; e.preventDefault(); }, { passive: false });
  cv.addEventListener('touchmove', e => { const t = e.touches[0]; if (ts && ts.y - t.clientY > 30) { jump(); ts = null; } e.preventDefault(); }, { passive: false });
  cv.addEventListener('touchend', () => { keys.touch = 0; ts = null; });
  cv.addEventListener('touchcancel', () => { keys.touch = 0; ts = null; });
  cv.addEventListener('click', () => { if (S.st === 'over' || S.st === 'title') reset(); else if (S.st === 'pause') togglePause(); });
  // on-screen pad (touch devices)
  const padHold = { left: 'ArrowLeft', right: 'ArrowRight' };
  document.querySelectorAll('#pad [data-k]').forEach(b => {
    const k = b.dataset.k;
    b.addEventListener('pointerdown', e => { e.preventDefault(); b.classList.add('on'); if (k === 'jump') jump(); else keys[padHold[k]] = true; if (S.st === 'title' || S.st === 'over') {} });
    const up = () => { b.classList.remove('on'); if (padHold[k]) keys[padHold[k]] = false; };
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => b.addEventListener(ev, up));
  });
  pauseBtn.addEventListener('click', () => { if (S.st === 'play' || S.st === 'pause') togglePause(); else if (S.st === 'title' || S.st === 'over') reset(); });

  const ENDPOINT = () => { const n = S.name || (load()[0]?.n) || 'YAD'; return `/api/og?score=${S.score}&name=${n}&slain=${S.slain}`; };
  function over() {
    S.st = 'over'; if (S.firstRun) markSeen();
    const l = load(), dur = S.frames / 60;
    // sanity: score is bounded by slain count and play time (blockers never add score)
    const ok = S.score <= S.slain * 100 + dur * 12 + 10;
    if (ok && qualifies(S.score)) { form.hidden = false; ini.value = ''; ini.focus({ preventScroll: true }); }
    shareBtn.hidden = shareLi.hidden = shareFb.hidden = saveBtn.hidden = !(ok && S.score > 0);
    track('arcade_game_over', { game: 'slayer', score: S.score, duration_s: Math.round(dur), is_new_best: ok && S.score > (l[0]?.s || 0) });
  }
  form.addEventListener('submit', e => { e.preventDefault(); const n = clean(ini.value); if (!n) return;
    const l = load(); l.push({ n, s: S.score, d: Date.now() }); l.sort((a, b) => b.s - a.s); save(l); form.hidden = true; S.name = n; cv.focus();
    track('arcade_score_saved', { game: 'slayer', score: S.score });
    const score = S.score, slain = S.slain, duration = Math.round(S.frames / 60);
    Promise.resolve(S.run).then(run => run ? fetch('/api/scores', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ game: 'slayer', run, name: n, score, slain, duration }) }) : null)
      .then(r => r && r.ok ? r.json() : null).then(j => { if (j && j.top) gtop = j.top; render(); }).catch(render); });
  shareBtn.addEventListener('click', () => {
    const n = S.name || (load()[0]?.n) || 'YAD';
    const url = `https://yourappisdead.com/?score=${S.score}&name=${n}&slain=${S.slain}#game`;
    const text = `I slayed ${S.slain} SaaS subscription${S.slain === 1 ? '' : 's'} for ${S.score} points in SaaS Slayer. See if your app is in the graveyard!`;
    track('arcade_score_shared', { game: 'slayer', score: S.score, channel: 'x' });
    open(`https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'noopener');
  });
  shareLi.addEventListener('click', () => {
    const n = S.name || (load()[0]?.n) || 'YAD';
    const url = `https://yourappisdead.com/?score=${S.score}&name=${n}&slain=${S.slain}#game`;
    track('arcade_score_shared', { game: 'slayer', score: S.score, channel: 'linkedin' });
    open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'noopener');
  });
  shareFb.addEventListener('click', () => {
    const n = S.name || (load()[0]?.n) || 'YAD';
    const url = `https://yourappisdead.com/?score=${S.score}&name=${n}&slain=${S.slain}#game`;
    track('arcade_score_shared', { game: 'slayer', score: S.score, channel: 'facebook' });
    open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'noopener');
  });
  saveBtn.addEventListener('click', async () => {
    const old = saveBtn.textContent; saveBtn.textContent = 'RENDERING…'; saveBtn.disabled = true;
    try {
      const blob = await fetch(ENDPOINT()).then(r => { if (!r.ok) throw 0; return r.blob(); });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = `saas-slayer-${S.score}.png`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    } catch { open(ENDPOINT(), '_blank', 'noopener'); }
    saveBtn.textContent = old; saveBtn.disabled = false;
  });

  const say = (m, f = 150) => { S.msg = m; S.msgT = f; };
  const flyOnScreen = () => S.enemies.some(e => e.fly);
  function spawnBlock() {
    const lvl = (S.score - BLOCK_AT) / 1000; // 0 at threshold, +1 per 1000 pts
    const pool = BTYPES.filter(b => S.score >= BLOCK_AT + b.from);
    const t = pool[Math.floor(Math.random() * pool.length)];
    S.blocks.push({ ...t, x: W + 10, wait: RM ? 70 : 55, move: 2.4 + Math.min(1, lvl * 0.3) + Math.random() * 0.5 });
    S.bspawn = Math.max(170, 420 - lvl * 70) + Math.random() * Math.max(120, 260 - lvl * 40); // frames; gaps shrink as score climbs, always >= ~3s apart
    S.spawn += 30; // give a breather before the next app
    if (S.firstBlock) { S.firstBlock = false; say('BARRIERS CAP YOUR JUMP! TIME YOUR HOPS', 180); }
  }

  function step() {
    S.t++; S.frames++;
    const dir = (keys.ArrowLeft || keys.a ? -1 : 0) + (keys.ArrowRight || keys.d ? 1 : 0) + (keys.touch || 0);
    hero.vx = Math.max(-1, Math.min(1, dir)) * 4; hero.x = Math.max(10, Math.min(W - 30, hero.x + hero.vx));
    hero.vy += 0.5; hero.y = Math.min(G, hero.y + hero.vy); if (hero.y >= G) { hero.y = G; hero.vy = 0; }
    // blockers: head bump / gentle push-down. Never kills.
    if (S.bump > 0) S.bump--;
    for (const b of S.blocks) {
      if (b.wait > 0) continue;
      if (hero.x + 13 > b.x && hero.x - 8 < b.x + b.w) {
        const under = G - b.clear, head = hero.y - 32;
        if (head < under) { if (hero.vy < 0) { hero.vy = 0; if (S.bump === 0) S.bump = 8; } hero.y = Math.min(G, hero.y + Math.min(6, under - head)); }
      }
    }
    const lvl = 1 + S.score / 800;
    if (--S.spawn <= 0) { const [n, c] = FAKES[Math.floor(Math.random() * FAKES.length)];
      const blockNear = S.blocks.length > 0;
      const fly = !blockNear && Math.random() < Math.min(0.35, 0.1 * lvl);
      S.enemies.push({ x: W + 10, y: fly ? G - 70 : G, n, c, vx: -(2 + Math.random() * lvl), fly, ph: Math.random() * 6 });
      S.spawn = Math.max(28, 90 - lvl * 10) + Math.random() * 40; }
    if (S.score >= BLOCK_AT) {
      if (S.bspawn <= 0 && S.blocks.length === 0 && !flyOnScreen()) { if (S.bspawn === 0 && S.firstBlock) S.bspawn = -1; spawnBlock(); }
      else if (S.bspawn > 0) S.bspawn--;
    }
    for (const b of S.blocks) { if (b.wait > 0) b.wait--; else b.x -= b.move; }
    S.blocks = S.blocks.filter(b => b.x + b.w > -20);
    for (const e of S.enemies) { e.x += e.vx; if (e.fly && !RM) e.y = G - 70 + Math.sin(S.t / 15 + e.ph) * 12; }
    for (const e of S.enemies) {
      if (e.dead) continue;
      if (Math.abs(hero.x - e.x) < 22 && Math.abs((hero.y - 12) - (e.y - 12)) < 24) {
        if (hero.vy > 0 && hero.y < e.y - 6) { e.dead = true; hero.vy = -7; S.slain++; S.score += 100; if (S.firstRun) { markSeen(); S.firstRun = false; }
          if (S.slain === 1 && !RM) say('SLAYED! KEEP JUMPING ON APPS', 90);
          for (let i = 0; i < (RM ? 0 : 10); i++) S.parts.push({ x: e.x, y: e.y - 12, vx: (Math.random() - .5) * 5, vy: -Math.random() * 4, l: 30, c: e.c }); }
        else return over();
      }
    }
    S.enemies = S.enemies.filter(e => !e.dead && e.x > -40);
    for (const p of S.parts) { p.x += p.vx; p.y += p.vy; p.vy += .2; p.l--; } S.parts = S.parts.filter(p => p.l > 0);
    if (S.msgT > 0) S.msgT--;
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
    txt(e.n, e.x, y - 4, 8, '#f5f0c8', 'center', 110); }
  function drawBlock(b) { // hazard-striped slab: yellow/black, red glow underside. Clearly not an app icon.
    const bottom = G - b.clear, top = bottom - b.th, x = b.x | 0, warn = b.wait > 0;
    if (warn) { // telegraph at the right edge: flashing red line + warning box
      const on = RM || (S.t >> 3) % 2;
      if (on) { px(W - 10, bottom - 4, 10, 6, '#ff2a3d'); px(W - 34, top - 26, 28, 22, '#ff2a3d'); px(W - 22, top - 22, 4, 10, '#fff'); px(W - 22, top - 9, 4, 4, '#fff'); }
      return; }
    if (b.k === 'bar') { px(x + 10, 0, 4, top, '#555c6b'); px(x + b.w - 14, 0, 4, top, '#555c6b'); }
    if (b.k === 'slab') { px(x + b.w / 2 - 2, 0, 4, top, '#555c6b'); }
    if (b.k === 'tunnel') { px(x + 6, 0, 8, top, '#555c6b'); px(x + b.w - 14, 0, 8, top, '#555c6b'); px(x + b.w / 2 - 4, 0, 8, top, '#555c6b'); }
    px(x - 2, top - 2, b.w + 4, b.th + 4, '#05070a');
    for (let i = 0; i < b.w; i += 16) { px(x + i, top, 8, b.th, '#ffd23f'); px(x + i + 8, top, 8, b.th, '#14161c'); }
    px(x, bottom, b.w, 3, S.bump && !RM && (S.t >> 1) % 2 ? '#fff' : '#ff2a3d');
    if (!RM && (S.t >> 4) % 2) { px(x + 4, bottom + 3, 4, 3, '#ff2a3d'); px(x + b.w - 8, bottom + 3, 4, 3, '#ff2a3d'); }
  }
  function draw() {
    px(0, 0, W, H, '#07040f');
    for (let i = 0; i < 40; i++) px((i * 97 + (RM ? 0 : -S.t * 0.2)) % W + (i * 97 < 0 ? W : 0), (i * 53) % 150, 2, 2, i % 3 ? '#3b2a5a' : '#f5f0c8');
    px(540, 30, 40, 40, '#f5f0c8'); px(552, 40, 6, 6, '#d8d09a');
    for (let i = 0; i < 6; i++) { const tx = ((i * 130 - (RM ? 0 : S.t * 0.6)) % 780 + 780) % 780 - 70; px(tx, G - 30, 26, 30, '#2b2f38'); px(tx + 4, G - 34, 18, 4, '#2b2f38'); px(tx + 6, G - 22, 14, 2, '#555c6b'); }
    px(0, G, W, H - G, '#0f2a14'); px(0, G, W, 3, '#1f5a27');
    S.blocks.forEach(drawBlock);
    S.enemies.forEach(drawFake); S.parts.forEach(p => px(p.x, p.y, 3, 3, p.c)); drawHero(hero.x, hero.y);
    cx.textAlign = 'left';
    txt('SCORE ' + String(S.score).padStart(6, '0'), 14, 8 + 16 * T, 12, '#39ff14', 'left', 300);
    txt('SLAIN ' + S.slain, 14, 12 + 32 * T, 12, '#ff8c1a', 'left', 300);
    if (S.st === 'play' || S.st === 'pause') {
      // coaching: always visible at the start of a round, and for first-ever play until the first slay
      const coach = S.slain === 0 && (S.firstRun || S.frames < 420);
      if (coach) {
        txt('JUMP ON APPS TO SLAY THEM', W / 2, H - 14, 12, '#39ff14');
        if (S.firstRun) { const e = S.enemies.filter(e => e.x > hero.x && !e.dead).sort((a, b) => a.x - b.x)[0];
          if (e) { const by = RM ? 0 : Math.sin(S.t / 6) * 3; txt('▼ STOMP', e.x, (e.fly ? e.y : G) - 58 + by, 9, '#ffd23f', 'center', 90); } }
      } else if (S.msgT > 0) txt(S.msg, W / 2, H - 14, 10, '#ffd23f');
    }
    if (S.st !== 'play') { px(0, 0, W, H, 'rgba(0,0,0,.6)'); const o = S.st;
      txt(o === 'over' ? 'GAME OVER' : o === 'pause' ? 'PAUSED' : 'SAAS SLAYER', W / 2, 122, 24, o === 'over' ? '#ff2a3d' : '#39ff14');
      txt(o === 'over' ? `${S.slain} SUBSCRIPTIONS SLAIN` : o === 'pause' ? 'PRESS P / TAP TO RESUME' : 'JUMP ON APPS TO SLAY THEM', W / 2, 166, 11, '#f5f0c8');
      if (o !== 'pause') txt(COARSE ? 'SWIPE UP OR TAP JUMP TO START' : 'PRESS ↑ / SPACE TO START', W / 2, 206, 11, '#f5f0c8');
      if (o === 'title') txt(COARSE ? 'LEFT/RIGHT PAD TO MOVE' : '← → MOVE   ↑ JUMP   P PAUSE', W / 2, 242, 9, '#b14bff');
      if (o === 'over' && S.score >= BLOCK_AT - 1 && false) {}
    }
  }
  let raf = 0;
  function loop(now) { raf = 0; if (!S.vis || document.hidden) return;
    if (now - S.last > 1000 / 60 - 2) { S.last = now; if (S.st === 'play') step(); else S.t++; draw(); }
    raf = requestAnimationFrame(loop); }
  const kick = () => { if (!raf && S.vis && !document.hidden) raf = requestAnimationFrame(loop); };
  new IntersectionObserver(([e]) => { S.vis = e.isIntersecting; if (!e.isIntersecting && S.st === 'play') togglePause(); kick(); }).observe(cv);
  document.fonts?.ready.then(draw); draw(); kick();
  window.__yadGame = { BTYPES, S, hero, reset, jump, step, draw, BLOCK_AT };
})();
