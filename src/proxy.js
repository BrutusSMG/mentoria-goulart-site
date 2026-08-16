// src/proxy.js
import { NextResponse } from 'next/server';

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};

export default function proxy(req) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';

  const isEbookSubdomain =
    hostname === 'ebook.mentoriagarimpourbano.com.br' ||
    hostname.startsWith('ebook.localhost') ||
    hostname.startsWith('ebook.127.0.0.1');

  const isAdminSubdomain =
    hostname === 'admin.mentoriagarimpourbano.com.br' ||
    hostname.startsWith('admin.localhost') ||
    hostname.startsWith('admin.127.0.0.1');

  // ebook.dominio.com.br/          → /ebook
  // ebook.dominio.com.br/obrigado  → /ebook/obrigado
  if (isEbookSubdomain) {
    url.pathname = url.pathname === '/'
      ? '/ebook'
      : `/ebook${url.pathname}`;

    const response = NextResponse.rewrite(url);
    response.cookies.set('x-bare-page', '1', {
      path: '/',
      sameSite: 'lax',
    });
    return response;
  }

  // admin.dominio.com.br/ → /admin
  // As demais rotas administrativas continuam com seu próprio caminho.
  if (isAdminSubdomain) {
    if (url.pathname === '/') {
      url.pathname = '/admin';
    }

    const response = NextResponse.rewrite(url);
    response.cookies.set('x-bare-page', '1', {
      path: '/',
      sameSite: 'lax',
    });
    return response;
  }

  // Obrigatório para todas as requisições do domínio principal.
  return NextResponse.next();
}
