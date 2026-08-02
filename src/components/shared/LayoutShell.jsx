"use client";
import { usePathname } from 'next/navigation';
import Header from '@/components/shared/Header';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import WhatsAppButton from '@/components/shared/WhatsAppButton';

export default function LayoutShell({ children }) {
  const pathname = usePathname();
  
  // Páginas que NÃO devem ter navbar/footer (landing pages de tráfego pago)
  const isBarePage = pathname.startsWith('/ebook') || pathname.startsWith('/conteudo');

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