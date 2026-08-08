// src/proxy.js
import { NextResponse } from 'next/server';

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\..*).*)',
  ],
};

export default function proxy(req) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';

  // Detecta subdomínio EBOOK
  const isEbookSubdomain = 
    hostname === 'ebook.mentoriagarimpourbano.com.br' || 
    hostname.startsWith('ebook.localhost') || 
    hostname.startsWith('ebook.127.0.0.1');

  // Detecta subdomínio ADMIN (linha nova)
  const isAdminSubdomain = 
    hostname === 'admin.mentoriagarimpourbano.com.br' || 
    hostname.startsWith('admin.localhost') || 
    hostname.startsWith('admin.127.0.0.1');

  // Lógica do Ebook (sem alteração)
  if (isEbookSubdomain) {
    url.pathname = `/ebook${url.pathname}`;
    const response = NextResponse.rewrite(url);
    response.cookies.set('x-bare-page', '1', { path: '/', sameSite: 'lax' });
    return response;
  }

  // Lógica do Admin (bloco novo)
  if (isAdminSubdomain) {
    if (url.pathname.startsWith('/admin')) {
      url.pathname = `/admin${url.pathname}`;
    }

    // Site principal: limpa o cookie (sem alteração)
    const response = NextResponse.rewrite(url);
    response.cookies.set('x-bare-page', '1', { path: '/', sameSite: 'lax' });
    return response;
  }
}