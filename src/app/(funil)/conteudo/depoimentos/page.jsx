// Página educativa de depoimentos, integrada ao funil de e-book do MGU.
// Preserva a rota, a validação do lead e os parâmetros de origem das campanhas.
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  MessageCircle,
  PlayCircle,
  Quote,
  ShieldCheck,
} from "lucide-react";

export const metadata = {
  title: "Experiências dos Alunos | Garimpo Urbano",
  description: "Assista a relatos publicados e conheça experiências de alunos do Garimpo Urbano.",
  robots: "noindex, nofollow",
};

const VIDEO_DEPOIMENTOS_ID = "TZyBu67Ep2A";

// As oito imagens já são utilizadas no carrossel da página pública /mentoria.
const relatosPublicados = Array.from({ length: 8 }, (_, index) => {
  const numero = String(index + 1).padStart(2, "0");
  return {
    id: numero,
    url: "/testimonials/depoimento-" + numero + ".jpg",
  };
});

function normalizarImagemUrl(imagemUrl) {
  if (!imagemUrl || typeof imagemUrl !== "string") return null;
  const url = imagemUrl.trim().replaceAll("\\", "/");

  if (url.startsWith("/") && !url.startsWith("//")) return url;
  if (url.startsWith("public/")) return "/" + url.slice("public/".length);
  if (/^https?:\/\//i.test(url)) return url;

  return null;
}

function normalizarVideoUrl(valor) {
  const texto = String(valor || "").trim();
  if (!texto) return null;

  // Compatibilidade com vídeos legados salvos apenas como ID do YouTube.
  if (/^[a-zA-Z0-9_-]{11}$/.test(texto)) {
    return "https://www.youtube-nocookie.com/embed/" + texto;
  }

  try {
    const url = new URL(texto);
    if (url.protocol !== "https:") return null;

    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    let id = null;

    if (host === "youtu.be") {
      id = url.pathname.split("/")[1];
    } else if (host === "youtube.com" || host === "m.youtube.com") {
      id = url.pathname.startsWith("/shorts/") || url.pathname.startsWith("/embed/")
        ? url.pathname.split("/")[2]
        : url.searchParams.get("v");
    }
    if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) {
      return "https://www.youtube-nocookie.com/embed/" + id;
    }

    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const parts = url.pathname.split("/").filter(Boolean);
      const videoId = parts.find((parte) => /^[0-9]{6,15}$/.test(parte));
      if (videoId) return "https://player.vimeo.com/video/" + videoId;
    }
  } catch {
    return null;
  }
  return null;
}

function parametroSeguro(valor, fallback) {
  return typeof valor === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(valor)
    ? valor
    : fallback;
}

function montarLinkMentoria(email, params) {
  const query = new URLSearchParams({
    email,
    utm_source: parametroSeguro(params.utm_source, "brevo"),
    utm_medium: parametroSeguro(params.utm_medium, "email"),
    utm_campaign: parametroSeguro(params.utm_campaign, "ebook_nutricao"),
    utm_content: "pagina_depoimentos_mentoria",
  });
  return "/mentoria?" + query.toString();
}

function GaleriaRelatos({ items }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-3 transition-colors hover:border-[#d89900]/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d89900]"
          aria-label={"Abrir imagem do depoimento " + item.id}
        >
          <div className="flex h-72 items-center justify-center overflow-hidden rounded-xl bg-[#171717]">
            <Image
              src={item.url}
              alt={"Relato de aluno publicado na página da mentoria, registro " + item.id}
              width={390}
              height={560}
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          </div>
          <span className="mt-3 flex items-center justify-between gap-2 px-1 pb-1 text-sm font-medium text-zinc-300">
            Ver relato {item.id} em tamanho completo
            <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-[#d89900]" />
          </span>
        </a>
      ))}
    </div>
  );
}

