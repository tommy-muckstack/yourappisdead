import { ImageResponse } from '@vercel/og';
export const config = { runtime: 'edge' };

// ---- pixel scene (SVG, crispEdges). Original art only. ----
const PAL = { K: '#05070a', D: '#2b2f38', L: '#4a5160', G: '#39ff14', W: '#cfd3da', B: '#8a6a3a', R: '#ff2a3d', O: '#ff8c1a', P: '#b14bff', Y: '#f5f0c8', S: '#3b414d', M: '#555c6b', E: '#1f5a27' };
const art = (rows, x, y, s) => rows.map((r, j) => [...r].map((c, i) => PAL[c] ? `<rect x="${x + i * s}" y="${y + j * s}" width="${s}" height="${s}" fill="${PAL[c]}"/>` : '').join('')).join('');
const REAPER = [
  '.........WWWWWW.',
  '........WW....WW',
  '...DDDD.B.....W.',
  '..DDDDDDB.......',
  '..DKKKKDB.......',
  '..DKGKGDB.......',
  '..DKKKKDB.......',
  '..DDDDDDB.......',
  '.DDDDDDDDB......',
  '.DDDDDDDDB......',
  '.DDDLDDDDB......',
  '.DDDDDDDDB......',
  '.DDDDDDDDB......',
  '.DDDDDDDDB......',
  'DDDDDDDDDB......',
  'D.D.D.D.DB......' ];
const STONE = [
  '..SSSSSS..',
  '.SMMMMMMS.',
  'SMMMMMMMMS',
  'SMMSMMSMMS',
  'SMMMSSMMMS',
  'SMMSMMSMMS',
  'SMMMMMMMMS',
  'SMMMMMMMMS',
  'SMMMMMMMMS',
  'SMMMMMMMMS' ];
const STONE2 = [
  '...SSSSSS...',
  '..SMMMMMMS..',
  '.SMMMMMMMMS.',
  'SMMMMMMMMMMS',
  'SMMMMMMMMMMS',
  'SMMMMMMMMMMS',
  'SMMMMMMMMMMS',
  'SMMMMMMMMMMS',
  'SMMMMMMMMMMS',
  'SMMMMMMMMMMS',
  'SMMMMMMMMMMS',
  'SSSSSSSSSSSS' ];
const CROSS = [
  '...SS...',
  '...MS...',
  'SSSMSSSS',
  'MMMMMMMS',
  '...MS...',
  '...MS...',
  '...MS...',
  '...MS...',
  '...MS...',
  '..SMMS..' ];
const icon = (rows, x, y, s, col) => rows.map((r, j) => [...r].map((ch, i) => ch === '.' ? '' : `<rect x="${x + i * s}" y="${y + j * s}" width="${s}" height="${s}" fill="${ch === 'W' ? '#ffffff' : col}"/>`).join('')).join('');
const ICONROWS = ['.cccccccc.', 'cccccccccc', 'cWWWWWWWWc', 'cccccccccc', 'cWWWWWcccc', 'cccccccccc', 'cWWWWWWccc', 'cccccccccc', 'cccccccccc', '.cccccccc.'];

