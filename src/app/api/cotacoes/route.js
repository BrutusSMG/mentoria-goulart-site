// src/app/api/cotacoes/route.js

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const ultimaCotacao = await prisma.cotacaoHistorico.findFirst({
      orderBy: { criadoEm: 'desc' }
    });

    if (!ultimaCotacao) {
      return NextResponse.json({
        ouro: null,
        prata: null,
        platina: null,
        paladio: null,
        rodio: null,
        dolar: null,
        atualizadoEm: null,
      });
    }

    return NextResponse.json({
      ouro: ultimaCotacao.ouro.toFixed(2),
      prata: ultimaCotacao.prata.toFixed(2),
      platina: ultimaCotacao.platina.toFixed(2),
      paladio: ultimaCotacao.paladio.toFixed(2),
      rodio: ultimaCotacao.rodio != null
        ? ultimaCotacao.rodio.toFixed(2)
        : null,
      dolar: ultimaCotacao.dolar.toFixed(2),
      atualizadoEm: ultimaCotacao.criadoEm.toISOString(),
    });

  } catch (error) {
    console.error(
      "Erro ao ler cotações do banco de dados:",
      error?.message || error,
    );

    return NextResponse.json(
      {
        ouro: null,
        prata: null,
        platina: null,
        paladio: null,
        rodio: null,
        dolar: null,
        atualizadoEm: null,
      },
      { status: 503 },
    );
  }
}
