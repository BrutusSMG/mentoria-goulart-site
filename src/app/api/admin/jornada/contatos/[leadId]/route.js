// src/app/api/admin/jornada/contatos/[leadId]/route.js
import { NextResponse } from 'next/server';
import {
  obterAcessoModulo,
  prisma,
  respostaAcessoNegado,
} from '@/lib/admin-permissoes';

export async function GET(_request, { params }) {
  const acesso = await obterAcessoModulo('JORNADA');
  if (!acesso.permitido) return respostaAcessoNegado(acesso);

  const { leadId } = await params;

  if (!leadId) {
    return NextResponse.json(
      { error: 'Identificador do contato não informado.' },
      { status: 400 },
    );
  }

  try {
    const contato = await prisma.lead.findUnique({
      where: { id: leadId },
      select: {
        id: true,
        nome: true,
        email: true,
        whatsapp: true,
        createdAt: true,
        updatedAt: true,
        jornadaContribuicoes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!contato) {
      return NextResponse.json(
        { error: 'Contato não encontrado.' },
        { status: 404 },
      );
    }

    return NextResponse.json(contato, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    console.error('[ADMIN_JORNADA_DETALHE]', error);
    return NextResponse.json(
      { error: 'Não foi possível carregar o contato.' },
      {
        status: 500,
        headers: { 'Cache-Control': 'private, no-store' },
      },
    );
  }
}