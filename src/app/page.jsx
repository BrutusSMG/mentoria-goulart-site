// src/app/page.jsx

import Link from 'next/link';
import HomepageHero from '@/components/HomepageHero';
import HomePageProducts from '@/components/HomePageProducts';
import HomePageLeadCapture from '@/components/HomePageLeadCapture';
import HomePageAuthor from '@/components/HomePageAuthor';

export default function HomePage() {
  return (
    <>
      <HomepageHero />
      <HomePageProducts />
      <HomePageLeadCapture />
      <HomePageAuthor />
        {/* Aqui virão as outras seções da homepage: */}
        {/* - Seção "Nossos Produtos" (cards para Mentoria, Ebooks, etc.) */}
        {/* - Seção "Quem Sou" (pode ser uma versão resumida do que já fizemos) */}
        {/* - Seção "Conteúdo Gratuito" */}        
      
    </>
  );
}
