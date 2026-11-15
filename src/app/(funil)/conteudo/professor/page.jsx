// Página educativa do funil MGU: experiência do professor + método.
// Mantém a rota existente, autenticação pelo lead e UTMs para não quebrar campanhas anteriores.
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ArrowRight,
  BookOpen,
  CarFront,
  CheckCircle2,
  Cpu,
  Film,
  FlaskConical,
  Gem,
  GraduationCap,
  Leaf,
  Recycle,
  ShieldCheck,
} from "lucide-react";

export const metadata = {
  title: "Professor Goulart e o Método Garimpo Urbano",
  description:
    "Conheça a experiência do Prof. Goulart e a proposta de aprendizagem sobre recuperação de metais preciosos de diferentes materiais.",
  robots: "noindex, nofollow",
};

const fontes = [
  {
    icon: Cpu,
    titulo: "Sucatas eletrônicas",
    descricao: "Placas, componentes e contatos que podem conter metais de interesse.",
  },
  {
    icon: Gem,
    titulo: "Resíduos de joalheria",
    descricao: "Materiais de oficinas, ligas, aparas e resíduos com potencial de recuperação.",
  },
  {
    icon: CarFront,
    titulo: "Catalisadores automotivos",
    descricao: "Materiais que podem conter metais do grupo da platina, conforme sua composição.",
  },
  {
    icon: Film,
    titulo: "Radiografias antigas",
    descricao: "Películas tradicionais que podem conter compostos de prata.",
  },
];

const caminho = [
  {
    numero: "01",
    titulo: "Entender as fontes",
    texto: "Reconhecer materiais com metais de interesse, suas diferenças e as possibilidades de obtenção.",
  },
  {
    numero: "02",
    titulo: "Preparar-se com segurança",
    texto: "Estudar fundamentos, laboratório, coleta, armazenamento, riscos e boas práticas.",
  },
  {
    numero: "03",
    titulo: "Aprender progressivamente",
    texto: "Aprofundar o estudo da prata e do ouro, avançando conforme a base técnica e a experiência.",
  },
  {
    numero: "04",
    titulo: "Avaliar processos e resíduos",
    texto: "Considerar rendimento, custos, saúde, segurança e tratamento responsável dos resíduos.",
  },
];

