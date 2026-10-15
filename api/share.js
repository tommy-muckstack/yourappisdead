export const config = { runtime: 'edge' };
export default async function handler(req) {
  const u = new URL(req.url);
  const score = Math.min(999999, Math.max(0, parseInt(u.searchParams.get('score') || '0', 10) || 0));
  const slain = Math.min(9999, Math.max(0, parseInt(u.searchParams.get('slain') || '0', 10) || 0));
  const name = (u.searchParams.get('name') || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3) || '???';
  let html = await fetch(new URL('/index.html', u.origin)).then(r => r.text());
  const og = `${u.origin}/api/og?score=${score}&name=${name}&slain=${slain}`;
  const title = `${name} slayed ${slain ? slain + ' SaaS subscriptions for ' : ''}${score} points in SaaS Slayer | YourAppIsDead`;
  const desc = `Can you beat ${score}? See if your app is in the graveyard! Free, open-source replacements for the SaaS you rent.`;
  const url = `https://yourappisdead.com/?score=${score}&amp;name=${name}&amp;slain=${slain}`;
  const meta = `<meta property="og:type" content="website"><meta property="og:title" content="${title}"><meta property="og:description" content="${desc}"><meta property="og:image" content="${og}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${name} scored ${score} in SaaS Slayer"><meta property="og:url" content="${url}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${desc}"><meta name="twitter:image" content="${og}">`;
  html = html.replace(/<!--og-->[\s\S]*?<!--\/og-->/, meta);
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300' } });
}
