// src/app/api/cotacoes/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  // PLANO DE EMERGÊNCIA: Caso o banco esteja completamente vazio
  // Adicionamos o Ródio aqui também com o valor base em Onça (USD)
  const fallbackCotacoes = {
    ouro: "2350.50", prata: "30.20", platina: "1050.30", paladio: "1020.90", rodio: "4750.00", dolar: "5.15",
    atualizadoEm: new Date().toISOString(),
    isFallback: true
  };

  try {
    // Busca APENAS a última cotação salva no Banco de Dados
    const ultimaCotacao = await prisma.cotacaoHistorico.findFirst({
      orderBy: { criadoEm: 'desc' }
    });

    if (ultimaCotacao) {
      return NextResponse.json({
        ouro: ultimaCotacao.ouro.toFixed(2),
        prata: ultimaCotacao.prata.toFixed(2),
        platina: ultimaCotacao.platina.toFixed(2),
        paladio: ultimaCotacao.paladio.toFixed(2),
        // Adicionamos o Ródio aqui! Se por acaso for null no banco antigo, ele manda o 4750.00
        rodio: ultimaCotacao.rodio ? ultimaCotacao.rodio.toFixed(2) : "4750.00",
        dolar: ultimaCotacao.dolar.toFixed(2),
        atualizadoEm: ultimaCotacao.criadoEm.toISOString(),
        isFallback: false
      });
    }

    // Se o banco estiver vazio, retorna o fallback
    return NextResponse.json(fallbackCotacoes);

  } catch (error) {
    console.error("Erro ao ler do banco de dados:", error.message);
    return NextResponse.json(fallbackCotacoes);
  }
}
