// Página educativa do funil: professor e filosofia do método.
// O catálogo de módulos pertence à página da mentoria.
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Leaf,
  Lightbulb,
  Recycle,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export const metadata = {
  title: "Conheça o Prof. Goulart | Garimpo Urbano",
  description:
    "A experiência do Prof. Goulart e a filosofia de aprendizagem por trás do método Garimpo Urbano.",
  robots: "noindex, nofollow",
};

const marcos = [
  {
    numero: "1984",
    titulo: "A pergunta que iniciou a jornada",
    descricao:
      "Aos 19 anos, a curiosidade sobre metais preciosos em equipamentos descartados levou o professor a buscar respostas sobre o valor que poderia existir nesses materiais.",
  },
  {
    numero: "2011",
    titulo: "A prática encontra o estudo",
    descricao:
      "Depois de décadas de experiência prática, o Prof. Goulart retomou os estudos para aprofundar a compreensão científica dos processos metalúrgicos.",
  },
  {
    numero: "Hoje",
    titulo: "Experiência organizada para ensinar",
    descricao:
      "O Garimpo Urbano reúne conhecimento técnico e vivência profissional em um caminho de aprendizagem, da base aos temas mais avançados.",
  },
];

const principios = [
  {
    icon: Lightbulb,
    titulo: "Enxergar possibilidades",
    descricao:
      "Materiais eletrônicos, resíduos de joalheria e outras fontes podem conter metais de interesse. O primeiro passo é entender o que se tem em mãos.",
  },
  {
    icon: BookOpen,
    titulo: "Aprender antes de executar",
    descricao:
      "A química e os fundamentos metalúrgicos dão sentido aos processos. A proposta é construir a base antes de avançar para aplicações mais exigentes.",
  },
  {
    icon: TrendingUp,
    titulo: "Buscar eficiência com critério",
    descricao:
      "O aproveitamento de um material depende de composição, escala, rendimento e custos. Obter matéria-prima por doação não elimina os custos do processamento.",
  },
  {
    icon: ShieldCheck,
    titulo: "Trabalhar com responsabilidade",
    descricao:
      "Saúde, segurança e gestão de resíduos são parte do conhecimento, não etapas opcionais depois da recuperação.",
  },
];

function montarLinkMentoria(email, params) {
  const query = new URLSearchParams({
    email,
    utm_source: typeof params.utm_source === "string" ? params.utm_source : "brevo",
    utm_medium: typeof params.utm_medium === "string" ? params.utm_medium : "email",
    utm_campaign:
      typeof params.utm_campaign === "string" ? params.utm_campaign : "ebook_nutricao",
    utm_content: "e03_professor_pagina_cta",
  });
  return "/mentoria?" + query.toString();
}

