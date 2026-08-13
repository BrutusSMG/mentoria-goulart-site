// src/components/shared/LayoutShell.jsx
"use client";
import { usePathname } from 'next/navigation';
import Header from '@/components/shared/Header';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import WhatsAppButton from '@/components/shared/WhatsAppButton';

// Lista de rotas que não devem ter Header/Navbar/Footer
const BARE_ROUTES = ['/ebook', '/conteudo', '/download', '/obrigado', '/admin', '/admin-login', '/alterar-senha'];

export default function LayoutShell({ children, isBarePage: isBareFromServer }) {
  const pathname = usePathname();

  const isBarePage = 
    isBareFromServer || 
    BARE_ROUTES.some(route => pathname.startsWith(route));

  if (isBarePage) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <Navbar />
      {children}
      <Footer />
      <WhatsAppButton />
    </>
  );
}
