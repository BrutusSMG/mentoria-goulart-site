// src/components/Header.jsx
import Image from 'next/image';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-black py-6">
      <div className="container mx-auto flex justify-center">
        <Link href="/">
          <Image
            src="/logo_fundoTransparentered.png" // O caminho para a imagem na pasta /public
            alt="Logo Garimpo Urbano" // Texto alternativo para acessibilidade e SEO
            width={368} // A largura original da sua imagem (equivalente a w-92)
            height={80}  // A altura correspondente para manter a proporção. AJUSTE SE NECESSÁRIO.
            priority // Diz ao Next.js para carregar esta imagem primeiro, pois ela está no topo da página.
            className="w-full h-auto" // Garante que a altura se ajuste caso a largura mude
          />
        </Link>
      </div>
    </header>
  );
};

export default Header;
