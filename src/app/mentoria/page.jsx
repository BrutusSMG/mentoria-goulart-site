// src/app/page.js
import Hero from '@/components/Hero.jsx';
import Testimonials from '@/components/Testimonials.jsx';
import Audience from '@/components/Audience.jsx';
import Learning from '@/components/Learning.jsx';
import Bonus from '@/components/Bonus.jsx';
import Guarantee from '@/components/Guarantee.jsx';
import Offer from '@/components/Offer.jsx';
import Faq from '@/components/Faq.jsx';
import Author from '@/components/Author';
import Opportunity from '@/components/Opportunity';
import VideoTestimonials from '@/components/VideoTestimonials';

export default function Home() {
  return (
    <main>
      <Hero />
      <Opportunity />
      <Testimonials />
      <Author />
      <Audience />
      <Learning />  
      <Bonus />    
      <Offer />      
      <Guarantee />
      <VideoTestimonials />
      <Faq />
    </main>
  );
}
