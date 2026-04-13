// src/app/page.js
import Header from '@/components/Header.jsx';
import Hero from '@/components/Hero.jsx';
import CTAButton from '@/components/CTAButton.jsx';
import Testimonials from '@/components/Testimonials.jsx';
import Audience from '@/components/Audience.jsx';
import Learning from '@/components/Learning.jsx';
import Bonus from '@/components/Bonus.jsx';
import Guarantee from '@/components/Guarantee.jsx';
import Offer from '@/components/Offer.jsx';
import Faq from '@/components/Faq.jsx';
import Footer from '@/components/Footer.jsx';
import Author from '@/components/Author';

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <CTAButton />
      <Testimonials />
      <Author />
      <Audience />
      <Learning />
      <Bonus />
      <Guarantee />
      <Offer />
      <Faq />
      <Footer />
      {/* As próximas seções virão aqui */}
    </main>
  );
}
