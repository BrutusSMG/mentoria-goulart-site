// src/app/api/admin/jornada/contribuicoes/[id]/route.js
import { NextResponse } from 'next/server';
import {
  obterAcessoModulo,
  prisma,
  respostaAcessoNegado,
} from '@/lib/admin-permissoes';
import {
  STATUS_OPERACIONAL,
  STATUS_VINCULO,
  TAGS_JORNADA,
} from '@/lib/jornada-triagem';

export async function PATCH(request, { params }) {
  const acesso = await obterAcessoModulo('JORNADA');
  if (!acesso.permitido) return respostaAcessoNegado(acesso);

  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: 'Identificador da contribuição não informado.' },
      { status: 400 },
    );
  }

  try {
    const body = await request.json();
    const dados = {};

    if (Object.prototype.hasOwnProperty.call(body, 'statusVinculo')) {
      if (!STATUS_VINCULO.includes(body.statusVinculo)) {
        return NextResponse.json(
          { error: 'Status de vínculo inválido.' },
          { status: 400 },
        );
      }
      dados.statusVinculo = body.statusVinculo;

      if (body.statusVinculo === 'ALUNO_CONFIRMADO') {
        dados.verificadoEm = new Date();
        dados.verificadoPor = acesso.conta.email;
      }
    }

    if (Object.prototype.hasOwnProperty.call(body, 'statusOperacional')) {
      if (!STATUS_OPERACIONAL.includes(body.statusOperacional)) {
        return NextResponse.json(
          { error: 'Status operacional inválido.' },
          { status: 400 },
        );
      }
      dados.statusOperacional = body.statusOperacional;
    }

    if (Object.prototype.hasOwnProperty.call(body, 'tags')) {
      if (!Array.isArray(body.tags)) {
        return NextResponse.json(
          { error: 'Tags devem ser enviadas como uma lista.' },
          { status: 400 },
        );
      }

      const tags = [...new Set(body.tags)];
      const possuiTagInvalida = tags.some(
        (tag) => !TAGS_JORNADA.includes(tag),
      );

      if (possuiTagInvalida) {
        return NextResponse.json(
          { error: 'Uma ou mais tags são inválidas.' },
          { status: 400 },
        );
      }

      dados.tags = tags;
    }

    if (Object.prototype.hasOwnProperty.call(body, 'observacoesInternas')) {
      if (
        body.observacoesInternas !== null &&
        typeof body.observacoesInternas !== 'string'
      ) {
        return NextResponse.json(
          { error: 'Observações internas devem ser texto.' },
          { status: 400 },
        );
      }

      dados.observacoesInternas = body.observacoesInternas === null
        ? null
        : body.observacoesInternas.trim().slice(0, 5000);
    }

    if (Object.keys(dados).length === 0) {
      return NextResponse.json(
        { error: 'Nenhum campo válido foi enviado.' },
        { status: 400 },
      );
    }

    const contribuicao = await prisma.jornadaContribuicao.update({
      where: { id },
      data: dados,
    });

    return NextResponse.json(contribuicao, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Contribuição não encontrada.' },
        { status: 404 },
      );
    }

    console.error('[ADMIN_JORNADA_TRIAGEM_PATCH]', error);
    return NextResponse.json(
      { error: 'Não foi possível atualizar a triagem.' },
      {
        status: 500,
        headers: { 'Cache-Control': 'private, no-store' },
      },
    );
  }
}