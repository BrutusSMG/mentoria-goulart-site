// src/components/homepage/CotacoesTicker.jsx
"use client";

import { useEffect, useRef, useState } from 'react';

const ITENS = [
  { chave: 'dolar', nome: 'Dólar', cor: 'text-emerald-300' },
  { chave: 'ouro', nome: 'Ouro', cor: 'text-[#e5b94e]' },
  { chave: 'prata', nome: 'Prata', cor: 'text-zinc-100' },
  { chave: 'platina', nome: 'Platina', cor: 'text-sky-200' },
  { chave: 'paladio', nome: 'Paládio', cor: 'text-violet-200' },
  { chave: 'rodio', nome: 'Ródio', cor: 'text-rose-200' },
];

const formatadorBRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatadorDolar = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});

const formatadorUSD = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 3,
});

function numeroPositivo(valor) {
  const numero = Number(valor);

  return valor !== null
    && valor !== undefined
    && Number.isFinite(numero)
    && numero > 0
    ? numero
    : null;
}

function formatarData(valor) {
  if (!valor) return 'Não informada';

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return 'Não informada';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(data);
}

function obterPreco(item, cotacoes) {
  if (item.chave === 'dolar') {
    const dolar = numeroPositivo(cotacoes?.dolarBrl);

    return dolar === null
      ? 'Indisponível'
      : formatadorDolar.format(dolar);
  }

  const registro = cotacoes?.metais?.[item.chave];
  const valor = numeroPositivo(registro?.valorBrlGrama);

  if (registro?.status !== 'SUCESSO' || valor === null) {
    return 'Indisponível';
  }

  return `${formatadorBRL.format(valor)} /g`;
}

