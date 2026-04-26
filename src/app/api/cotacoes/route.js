// src/app/api/cotacoes/route.js
import { NextResponse } from 'next/server';

export async function GET() {
  const fallbackCotacoes = {
    ouro: "415.50", prata: "5.20", platina: "165.30", paladio: "180.90",
    atualizadoEm: new Date().toISOString()
  };

  try {
    const apiKey = process.env.GOLD_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(fallbackCotacoes);
    }

    const headers = {
      'x-access-token': apiKey,
      'Content-Type': 'application/json'
    };

    // 1. Busca a cotação do Dólar (USD para BRL) em uma API pública e gratuita
    const dolarRes = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL', { next: { revalidate: 14400 } } );
    const dolarData = await dolarRes.json();
    const valorDolar = parseFloat(dolarData.USDBRL.bid); // Ex: 5.15

    // 2. Busca os metais em USD (como manda o exemplo da GoldAPI)
    const fetchCotacao = async (metal) => {
      const res = await fetch(`https://www.goldapi.io/api/${metal}/USD`, {
        method: 'GET',
        headers,
        next: { revalidate: 14400 } // Cache de 4 horas
      } );
      
      if (!res.ok) throw new Error(`Erro GoldAPI: ${res.status}`);
      const data = await res.json();
      if (!data.price) throw new Error(`Preço não encontrado para ${metal}`);
      
      return data;
    };

    const [ouroData, prataData, platinaData, paladioData] = await Promise.all([
      fetchCotacao('XAU'),
      fetchCotacao('XAG'),
      fetchCotacao('XPT'),
      fetchCotacao('XPD')
    ]);

    // 3. Converte de Onça (Oz) para Grama (g) E de Dólar (USD) para Real (BRL)
    const ozToGrams = 31.1034768;
    const converterParaBRLporGrama = (precoUsdOz) => {
      const precoUsdGrama = precoUsdOz / ozToGrams;
      return (precoUsdGrama * valorDolar).toFixed(2);
    };

    const cotacoes = {
      ouro: converterParaBRLporGrama(ouroData.price),
      prata: converterParaBRLporGrama(prataData.price),
      platina: converterParaBRLporGrama(platinaData.price),
      paladio: converterParaBRLporGrama(paladioData.price),
      dolar: valorDolar.toFixed(2),
      atualizadoEm: new Date().toISOString()
    };

    return NextResponse.json(cotacoes);

  } catch (error) {
    console.error("Erro na API de Cotações:", error.message);
    return NextResponse.json(fallbackCotacoes);
  }
}
