// src/components/Header.jsx
import Image from 'next/image';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="py-6">
      <div className="container mx-auto flex justify-center">
        <Link href="/">
          <video
            autoPlay
            muted
            // playsInline: Importante para dispositivos móveis (iOS). Garante que o vídeo toque
            // no local, em vez de abrir em tela cheia.
            playsInline
            // --- Estilização e Acessibilidade ---
            // src: O caminho para o vídeo na pasta /public.
            src="/logoAnimada.mp4"
            className="w-92 h-auto"
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
