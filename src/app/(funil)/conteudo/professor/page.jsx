// src/app/(funil)/conteudo/professor/page.jsx
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Play,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "Conheça o Professor Goulart | Garimpo Urbano",
  description: "A trajetória por trás do método Garimpo Urbano.",
  robots: "noindex, nofollow",
};

function montarLinkMentoria(email, utmSource, utmMedium, utmCampaign) {
  const params = new URLSearchParams({
    email,
    utm_source: utmSource || "brevo",
    utm_medium: utmMedium || "email",
    utm_campaign: utmCampaign || "ebook_nutricao",
    utm_content: "email_3_professor_mentoria",
  });

  return `/mentoria?${params.toString()}`;
}

export default async function ProfessorPage({ searchParams }) {
  const params = await searchParams;
  const email = typeof params.email === "string" ? params.email.trim().toLowerCase() : "";

  if (!email) {
    redirect("/");
  }

  const lead = await prisma.lead.findUnique({
    where: { email },
    select: {
      nome: true,
      email: true,
    },
  });

  if (!lead) {
    redirect("/");
  }

  const linkMentoria = montarLinkMentoria(
    lead.email,
    typeof params.utm_source === "string" ? params.utm_source : undefined,
    typeof params.utm_medium === "string" ? params.utm_medium : undefined,
    typeof params.utm_campaign === "string" ? params.utm_campaign : undefined,
  );

  return (
    <div className="min-h-screen overflow-hidden bg-black text-white">
      <section className="relative border-b border-zinc-900 bg-linear-to-b from-zinc-950 via-black to-black px-4 py-16 md:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(216,153,0,0.16),transparent_38%)]" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d89900]/40 bg-[#d89900]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#d89900]">
              <Sparkles className="h-4 w-4" />
              Sobre o método
            </span>

            <h1 className="max-w-xl text-4xl font-black leading-tight text-white md:text-6xl">
              A trajetória por trás do método Garimpo Urbano
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-300">
              Antes de mostrar histórias de quem colocou esse conhecimento em prática, conheça a jornada que transformou curiosidade, estudo e experiência em um caminho de aprendizagem.
            </p>

            <p className="mt-5 max-w-xl text-sm leading-relaxed text-zinc-500">
              Olá, {lead.nome}. Este é um material complementar exclusivo para quem recebeu o e-book.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-5 rounded-[2rem] bg-[#d89900]/15 blur-3xl" />
            <div className="relative overflow-hidden rounded-3xl border border-[#d89900]/30 bg-zinc-900 p-2 shadow-2xl shadow-black/60">
              <Image
                src="/ProfGoulart.webp"
                alt="Professor Goulart"
                width={720}
                height={900}
                priority
                className="h-auto w-full rounded-2xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 py-16 md:py-24">
        <section className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#d89900]">
            A pergunta que iniciou tudo
          </p>
          <h2 className="mt-4 text-3xl font-black leading-tight md:text-5xl">
            Como pode existir valor em algo que quase todos chamam de sucata?
          </h2>
          <p className="mt-7 text-lg leading-relaxed text-zinc-300">
            Em 1984, aos 19 anos, o Prof. Goulart ouviu que equipamentos eletrônicos descartados poderiam conter metais preciosos. A pergunta ficou: como poderia existir ouro em algo que todos enxergavam apenas como descarte?
          </p>
          <p className="mt-5 text-lg leading-relaxed text-zinc-300">
            A busca por essa resposta se transformou em uma trajetória de prática, estudo, erros, pesquisa e organização de conhecimento.
          </p>
        </section>

        <section className="mt-20">
          <div className="mb-10 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#d89900]">Uma caminhada em três marcos</p>
            <h2 className="mt-3 text-3xl font-black md:text-4xl">Do primeiro contato ao compartilhamento</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <article className="rounded-2xl border border-zinc-800 bg-zinc-950 p-7 transition-colors hover:border-[#d89900]/50">
              <span className="text-4xl font-black text-[#d89900]">1984</span>
              <h3 className="mt-5 text-xl font-bold">O começo da busca</h3>
              <p className="mt-3 leading-relaxed text-zinc-400">
                A curiosidade sobre os metais presentes em resíduos eletrônicos deu início a uma jornada de aprendizado sem atalhos nem respostas fáceis.
              </p>
            </article>

            <article className="rounded-2xl border border-zinc-800 bg-zinc-950 p-7 transition-colors hover:border-[#d89900]/50">
              <span className="text-4xl font-black text-[#d89900]">2011</span>
              <h3 className="mt-5 text-xl font-bold">Voltar a estudar</h3>
              <p className="mt-3 leading-relaxed text-zinc-400">
                Aos 46 anos, depois de décadas de experiência prática, o Professor voltou a estudar para aprofundar a compreensão científica dos processos.
              </p>
            </article>

            <article className="rounded-2xl border border-zinc-800 bg-zinc-950 p-7 transition-colors hover:border-[#d89900]/50">
              <span className="text-4xl font-black text-[#d89900]">Hoje</span>
              <h3 className="mt-5 text-xl font-bold">Encurtar caminhos</h3>
              <p className="mt-3 leading-relaxed text-zinc-400">
                Experiência e estudo foram organizados para ajudar outras pessoas a começar com mais base, orientação e responsabilidade.
              </p>
            </article>
          </div>
        </section>

        <section className="mt-20 rounded-3xl border border-[#d89900]/20 bg-linear-to-br from-[#d89900]/10 via-zinc-950 to-black p-8 md:p-12">
          <div className="grid items-center gap-10 md:grid-cols-[1fr_1.1fr]">
            <div className="flex aspect-video items-center justify-center rounded-2xl border border-[#d89900]/25 bg-black/50">
              <div className="text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#d89900]/50 bg-[#d89900]/10 text-[#d89900]">
                  <Play className="ml-1 h-7 w-7" fill="currentColor" />
                </span>
                <p className="mt-4 text-sm font-bold uppercase tracking-wider text-zinc-400">Documentário em produção</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#d89900]">Em breve</p>
              <h2 className="mt-3 text-3xl font-black">A história completa está sendo preparada</h2>
              <p className="mt-5 leading-relaxed text-zinc-300">
                Em breve, você poderá acompanhar em vídeo os desafios, decisões e aprendizados que ajudaram a construir o método Garimpo Urbano.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#d89900]">Por que o método existe</p>
            <h2 className="mt-3 text-3xl font-black md:text-4xl">Conhecimento organizado para quem está começando</h2>
            <p className="mt-6 text-lg leading-relaxed text-zinc-300">
              O método não nasceu para prometer resultados rápidos. Ele nasceu da percepção de que ninguém deveria precisar repetir, sozinho, anos de tentativa e erro para começar a aprender.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <article className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <BookOpen className="h-7 w-7 text-[#d89900]" />
              <h3 className="mt-5 text-lg font-bold">Fundamentos antes de atalhos</h3>
              <p className="mt-2 leading-relaxed text-zinc-400">Entender o contexto e a lógica antes de avançar.</p>
            </article>

            <article className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <GraduationCap className="h-7 w-7 text-[#d89900]" />
              <h3 className="mt-5 text-lg font-bold">Sequência correta</h3>
              <p className="mt-2 leading-relaxed text-zinc-400">Desenvolver conhecimento de forma progressiva.</p>
            </article>

            <article className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <ShieldCheck className="h-7 w-7 text-[#d89900]" />
              <h3 className="mt-5 text-lg font-bold">Cuidado e responsabilidade</h3>
              <p className="mt-2 leading-relaxed text-zinc-400">Tratar segurança e conformidade como parte do aprendizado.</p>
            </article>

            <article className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <Sparkles className="h-7 w-7 text-[#d89900]" />
              <h3 className="mt-5 text-lg font-bold">Orientação aplicada</h3>
              <p className="mt-2 leading-relaxed text-zinc-400">Transformar experiência acumulada em um caminho mais claro para quem começa.</p>
            </article>
          </div>
        </section>

        <section className="mt-20 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-center md:p-12">
          <h2 className="text-3xl font-black">O que vem a seguir</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-zinc-300">
            Nos próximos dias, você vai conhecer histórias de pessoas que começaram com a mesma curiosidade e decidiram colocar esse conhecimento em prática.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={linkMentoria}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#d89900] px-6 py-3 font-bold text-black transition-colors hover:bg-[#F7FA83]"
            >
              CONHECER A MENTORIA
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <p className="mt-5 text-sm text-zinc-500">
            Se ainda não é o seu momento, não há problema: siga acompanhando os próximos materiais.
          </p>
        </section>
      </main>
    </div>
  );
}