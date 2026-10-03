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

    const pessoa = await prisma.pessoa.findFirst({
      where: {
        emailPrincipal: {
          equals: email,
          mode: 'insensitive',
        },
      },
      select: {
        emailPrincipal: true,
        usuario: {
          select: {
            id: true,
            status: true,
            senhaHash: true,
          },
        },
        aluno: {
          select: {
            id: true,
            nome: true,
            email: true,
            status: true,
            origem: true,
            conviteLegadoEnviadoEm: true,
          },
        },
      },
    });

    const usuario = pessoa?.usuario;
    const aluno = pessoa?.aluno;

    if (
      !aluno ||
      !usuario ||
      aluno.status !== 'ATIVO' ||
      usuario.status !== 'PENDENTE_ATIVACAO' ||
      usuario.senhaHash ||
      normalizarEmail(aluno.email) !==
        normalizarEmail(pessoa.emailPrincipal)
    ) {
      return respostaGenerica();
    }

    // O primeiro convite de um legado depende da decisao
    // do administrador. A rota publica so pode reenvia-lo
    // depois que o envio inicial tiver sido confirmado.
    if (
      aluno.origem === 'LEGADO' &&
      !aluno.conviteLegadoEnviadoEm
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
          expiraEm: {
            gt: agora,
          },
          createdAt: {
            gt: limiteReenvio,
          },
        },
        select: {
          id: true,
        },
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
            calcularExpiracaoConvitePrimeiroAcesso(
              agora,
            ),
        },
      }),
    ]);

    await enviarConvitePrimeiroAcesso({
      email: pessoa.emailPrincipal,
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
