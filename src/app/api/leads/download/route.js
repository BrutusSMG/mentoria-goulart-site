// src/app/api/leads/download/route.js
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const { leadId } = await request.json();

    if (!leadId) {
      return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 });
    }

    // Atualiza o lead no banco informando que ele baixou o e-book
    await prisma.lead.update({
      where: { id: leadId },
      data: { baixouEbook: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao registrar download:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
