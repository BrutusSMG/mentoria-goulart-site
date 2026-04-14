// src/components/Footer.jsx
import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-black border-t border-gray-800 py-12 px-4">
      <div className="container mx-auto text-center text-gray-400">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link href="/">
            <Image
              src="/LogoGU2.png" // Reutilizando o mesmo logo da pasta /public
              alt="Logo Goulart Metais Preciosos"
              width={100} // Um tamanho um pouco menor para o rodapé
              height={43}
            />
          </Link>
        </div>

        {/* Links Legais */}
        <div className="flex justify-center gap-6 mb-6">
          <Link href="#" className="hover:text-white transition-colors">
            Termos de Uso
          </Link>
          <Link href="#" className="hover:text-white transition-colors">
            Políticas de Privacidade
          </Link>
        </div>

        {/* Aviso Legal e Direitos Autorais */}
        <div className="text-xs space-y-4 max-w-3xl mx-auto">          
          <p className="mt-6">
            &copy; {new Date().getFullYear()} Goulart Metais Preciosos. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
