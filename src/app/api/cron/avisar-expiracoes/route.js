// src/app/api/cron/avisar-expiracoes/route.js
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

import { processarAvisosExpiracao } from '@/lib/aviso-expiracao';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');

  if (
    !cronSecret ||
    authHeader !== `Bearer ${cronSecret}`
  ) {
    return NextResponse.json(
      {
        ok: false,
        erro: 'Não autorizado.',
      },
      {
        status: 401,
      },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        erro: 'RESEND_API_KEY não configurada.',
      },
      {
        status: 500,
      },
    );
  }

  try {
    const resend = new Resend(apiKey);

    const resultado = await processarAvisosExpiracao({
      resend,
      db: prisma,
    });

    const status = resultado.falhas > 0 ? 500 : 200;

    return NextResponse.json(
      {
        ok: resultado.falhas === 0,
        encontrados: resultado.encontrados,
        enviados: resultado.enviados,
        falhas: resultado.falhas,
        resultados: resultado.resultados,
      },
      {
        status,
      },
    );
  } catch (error) {
    console.error(
      '[CRON][AVISO_EXPIRACAO]',
      error?.message || error,
    );

    return NextResponse.json(
      {
        ok: false,
        erro: 'Falha ao processar avisos de expiração.',
      },
      {
        status: 500,
      },
    );
  }
}