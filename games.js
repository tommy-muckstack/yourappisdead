// More arcade: four tiny games on one canvas. Arrow keys + space only. Original art, fake app names.
(() => {
  const cv = document.getElementById('game2'); if (!cv) return;
  const cx = cv.getContext('2d'), W = 640, H = 320;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches, COARSE = matchMedia('(pointer: coarse)').matches;
  const $ = id => document.getElementById(id);
  const track = (e, p) => window.yad && window.yad.track(e, p);
  let startedAt = 0, lastInput = 'keyboard';
  const INK = '#ece7d8', GRN = '#7fd68c', RED = '#ef5f68', PUR = '#a596ff', AMB = '#e6b35a', BG = '#07040f';
  const FAKES = [['SYNERGIX','#4aa3ff'],['DASHLY','#ff5fa2'],['TIKTRAK','#ffd23f'],['SEATSY','#7cf'],['PIPELYNK','#9b7bff'],
    ['FORMULO','#e6a04a'],['CHURNIO','#5cf2b5'],['UPSELLR','#ef5f68'],['LOGINZ','#c0ff4a'],['INVOYCE','#f0a']];
  const rnd = n => Math.random() * n, pick = a => a[Math.floor(rnd(a.length))];
  let T = 1; const fit = () => { const w = cv.getBoundingClientRect().width || W; T = Math.max(1, Math.min(2, (W / w) * 0.78)); };
  const px = (x, y, w, h, c) => { cx.fillStyle = c; cx.fillRect(x | 0, y | 0, w, h); };
  const txt = (s, x, y, size, color, align = 'center', maxW = W - 24) => {
    let f = size * T; cx.font = `${f}px "Press Start 2P"`;
    const w = cx.measureText(s).width; if (w > maxW) { f = f * maxW / w; cx.font = `${f}px "Press Start 2P"`; }
    cx.fillStyle = color; cx.textAlign = align; cx.fillText(s, x, y); };
  const icon = (x, y, w, h, c) => { px(x + 2, y, w - 4, h, c); px(x, y + 2, w, h - 4, c); px(x + 5, y + 5, w - 12, 3, '#fff'); px(x + 5, y + 10, w - 16, 3, '#fff'); };
  const stars = t => { for (let i = 0; i < 40; i++) px((i * 97 + (RM ? 0 : -t * 0.15)) % W + ((i * 97 - t * 0.15) % W < 0 ? W : 0), (i * 53) % H, 2, 2, i % 3 ? '#3b2a5a' : '#f5f0c8'); };

  const BK = 'yad.best.v1';
  const bests = (() => { try { return JSON.parse(localStorage.getItem(BK)) || {}; } catch { return {}; } })();
  const saveBest = (id, s) => { if (s > (bests[id] | 0)) { bests[id] = s; try { localStorage.setItem(BK, JSON.stringify(bests)); } catch {} } };

  const keys = {}; let t = 0, st = 'title', score = 0, cur = null, raf = 0, last = 0, vis = true;

  /* ---------- 1. Paywall Breaker (breakout) ---------- */
  const breaker = { id: 'breaker', name: 'PAYWALL BREAKER', share: n => `I smashed ${n} points of paywalls in Paywall Breaker on YourAppIsDead.`, how: ['SMASH THE PAYWALL BRICKS', COARSE ? 'LEFT/RIGHT PAD  ·  ACTION LAUNCHES' : '← → MOVE PADDLE   SPACE LAUNCH'],
    reset() { this.lvl = 1; this.lives = 3; this.pad = W / 2; this.bricks = []; this.ball = null; this.build(); this.serve(); },
    build() { const rows = ['$99', '$49', '$19', '$9'], cols = 8, bw = 70, gap = 6, x0 = (W - cols * bw - (cols - 1) * gap) / 2;
      this.bricks = []; rows.forEach((p, r) => { for (let c = 0; c < cols; c++) this.bricks.push({ x: x0 + c * (bw + gap), y: 44 + r * 24, w: bw, h: 18, p, v: (4 - r) * 10, c: FAKES[(r * 3 + c) % FAKES.length][1] }); }); },
    serve() { this.ball = { x: this.pad, y: 292, vx: 0, vy: 0, stuck: true }; },
    press(k) { if (k === 'action' && this.ball.stuck) { this.ball.stuck = false; const sp = 3.6 + this.lvl * 0.4; const a = -Math.PI / 2 + (rnd(1) - .5) * 1.2; this.ball.vx = Math.cos(a) * sp; this.ball.vy = Math.sin(a) * sp; } },
    step() { const b = this.ball, dir = (keys.ArrowLeft ? -1 : 0) + (keys.ArrowRight ? 1 : 0);
      this.pad = Math.max(44, Math.min(W - 44, this.pad + dir * 6));
      if (b.stuck) { b.x = this.pad; return; }
      b.x += b.vx; b.y += b.vy;
      if (b.x < 4) { b.x = 4; b.vx *= -1; } if (b.x > W - 4) { b.x = W - 4; b.vx *= -1; } if (b.y < 4) { b.y = 4; b.vy *= -1; }
      if (b.vy > 0 && b.y >= 296 && b.y <= 306 && Math.abs(b.x - this.pad) < 46) { const sp = Math.hypot(b.vx, b.vy); const a = -Math.PI / 2 + ((b.x - this.pad) / 44) * 1.1; b.vx = Math.cos(a) * sp; b.vy = Math.sin(a) * sp; b.y = 295; }
      if (b.y > H + 6) { this.lives--; if (this.lives <= 0) return over(); this.serve(); return; }
      for (const k of this.bricks) { if (k.dead) continue;
        if (b.x > k.x - 4 && b.x < k.x + k.w + 4 && b.y > k.y - 4 && b.y < k.y + k.h + 4) { k.dead = true; score += k.v;
          const fromSide = Math.min(Math.abs(b.x - k.x), Math.abs(b.x - k.x - k.w)) < Math.min(Math.abs(b.y - k.y), Math.abs(b.y - k.y - k.h));
          if (fromSide) b.vx *= -1; else b.vy *= -1; break; } }
      if (this.bricks.every(k => k.dead)) { this.lvl++; score += 100; this.build(); this.serve(); } },
    draw() { for (const k of this.bricks) if (!k.dead) { px(k.x, k.y, k.w, k.h, k.c); txt(k.p, k.x + k.w / 2, k.y + 13, 7, '#07040f', 'center', k.w); }
      px(this.pad - 44, 300, 88, 8, GRN); px(this.pad - 40, 308, 80, 3, '#2f8f44');
      const b = this.ball; px(b.x - 4, b.y - 4, 8, 8, INK);
      txt('LIVES ' + '♥'.repeat(this.lives), W - 14, 8 + 16 * T, 10, RED, 'right', 200); txt('LVL ' + this.lvl, W - 14, 12 + 32 * T, 10, AMB, 'right', 200);
      if (b.stuck && st === 'play') txt(COARSE ? 'TAP ACTION TO LAUNCH' : 'SPACE TO LAUNCH', W / 2, 270, 9, AMB); } };

  /* ---------- 2. Invoice Invaders (star shooter) ---------- */
  const invaders = { id: 'invaders', name: 'INVOICE INVADERS', share: n => `I shot down ${n} points of invoices in Invoice Invaders on YourAppIsDead.`, how: ['SHOOT DOWN THE INVOICES', COARSE ? 'LEFT/RIGHT PAD  ·  ACTION FIRES' : '← → MOVE   SPACE FIRE'],
    reset() { this.x = W / 2; this.lives = 3; this.wave = 1; this.shots = []; this.bombs = []; this.cool = 0; this.parts = []; this.spawn(); },
    spawn() { this.inv = []; const cols = 7, rows = 3; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const [n, col] = FAKES[(r * cols + c) % FAKES.length]; this.inv.push({ x: 90 + c * 68, y: 40 + r * 34, n, c: col, r }); }
      this.dir = 1; this.sp = 0.6 + this.wave * 0.25; },
    press(k) { if (k === 'action') this.fire(); },
    fire() { if (this.cool > 0 || this.shots.length >= 3) return; this.shots.push({ x: this.x, y: 290 }); this.cool = 14; },
    step() { const dir = (keys.ArrowLeft ? -1 : 0) + (keys.ArrowRight ? 1 : 0); this.x = Math.max(16, Math.min(W - 16, this.x + dir * 5));
      if (this.cool > 0) this.cool--; if (keys[' '] || keys.ArrowUp) this.fire();
      let edge = false; for (const i of this.inv) { i.x += this.dir * this.sp; if (i.x < 24 || i.x > W - 24) edge = true; }
      if (edge) { this.dir *= -1; for (const i of this.inv) { i.y += 10; i.x += this.dir * 2; if (i.y > 262) return over(); } }
      if (rnd(1) < 0.012 + this.wave * 0.004 && this.inv.length) { const i = pick(this.inv); this.bombs.push({ x: i.x, y: i.y + 10 }); }
      for (const s of this.shots) s.y -= 7; this.shots = this.shots.filter(s => s.y > -10);
      for (const b of this.bombs) b.y += 3; this.bombs = this.bombs.filter(b => b.y < H + 10);
      for (const s of this.shots) for (const i of this.inv) if (!i.dead && !s.hit && Math.abs(s.x - i.x) < 14 && Math.abs(s.y - i.y) < 12) { i.dead = true; s.hit = true; score += (3 - i.r) * 10;
        for (let k = 0; k < (RM ? 0 : 8); k++) this.parts.push({ x: i.x, y: i.y, vx: (rnd(1) - .5) * 4, vy: (rnd(1) - .5) * 4, l: 24, c: i.c }); }
      this.inv = this.inv.filter(i => !i.dead); this.shots = this.shots.filter(s => !s.hit);
      for (const b of this.bombs) if (!b.hit && Math.abs(b.x - this.x) < 14 && b.y > 282 && b.y < 306) { b.hit = true; this.lives--; if (this.lives <= 0) return over(); }
      this.bombs = this.bombs.filter(b => !b.hit);
      for (const p of this.parts) { p.x += p.vx; p.y += p.vy; p.l--; } this.parts = this.parts.filter(p => p.l > 0);
      if (!this.inv.length) { this.wave++; score += 50; this.bombs = []; this.spawn(); } },
    draw() { for (const i of this.inv) { icon(i.x - 12, i.y - 10, 24, 20, i.c); }
      for (const s of this.shots) px(s.x - 1, s.y - 6, 3, 10, GRN); for (const b of this.bombs) { px(b.x - 3, b.y - 5, 7, 10, INK); txt('$', b.x + .5, b.y + 3, 6, RED, 'center', 10); }
      this.parts.forEach(p => px(p.x, p.y, 3, 3, p.c));
      const x = this.x; px(x - 14, 296, 28, 8, GRN); px(x - 8, 290, 16, 6, GRN); px(x - 2, 284, 4, 6, INK);
      txt('LIVES ' + '♥'.repeat(this.lives), W - 14, 8 + 16 * T, 10, RED, 'right', 200); txt('WAVE ' + this.wave, W - 14, 12 + 32 * T, 10, AMB, 'right', 200); } };

  /* ---------- 3. Churn Bird (flappy) ---------- */
  const bird = { id: 'bird', name: 'CHURN BIRD', share: n => `I flew through ${n} paywall${n === 1 ? '' : 's'} in Churn Bird on YourAppIsDead.`, how: ['FLY BETWEEN THE PAYWALLS', COARSE ? 'TAP ACTION OR THE SCREEN TO FLAP' : 'SPACE OR ↑ TO FLAP'],
    reset() { this.y = 150; this.vy = 0; this.walls = []; this.next = 90; this.started = false; },
    press(k) { if (k === 'action' || k === 'up') { this.started = true; this.vy = -5.6; } },
    step() { if (!this.started) { this.y = 150 + Math.sin(t / 12) * 4; return; }
      this.vy += 0.3; this.y += this.vy;
      if (--this.next <= 0) { const gap = Math.max(86, 118 - score * 1.2); const gy = 60 + rnd(H - 120 - gap); this.walls.push({ x: W + 30, gy, gap, w: 44, passed: false }); this.next = 95; }
      for (const w of this.walls) { w.x -= 2.6; if (!w.passed && w.x + w.w < 120) { w.passed = true; score++; } }
      this.walls = this.walls.filter(w => w.x > -60);
      if (this.y < 8) { this.y = 8; this.vy = 0; } if (this.y > H - 24) return over();
      for (const w of this.walls) if (120 + 9 > w.x && 120 - 9 < w.x + w.w && (this.y - 8 < w.gy || this.y + 8 > w.gy + w.gap)) return over(); },
    draw() { for (const w of this.walls) { px(w.x, 0, w.w, w.gy, PUR); px(w.x, w.gy + w.gap, w.w, H - w.gy - w.gap, PUR); px(w.x - 3, w.gy - 10, w.w + 6, 10, '#5e4fc4'); px(w.x - 3, w.gy + w.gap, w.w + 6, 10, '#5e4fc4');
        cx.save(); cx.translate(w.x + w.w / 2, Math.max(20, w.gy - 30)); cx.rotate(-Math.PI / 2); txt('PAYWALL', 0, 4, 7, INK, 'center', 100); cx.restore(); }
      px(0, H - 16, W, 16, '#0f2a14'); px(0, H - 16, W, 3, '#1f5a27');
      const y = this.y, x = 120; px(x - 9, y - 9, 18, 16, '#e8fff0'); px(x - 9, y + 5, 4, 4, '#e8fff0'); px(x + 1, y + 5, 4, 4, '#e8fff0'); px(x - 5, y - 4, 3, 3, BG); px(x + 2, y - 4, 3, 3, BG); px(x + 9, y, 6, 3, AMB);
      if (!this.started && st === 'play') txt(COARSE ? 'TAP TO FLAP' : 'SPACE TO FLAP', W / 2, 270, 9, AMB); } };

  /* ---------- 4. Renewal Snake ---------- */
  const snake = { id: 'snake', name: 'RENEWAL SNAKE', share: n => `I ate ${n} points of invoices in Renewal Snake on YourAppIsDead.`, how: ['EAT INVOICES. DON\'T EAT YOURSELF', COARSE ? 'USE THE ARROW PAD TO TURN' : '← ↑ → ↓ TO TURN'],
    C: 20, reset() { this.cols = W / this.C; this.rows = H / this.C; this.body = [{ x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 }]; this.dir = { x: 1, y: 0 }; this.q = []; this.every = 9; this.tick = 0; this.food(); },
    food() { do { this.f = { x: Math.floor(rnd(this.cols)), y: Math.floor(rnd(this.rows)) }; } while (this.body.some(b => b.x === this.f.x && b.y === this.f.y)); },
    press(k) { const d = { left: { x: -1, y: 0 }, right: { x: 1, y: 0 }, up: { x: 0, y: -1 }, down: { x: 0, y: 1 } }[k]; if (d) this.q.push(d); },
    step() { if (++this.tick < this.every) return; this.tick = 0;
      while (this.q.length) { const d = this.q.shift(); if (d.x !== -this.dir.x || d.y !== -this.dir.y) { this.dir = d; break; } }
      const h = { x: this.body[0].x + this.dir.x, y: this.body[0].y + this.dir.y };
      if (h.x < 0 || h.y < 0 || h.x >= this.cols || h.y >= this.rows || this.body.some(b => b.x === h.x && b.y === h.y)) return over();
      this.body.unshift(h);
      if (h.x === this.f.x && h.y === this.f.y) { score += 10; this.every = Math.max(4, this.every - (score % 50 === 0 ? 1 : 0)); this.food(); } else this.body.pop(); },
    draw() { const C = this.C; for (let x = 0; x < W; x += C) for (let y = 0; y < H; y += C) if (((x + y) / C) % 2) px(x, y, C, C, 'rgba(255,255,255,.015)');
      px(this.f.x * C + 3, this.f.y * C + 2, C - 6, C - 4, INK); txt('$', this.f.x * C + C / 2 + .5, this.f.y * C + 15, 8, RED, 'center', C);
      this.body.forEach((b, i) => px(b.x * C + 1, b.y * C + 1, C - 2, C - 2, i ? '#2f8f44' : GRN)); } };

  const GAMES = { breaker, invaders, bird, snake };

  /* ---------- shared shell ---------- */
  const share2 = $('share2'), share2li = $('share2li');
  function over() { st = 'over'; const best = bests[cur.id] | 0; saveBest(cur.id, score); share2.hidden = share2li.hidden = !(score > 0);
    track('arcade_game_over', { game: cur.id, score, duration_s: Math.round((Date.now() - startedAt) / 1000), is_new_best: score > best }); }
  function reset() { score = 0; st = 'play'; cur.reset(); pauseBtn.textContent = 'PAUSE'; share2.hidden = share2li.hidden = true; startedAt = Date.now(); track('arcade_game_started', { game: cur.id, input: lastInput }); }
  share2.addEventListener('click', () => {
    const url = `https://yourappisdead.com/#${cur.id}`;
    const text = cur.share(score) + ' Can you beat it?';
    track('arcade_score_shared', { game: cur.id, score, channel: 'x' });
    open(`https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'noopener'); });
  share2li.addEventListener('click', () => {
    track('arcade_score_shared', { game: cur.id, score, channel: 'linkedin' });
    open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://yourappisdead.com/#' + cur.id)}`, '_blank', 'noopener'); });
  const pauseBtn = $('pause2');
  const togglePause = () => { if (st === 'play') { st = 'pause'; pauseBtn.textContent = 'RESUME'; draw(); } else if (st === 'pause') { st = 'play'; pauseBtn.textContent = 'PAUSE'; kick(); } };
  const action = k => { if (st === 'pause') return togglePause(); if (st !== 'play') { if (k === 'action' || k === 'up') reset(); return; } cur.press(k); };
  const inView = el => { const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; };
  const cv1 = $('game');
  const mine = () => { const ae = document.activeElement; if (ae === cv) return true; if (ae && ae !== document.body) return false; return inView(cv) && !(cv1 && inView(cv1)); };
  addEventListener('keydown', e => {
    const ae = document.activeElement; if (ae?.tagName === 'INPUT' || ae?.tagName === 'TEXTAREA' || ae?.tagName === 'SELECT') return;
    if (!mine()) return; const k = e.key; lastInput = 'keyboard';
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(k)) e.preventDefault();
    if (k === 'p' || k === 'P' || k === 'Escape') { if (st === 'play' || st === 'pause') togglePause(); return; }
    if (e.repeat) { keys[k] = true; return; }
    if (k === ' ') action('action'); else if (k === 'ArrowUp') action('up'); else if (k === 'ArrowDown') action('down'); else if (k === 'ArrowLeft') action('left'); else if (k === 'ArrowRight') action('right'); else if (k === 'Enter' && st !== 'play') reset();
    keys[k] = true; });
  addEventListener('keyup', e => { keys[e.key] = false; });
  const releaseAll = () => { for (const k in keys) keys[k] = false; };
  addEventListener('blur', () => { releaseAll(); if (st === 'play') togglePause(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { releaseAll(); if (st === 'play') togglePause(); } kick(); });
  cv.addEventListener('pointerdown', e => { if (e.pointerType === 'touch') lastInput = 'touch'; cv.focus({ preventScroll: true }); if (st === 'over' || st === 'title') reset(); else if (st === 'pause') togglePause(); else if (cur === bird) action('action'); e.preventDefault(); });
  const PAD = { left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown', action: ' ' };
  document.querySelectorAll('#pad2 [data-k]').forEach(b => { const k = b.dataset.k;
    b.addEventListener('pointerdown', e => { e.preventDefault(); lastInput = 'touch'; b.classList.add('on'); action(k); keys[PAD[k]] = true; });
    const up = () => { b.classList.remove('on'); keys[PAD[k]] = false; };
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => b.addEventListener(ev, up)); });
  pauseBtn.addEventListener('click', () => { if (st === 'play' || st === 'pause') togglePause(); else reset(); });

  const tabs = [...document.querySelectorAll('#gametabs [data-g]')], how = $('gamehow'), cabS = $('cab-slayer'), cabM = $('cab-more');
  const SLAYER_HOW = how.innerHTML;
  const select = id => {
    tabs.forEach(b => b.setAttribute('aria-pressed', b.dataset.g === id));
    if (id === 'slayer') { cabM.hidden = true; cabS.hidden = false; how.innerHTML = SLAYER_HOW; if (st === 'play') togglePause(); return; }
    cur = GAMES[id] || breaker; st = 'title'; score = 0; cur.reset(); pauseBtn.textContent = 'PAUSE';
    how.textContent = cur.how[0] + '. ' + cur.how[1].replace(/\s+·\s+/g, '. ').replace(/ {2,}/g, ', ') + '. P pauses.';
    cabS.hidden = true; cabM.hidden = false; share2.hidden = share2li.hidden = true; draw(); };
  tabs.forEach(b => b.addEventListener('click', () => { track('arcade_game_selected', { game: b.dataset.g }); select(b.dataset.g); (b.dataset.g === 'slayer' ? cv1 : cv).focus({ preventScroll: true }); }));
  function draw() { px(0, 0, W, H, BG); stars(t); cur.draw();
    txt('SCORE ' + String(score).padStart(5, '0'), 14, 8 + 16 * T, 10, GRN, 'left', 260); txt('BEST ' + String(bests[cur.id] | 0).padStart(5, '0'), 14, 12 + 32 * T, 10, PUR, 'left', 260);
    if (st !== 'play') { px(0, 0, W, H, 'rgba(0,0,0,.62)');
      txt(st === 'over' ? 'GAME OVER' : st === 'pause' ? 'PAUSED' : cur.name, W / 2, 122, 22, st === 'over' ? RED : GRN);
      txt(st === 'over' ? `${score} POINTS` + (score >= (bests[cur.id] | 0) && score > 0 ? '  ·  NEW BEST' : '') : st === 'pause' ? 'PRESS P / TAP TO RESUME' : cur.how[0], W / 2, 166, 11, INK);
      if (st !== 'pause') txt(COARSE ? 'TAP TO START' : 'PRESS SPACE TO START', W / 2, 206, 11, INK);
      if (st === 'title') txt(cur.how[1], W / 2, 242, 9, PUR); } }
  function loop(now) { raf = 0; if (!vis || document.hidden) return; if (now - last > 1000 / 60 - 2) { last = now; t++; if (st === 'play') cur.step(); draw(); } raf = requestAnimationFrame(loop); }
  const kick = () => { if (!raf && vis && !document.hidden) raf = requestAnimationFrame(loop); };
  fit(); new ResizeObserver(() => { fit(); if (st !== 'play') draw(); }).observe(cv);
  new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (!vis && st === 'play') togglePause(); kick(); }).observe(cv);
  cur = breaker; cur.reset();
  const h = location.hash.slice(1); select(h in GAMES ? h : 'slayer');
  if (h in GAMES) addEventListener('load', () => setTimeout(() => $('arcade').scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' }), 50));
  document.fonts?.ready.then(draw); kick();
})();
