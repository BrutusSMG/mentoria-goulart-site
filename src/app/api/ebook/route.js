// src/app/api/ebook/route.js
// Entrega o PDF do e-book somente para leads cadastrados (gate real da isca).

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');

    if (!leadId) {
      // Sem identificação: manda para a página de captura
      return NextResponse.redirect(new URL('/#ebook', request.url));
    }

    // Valida que o lead existe no banco
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      return NextResponse.redirect(new URL('/#ebook', request.url));
    }

    // Marca o download (substitui a chamada separada a /api/leads/download)
    await prisma.lead.update({
      where: { id: leadId },
      data: { baixouEbook: true },
    });

    // Lê e entrega o PDF
    const filePath = path.join(process.cwd(), 'private', 'como-transformar-lixo-eletronico-em-ouro.pdf');
    const fileBuffer = await readFile(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="como-transformar-lixo-eletronico-em-ouro.pdf"',
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    console.error('Erro ao entregar e-book:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
