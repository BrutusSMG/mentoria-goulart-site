// src/app/api/admin/jornada/contatos/route.js
import { NextResponse } from 'next/server';
import {
  obterAcessoModulo,
  prisma,
  respostaAcessoNegado,
} from '@/lib/admin-permissoes';
import {
  paginaSegura,
  tamanhoPaginaSegura,
} from '@/lib/jornada-triagem';

export async function GET(request) {
  const acesso = await obterAcessoModulo('JORNADA');
  if (!acesso.permitido) return respostaAcessoNegado(acesso);

  try {
    const { searchParams } = new URL(request.url);
    const busca = searchParams.get('q')?.trim() || '';
    const statusVinculo = searchParams.get('statusVinculo') || '';
    const statusOperacional = searchParams.get('statusOperacional') || '';
    const caminho = searchParams.get('caminho') || '';
    const page = paginaSegura(searchParams.get('page'));
    const pageSize = tamanhoPaginaSegura(searchParams.get('pageSize'));

    const contribuicaoWhere = {
      ...(statusVinculo ? { statusVinculo } : {}),
      ...(statusOperacional ? { statusOperacional } : {}),
      ...(caminho ? { caminho } : {}),
      ...(busca
        ? {
            OR: [
              { nomeInformado: { contains: busca, mode: 'insensitive' } },
              { emailInformado: { contains: busca, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const where = {
      jornadaContribuicoes: {
        some: contribuicaoWhere,
      },
    };

    const [total, contatos] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          nome: true,
          email: true,
          whatsapp: true,
          createdAt: true,
          updatedAt: true,
          jornadaContribuicoes: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              id: true,
              caminho: true,
              produtosDeclarados: true,
              statusVinculo: true,
              statusOperacional: true,
              tags: true,
              createdAt: true,
            },
          },
          _count: {
            select: { jornadaContribuicoes: true },
          },
        },
      }),
    ]);

    return NextResponse.json(
      {
        contatos,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    console.error('[ADMIN_JORNADA_LISTA]', error);
    return NextResponse.json(
      { error: 'Não foi possível carregar os contatos da Jornada.' },
      {
        status: 500,
        headers: { 'Cache-Control': 'private, no-store' },
      },
    );
  }
}