export default async function ProfessorPage({ searchParams }) {
  const params = await searchParams;
  const email =
    typeof params.email === "string" ? params.email.trim().toLowerCase() : "";

  if (!email) redirect("/");

  const lead = await prisma.lead.findUnique({
    where: { email },
    select: { nome: true, email: true },
  });

  if (!lead) redirect("/");

  const linkMentoria = montarLinkMentoria(lead.email, params);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-zinc-800 bg-[#080808] px-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 py-3">
          <Link href="/" aria-label="Garimpo Urbano - página inicial" className="shrink-0">
            <Image
              src="/logo_fundoTransparentered.png"
              alt="Garimpo Urbano"
              width={230}
              height={140}
              priority
              className="h-auto w-40 md:w-48"
            />
          </Link>
          <span className="hidden rounded-full border border-[#d89900]/40 bg-[#d89900]/10 px-4 py-2 text-xs font-bold text-[#d89900] sm:inline-flex">
            Conteúdo exclusivo MGU
          </span>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-zinc-900 bg-gradient-to-b from-zinc-950 via-black to-black px-4 py-14 md:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(216,153,0,0.15),transparent_42%)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1.15fr_0.85fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#d89900]/40 bg-[#d89900]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.13em] text-[#d89900]">
              <GraduationCap className="h-4 w-4" />
              A trajetória por trás do método
            </span>
            <h1 className="mt-6 max-w-2xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
              Mais de 30 anos recuperando metais.
              <span className="mt-2 block text-[#d89900]">Uma experiência que agora pode ser compartilhada.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-300">
              O Prof. Goulart construiu sua trajetória na recuperação de metais
              preciosos de materiais e resíduos. O Garimpo Urbano nasce do propósito
              de transformar essa vivência em conhecimento estruturado para novos alunos.
            </p>
            <p className="mt-4 max-w-xl leading-relaxed text-zinc-400">
              Da recuperação da prata aos estudos sobre ouro e outros metais,
              a proposta é aprender progressivamente, considerando técnica,
              eficiência, segurança e responsabilidade ambiental.
            </p>
            {lead.nome ? (
              <p className="mt-6 text-sm text-zinc-500">
                Olá, {lead.nome}. Conheça a história por trás da formação.
              </p>
            ) : null}
          </div>
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-5 rounded-3xl bg-[#d89900]/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-3xl border border-[#d89900]/30 bg-zinc-900 p-2 shadow-xl shadow-black/60">
              <Image
                src="/ProfGoulart.webp"
                alt="Fotografia do Professor Goulart"
                width={720}
                height={900}
                priority
                className="h-auto w-full rounded-2xl object-cover"
              />
            </div>
            <p className="relative mt-4 text-center text-xs font-semibold uppercase tracking-[0.14em] text-[#d89900]">
              Prof. Goulart
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <section className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d89900]">
            A origem de uma pergunta
          </p>
          <h2 className="mt-4 text-3xl font-black md:text-4xl">
            Como pode existir valor naquilo que muitos enxergam como descarte?
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-zinc-300">
            Essa curiosidade acompanha a história do professor. Com o tempo,
            a busca por respostas exigiu prática, estudo e compreensão dos
            processos que tornam possível recuperar metais de diferentes fontes.
          </p>
          <p className="mt-4 leading-relaxed text-zinc-400">
            Hoje, essa experiência fundamenta uma proposta de ensino:
            ajudar o aluno a entender não apenas onde podem existir metais,
            mas como estudar sua recuperação com critério.
          </p>
        </section>

        <section className="mt-16 md:mt-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d89900]">A trajetória</p>
            <h2 className="mt-4 text-3xl font-black md:text-4xl">Experiência construída ao longo do tempo</h2>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {marcos.map((marco) => (
              <article key={marco.numero} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 md:p-7">
                <p className="text-3xl font-black text-[#d89900]">{marco.numero}</p>
                <h3 className="mt-4 text-lg font-bold">{marco.titulo}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">{marco.descricao}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-20 rounded-3xl border border-[#d89900]/25 bg-gradient-to-br from-[#d89900]/10 via-zinc-950 to-zinc-950 p-7 md:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d89900]">A essência do método</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-black md:text-4xl">
            Não basta encontrar um material. É preciso compreender o processo.
          </h2>
          <p className="mt-5 max-w-3xl leading-relaxed text-zinc-300">
            O conteúdo do curso parte dos fundamentos e chega às aplicações práticas
            em materiais como resíduos de oficinas de joalheria, sucatas eletrônicas,
            catalisadores e outras fontes. Aqui, o foco é explicar o pensamento por
            trás dessa jornada, não repetir a lista de aulas.
          </p>
          <div className="mt-9 grid gap-4 md:grid-cols-2">
            {principios.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.titulo} className="rounded-xl border border-zinc-800 bg-black/50 p-6">
                  <Icon className="h-7 w-7 text-[#d89900]" aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-bold">{item.titulo}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">{item.descricao}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-20 grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d89900]">
              Uma aprendizagem progressiva
            </p>
            <h2 className="mt-4 text-3xl font-black md:text-4xl">
              Começar pelo entendimento. Avançar com segurança.
            </h2>
            <p className="mt-5 leading-relaxed text-zinc-300">
              Uma boa trajetória de aprendizagem começa pela base científica,
              pelas boas práticas e pela estrutura necessária. O estudo da recuperação
              da prata é uma possível primeira aplicação, seguido do ouro e de
              outros processos, conforme a preparação e a evolução do aluno.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-zinc-400">
              Conhecer uma técnica não elimina os riscos do trabalho com reagentes,
              equipamentos e resíduos. O objetivo é construir competência, não
              prometer facilidade ou resultados financeiros garantidos.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#d89900]" />
              <div><h3 className="font-bold">Fundamentos e segurança</h3>
                <p className="mt-1 text-sm text-zinc-400">Entender os princípios antes de aplicar processos.</p></div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#d89900]" />
              <div><h3 className="font-bold">Prata e ouro</h3>
                <p className="mt-1 text-sm text-zinc-400">Aprender progressivamente, a partir dos conhecimentos necessários.</p></div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#d89900]" />
              <div><h3 className="font-bold">Outros materiais e novas aplicações</h3>
                <p className="mt-1 text-sm text-zinc-400">Ampliar a visão técnica e avaliar a viabilidade de cada oportunidade.</p></div>
            </div>
          </div>
        </section>

        <section className="mt-20 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 md:p-12">
          <div className="flex items-center gap-3">
            <Recycle className="h-7 w-7 text-[#d89900]" aria-hidden="true" />
            <h2 className="text-2xl font-black md:text-3xl">Recuperar metais com responsabilidade</h2>
          </div>
          <p className="mt-5 max-w-4xl leading-relaxed text-zinc-300">
            O Garimpo Urbano também aborda proteção das pessoas, recolhimento
            e armazenamento, tratamento dos resíduos e o planejamento de uma
            atividade que considere custos e impactos ambientais.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
              <ShieldCheck className="h-4 w-4 text-[#d89900]" /> Saúde e segurança
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
              <Leaf className="h-4 w-4 text-[#d89900]" /> Cuidado ambiental
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
              <TrendingUp className="h-4 w-4 text-[#d89900]" /> Gestão de custos
            </span>
          </div>
        </section>

        <section className="mt-20 rounded-3xl border border-[#d89900]/30 bg-gradient-to-r from-[#d89900]/10 via-zinc-950 to-black p-8 text-center md:p-14">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d89900]">
            Conheça a formação
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black md:text-4xl">
            Quer conhecer o conteúdo completo da Mentoria Garimpo Urbano?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-zinc-300">
            Na página da mentoria você encontra os módulos, os temas estudados
            e as informações sobre a formação. Aqui você conheceu a história
            e a filosofia que orientam esse ensino.
          </p>
          <Link
            href={linkMentoria}
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-[#d89900] px-7 py-4 text-sm font-black text-black transition-colors hover:bg-[#edb33d]"
          >
            CONHECER O PROGRAMA COMPLETO
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-5 text-xs leading-relaxed text-zinc-500">
            O aprendizado exige estrutura adequada e atenção à segurança.
            Resultados de recuperação e rentabilidade variam conforme o material,
            o processo e as condições de trabalho.
          </p>
        </section>
      </main>
    </div>
  );
}
