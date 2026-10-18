// Global leaderboards. Upstash Redis (Vercel marketplace) via REST, one sorted set per game.
// GET  /api/scores?game=slayer            -> { top: [{ n, s }] }
// POST /api/scores { game, start: true }                    -> { run }  (server-side start time, single use)
// POST /api/scores { game, run, name, score, slain?, duration } -> { ok, rank, top }
const GAMES = { slayer: 1, breaker: 1, invaders: 1, bird: 1, snake: 1 };
const TOP = 10, KEEP = 100, RUN_TTL = 7200;
const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function redis(...cmd) {
  const r = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(cmd) });
  const j = await r.json(); if (j.error) throw new Error(j.error); return j.result;
}
async function top(game) {
  const raw = await redis('ZREVRANGE', `scores:${game}`, 0, TOP - 1, 'WITHSCORES');
  const out = []; for (let i = 0; i < raw.length; i += 2) out.push({ n: String(raw[i]).split('#')[0], s: Number(raw[i + 1]) });
  return out;
}
// Ticket of the server-side start time; play time is bounded by the server clock, not the client's claim.
const ipOf = req => (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'anon';
async function limited(key, max) { const n = await redis('INCR', key); if (n === 1) await redis('EXPIRE', key, 60); return n > max; }
// Loose plausibility caps so a hand-crafted POST can't post 999999. Mirrors how each game actually scores.
function plausible(game, score, slain, dur) {
  if (game === 'slayer') return score <= slain * 100 + dur * 12 + 10;
  if (game === 'breaker') return score <= dur * 60 + 200;   // bricks are 10-40 each, +100 per level
  if (game === 'invaders') return score <= dur * 60 + 100;  // 10-30 per invader, +50 per wave
  if (game === 'bird') return score <= dur / 1.4 + 2;       // one wall every ~1.6s
  if (game === 'snake') return score <= dur * 12 + 10;      // 10 per invoice, >= ~0.8s apart
  return false;
}
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!url || !token) return res.status(503).json({ error: 'leaderboard not configured' });
  const game = String((req.method === 'GET' ? req.query.game : req.body?.game) || '');
  if (!GAMES[game]) return res.status(400).json({ error: 'unknown game' });
  try {
    if (req.method === 'GET') return res.status(200).json({ top: await top(game) });
    if (req.method !== 'POST') return res.status(405).end();
    const b = req.body || {};
    const ip = ipOf(req);
    if (b.start) {
      if (await limited(`rls:${ip}`, 40)) return res.status(429).json({ error: 'slow down' });
      const run = crypto.randomUUID();
      await redis('SET', `run:${run}`, `${game}|${Date.now()}`, 'EX', RUN_TTL);
      return res.status(200).json({ run });
    }
    const name = String(b.name || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
    const score = Math.floor(Number(b.score)), slain = Math.floor(Number(b.slain) || 0);
    if (!name || !(score > 0) || score > 999999 || !/^[0-9a-f-]{36}$/.test(String(b.run || ''))) return res.status(400).json({ error: 'rejected' });
    if (await limited(`rl:${ip}`, 12)) return res.status(429).json({ error: 'slow down' });
    const ticket = await redis('GETDEL', `run:${b.run}`); // single use
    const [tGame, t0] = String(ticket || '').split('|');
    if (tGame !== game) return res.status(400).json({ error: 'rejected' });
    const elapsed = (Date.now() - Number(t0)) / 1000;
    const dur = Math.max(0, Math.min(Math.floor(Number(b.duration) || 0), Math.floor(elapsed)));
    if (!plausible(game, score, slain, dur)) return res.status(400).json({ error: 'rejected' });
    const member = `${name}#${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    await redis('ZADD', `scores:${game}`, score, member);
    await redis('ZREMRANGEBYRANK', `scores:${game}`, 0, -(KEEP + 1));
    const rank = await redis('ZREVRANK', `scores:${game}`, member);
    return res.status(200).json({ ok: true, rank: rank == null ? null : rank + 1, top: await top(game) });
  } catch (e) { return res.status(500).json({ error: 'leaderboard error' }); }
}