export default async function DepoimentosPage({ searchParams }) {
  const params = (await searchParams) ?? {};
  const email =
    typeof params.email === "string" ? params.email.trim().toLowerCase() : "";

  if (!email) redirect("/");

  const lead = await prisma.lead.findUnique({
    where: { email },
    select: { nome: true, email: true },
  });

  if (!lead) redirect("/");

  const depoimentos = await prisma.depoimento.findMany({
    where: { aprovado: true },
    orderBy: [{ destaque: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      nome: true,
      texto: true,
      imagemUrl: true,
      videoUrl: true,
      destaque: true,
    },
  });

  const nomeLead = lead.nome?.trim() || "";
  const linkMentoria = montarLinkMentoria(lead.email, params);

  return (
    <main className="min-h-screen overflow-x-hidden bg-black pb-20 text-white">
      <header className="border-b border-zinc-800 bg-zinc-950/90 px-4 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/" aria-label="Garimpo Urbano - início">
            <Image
              src="/logo_fundoTransparentered.png"
              alt="Garimpo Urbano"
              width={170}
              height={75}
              priority
              className="h-auto w-auto max-w-32 object-contain sm:max-w-44"
            />
          </Link>
          <span className="rounded-full border border-[#d89900]/30 bg-[#d89900]/10 px-3 py-1.5 text-xs font-semibold text-[#f1ca75]">
            Conteúdo exclusivo MGU
          </span>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-zinc-900 bg-gradient-to-b from-zinc-950 via-black to-black px-4 py-14 md:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(216,153,0,0.14),transparent_46%)]" />
        <div className="relative mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#d89900]/35 bg-[#d89900]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#e8b35a]">
            <MessageCircle aria-hidden="true" className="h-4 w-4" />
            A voz de quem já estudou
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
            Conheça as experiências
            <span className="block text-[#d89900]">dos alunos do Garimpo Urbano.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-zinc-300">
            {nomeLead ? "Olá, " + nomeLead + "! " : ""}
            Antes de tomar uma decisão sobre sua formação, vale ouvir quem já
            conheceu o método e compartilhou sua própria experiência.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-500">
            São relatos individuais, publicados no Garimpo Urbano.
            Cada trajetória de estudo e seus resultados são diferentes.
          </p>
          <a
            href="#video-depoimentos"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg border border-[#d89900]/60 px-6 py-3.5 font-semibold text-[#f1ca75] transition-colors hover:bg-[#d89900]/10"
          >
            ASSISTIR AOS DEPOIMENTOS
            <ArrowDown aria-hidden="true" className="h-4 w-4" />
          </a>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-16 px-4 pt-14 md:space-y-20 md:pt-20">
        <section id="video-depoimentos" className="scroll-mt-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d89900]">
              Depoimentos em vídeo
            </p>
            <h2 className="mt-4 text-3xl font-black md:text-4xl">
              Ouça os alunos com suas próprias palavras
            </h2>
            <p className="mt-5 leading-relaxed text-zinc-400">
              Este é o mesmo vídeo de depoimentos apresentado na página
              oficial da mentoria.
            </p>
          </div>
          <div className="mx-auto mt-9 max-w-4xl overflow-hidden rounded-2xl border border-[#d89900]/35 bg-zinc-950 p-2 shadow-2xl shadow-black/60 md:p-3">
            <div className="aspect-video overflow-hidden rounded-xl bg-black">
              <iframe
                src={"https://www.youtube-nocookie.com/embed/" + VIDEO_DEPOIMENTOS_ID}
                title="Depoimentos de alunos do curso Garimpo Urbano"
                className="h-full w-full"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-zinc-500">
            O vídeo é hospedado no YouTube. Clique em reproduzir para assistir.
          </p>
        </section>

        {depoimentos.length > 0 && (
          <section>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d89900]">
                Relatos compartilhados
              </p>
              <h2 className="mt-4 text-3xl font-black md:text-4xl">
                Histórias contadas por quem participou
              </h2>
              <p className="mt-5 text-zinc-400">
                Depoimentos publicados no MGU, apresentados com as palavras dos próprios autores.
              </p>
            </div>
            <div className="mt-9 space-y-5">
              {depoimentos.map((dep) => {
                const imagem = normalizarImagemUrl(dep.imagemUrl);
                const video = normalizarVideoUrl(dep.videoUrl);
                const possuiMidia = Boolean(imagem || video);

                return (
                  <article
                    key={dep.id}
                    className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950"
                  >
                    <div className={"grid " + (possuiMidia ? "md:grid-cols-[1.1fr_0.9fr]" : "")}>
                      <div className="relative p-6 md:p-9">
                        <Quote
                          aria-hidden="true"
                          className="absolute right-5 top-5 h-12 w-12 text-[#d89900]/10"
                        />
                        <p className="relative flex items-center gap-2 text-sm font-bold text-[#e8b35a]">
                          <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
                          Relato publicado no MGU
                        </p>
                        <h3 className="relative mt-4 text-xl font-bold text-white">
                          {dep.nome}
                        </h3>
                        <blockquote className="relative mt-5 border-l-2 border-[#d89900] pl-5 text-lg font-medium leading-relaxed text-zinc-200 md:text-xl">
                          “{dep.texto}”
                        </blockquote>
                      </div>
                      {possuiMidia && (
                        <div className="flex flex-col justify-center gap-4 border-t border-zinc-800 bg-black/40 p-4 md:border-l md:border-t-0 md:p-6">
                          {video && (
                            <div className="aspect-video overflow-hidden rounded-xl border border-zinc-800">
                              <iframe
                                src={video}
                                title={"Vídeo com relato de " + dep.nome}
                                className="h-full w-full"
                                loading="lazy"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          )}
                          {imagem && (
                            <a
                              href={imagem}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block rounded-xl border border-zinc-800 bg-zinc-950 p-2 transition-colors hover:border-[#d89900]/50"
                            >
                              <Image
                                src={imagem}
                                alt={"Registro visual do relato de " + dep.nome}
                                width={650}
                                height={900}
                                unoptimized={/^https?:\/\//i.test(imagem)}
                                className="mx-auto max-h-[360px] w-auto max-w-full rounded-lg object-contain"
                              />
                              <p className="mt-3 text-center text-xs text-[#d89900]">
                                Abrir imagem em tamanho completo
                              </p>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        <section>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d89900]">
              Registros em imagens
            </p>
            <h2 className="mt-4 text-3xl font-black md:text-4xl">
              Outros relatos já publicados no Garimpo Urbano
            </h2>
            <p className="mt-5 leading-relaxed text-zinc-400">
              Imagens de depoimentos exibidas na página da mentoria.
              Clique em qualquer registro para ler em tamanho completo.
            </p>
          </div>
          <div className="mt-9">
            <GaleriaRelatos items={relatosPublicados.slice(0, 4)} />
          </div>
          <details className="group mt-5 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <summary className="cursor-pointer font-semibold text-[#e8b35a] marker:text-[#d89900]">
              Ver mais quatro relatos em imagens
            </summary>
            <div className="mt-6">
              <GaleriaRelatos items={relatosPublicados.slice(4)} />
            </div>
          </details>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-7 md:p-10">
          <div className="flex items-start gap-4">
            <ShieldCheck aria-hidden="true" className="mt-1 h-8 w-8 shrink-0 text-[#d89900]" />
            <div>
              <h2 className="text-xl font-bold md:text-2xl">
                Cada pessoa tem sua própria trajetória
              </h2>
              <p className="mt-4 leading-relaxed text-zinc-300">
                Os depoimentos mostram experiências individuais e não significam
                que todos alcançarão os mesmos resultados. A recuperação de metais
                exige conhecimento técnico, estrutura adequada, segurança e
                tratamento responsável de resíduos.
              </p>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-3xl border border-[#d89900]/30 bg-gradient-to-br from-[#d89900]/10 via-zinc-950 to-black p-7 text-center md:p-12">
          <BookOpen aria-hidden="true" className="mx-auto h-9 w-9 text-[#d89900]" />
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d89900]">
            Conheça o próximo passo
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black md:text-4xl">
            Quer saber como funciona a formação?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-zinc-300">
            Na página da mentoria você encontra a apresentação do método,
            os módulos disponíveis e as informações sobre inscrição.
            Aqui, você conheceu experiências de alunos que já passaram por esse caminho.
          </p>
          <Link
            href={linkMentoria}
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-[#d89900] px-7 py-4 text-sm font-black text-black transition-colors hover:bg-[#edb33d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            CONHECER A MENTORIA
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
          <p className="mt-5 text-xs text-zinc-500">
            Você pode conhecer o conteúdo e avaliar com calma se a formação é adequada ao seu momento.
          </p>
        </section>
      </div>
    </main>
  );
}
