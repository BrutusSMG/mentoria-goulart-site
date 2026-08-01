// src/app/(vendas)/mentoria/page.jsx

import TrackViewContent from '@/components/mentoria/TrackViewContent';
import Hero from '@/components/mentoria/Hero';
import Promessa from '@/components/mentoria/Promessa';
import Testimonials from '@/components/mentoria/Testimonials';
import Audience from '@/components/mentoria/Audience';
import Learning from '@/components/mentoria/Learning';
import Bonus from '@/components/mentoria/Bonus';
import Urgency from '@/components/mentoria/Urgency';
import Guarantee from '@/components/mentoria/Guarantee';
import Offer from '@/components/mentoria/Offer';
import Faq from '@/components/mentoria/Faq';
import Author from '@/components/mentoria/Author';
import Opportunity from '@/components/mentoria/Opportunity';
import VideoTestimonials from '@/components/mentoria/VideoTestimonials';

export default function Home() {
  return (
    <main>
      <TrackViewContent />
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
