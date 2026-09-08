// src/app/api/alunos/reenviar-convite/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  TIPO_PRIMEIRO_ACESSO,
  calcularExpiracaoConvitePrimeiroAcesso,
  enviarConvitePrimeiroAcesso,
  gerarTokenPrimeiroAcesso,
  hashTokenAcesso,
} from '@/lib/convite-primeiro-acesso';
import {
  emailFormatoValido,
  normalizarEmail,
} from '@/lib/validacoes';

function respostaGenerica() {
  return NextResponse.json({
    ok: true,
    mensagem:
      'Se houver uma conta elegível para este e-mail, enviaremos um novo convite de acesso.',
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const email = normalizarEmail(body?.email);

    if (!email || !emailFormatoValido(email)) {
      return respostaGenerica();
    }

    const aluno = await prisma.aluno.findUnique({
      where: { email },
      select: {
        id: true,
        nome: true,
        email: true,
        senhaHash: true,
        status: true,
      },
    });

    if (
      !aluno ||
      aluno.status !== 'ATIVO' ||
      aluno.senhaHash
    ) {
      return respostaGenerica();
    }

    const agora = new Date();
    const limiteReenvio = new Date(
      agora.getTime() - 5 * 60 * 1000,
    );

    const conviteRecente =
      await prisma.alunoAccessToken.findFirst({
        where: {
          alunoId: aluno.id,
          tipo: TIPO_PRIMEIRO_ACESSO,
          usadoEm: null,
          expiraEm: { gt: agora },
          createdAt: { gt: limiteReenvio },
        },
        select: { id: true },
      });

    if (conviteRecente) {
      return respostaGenerica();
    }

    const token = gerarTokenPrimeiroAcesso();

    await prisma.$transaction([
      prisma.alunoAccessToken.updateMany({
        where: {
          alunoId: aluno.id,
          tipo: TIPO_PRIMEIRO_ACESSO,
          usadoEm: null,
        },
        data: {
          usadoEm: agora,
        },
      }),

      prisma.alunoAccessToken.create({
        data: {
          alunoId: aluno.id,
          tokenHash: hashTokenAcesso(token),
          tipo: TIPO_PRIMEIRO_ACESSO,
          expiraEm:
            calcularExpiracaoConvitePrimeiroAcesso(agora),
        },
      }),
    ]);

    await enviarConvitePrimeiroAcesso({
      email: aluno.email,
      nome: aluno.nome,
      token,
    });

    return respostaGenerica();
  } catch (error) {
    console.error(
      'Erro ao reenviar convite de primeiro acesso:',
      error?.message,
    );

    return respostaGenerica();
  }
}