function scene(rng) {
  const GY = 470; let o = '';
  o += `<rect width="1200" height="630" fill="#07040f"/>`;
  for (let y = 0; y < 460; y += 46) { const a = Math.max(0, 0.22 - y / 2400); o += `<rect y="${y}" width="1200" height="46" fill="#b14bff" opacity="${a.toFixed(3)}"/>`; }
  for (let i = 0; i < 70; i++) { const x = Math.floor(rng() * 1180), y = Math.floor(rng() * 400), big = rng() > 0.8; o += `<rect x="${x}" y="${y}" width="${big ? 6 : 4}" height="${big ? 6 : 4}" fill="${rng() > 0.5 ? '#f5f0c8' : '#5b4a82'}"/>`; }
  // moon
  o += art(['..YYYY..', '.YYYYYY.', 'YYYYyYYY', 'YYYYYYYY', 'YYyYYYYY', 'YYYYYYyY', '.YYYYYY.', '..YYYY..'].map(r => r.replace(/y/g, 'S')), 1010, 36, 14).replace(/#3b414d/g, '#d8d09a');
  // ground
  o += `<rect y="${GY}" width="1200" height="160" fill="#0f2a14"/><rect y="${GY}" width="1200" height="8" fill="#1f5a27"/>`;
  for (let x = 0; x < 1200; x += 40) o += `<rect x="${x + (x / 40 % 3) * 9}" y="${GY + 22}" width="14" height="4" fill="#1f5a27"/>`;
  // left: reaper + tombstones
  o += art(STONE, 24, GY - 100, 10) + art(CROSS, 124, GY - 80, 10);
  o += art(REAPER, 196, GY - 160, 10);
  // right: tombstones + fake SaaS icons (no text, no brands)
  o += icon(ICONROWS, 900, GY - 100, 10, '#4aa3ff') + icon(ICONROWS, 1010, GY - 100, 10, '#ff5fa2');
  o += icon(ICONROWS, 955, GY - 210, 10, '#ffd23f');
  o += art(STONE, 1110, GY - 100, 8);
  // zap marks above stomped icons
  o += `<rect x="1060" y="${GY - 128}" width="8" height="8" fill="#39ff14"/><rect x="1075" y="${GY - 146}" width="8" height="8" fill="#ff8c1a"/><rect x="940" y="${GY - 236}" width="8" height="8" fill="#ff2a3d"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" shape-rendering="crispEdges">${o}</svg>`;
}
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const b64 = s => { const bytes = new TextEncoder().encode(s); let bin = ''; for (const b of bytes) bin += String.fromCharCode(b); return btoa(bin); };
const d = (style, children) => ({ type: 'div', props: { style: { display: 'flex', ...style }, children } });

// Site card: title over a row of tombstones engraved with the apps that died.
function siteScene(rng, n) {
  const GY = 480; let o = '';
  o += `<rect width="1200" height="630" fill="#07040f"/>`;
  for (let y = 0; y < 460; y += 46) { const a = Math.max(0, 0.22 - y / 2400); o += `<rect y="${y}" width="1200" height="46" fill="#b14bff" opacity="${a.toFixed(3)}"/>`; }
  for (let i = 0; i < 80; i++) { const x = Math.floor(rng() * 1180), y = Math.floor(rng() * 300), big = rng() > 0.8; o += `<rect x="${x}" y="${y}" width="${big ? 6 : 4}" height="${big ? 6 : 4}" fill="${rng() > 0.5 ? '#f5f0c8' : '#5b4a82'}"/>`; }
  o += art(['..YYYY..', '.YYYYYY.', 'YYYYyYYY', 'YYYYYYYY', 'YYyYYYYY', 'YYYYYYyY', '.YYYYYY.', '..YYYY..'].map(r => r.replace(/y/g, 'S')), 1060, 40, 12).replace(/#3b414d/g, '#d8d09a');
  o += `<rect y="${GY}" width="1200" height="150" fill="#0f2a14"/><rect y="${GY}" width="1200" height="8" fill="#1f5a27"/>`;
  for (let x = 0; x < 1200; x += 40) o += `<rect x="${x + (x / 40 % 3) * 9}" y="${GY + 24}" width="14" height="4" fill="#1f5a27"/>`;
  // back row (small, dim) then front row of engraved stones
  for (let i = 0; i < 9; i++) { const x = 30 + i * 132 + (i % 2) * 20; o += art(STONE, x, GY - 150, 7).replace(/#555c6b/g, '#3b414d').replace(/#3b414d/g, '#2b2f38'); }
  for (let i = 0; i < n; i++) { const x = 24 + i * 156; o += art(STONE2, x, GY - 144, 12); o += `<rect x="${x + 6}" y="${GY - 4}" width="132" height="6" fill="#1f5a27"/>`; }
  o += art(REAPER, 1112, GY - 80, 5);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" shape-rendering="crispEdges">${o}</svg>`;
}
export default async function handler(req) {
  const u = new URL(req.url);
  const score = Math.min(999999, Math.max(0, parseInt(u.searchParams.get('score') || '0', 10) || 0));
  const slain = Math.min(9999, Math.max(0, parseInt(u.searchParams.get('slain') || '0', 10) || 0));
  const name = (u.searchParams.get('name') || '???').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3) || '???';
  const font = await fetch(new URL('/fonts/PressStart2P.ttf', u.origin)).then(r => r.arrayBuffer());
  if (!u.searchParams.has('score')) {
    const apps = await fetch(new URL('/apps.json', u.origin)).then(r => r.json()).catch(() => []);
    const names = apps.filter(a => a.status === 'live').map(a => String(a.replaces).toUpperCase().replace(/\.AI$/, '')).filter(x => x.length <= 9).slice(0, 7);
    const n = names.length || 7, GY = 480;
    const bg2 = 'data:image/svg+xml;base64,' + b64(siteScene(mulberry(11), n));
    const stones = names.map((nm, i) => d({ position: 'absolute', left: 24 + i * 156, top: GY - 108, width: 144, flexDirection: 'column', alignItems: 'center' }, [
      d({ fontSize: 11, color: '#8a90a0' }, 'R.I.P.'),
      d({ fontSize: nm.length > 7 ? 11 : 13, color: '#f5f0c8', marginTop: 10 }, nm),
    ]));
    const el2 = d({ width: 1200, height: 630, position: 'relative', fontFamily: 'P', color: '#f5f0c8' }, [
      { type: 'img', props: { src: bg2, width: 1200, height: 630, style: { position: 'absolute', left: 0, top: 0 } } },
      d({ position: 'absolute', left: 0, top: 70, width: 1200, justifyContent: 'center', fontSize: 64, color: '#f5f0c8', textShadow: '6px 6px 0 #2b0a3d' }, [d({}, 'YOURAPP'), d({ color: '#ff2a3d' }, 'IS'), d({}, 'DEAD')]),
      d({ position: 'absolute', left: 0, top: 170, width: 1200, justifyContent: 'center', fontSize: 24, color: '#39ff14', textShadow: '3px 3px 0 #0b3d05' }, 'SAAS IS DEAD'),
      d({ position: 'absolute', left: 0, top: 222, width: 1200, justifyContent: 'center', fontSize: 17, color: '#cfc9a8' }, 'FREE, OPEN-SOURCE REPLACEMENTS FOR THE APPS YOU RENT'),
      ...stones,
      d({ position: 'absolute', left: 0, top: 566, width: 1200, justifyContent: 'center', fontSize: 18, color: '#39ff14' }, 'YOURAPPISDEAD.COM'),
    ]);
    return new ImageResponse(el2, { width: 1200, height: 630, fonts: [{ name: 'P', data: font, style: 'normal' }], headers: { 'cache-control': 'public, max-age=3600' } });
  }
  const bg = 'data:image/svg+xml;base64,' + b64(scene(mulberry(7)));
  const scoreSize = String(score).length > 5 ? 110 : 136;
  const el = d({ width: 1200, height: 630, position: 'relative', fontFamily: 'P', color: '#f5f0c8' }, [
    { type: 'img', props: { src: bg, width: 1200, height: 630, style: { position: 'absolute', left: 0, top: 0 } } },
    d({ position: 'absolute', left: 0, top: 0, width: 1200, height: 630, border: '14px solid #39ff14', boxShadow: 'inset 0 0 0 6px #05070a' }, ''),
    d({ position: 'absolute', left: 0, top: 44, width: 1200, justifyContent: 'center', fontSize: 58, color: '#ff2a3d', textShadow: '4px 4px 0 #4a0510' }, 'SAAS SLAYER'),
    d({ position: 'absolute', left: 0, top: 138, width: 1200, justifyContent: 'center', fontSize: 40, color: '#b14bff' }, `${name} SLAYED`),
    d({ position: 'absolute', left: 0, top: 200, width: 1200, justifyContent: 'center', fontSize: scoreSize, color: '#39ff14', textShadow: '8px 8px 0 #0b3d05' }, String(score)),
    d({ position: 'absolute', left: 0, top: 362, width: 1200, justifyContent: 'center', fontSize: 30, color: '#ff8c1a' }, `${slain} SAAS APP${slain === 1 ? '' : 'S'} SLAIN`),
    d({ position: 'absolute', left: 60, top: 526, width: 1080, height: 46, alignItems: 'center', justifyContent: 'center', background: '#05070a', border: '4px solid #ff8c1a', fontSize: 25, color: '#f5f0c8' }, 'SEE IF YOUR APP IS IN THE GRAVEYARD!'),
    d({ position: 'absolute', left: 0, top: 584, width: 1200, justifyContent: 'center', fontSize: 20, color: '#39ff14' }, 'YOURAPPISDEAD.COM'),
  ]);
  return new ImageResponse(el, { width: 1200, height: 630, fonts: [{ name: 'P', data: font, style: 'normal' }],
    headers: { 'cache-control': 'public, max-age=86400, immutable' } });
}