function DetalhesCotacao({ item, cotacoes }) {
  if (!item) return null;

  if (item.chave === 'dolar') {
    const dolar = numeroPositivo(cotacoes?.dolarBrl);
    const fonteDolar =
      cotacoes?.metais?.ouro?.fonteDolar
      || 'Fonte não informada';

    return (
      <div
        id="detalhes-cotacao"
        data-cotacao-detalhes
        className="mx-auto max-w-4xl rounded-xl border border-emerald-500/25 bg-zinc-950 px-4 py-4 text-left shadow-xl"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="font-semibold text-emerald-300">
            Dólar — USD/BRL
          </span>
          <strong className="text-xl text-white">
            {dolar === null
              ? 'Cotação indisponível'
              : formatadorDolar.format(dolar)}
          </strong>
        </div>

        <p className="mt-3 text-xs text-zinc-400">
          Fonte: {fonteDolar} · Coletado em{' '}
          {formatarData(cotacoes?.atualizadoEm)} (Brasília)
        </p>
      </div>
    );
  }

  const registro = cotacoes?.metais?.[item.chave];
  const valorGrama = numeroPositivo(registro?.valorBrlGrama);

  const disponivel =
    registro?.status === 'SUCESSO'
    && valorGrama !== null;

  const valorOriginal = numeroPositivo(registro?.valorOriginal);
  const dolar = numeroPositivo(registro?.dolarBrl);

  return (
    <div
      id="detalhes-cotacao"
      data-cotacao-detalhes
      className="mx-auto max-w-4xl rounded-xl border border-[#d89900]/30 bg-zinc-950 px-4 py-4 text-left shadow-xl"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className={`text-lg font-semibold ${item.cor}`}>
          {item.nome}
        </h3>

        <span
          className={
            disponivel
              ? 'rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300'
              : 'rounded-full bg-rose-500/10 px-3 py-1 text-xs text-rose-200'
          }
        >
          {disponivel ? 'Disponível' : 'Indisponível'}
        </span>
      </div>

      <p className={`mt-2 text-2xl font-bold ${item.cor}`}>
        {disponivel
          ? `${formatadorBRL.format(valorGrama)} /g`
          : 'Cotação em R$/g indisponível'}
      </p>

      {disponivel && (
        <div className="mt-3 grid grid-cols-3 gap-1.5 text-xs sm:gap-3 sm:text-sm">
          {[
            ['10 g', 10],
            ['100 g', 100],
            ['1 kg', 1000],
          ].map(([peso, multiplicador]) => (
            <div
              key={peso}
              className="min-w-0 rounded-lg border border-zinc-800 bg-zinc-900/70 p-2 sm:p-3"
            >
              <p className="text-xs text-zinc-400">{peso}</p>
              <strong className="mt-1 block break-all text-[10px] leading-tight text-white sm:text-sm">
                {formatadorBRL.format(valorGrama * multiplicador)}
              </strong>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 space-y-1 text-xs leading-5 text-zinc-400">
        {valorOriginal !== null && (
          <p>
            Preço original: {formatadorUSD.format(valorOriginal)}
            {registro?.unidadeOriginal === 'onca_troy'
              ? ' / onça troy'
              : registro?.unidadeOriginal
                ? ` / ${registro.unidadeOriginal}`
                : ''}
          </p>
        )}

        {dolar !== null && (
          <p>Dólar utilizado: {formatadorDolar.format(dolar)}</p>
        )}

        <p>
          Fonte cadastrada: {registro?.fonte || 'Não informada'}
        </p>

        {registro?.referenciaEm && (
          <p>
            Referência da cotação:{' '}
            {formatarData(registro.referenciaEm)} (Brasília)
          </p>
        )}

        <p>
          Coletado em: {formatarData(registro?.coletadoEm)} (Brasília)
        </p>

        {!disponivel && (
          <p className="text-rose-200">
            {registro?.erro
              || 'Não há um preço em R$/g disponível para este metal.'}
          </p>
        )}
      </div>
    </div>
  );
}

function FaixaItens({
  cotacoes,
  ativo,
  setSelecionado,
  setHover,
  setFocado,
  duplicada = false,
}) {
  return (
    <div
      className="flex min-w-[100vw] shrink-0 items-center justify-around gap-5 px-5"
      aria-hidden={duplicada ? 'true' : undefined}
      style={duplicada ? { pointerEvents: 'none' } : undefined}
    >
      {ITENS.map((item) => (
        <button
          key={item.chave}
          type="button"
          data-cotacao-interativo
          tabIndex={duplicada ? -1 : 0}
          aria-expanded={
            duplicada ? undefined : ativo === item.chave
          }
          aria-controls={
            !duplicada && ativo === item.chave
              ? 'detalhes-cotacao'
              : undefined
          }
          onPointerEnter={(event) => {
            if (event.pointerType === 'mouse') {
              setHover(item.chave);
            }
          }}
          onPointerLeave={(event) => {
            if (event.pointerType === 'mouse') {
              setHover(null);
            }
          }}
          onFocus={() => setFocado(item.chave)}
          onBlur={() => setFocado(null)}
          onClick={(event) => {
            setSelecionado((anterior) =>
              anterior === item.chave ? null : item.chave
            );

            // Evita que o foco permaneça no botão após um toque.
            // Preserva a navegação pelo teclado.
            if (event.detail > 0) {
              event.currentTarget.blur();
            }
          }}
          className="flex shrink-0 items-baseline gap-2 whitespace-nowrap rounded-lg px-2 py-2 text-sm transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d89900]"
        >
          <span className="text-zinc-300">{item.nome}:</span>
          <strong className={item.cor}>
            {obterPreco(item, cotacoes)}
          </strong>
        </button>
      ))}
    </div>
  );
}

export default function CotacoesTicker() {
  const [cotacoes, setCotacoes] = useState(null);
  const [situacao, setSituacao] = useState('carregando');
  const [selecionado, setSelecionado] = useState(null);
  const [hover, setHover] = useState(null);
  const [focado, setFocado] = useState(null);
  const tickerRef = useRef(null);

  useEffect(() => {
    function fecharPainel() {
      setSelecionado(null);
      setHover(null);
      setFocado(null);

      if (tickerRef.current?.contains(document.activeElement)) {
        document.activeElement?.blur();
      }
    }

    function aoTocarNaPagina(event) {
      const dentroDoTicker =
        tickerRef.current?.contains(event.target);

      const tocouEmAreaInterativa =
        event.target.closest?.('[data-cotacao-interativo]');

      if (dentroDoTicker && tocouEmAreaInterativa) {
        return;
      }

      fecharPainel();
    }

    function aoPressionarTecla(event) {
      if (event.key === 'Escape') {
        fecharPainel();
      }
    }

    document.addEventListener('pointerdown', aoTocarNaPagina);
    document.addEventListener('keydown', aoPressionarTecla);

    return () => {
      document.removeEventListener('pointerdown', aoTocarNaPagina);
      document.removeEventListener('keydown', aoPressionarTecla);
    };
  }, []);

  useEffect(() => {
    const controlador = new AbortController();

    async function carregar() {
      try {
        const resposta = await fetch('/api/cotacoes', {
          cache: 'no-store',
          signal: controlador.signal,
        });

        if (!resposta.ok) {
          throw new Error(`HTTP ${resposta.status}`);
        }

        const dados = await resposta.json();

        if (!controlador.signal.aborted) {
          setCotacoes(dados);
          setSituacao('pronto');
        }
      } catch (erro) {
        if (!controlador.signal.aborted) {
          console.error('Falha ao carregar cotações:', erro);
          setSituacao('erro');
        }
      }
    }

    carregar();

    return () => controlador.abort();
  }, []);

  const ativo = hover ?? focado ?? selecionado;
  const itemAtivo = ITENS.find((item) => item.chave === ativo);

  const consolidada =
    situacao === 'pronto'
    && cotacoes?.origem === 'CONSOLIDADA';

  return (
    <div
      className="relative z-30 w-full border-b border-zinc-800 bg-zinc-900/95 text-white backdrop-blur-md"
      onMouseLeave={() => setHover(null)}
    >
      {consolidada ? (
        <>
          <div className="relative overflow-hidden py-1">
            <div className="ticker-track flex w-max">
              <FaixaItens
                cotacoes={cotacoes}
                ativo={ativo}
                setSelecionado={setSelecionado}
                setHover={setHover}
                setFocado={setFocado}
              />

              <FaixaItens
                cotacoes={cotacoes}
                ativo={ativo}
                setSelecionado={setSelecionado}
                setHover={setHover}
                setFocado={setFocado}
                duplicada
              />
            </div>
          </div>

          {itemAtivo && (
            <div className="border-t border-zinc-800 px-3 py-3">
              <DetalhesCotacao
                item={itemAtivo}
                cotacoes={cotacoes}
              />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-black/70 px-4 py-2 text-[11px] text-[#d8b35f]">
            <span>
              Coleta: {formatarData(cotacoes.atualizadoEm)} (Brasília)
            </span>
            <span aria-hidden="true">•</span>
            <span>
              Referência de mercado; não é preço de compra de sucata
            </span>
          </div>
        </>
      ) : (
        <div
          className="px-4 py-3 text-center text-sm text-zinc-300"
          role="status"
        >
          {situacao === 'carregando'
            ? 'Carregando cotações...'
            : situacao === 'erro'
              ? 'Não foi possível consultar as cotações.'
              : cotacoes?.origem === 'LEGADO'
                ? `Aguardando nova coleta de cotações. Último registro legado: ${formatarData(cotacoes.atualizadoEm)} (Brasília).`
                : 'Nenhuma cotação consolidada disponível.'}
        </div>
      )}

      <style jsx>{`
        @keyframes ticker-deslizar {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .ticker-track {
          animation: ticker-deslizar 45s linear infinite;
        }

        div:hover > div > .ticker-track,
        div:focus-within > div > .ticker-track {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .ticker-track {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
