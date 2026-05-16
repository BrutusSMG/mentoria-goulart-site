// src/app/api/cotacoes/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  // PLANO C: O valor fixo de emergência máxima (Pode ser atualizado periodicamente, quando a variação estiver defassada)
  const fallbackCotacoes = {
    ouro: "415.50", prata: "5.20", platina: "165.30", paladio: "180.90",
    atualizadoEm: new Date().toISOString(),
    isFallback: true
  };

  try {
    const apiKey = process.env.GOLD_API_KEY;    
    if (!apiKey) throw new Error("Chave da API não encontrada no ambiente.");
    const headers = {
      'x-access-token': apiKey,
      'Content-Type': 'application/json'
    };

    // 1. Busca a cotação do Dólar COM PROTEÇÃO
    let valorDolar = 5.15; // Valor de segurança (fallback) caso a API do dólar falhe na Vercel (Pode ser alterado periodicamente, quando a variação estiver defassada)    
    try {
      const dolarRes = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL', { next: { revalidate: 14400 } } );
      if (dolarRes.ok) {
        const dolarData = await dolarRes.json();
        if (dolarData?.USDBRL?.bid) valorDolar = parseFloat(dolarData.USDBRL.bid);
      }
    } catch (e) {
      console.error("Aviso: Falha no Dólar, usando valor base.");
    }

    // 2. Busca os metais em USD (como manda o exemplo da GoldAPI)
    const fetchCotacao = async (metal) => {
      const res = await fetch(`https://www.goldapi.io/api/${metal}/USD`, {
        method: 'GET', headers, next: { revalidate: 14400 } // Cache de 4 horas
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
      return ((precoUsdOz / ozToGrams) * valorDolar).toFixed(2);
    };

    const cotacoes = {
      ouro: converterParaBRLporGrama(ouroData.price),
      prata: converterParaBRLporGrama(prataData.price),
      platina: converterParaBRLporGrama(platinaData.price),
      paladio: converterParaBRLporGrama(paladioData.price),
      dolar: valorDolar.toFixed(2),
      atualizadoEm: new Date().toISOString(),
      isFallback: false
    };

    // PLANO A (SUCESSO): Salva essa cotação fresquinha no Banco de Dados!
    // Usamos await para garantir que salvou antes de responder ao usuário
    await prisma.cotacaoHistorico.create({
      data: {
        dolar: parseFloat(cotacoes.dolar),
        ouro: parseFloat(cotacoes.ouro),
        prata: parseFloat(cotacoes.prata),
        platina: parseFloat(cotacoes.platina),
        paladio: parseFloat(cotacoes.paladio),
      }
    });

    return NextResponse.json(cotacoes);

  } catch (error) {
    console.error("Erro na API externa. Tentando buscar do Banco de Dados...", error.message);

    // PLANO B: A API falhou. Vamos buscar a última cotação salva no Banco de Dados!
    try {
      const ultimaCotacao = await prisma.cotacaoHistorico.findFirst({
        orderBy: { criadoEm: 'desc' } // Pega a mais recente
      });

      if (ultimaCotacao) {
        console.log("Sucesso! Retornando última cotação do banco de dados.");
        return NextResponse.json({
          ouro: ultimaCotacao.ouro.toFixed(2),
          prata: ultimaCotacao.prata.toFixed(2),
          platina: ultimaCotacao.platina.toFixed(2),
          paladio: ultimaCotacao.paladio.toFixed(2),
          dolar: ultimaCotacao.dolar.toFixed(2),
          atualizadoEm: ultimaCotacao.criadoEm.toISOString(),
          isFallback: true // Avisa o frontend que é um valor de referência
        });
      }
    } catch (dbError) {
      console.error("Erro ao ler do banco de dados:", dbError.message);
    }

    // Se chegou aqui, a API falhou E o banco estava vazio. Usa o Plano C.
    return NextResponse.json(fallbackCotacoes);
  }
}
