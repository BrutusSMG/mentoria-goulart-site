// src/proxy.js

import { NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export default function proxy(req) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Detecta se é o subdomínio do ebook
  // Em localhost: verifica se começa com "ebook."
  // Em produção: verifica se é exatamente "ebook.mentoriagarimpourbano.com.br"
  const isEbookSubdomain = 
    hostname === 'ebook.mentoriagarimpourbano.com.br' || 
    (hostname.startsWith('ebook.localhost') || hostname.startsWith('ebook.127.0.0.1'));

  if (isEbookSubdomain) {
    url.pathname = `/ebook${url.pathname}`;
    const response = NextResponse.rewrite(url);
    response.headers.set('x-is-ebook', 'true');
    return response;
  }

  // Se for o subdomínio e estiver acessando a raiz (/)
  if (isEbookSubdomain && url.pathname === '/') {
    // Reescreve a URL internamente para a pasta /ebook
    // O usuário continua vendo ebook.mentoriagarimpourbano.com.br na barra de endereços
    return NextResponse.rewrite(new URL('/ebook', req.url));
  }

  // Se for o subdomínio e estiver acessando /obrigado
  if (isEbookSubdomain && url.pathname === '/obrigado') {
    return NextResponse.rewrite(new URL('/ebook/obrigado', req.url));
  }

  return NextResponse.next();
}
