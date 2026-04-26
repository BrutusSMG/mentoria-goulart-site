// src/components/Header.jsx
import Image from 'next/image';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-black py-6">
      <div className="container mx-auto flex justify-center">
        <Link href="/">
          <Image
            src="/logo_fundoTransparentered.png"
            alt="Logo Garimpo Urbano"
            width={368}
            height={80}
            priority
            className="max-w-full h-auto object-contain" 
          />
        </Link>
      </div>
    </header>
  );
};

export default Header;
