// src/components/Header.jsx
import Image from 'next/image';
import Link from 'next/link';

// Melhor Prática: Usar o componente <Image> do Next.js.
// Ele otimiza automaticamente as imagens (tamanho, formato, lazy loading),
// melhorando a performance e o SEO do site.

// Melhor Prática: Usar o componente <Link> do Next.js para navegação interna.
// Ele habilita a navegação no lado do cliente (Client-Side Navigation),
// que é muito mais rápida do que a navegação tradicional, pois não recarrega a página inteira.

const Header = () => {
  return (
    <header className="py-6">
      <div className="container mx-auto flex justify-center">
        <Link href="/">
          <video
            // --- Atributos Essenciais para o Comportamento ---

            // autoPlay: Faz o vídeo começar a tocar assim que a página carrega.
            autoPlay

            // loop: Faz o vídeo recomeçar automaticamente quando termina.
            loop

            // muted: Essencial! A maioria dos navegadores modernos bloqueia o autoPlay de vídeos com som.
            // Além disso, um som inesperado no cabeçalho é uma péssima experiência para o usuário.
            muted

            // playsInline: Importante para dispositivos móveis (iOS). Garante que o vídeo toque
            // no local, em vez de abrir em tela cheia.
            playsInline

            // --- Estilização e Acessibilidade ---

            // src: O caminho para o vídeo na pasta /public.
            src="/logoAnimada.mp4"

            // className: Usamos Tailwind para definir o tamanho.
            // Ajuste 'w-72' (width: 18rem ou 288px) conforme necessário para o seu vídeo.
            className="w-72 h-auto"

            // Oculta o vídeo de leitores de tela, pois o link já tem um propósito.
            // A logo é decorativa.
            aria-hidden="true"
          >
            {/* Melhor Prática: Fornecer um fallback para navegadores que não suportam o vídeo. */}
            Seu navegador não suporta o vídeo.
          </video>
        </Link>
      </div>
    </header>
  );
};

export default Header;
