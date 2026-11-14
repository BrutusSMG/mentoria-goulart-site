import Image from "next/image";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BookOpen, CalendarClock, CircleHelp, ShieldCheck } from "lucide-react";
import CotacoesResumo from "@/components/funil/CotacoesResumo";
import LinkOfertaSucata from "@/components/funil/LinkOfertaSucata";

export const metadata = {
  title: "Tabela de Valores de Sucatas | Garimpo Urbano",
  description: "Referências cadastradas de valores de sucatas eletrônicas, contexto e cotações dos metais do MGU.",
  robots: "noindex, nofollow",
};

const reaisKg = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function dataBrasil(valor) {
  if (!valor) return "Não informada";
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "Não informada";
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
  }).format(data);
}

function parametro(valor, padrao) {
  return typeof valor === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(valor)
    ? valor
    : padrao;
}

export default async function ValoresSucataPage({ searchParams }) {
  const params = await searchParams;
  const email = typeof params?.email === "string" ? params.email.trim().toLowerCase() : "";
  if (!email) redirect("/");

  const lead = await prisma.lead.findUnique({
    where: { email },
    select: { nome: true },
  });
  if (!lead) redirect("/");

  const sucatas = await prisma.sucataItem.findMany({
    where: { ativo: true },
    orderBy: [{ categoria: "asc" }, { nome: "asc" }],
    select: {
      id: true,
      nome: true,
      metais: true,
      valorKg: true,
      ultimaAtualizacao: true,
    },
  });

  const ultimaRevisao = sucatas.reduce((maisRecente, item) => {
    const data = item.ultimaAtualizacao ? new Date(item.ultimaAtualizacao) : null;
    return data && (!maisRecente || data > maisRecente) ? data : maisRecente;
  }, null);

  const origem = parametro(params?.utm_source, "brevo");
  const campanha = parametro(params?.utm_campaign, "ebook_nutricao");

  return (
    <main className="min-h-screen bg-black pb-20 text-white">
      <header className="border-b border-zinc-800 bg-zinc-950/90 px-4 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Image src="/logo_fundoTransparentered.png" alt="Garimpo Urbano" width={170} height={75} priority className="h-auto w-auto max-w-36 object-contain sm:max-w-44" />
          <span className="rounded-full border border-[#d89900]/30 bg-[#d89900]/10 px-3 py-1.5 text-xs font-semibold text-[#f1ca75]">
            Conteúdo exclusivo MGU
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-10 px-4 pt-10 sm:pt-14">
        <section className="relative overflow-hidden rounded-3xl border border-[#d89900]/20 bg-gradient-to-br from-[#d89900]/10 via-zinc-950 to-black px-6 py-10 sm:px-10 sm:py-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d89900]">Capítulo extra • Garimpo Urbano</p>
          <h1 className="mt-4 max-w-3xl text-3xl font-black leading-tight sm:text-5xl">
            Quanto valem as principais sucatas eletrônicas?
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-300 sm:text-lg">
            Olá, <strong className="text-white">{lead.nome || "futuro garimpeiro"}</strong>.
            Explore as referências de valores cadastradas no MGU e acompanhe as cotações de metais que ajudam a contextualizar esse mercado.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3 text-sm text-zinc-300">
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-black/40 px-4 py-2">
              <CalendarClock aria-hidden="true" className="h-4 w-4 text-[#d89900]" />
              Revisão mais recente: {dataBrasil(ultimaRevisao)}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-black/40 px-4 py-2">
              <ShieldCheck aria-hidden="true" className="h-4 w-4 text-[#d89900]" />
              Referências, não ofertas de compra
            </span>
          </div>
        </section>

        <CotacoesResumo />

        <section aria-labelledby="tabela-sucatas">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#d89900]">Material eletrônico</p>
            <h2 id="tabela-sucatas" className="mt-2 text-2xl font-extrabold sm:text-3xl">Tabela de referência de sucatas</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
              Valores por quilograma cadastrados no MGU. Não são recalculados automaticamente quando o ouro,
              a prata ou o dólar mudam. Os preços reais variam conforme tipo, classificação, condição,
              quantidade, região e negociação.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950">
            <table className="w-full min-w-[620px] text-left">
              <thead className="bg-zinc-900 text-sm text-zinc-200">
                <tr>
                  <th scope="col" className="px-5 py-4 font-semibold">Material</th>
                  <th scope="col" className="px-5 py-4 font-semibold">Metais presentes</th>
                  <th scope="col" className="px-5 py-4 text-right font-semibold">Referência (R$/kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {sucatas.length === 0 ? (
                  <tr><td colSpan={3} className="px-5 py-10 text-center text-zinc-400">Tabela em revisão. Não há valores disponíveis neste momento.</td></tr>
                ) : sucatas.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-zinc-900/70">
                    <th scope="row" className="px-5 py-4 text-sm font-medium text-white">{item.nome}</th>
                    <td className="px-5 py-4 text-sm text-zinc-400">{item.metais}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-right font-bold tabular-nums text-emerald-300">
                      {reaisKg.format(Number(item.valorKg))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <CircleHelp aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-[#d89900]" />
              <div>
                <h3 className="font-bold text-white">Como interpretar esses valores?</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Esta é uma tabela indicativa, alimentada pelos valores cadastrados e revisados no MGU.
                  Não representa cotação automática de compra, nem garantia de preço. Antes de negociar,
                  confirme a classificação do material, as condições do lote e a oferta real do comprador.
                  A coleta das cotações metálicas acima é independente da revisão desta tabela.
                </p>
                <p className="mt-2 text-xs text-zinc-500">Última revisão registrada da tabela: {dataBrasil(ultimaRevisao)} (Brasília).</p>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="proximo-passo" className="rounded-3xl border border-[#d89900]/30 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black px-6 py-10 text-center sm:px-10 sm:py-12">
          <BookOpen aria-hidden="true" className="mx-auto h-9 w-9 text-[#d89900]" />
          <h2 id="proximo-passo" className="mx-auto mt-4 max-w-2xl text-2xl font-black sm:text-3xl">
            Identificar o valor é só o começo. Aprenda a avaliar os materiais com método.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base">
            Conheça a formação Garimpo Urbano e veja como o Prof. Goulart organiza o aprendizado sobre identificação,
            separação e recuperação de metais, com atenção à técnica e à segurança.
          </p>
          <div className="mt-7"><LinkOfertaSucata origem={origem} campanha={campanha} /></div>
          <p className="mt-4 text-xs text-zinc-500">Conhecer a formação não obriga a realizar uma compra.</p>
        </section>
      </div>
    </main>
  );
}
