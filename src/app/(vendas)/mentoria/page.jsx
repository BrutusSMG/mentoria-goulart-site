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
import ExitIntentHandler from '@/components/shared/ExitIntentHandler';
import { prisma } from '@/lib/prisma';

export default async function Home() {
  const produtos = await prisma.produto.findMany({
    where: {
      id: {
        in: [
          'prod_garimpo_mentoria',
          'prod_garimpo_sem_mentoria',
        ],
      },
    },
    select: {
      id: true,
      preco: true,
      moeda: true,
    },
  });

  const produtosPorId = Object.fromEntries(
    produtos.map((produto) => [
      produto.id,
      {
        preco: produto.preco?.toString() ?? null,
        moeda: produto.moeda,
      },
    ]),
  );

  const mentoria =
    produtosPorId.prod_garimpo_mentoria ?? {
      preco: null,
      moeda: 'BRL',
    };

  const semMentoria =
    produtosPorId.prod_garimpo_sem_mentoria ?? {
      preco: null,
      moeda: 'BRL',
    };

  return (
    <main>
      <TrackViewContent
        preco={mentoria.preco}
        moeda={mentoria.moeda}
      />
      <Hero />
      <Promessa />
      <Opportunity />
      <Testimonials />
      <Author />
      <Audience />
      <Learning />
      <Bonus />
      <Urgency />
      <Offer
        preco={mentoria.preco}
        moeda={mentoria.moeda}
      />
      <Guarantee />
      <VideoTestimonials />
      <Faq />
      <ExitIntentHandler
        precoDownsell={semMentoria.preco}
        moedaDownsell={semMentoria.moeda}
      />
    </main>
  );
}
