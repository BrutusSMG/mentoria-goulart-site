import { NextResponse } from 'next/server';

export function proxy(req) {
  // Clonamos a URL atual da requisição
  const url = req.nextUrl.clone();
  
  // Pegamos o domínio que o usuário digitou (ex: ebook.mentoriagarimpourbano.com.br)
  const hostname = req.headers.get('host') || '';

  // Verificamos se o domínio começa com "ebook."
  // Isso funciona para "ebook.mentoriagarimpourbano.com.br" e também para "ebook.localhost:3000" (para você testar)
  const isEbookSubdomain = hostname.startsWith('ebook.');

  if (isEbookSubdomain) {
    // Se a pessoa acessar a raiz do subdomínio (ebook.dominio.com.br/), o pathname é '/'
    // Nós reescrevemos silenciosamente para '/ebook/'
    // Se ela acessar '/obrigado', reescrevemos para '/ebook/obrigado'
    url.pathname = `/ebook${url.pathname}`;
    
    // O rewrite mostra o conteúdo da nova rota, mas mantém a URL original no navegador do usuário!
    return NextResponse.rewrite(url);
  }

  // Se não for o subdomínio, segue o fluxo normal do site principal
  return NextResponse.next();
}

// Essa configuração é crucial para otimização. 
// Ela impede que o middleware rode em imagens, arquivos estáticos e na sua API, economizando recursos.
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
