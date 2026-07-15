// src/app/page.js
import Hero from '@/components/Mentoria/Hero.jsx';
import Promessa from '@/components/Mentoria/Promessa.jsx';
import Testimonials from '@/components/Mentoria/Testimonials.jsx';
import Audience from '@/components/Mentoria/Audience.jsx';
import Learning from '@/components/Mentoria/Learning.jsx';
import Bonus from '@/components/Mentoria/Bonus.jsx';
import Urgency from '@/components/Mentoria/Urgency.jsx';
import Guarantee from '@/components/Mentoria/Guarantee.jsx';
import Offer from '@/components/Mentoria/Offer.jsx';
import Faq from '@/components/Mentoria/Faq.jsx';
import Author from '@/components/Mentoria/Author';
import Opportunity from '@/components/Mentoria/Opportunity';
import VideoTestimonials from '@/components/Mentoria/VideoTestimonials';

export default function Home() {
  return (
    <main>
      <Hero />
      <Promessa />
      <Opportunity />
      <Testimonials />
      <Author />
      <Audience />
      <Learning />  
      <Bonus />
      <Urgency />
      <Offer />      
      <Guarantee />
      <VideoTestimonials />
      <Faq />
    </main>
  );
}
