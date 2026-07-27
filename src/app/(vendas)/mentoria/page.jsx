// src/app/page.js
import Hero from '@/components/mentoria/Hero.jsx';
import Promessa from '@/components/mentoria/Promessa.jsx';
import Testimonials from '@/components/mentoria/Testimonials.jsx';
import Audience from '@/components/mentoria/Audience.jsx';
import Learning from '@/components/mentoria/Learning.jsx';
import Bonus from '@/components/mentoria/Bonus.jsx';
import Urgency from '@/components/mentoria/Urgency.jsx';
import Guarantee from '@/components/mentoria/Guarantee.jsx';
import Offer from '@/components/mentoria/Offer.jsx';
import Faq from '@/components/mentoria/Faq.jsx';
import Author from '@/components/mentoria/Author';
import Opportunity from '@/components/mentoria/Opportunity';
import VideoTestimonials from '@/components/mentoria/VideoTestimonials';

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
