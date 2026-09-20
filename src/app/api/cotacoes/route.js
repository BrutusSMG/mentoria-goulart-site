// src/app/api/cotacoes/route.js

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

const CHAVES_METAIS = {
  OURO: 'ouro',
  PRATA: 'prata',
  PLATINA: 'platina',
  PALADIO: 'paladio',
  RODIO: 'rodio',
};

function decimalParaNumero(valor) {
  if (valor === null || valor === undefined) {
    return null;
  }

  const numero = Number(valor);

  return Number.isFinite(numero)
    ? numero
    : null;
}

function serializarMetal(registro) {
  return {
    metal: registro.metal,
    status: registro.status,
    valorOriginal:
      decimalParaNumero(registro.valorOriginal),
    unidadeOriginal:
      registro.unidadeOriginal ?? null,
    moedaOriginal:
      registro.moedaOriginal ?? null,
    dolarBrl:
      decimalParaNumero(registro.dolarBrl),
    valorBrlGrama:
      decimalParaNumero(registro.valorBrlGrama),
    fonte:
      registro.fonte ?? null,
    fonteDolar:
      registro.fonteDolar ?? null,
    referenciaEm:
      registro.referenciaEm?.toISOString() ?? null,
    coletadoEm:
      registro.coletadoEm.toISOString(),
    erro:
      registro.erro ?? null,
  };
}

function respostaSemDados() {
  return {
    origem: 'SEM_DADOS',
    coletaId: null,
    atualizadoEm: null,
    dolarBrl: null,

    metais: {
      ouro: null,
      prata: null,
      platina: null,
      paladio: null,
      rodio: null,
    },

    // Compatibilidade temporária com HomepageHero.
    ouro: null,
    prata: null,
    platina: null,
    paladio: null,
    rodio: null,
    dolar: null,
  };
}

function montarRespostaConsolidada(registros) {
  if (!registros.length) {
    return null;
  }

  const primeiro = registros[0];

  const metais = {
    ouro: null,
    prata: null,
    platina: null,
    paladio: null,
    rodio: null,
  };

  for (const registro of registros) {
    const chave = CHAVES_METAIS[registro.metal];

    if (!chave) {
      continue;
    }

    metais[chave] = serializarMetal(registro);
  }

  const dolarBrl =
    registros
      .map((registro) =>
        decimalParaNumero(registro.dolarBrl),
      )
      .find((valor) => valor !== null)
    ?? null;

  return {
    origem: 'CONSOLIDADA',
    coletaId: primeiro.coletaId,
    atualizadoEm:
      primeiro.coletadoEm.toISOString(),
    dolarBrl,
    metais,

    // Compatibilidade temporária com HomepageHero.
    // A home antiga espera USD/onça + dólar para calcular BRL/g.
    ouro: metais.ouro?.valorOriginal ?? null,
    prata: metais.prata?.valorOriginal ?? null,
    platina: metais.platina?.valorOriginal ?? null,
    paladio: metais.paladio?.valorOriginal ?? null,
    rodio: metais.rodio?.valorOriginal ?? null,
    dolar: dolarBrl,
  };
}

function montarRespostaLegada(registro) {
  if (!registro) {
    return respostaSemDados();
  }

  return {
    origem: 'LEGADO',
    coletaId: null,
    atualizadoEm:
      registro.criadoEm.toISOString(),
    dolarBrl: registro.dolar,

    // Não inventamos metadados que o modelo legado
    // nunca armazenou.
    metais: {
      ouro: null,
      prata: null,
      platina: null,
      paladio: null,
      rodio: null,
    },

    // Compatibilidade com a home atual.
    ouro: registro.ouro,
    prata: registro.prata,
    platina: registro.platina,
    paladio: registro.paladio,
    // O histórico legado contém valores que podem ter vindo do antigo fallback fixo, sem cotação confirmada.
    rodio: null,
    dolar: registro.dolar,
  };
}

export async function GET() {
  try {
    const ultimaLinha =
      await prisma.cotacaoMetal.findFirst({
        orderBy: {
          coletadoEm: 'desc',
        },
        select: {
          coletaId: true,
        },
      });

    if (ultimaLinha) {
      const registros =
        await prisma.cotacaoMetal.findMany({
          where: {
            coletaId: ultimaLinha.coletaId,
          },
          orderBy: {
            metal: 'asc',
          },
        });

      const consolidada =
        montarRespostaConsolidada(registros);

      if (consolidada) {
        return NextResponse.json(consolidada);
      }
    }

    const legado =
      await prisma.cotacaoHistorico.findFirst({
        orderBy: {
          criadoEm: 'desc',
        },
      });

    return NextResponse.json(
      montarRespostaLegada(legado),
    );
  } catch (error) {
    console.error(
      'Erro ao ler cotações do banco de dados:',
      error?.message || error,
    );

    return NextResponse.json(
      respostaSemDados(),
      {
        status: 503,
      },
    );
  }
}
