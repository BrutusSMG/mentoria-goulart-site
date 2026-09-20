// src/app/api/cron/atualizar-cotacoes/route.js

import { NextResponse } from 'next/server';

import { coletarCotacoesMetais } from '@/lib/cotacoes';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function possuiCotacaoUtil(registros) {
  return registros.some(
    (registro) =>
      registro.status === 'SUCESSO'
      || registro.status === 'PARCIAL',
  );
}

export async function GET(request) {
  const authHeader = request.headers.get('authorization');

  if (
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response('Não autorizado', {
      status: 401,
    });
  }

  try {
    const resultado = await coletarCotacoesMetais({
      db: prisma,
    });

    const possuiDados =
      possuiCotacaoUtil(resultado.registros);

    return NextResponse.json(
      {
        success: possuiDados,
        coletaId: resultado.coletaId,
        coletadoEm:
          resultado.coletadoEm.toISOString(),
        resumo: resultado.resumo,
      },
      {
        status: possuiDados ? 200 : 503,
      },
    );
  } catch (error) {
    console.error(
      'Erro no cron de cotações:',
      error?.message || error,
    );

    return NextResponse.json(
      {
        success: false,
        error: 'Falha ao atualizar cotações',
      },
      {
        status: 500,
      },
    );
  }
}
