// src/app/page.jsx
import HomepageHero from '@/components/homepage/HomepageHero';
import HomePageProducts from '@/components/homepage/HomePageProducts';
import HomePageAuthor from '@/components/homepage/HomePageAuthor';
import LeadCapture from '@/components/homepage/LeadCapture';

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
