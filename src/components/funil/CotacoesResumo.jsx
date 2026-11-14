// src/components/funil/CotacoesResumo.jsx
"use client";

import { useEffect, useState } from "react";
import { CircleAlert, RefreshCw } from "lucide-react";

const METAIS = [
  { chave: "ouro", nome: "Ouro" },
  { chave: "prata", nome: "Prata" },
  { chave: "platina", nome: "Platina" },
  { chave: "paladio", nome: "Paládio" },
];

const moedaGrama = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});
const moedaDolar = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});

function numeroPositivo(valor) {
  if (valor === null || valor === undefined) return null;
  const numero = Number(valor);
  return Number.isFinite(numero) && numero > 0 ? numero : null;
}

function formatarColeta(valor) {
  if (!valor) return null;
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return null;
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "short",
  }).format(data);
}

export default function CotacoesResumo() {
  const [dados, setDados] = useState(null);
  const [estado, setEstado] = useState("carregando");

  useEffect(() => {
    const controlador = new AbortController();

    async function consultar() {
      try {
        const resposta = await fetch("/api/cotacoes", {
          cache: "no-store",
          signal: controlador.signal,
        });
        if (!resposta.ok) throw new Error("Cotação indisponível");
        const resultado = await resposta.json();
        if (!controlador.signal.aborted) {
          setDados(resultado);
          setEstado("pronto");
        }
      } catch {
        if (!controlador.signal.aborted) setEstado("erro");
      }
    }

    void consultar();
    return () => controlador.abort();
  }, []);

  const consolidado = estado === "pronto" && dados?.origem === "CONSOLIDADA";
  const atualizadoEm = consolidado ? formatarColeta(dados.atualizadoEm) : null;

  return (
    <section aria-labelledby="cotacoes-titulo" className="rounded-2xl border border-[#d89900]/25 bg-zinc-950 p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#d89900]">
            Mercado de metais
          </p>
          <h2 id="cotacoes-titulo" className="mt-2 text-xl font-bold text-white sm:text-2xl">
            Cotações disponíveis no MGU
          </h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300">
          <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
          {estado === "carregando" ? "Consultando..." : atualizadoEm ? `Coleta: ${atualizadoEm}` : "Coleta indisponível"}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {METAIS.map(({ chave, nome }) => {
          const cotacao = consolidado ? dados.metais?.[chave] : null;
          const valor = cotacao?.status === "SUCESSO"
            ? numeroPositivo(cotacao.valorBrlGrama)
            : null;
          return (
            <div key={chave} className="min-w-0 rounded-xl border border-zinc-800 bg-black/70 p-3">
              <p className="text-sm text-zinc-400">{nome}</p>
              <p className="mt-1 text-base font-bold text-white sm:text-lg">
                {valor === null ? "Indisponível" : moedaGrama.format(valor)}
              </p>
              <p className="mt-1 text-xs text-zinc-500">por grama</p>
              {valor !== null && cotacao?.fonte ? (
                <p className="mt-2 break-words text-[11px] text-zinc-500">Fonte: {cotacao.fonte}</p>
              ) : null}
            </div>
          );
        })}
        <div className="min-w-0 rounded-xl border border-zinc-800 bg-black/70 p-3">
          <p className="text-sm text-zinc-400">Dólar (USD/BRL)</p>
          <p className="mt-1 text-base font-bold text-white sm:text-lg">
            {consolidado && numeroPositivo(dados.dolarBrl) !== null
              ? moedaDolar.format(numeroPositivo(dados.dolarBrl))
              : "Indisponível"}
          </p>
          <p className="mt-1 text-xs text-zinc-500">por US$ 1</p>
        </div>
      </div>

      {estado === "erro" || (estado === "pronto" && !consolidado) ? (
        <p role="status" className="mt-4 flex items-start gap-2 text-sm text-amber-300">
          <CircleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          Não há coleta consolidada disponível nesta consulta. Nenhum valor substituto foi utilizado.
        </p>
      ) : null}
      <p className="mt-4 text-xs leading-5 text-zinc-400">
        Valores da última coleta disponível no MGU, não necessariamente em tempo real.
        São cotações dos metais, <strong className="text-zinc-200">não preços por kg de sucata</strong>.
        O cobre ainda não integra esta fonte de cotações.
      </p>
    </section>
  );
}