function montarLinkMentoria(email, params) {
  const query = new URLSearchParams({
    email,
    utm_source: typeof params.utm_source === "string" ? params.utm_source : "brevo",
    utm_medium: typeof params.utm_medium === "string" ? params.utm_medium : "email",
    utm_campaign: typeof params.utm_campaign === "string" ? params.utm_campaign : "ebook_nutricao",
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
      <section className="relative overflow-hidden border-b border-zinc-900 bg-gradient-to-b from-zinc-950 via-black to-black px-4 py-16 md:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(216,153,0,0.13),transparent_50%)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[1.15fr_0.85fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#d89900]/40 bg-[#d89900]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#d89900]">
              <GraduationCap className="h-4 w-4" />
              Conheça quem ensina
            </span>
            <h1 className="mt-6 max-w-2xl text-4xl font-black leading-[1.08] tracking-tight md:text-6xl">
              Da matéria-prima ao metal recuperado:
              <span className="block text-[#d89900]">o conhecimento faz a diferença.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-zinc-300">
              Por trás do Garimpo Urbano está a experiência do Prof. Goulart, construída
              ao longo de mais de 30 anos de trabalho com recuperação de metais preciosos.
            </p>
            <p className="mt-5 max-w-xl leading-relaxed text-zinc-400">
              O objetivo da formação é organizar esse conhecimento em uma jornada de
              aprendizagem, dos fundamentos aos processos mais avançados, com atenção
              à eficiência, à segurança e ao meio ambiente.
            </p>
            {lead.nome ? (
              <p className="mt-6 text-sm text-zinc-500">
                Olá, {lead.nome}. Este conteúdo foi preparado para quem acompanha o Garimpo Urbano.
              </p>
            ) : null}
            <Link
              href={linkMentoria}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-[#d89900] px-6 py-4 text-sm font-bold text-black transition-colors hover:bg-[#edb33d]"
            >
              CONHECER A FORMAÇÃO
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-5 rounded-[2rem] bg-[#d89900]/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-3xl border border-[#d89900]/30 bg-zinc-900 p-2 shadow-2xl shadow-black/50">
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
              Prof. Goulart · Experiência aplicada ao ensino
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <section className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d89900]">Além da tabela de sucatas</p>
          <h2 className="mt-4 text-3xl font-black md:text-4xl">
            Encontrar material é o começo. Recuperar metais exige conhecimento.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-zinc-300">
            Eletrônicos podem chegar por doações, parcerias ou pontos de coleta,
            além de compra e venda. Outras fontes podem ser encontradas em
            diferentes atividades comerciais e industriais. A questão principal
            é como estudar e avaliar a recuperação dos metais presentes nesses materiais.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-zinc-500">
            Matéria-prima obtida gratuitamente não significa processamento sem custo.
            Composição, quantidade, estrutura e custos influenciam a viabilidade.
          </p>
        </section>

        <section className="mt-16 md:mt-20">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d89900]">Diversidade de materiais</p>
            <h2 className="mt-3 text-2xl font-black md:text-3xl">Fontes diferentes. Princípios que se conectam.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {fontes.map((fonte) => {
              const Icon = fonte.icon;
              return (
                <article key={fonte.titulo} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
                  <Icon className="h-8 w-8 text-[#d89900]" aria-hidden="true" />
                  <h3 className="mt-5 text-lg font-bold">{fonte.titulo}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">{fonte.descricao}</p>
                </article>
              );
            })}
          </div>
          <p className="mt-5 text-sm text-zinc-500">
            Esses exemplos não garantem a presença, o teor ou a recuperação economicamente viável de metais em todos os materiais.
          </p>
        </section>

        <section className="mt-20 rounded-3xl border border-[#d89900]/25 bg-gradient-to-br from-[#d89900]/10 via-zinc-950 to-zinc-950 p-7 md:p-12">
          <div className="grid items-start gap-10 md:grid-cols-[1fr_1.1fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d89900]">O método</p>
              <h2 className="mt-4 text-3xl font-black leading-tight md:text-4xl">
                Uma jornada progressiva, sem prometer atalhos.
              </h2>
              <p className="mt-6 leading-relaxed text-zinc-300">
                A proposta é começar pelos fundamentos e avançar de acordo com o
                conhecimento e a segurança adquiridos. O estudo da prata pode ser
                uma porta de entrada pedagógica; depois vêm o ouro e outras
                aplicações que exigem aprofundamento.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                A progressão não elimina riscos: a recuperação de metais requer
                conhecimentos técnicos, equipamentos adequados e controles de segurança.
              </p>
            </div>
            <div className="grid gap-3">
              {caminho.map((item) => (
                <div key={item.numero} className="flex gap-4 rounded-xl border border-zinc-800 bg-black/50 p-4">
                  <span className="shrink-0 text-2xl font-black text-[#d89900]">{item.numero}</span>
                  <div>
                    <h3 className="font-bold">{item.titulo}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-400">{item.texto}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d89900]">Dentro da formação</p>
            <h2 className="mt-4 text-3xl font-black md:text-4xl">O que você estudará</h2>
            <p className="mt-5 text-lg leading-relaxed text-zinc-300">
              Uma visão do programa apresentado na mentoria, com conteúdo
              técnico organizado para apoiar o desenvolvimento gradual.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <article className="rounded-2xl border border-zinc-800 bg-zinc-950 p-7">
              <BookOpen className="h-8 w-8 text-[#d89900]" />
              <h3 className="mt-5 text-xl font-bold">Fundamentos e estrutura</h3>
              <p className="mt-3 leading-relaxed text-zinc-400">
                Metalurgia nobre, ligas, laboratório, coleta e preparo de materiais.
              </p>
            </article>
            <article className="rounded-2xl border border-zinc-800 bg-zinc-950 p-7">
              <FlaskConical className="h-8 w-8 text-[#d89900]" />
              <h3 className="mt-5 text-xl font-bold">Rotas de recuperação</h3>
              <p className="mt-3 leading-relaxed text-zinc-400">
                Estudos de rotas pirometalúrgicas e hidrometalúrgicas, refino de ligas,
                eletrônicos, catalisadores e outros materiais previstos no programa.
              </p>
            </article>
            <article className="rounded-2xl border border-zinc-800 bg-zinc-950 p-7">
              <Recycle className="h-8 w-8 text-[#d89900]" />
              <h3 className="mt-5 text-xl font-bold">Segurança e resíduos</h3>
              <p className="mt-3 leading-relaxed text-zinc-400">
                Saúde e segurança, controle de riscos e tratamento responsável dos
                resíduos gerados durante o processamento.
              </p>
            </article>
          </div>
        </section>

        <section className="mt-20 grid gap-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 md:grid-cols-2 md:p-12">
          <div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-7 w-7 text-[#d89900]" />
              <h2 className="text-2xl font-black">Responsabilidade faz parte do método</h2>
            </div>
            <p className="mt-5 leading-relaxed text-zinc-300">
              Eficiência não significa ignorar custos ambientais. O aprendizado inclui
              atenção à proteção das pessoas, aos materiais utilizados e aos resíduos
              resultantes das atividades.
            </p>
          </div>
          <div className="grid gap-3">
            <p className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="h-5 w-5 shrink-0 text-[#d89900]" /> Segurança e boas práticas</p>
            <p className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="h-5 w-5 shrink-0 text-[#d89900]" /> Planejamento de estrutura e custos</p>
            <p className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="h-5 w-5 shrink-0 text-[#d89900]" /> Tratamento e destinação adequada de resíduos</p>
            <p className="flex items-center gap-3 text-sm text-zinc-300"><Leaf className="h-5 w-5 shrink-0 text-[#d89900]" /> Respeito às exigências ambientais aplicáveis</p>
          </div>
        </section>

        <section className="mt-20 rounded-3xl border border-[#d89900]/30 bg-gradient-to-r from-[#d89900]/10 via-zinc-950 to-black p-8 text-center md:p-14">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d89900]">O próximo passo</p>
          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black md:text-4xl">
            Conheça o programa completo da Mentoria Garimpo Urbano
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-zinc-300">
            Veja os módulos da formação e como o conhecimento do Prof. Goulart
            pode orientar sua jornada de aprendizagem.
          </p>
          <Link
            href={linkMentoria}
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-[#d89900] px-7 py-4 text-sm font-black text-black transition-colors hover:bg-[#edb33d]"
          >
            VER O CONTEÚDO DA MENTORIA
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-5 text-xs leading-relaxed text-zinc-500">
            Os resultados dependem do material, da técnica, dos custos e das condições de trabalho. A formação não garante rentabilidade.
          </p>
        </section>
      </main>
    </div>
  );
}
