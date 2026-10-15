import { ImageResponse } from '@vercel/og';
export const config = { runtime: 'edge' };
const h = (type, style, children) => ({ type, props: { style, children } });
export default async function handler(req) {
  const u = new URL(req.url);
  const score = Math.min(999999, Math.max(0, parseInt(u.searchParams.get('score') || '0', 10) || 0));
  const name = (u.searchParams.get('name') || '???').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3) || '???';
  const font = await fetch(new URL('/fonts/PressStart2P.ttf', u.origin)).then(r => r.arrayBuffer());
  return new ImageResponse(
    h('div', { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#05070a', color: '#f5f0c8', fontFamily: 'P', border: '12px solid #39ff14' }, [
      h('div', { color: '#ff8c1a', fontSize: 28 }, 'YOURAPPISDEAD.COM'),
      h('div', { color: '#ff2a3d', fontSize: 64, marginTop: 40 }, 'SAAS SLAYER'),
      h('div', { color: '#39ff14', fontSize: 110, marginTop: 40 }, String(score)),
      h('div', { color: '#b14bff', fontSize: 40, marginTop: 30 }, `${name} SLAYED SAAS`),
    ]),
    { width: 1200, height: 630, fonts: [{ name: 'P', data: font, style: 'normal' }],
      headers: { 'cache-control': 'public, max-age=86400, immutable' } }
  );
}
