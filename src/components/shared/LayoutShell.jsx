"use client";
import { usePathname } from 'next/navigation';
import Header from '@/components/shared/Header';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import WhatsAppButton from '@/components/shared/WhatsAppButton';

export default function LayoutShell({ children, isBarePage: isBareFromServer }) {
  const pathname = usePathname();

  // Combina: prop do server (cookie) OU pathname do client
  const isBarePage = isBareFromServer || pathname.startsWith('/ebook') || pathname.startsWith('/conteudo');

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
