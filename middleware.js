import { rewrite, next } from '@vercel/edge';
export const config = { matcher: '/' };
export default function middleware(req) {
  const u = new URL(req.url);
  if (!u.searchParams.has('score')) return next();
  return rewrite(new URL('/api/share' + u.search, u.origin));
}
