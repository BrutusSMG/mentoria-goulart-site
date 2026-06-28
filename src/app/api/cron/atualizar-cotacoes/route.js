// src/app/api/cron/atualizar-cotacoes/route.js

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Não autorizado', { status: 401 });
  }

  try {
    const headersYahoo = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
    };

    const fetchYahooPrice = async (ticker) => {
      const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`, { headers: headersYahoo, cache: 'no-store' } );
      if (!res.ok) throw new Error(`Erro Yahoo: ${ticker}`);
      const data = await res.json();
      return data.chart.result[0].meta.regularMarketPrice;
    };

    // 1. Busca Dólar e 4 Metais no Yahoo (Gratuito e Ilimitado)
    const [valorDolar, ouroUsdOz, prataUsdOz, platinaUsdOz, paladioUsdOz] = await Promise.all([
      fetchYahooPrice('BRL=X'),
      fetchYahooPrice('GC=F'),
      fetchYahooPrice('SI=F'),
      fetchYahooPrice('PL=F'),
      fetchYahooPrice('PA=F')
    ]);

    // 2. Busca APENAS o Ródio na GoldAPI (Gasta 1 requisição das 100 mensais)
    let rodioUsdOz = 4750.00; // Valor padrão caso a GoldAPI falhe
    
    try {
      const resRodio = await fetch(`https://www.goldapi.io/api/XRH/USD`, {
        headers: {
          'x-access-token': process.env.GOLD_API_KEY,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      } );
      if (resRodio.ok) {
        const dataRodio = await resRodio.json();
        if (dataRodio.price) rodioUsdOz = dataRodio.price;
      }
    } catch (e) {
      console.error("Aviso: Falha ao buscar Ródio na GoldAPI.");
    }

    // 3. Salva os valores PUROS (Onça e Dólar) no Banco de Dados
    const novaCotacao = await prisma.cotacaoHistorico.create({
      data: {
        dolar: valorDolar,
        ouro: ouroUsdOz,
        prata: prataUsdOz,
        platina: platinaUsdOz,
        paladio: paladioUsdOz,
        rodio: rodioUsdOz
      }
    });

    return NextResponse.json({ success: true, data: novaCotacao });

  } catch (error) {
    console.error("Erro no Cron:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
