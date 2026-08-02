// src/proxy.js
import { NextResponse } from 'next/server';

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export default function proxy(req) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';

  const isEbookSubdomain = 
    hostname === 'ebook.mentoriagarimpourbano.com.br' || 
    hostname.startsWith('ebook.localhost') || 
    hostname.startsWith('ebook.127.0.0.1');

  if (isEbookSubdomain) {
    url.pathname = `/ebook${url.pathname}`;
    const response = NextResponse.rewrite(url);
    response.cookies.set('x-bare-page', '1', { path: '/', sameSite: 'lax' });
    return response;
  }

  // Site principal: limpa o cookie caso o usuário venha do subdomínio
  const response = NextResponse.next();
  response.cookies.delete('x-bare-page');
  return response;
}
