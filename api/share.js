export const config = { runtime: 'edge' };
export default async function handler(req) {
  const u = new URL(req.url);
  const score = Math.min(999999, Math.max(0, parseInt(u.searchParams.get('score') || '0', 10) || 0));
  const name = (u.searchParams.get('name') || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3) || '???';
  let html = await fetch(new URL('/index.html', u.origin)).then(r => r.text());
  const og = `${u.origin}/api/og?score=${score}&name=${name}`;
  const title = `${name} scored ${score} slaying SaaS | YourAppIsDead`;
  const meta = `<meta property="og:title" content="${title}"><meta property="og:description" content="Free, open-source replacements for the SaaS you rent. Can you beat ${score}?"><meta property="og:image" content="${og}"><meta property="og:url" content="https://yourappisdead.com/?score=${score}&amp;name=${name}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${og}">`;
  html = html.replace(/<!--og-->[\s\S]*?<!--\/og-->/, meta);
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300' } });
}
