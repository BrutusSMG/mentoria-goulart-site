// src/lib/cotacoes.js

import { randomUUID } from 'node:crypto';

export const GRAMAS_POR_ONCA_TROY = 31.1034768;

export const FONTE_YAHOO = 'Yahoo Finance';
export const FONTE_RODIO = 'GoldAPI';

export const METAIS_YAHOO = [
  {
    metal: 'OURO',
    ticker: 'GC=F',
  },
  {
    metal: 'PRATA',
    ticker: 'SI=F',
  },
  {
    metal: 'PLATINA',
    ticker: 'PL=F',
  },
  {
    metal: 'PALADIO',
    ticker: 'PA=F',
  },
];

const TIMEOUT_YAHOO_MS = 8000;

export function converterUsdOzTroyParaBrlGrama(
  valorUsdOzTroy,
  dolarBrl,
) {
  const valor = Number(valorUsdOzTroy);
  const dolar = Number(dolarBrl);

  if (
    !Number.isFinite(valor)
    || !Number.isFinite(dolar)
    || valor <= 0
    || dolar <= 0
  ) {
    return null;
  }

  return (valor * dolar) / GRAMAS_POR_ONCA_TROY;
}

function converterTimestampYahoo(timestamp) {
  const valor = Number(timestamp);

  if (!Number.isFinite(valor) || valor <= 0) {
    return null;
  }

  return new Date(valor * 1000);
}

export async function buscarCotacaoYahoo(
  ticker,
  {
    fetchImpl = fetch,
  } = {},
) {
  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/`
    + encodeURIComponent(ticker);

  try {
    const resposta = await fetchImpl(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
          + 'AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_YAHOO_MS),
    });

    if (!resposta.ok) {
      return {
        ok: false,
        ticker,
        valor: null,
        referenciaEm: null,
        erro:
          `Yahoo Finance respondeu HTTP ${resposta.status} `
          + `para ${ticker}`,
      };
    }

    const payload = await resposta.json();

    if (payload?.chart?.error) {
      return {
        ok: false,
        ticker,
        valor: null,
        referenciaEm: null,
        erro:
          `Yahoo Finance retornou erro para ${ticker}: `
          + String(
            payload.chart.error.description
            || payload.chart.error.code
            || 'erro não informado',
          ),
      };
    }

    const meta = payload?.chart?.result?.[0]?.meta;
    const valor = Number(meta?.regularMarketPrice);

    if (!Number.isFinite(valor) || valor <= 0) {
      return {
        ok: false,
        ticker,
        valor: null,
        referenciaEm: null,
        erro:
          `Yahoo Finance não retornou preço válido para ${ticker}`,
      };
    }

    return {
      ok: true,
      ticker,
      valor,
      referenciaEm: converterTimestampYahoo(
        meta?.regularMarketTime,
      ),
      erro: null,
    };
  } catch (error) {
    return {
      ok: false,
      ticker,
      valor: null,
      referenciaEm: null,
      erro:
        `Falha ao consultar Yahoo Finance para ${ticker}: `
        + String(error?.message || error),
    };
  }
}

export function montarRegistroMetal({
  coletaId,
  metal,
  cotacaoMetal,
  cotacaoDolar,
  coletadoEm,
  fonte = FONTE_YAHOO,
  indisponivel = false,
  erroIndisponibilidade = null,
}) {
  const dolarDisponivel = cotacaoDolar?.ok === true;

  const base = {
    coletaId,
    metal,
    valorOriginal: null,
    unidadeOriginal: null,
    moedaOriginal: null,
    dolarBrl: dolarDisponivel
      ? cotacaoDolar.valor
      : null,
    valorBrlGrama: null,
    fonte,
    fonteDolar: FONTE_YAHOO,
    referenciaEm: null,
    coletadoEm,
    status: 'ERRO',
    erro: null,
  };

  if (indisponivel) {
    return {
      ...base,
      status: 'INDISPONIVEL',
      erro:
        erroIndisponibilidade
        || 'Cotação indisponível na fonte configurada',
    };
  }

  if (!cotacaoMetal?.ok) {
    return {
      ...base,
      status: 'ERRO',
      erro:
        cotacaoMetal?.erro
        || `Não foi possível obter a cotação de ${metal}`,
    };
  }

  const valorBrlGrama = dolarDisponivel
    ? converterUsdOzTroyParaBrlGrama(
        cotacaoMetal.valor,
        cotacaoDolar.valor,
      )
    : null;

  return {
    ...base,
    valorOriginal: cotacaoMetal.valor,
    unidadeOriginal: 'onca_troy',
    moedaOriginal: 'USD',
    valorBrlGrama,
    referenciaEm: cotacaoMetal.referenciaEm || null,
    status: dolarDisponivel ? 'SUCESSO' : 'PARCIAL',
    erro: dolarDisponivel
      ? null
      : (
          'Cotação original obtida, mas a conversão para BRL/g '
          + 'não pôde ser calculada porque o dólar está indisponível'
        ),
  };
}

export async function coletarCotacoesMetais({
  db,
  fetchImpl = fetch,
  coletaId = randomUUID(),
  coletadoEm = new Date(),
} = {}) {
  if (!db?.cotacaoMetal?.createMany) {
    throw new Error(
      'Dependência db.cotacaoMetal.createMany não informada',
    );
  }

  const consultas = await Promise.all([
    buscarCotacaoYahoo('BRL=X', {
      fetchImpl,
    }),
    ...METAIS_YAHOO.map(({ ticker }) =>
      buscarCotacaoYahoo(ticker, {
        fetchImpl,
      }),
    ),
  ]);

  const [
    cotacaoDolar,
    ...cotacoesMetaisYahoo
  ] = consultas;

  const registros = METAIS_YAHOO.map(
    ({ metal }, indice) =>
      montarRegistroMetal({
        coletaId,
        metal,
        cotacaoMetal: cotacoesMetaisYahoo[indice],
        cotacaoDolar,
        coletadoEm,
      }),
  );

  registros.push(
    montarRegistroMetal({
      coletaId,
      metal: 'RODIO',
      cotacaoMetal: null,
      cotacaoDolar,
      coletadoEm,
      fonte: FONTE_RODIO,
      indisponivel: true,
      erroIndisponibilidade:
        'Ródio indisponível na fonte atualmente configurada',
    }),
  );

  await db.cotacaoMetal.createMany({
    data: registros,
  });

  return {
    coletaId,
    coletadoEm,
    registros,
    resumo: Object.fromEntries(
      registros.map((registro) => [
        registro.metal,
        registro.status,
      ]),
    ),
  };
}
