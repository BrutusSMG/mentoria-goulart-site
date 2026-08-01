// src/components/shared/Header.jsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Header = () => {
  const pathname = usePathname();
  
  // Se estiver na página de mentoria, a logo não é clicável
  const isMenutoriaPage = pathname === '/mentoria';

  const logoContent = (
    <Image
      src="/logo_fundoTransparentered.png"
      alt="Logo Garimpo Urbano"
      width={120}
      height={80}
      priority
      className="max-w-full h-auto object-contain"
      style={{ width: 'auto', height: 'auto' }}
    />
  );

  return (
    <header className="bg-black py-6">
      <div className="container mx-auto flex justify-center">
        {isMenutoriaPage ? (
          // Na mentoria: apenas a imagem, sem link
          <div>{logoContent}</div>
        ) : (
          // Em outras páginas: logo clicável
          <Link href="/">
            {logoContent}
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
