// src/app/api/ebook/route.js
// Entrega o PDF do e-book somente para leads cadastrados (gate real da isca).

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  registrarInteracaoMarketing,
  TIPOS_INTERACAO_MARKETING,
} from '@/lib/interacao-marketing';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');

    if (!leadId) {
      return NextResponse.redirect(
        new URL('/#ebook', request.url),
      );
    }

    /*
     * baixouEbook é cumulativo:
     * depois de true, nunca volta para false.
     *
     * Para Leads já consolidados com Pessoa, o download também
     * gera um fato histórico em InteracaoMarketing.
     *
     * Leads históricos ainda sem Pessoa continuam funcionando,
     * mas não são vinculados automaticamente nesta etapa.
     */
    const resultado = await prisma.$transaction(
      async (tx) => {
        const lead = await tx.lead.findUnique({
          where: {
            id: leadId,
          },
          select: {
            id: true,
            pessoaId: true,
          },
        });

        if (!lead) {
          return {
            encontrado: false,
          };
        }

        await tx.lead.update({
          where: {
            id: leadId,
          },
          data: {
            baixouEbook: true,
          },
        });

        if (lead.pessoaId) {
          await registrarInteracaoMarketing(
            tx,
            {
              pessoaId: lead.pessoaId,
              tipo:
                TIPOS_INTERACAO_MARKETING
                  .EBOOK_DOWNLOAD,
              pagina: '/api/ebook',
            },
          );
        }

        return {
          encontrado: true,
        };
      },
    );

    if (!resultado.encontrado) {
      return NextResponse.redirect(
        new URL('/#ebook', request.url),
      );
    }

    const filePath = path.join(
      process.cwd(),
      'private',
      'como-transformar-lixo-eletronico-em-ouro.pdf',
    );

    const fileBuffer = await readFile(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition':
          'inline; filename="como-transformar-lixo-eletronico-em-ouro.pdf"',
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    console.error(
      'Erro ao entregar e-book:',
      error,
    );

    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 },
    );
  }
}
