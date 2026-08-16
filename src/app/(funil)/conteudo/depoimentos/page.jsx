// src/app/(funil)/conteudo/depoimentos/page.jsx
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { ArrowRight, CheckCircle2, Quote, ShieldCheck, Sparkles } from 'lucide-react';

const prisma = new PrismaClient();

export const metadata = {
  title: 'Depoimentos de Alunos | Garimpo Urbano',
  robots: 'noindex, nofollow',
};

/**
 * Caminho físico: public/depoimentos/arquivo.webp
 * Valor no banco: /depoimentos/arquivo.webp
 */
function normalizarImagemUrl(imagemUrl) {
  if (!imagemUrl || typeof imagemUrl !== 'string') return null;

  const url = imagemUrl.trim().replaceAll('\\', '/');

  if (url.startsWith('/')) return url;

  // Mantém compatibilidade com registros antigos salvos como public/depoimentos/...
  if (url.startsWith('public/')) {
    return `/${url.replace(/^public\//, '')}`;
  }

  // Para imagens externas, será necessário configurar images.remotePatterns no next.config.mjs.
  if (url.startsWith('https://') || url.startsWith('http://')) return url;

  return null;
}

function montarLinkMentoria(email, utmSource, utmMedium, utmCampaign) {
  const params = new URLSearchParams({
    email,
    utm_source: utmSource || 'brevo',
    utm_medium: utmMedium || 'email',
    utm_campaign: utmCampaign || 'ebook_nutricao',
    utm_content: 'pagina_depoimentos_mentoria',
  });

  return `/mentoria?${params.toString()}`;
}

export default async function DepoimentosPage({ searchParams }) {
  const params = await searchParams;
  const email = typeof params.email === 'string'
    ? params.email.trim().toLowerCase()
    : '';

  if (!email) redirect('/');

  const lead = await prisma.lead.findUnique({
    where: { email },
    select: { nome: true, email: true },
  });

  if (!lead) redirect('/');

  const depoimentos = await prisma.depoimento.findMany({
    where: { aprovado: true },
    orderBy: [{ destaque: 'desc' }, { createdAt: 'desc' }],
  });

  const linkMentoria = montarLinkMentoria(
    lead.email,
    typeof params.utm_source === 'string' ? params.utm_source : undefined,
    typeof params.utm_medium === 'string' ? params.utm_medium : undefined,
    typeof params.utm_campaign === 'string' ? params.utm_campaign : undefined,
  );

  return (
    <div className="min-h-screen overflow-hidden bg-black text-white">
      {/* Hero */}
      <section className="relative border-b border-zinc-900 px-4 py-16 md:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(216,153,0,0.16),transparent_38%)]" />

        <div className="relative mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#d89900]/40 bg-[#d89900]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#d89900]">
            <Sparkles className="h-4 w-4" />
            Experiências compartilhadas
          </span>

          <h1 className="mt-6 text-4xl font-black leading-tight md:text-6xl">
            Quando o conhecimento começa a fazer sentido na prática
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-zinc-300">
            {lead.nome}, cada trajetória é única. Estes relatos mostram experiências de pessoas que buscaram aprender com mais base, orientação e responsabilidade.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 py-14 md:py-20">
        {depoimentos.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-6 py-16 text-center text-zinc-500">
            <p>Novos depoimentos em breve.</p>
          </div>
        ) : (
          <div className="space-y-8 md:space-y-10">
            {depoimentos.map((dep, index) => {
              const imagemUrl = normalizarImagemUrl(dep.imagemUrl);
              const possuiMidia = Boolean(dep.videoUrl || imagemUrl);

              return (
                <article
                  key={dep.id}
                  className="group relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 transition-colors hover:border-[#d89900]/45"
                >
                  <div className="absolute left-0 top-0 h-1 w-full bg-linear-to-r from-transparent via-[#d89900] to-transparent opacity-50" />

                  <div className={`grid ${possuiMidia ? 'md:grid-cols-[1.1fr_0.9fr]' : ''}`}>
                    {/* O texto vem primeiro no DOM e no mobile. */}
                    <div className="relative p-7 md:p-10">
                      <Quote className="absolute right-7 top-6 h-14 w-14 text-[#d89900]/10 md:right-10 md:top-8" fill="currentColor" />

                      <div className="relative">
                        <div className="mb-7 flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d89900]/30 bg-[#d89900]/10 text-sm font-black text-[#d89900]">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <div>
                            <p className="text-sm font-bold text-white">{dep.nome}</p>
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
                              <CheckCircle2 className="h-3.5 w-3.5 text-[#d89900]" />
                              Relato compartilhado com autorização
                            </p>
                          </div>
                        </div>

                        <blockquote className="border-l-2 border-[#d89900] pl-5 text-xl font-medium leading-relaxed text-zinc-100 md:text-2xl">
                          “{dep.texto}”
                        </blockquote>

                        <p className="mt-7 text-sm leading-relaxed text-zinc-500">
                          Toda experiência é individual e não representa garantia de resultados.
                        </p>
                      </div>
                    </div>

                    {/* Evidência visual vem depois do texto. */}
                    {possuiMidia && (
                      <div className="border-t border-zinc-800 bg-black/40 p-4 md:border-l md:border-t-0 md:p-6">
                        {dep.videoUrl ? (
                          <div className="overflow-hidden rounded-2xl border border-zinc-800 shadow-2xl shadow-black/50">
                            <div className="aspect-video">
                              <iframe
                                src={`https://www.youtube.com/embed/${dep.videoUrl}`}
                                title={`Depoimento de ${dep.nome}`}
                                className="h-full w-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          </div>
                        ) : null}

                        {imagemUrl ? (
                          <a
                            href={imagemUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-2 transition-colors hover:border-[#d89900]/50"
                            title="Abrir imagem do depoimento"
                          >
                            <Image
                              src={imagemUrl}
                              alt={`Print autorizado do depoimento de ${dep.nome}`}
                              width={720}
                              height={1600}
                              className="h-auto max-h-[500px] w-auto max-w-full rounded-xl object-contain"
                            />
                            <p className="px-2 pb-1 pt-3 text-center text-xs text-zinc-500">
                              Registro visual do relato
                            </p>
                          </a>
                        ) : null}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* CTA final */}
        <section className="relative mt-16 overflow-hidden rounded-3xl border border-[#d89900]/25 bg-linear-to-br from-[#d89900]/12 via-zinc-950 to-black p-8 text-center md:mt-20 md:p-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#d89900]/10 blur-3xl" />
          <div className="relative mx-auto max-w-2xl">
            <ShieldCheck className="mx-auto h-9 w-9 text-[#d89900]" />
            <h2 className="mt-5 text-3xl font-black md:text-4xl">
              Pronto para avaliar o seu próximo passo?
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-zinc-300">
              Se o método faz sentido para o seu momento, conheça como a Mentoria Garimpo Urbano organiza esse aprendizado de forma progressiva.
            </p>

            <Link
              href={linkMentoria}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-[#d89900] px-7 py-3.5 font-bold text-black transition-all hover:-translate-y-0.5 hover:bg-[#F7FA83] hover:shadow-lg hover:shadow-[#d89900]/20"
            >
              CONHECER A MENTORIA
              <ArrowRight className="h-4 w-4" />
            </Link>

            <p className="mt-5 text-sm text-zinc-500">
              Sem pressão: você pode continuar acompanhando os próximos materiais do funil.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
