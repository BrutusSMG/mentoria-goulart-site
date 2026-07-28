// src/app/page.jsx

export const dynamic = 'force-dynamic';
import Link from 'next/link';
import HomepageHero from '@/components/HomepageHero';
import HomePageProducts from '@/components/HomePageProducts';
import HomePageLeadCapture from '@/components/HomePageLeadCapture';
import HomePageAuthor from '@/components/HomePageAuthor';
import LeadCapture from '@/components/LeadCapture';

export default function HomePage() {
  return (
    <>
      <HomepageHero />
      <HomePageProducts />
      <LeadCapture />
      <HomePageAuthor />     
    </>
  );
}
