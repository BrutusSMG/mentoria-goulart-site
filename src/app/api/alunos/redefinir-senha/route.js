// src/app/api/alunos/redefinir-senha/route.js
import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import {
  SENHA_ALUNO_MIN,
  SENHA_ALUNO_MAX,
  senhaAlunoValida,
} from '@/lib/validacoes';
import {
  definirCredencialCanonica,
} from '@/lib/credencial-usuario';

function hashToken(token) {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
}

function respostaErro(mensagem, status = 400) {
  return NextResponse.json(
    {
      ok: false,
      erro: mensagem,
    },
    {
      status,
    },
  );
}

class RecuperacaoSenhaIndisponivelError
  extends Error {
  constructor() {
    super(
      'Recuperacao de senha indisponivel.',
    );

    this.name =
      'RecuperacaoSenhaIndisponivelError';
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const token =
      typeof body?.token === 'string'
        ? body.token.trim()
        : '';

    const senha =
      typeof body?.senha === 'string'
        ? body.senha
        : '';

    if (!token) {
      return respostaErro(
        'Link de recuperação inválido.',
      );
    }

    if (!senhaAlunoValida(senha)) {
      if (senha.length < SENHA_ALUNO_MIN) {
        return respostaErro(
          `A senha precisa ter pelo menos ${SENHA_ALUNO_MIN} caracteres.`,
        );
      }

      return respostaErro(
        `A senha não pode ter mais de ${SENHA_ALUNO_MAX} caracteres.`,
      );
    }

    const tokenAcesso =
      await prisma.alunoAccessToken.findUnique({
        where: {
          tokenHash: hashToken(token),
        },
        include: {
          aluno: true,
        },
      });

    const invalido =
      !tokenAcesso ||
      tokenAcesso.tipo !==
        'RECUPERACAO_SENHA' ||
      tokenAcesso.usadoEm ||
      tokenAcesso.expiraEm <= new Date() ||
      !tokenAcesso.aluno?.pessoaId;

    if (invalido) {
      return respostaErro(
        'Este link é inválido, expirou ou já foi utilizado.',
      );
    }

    const senhaHash = await bcrypt.hash(
      senha,
      12,
    );

    const agora = new Date();

    await prisma.$transaction(
      async (tx) => {
        // Somente uma requisicao pode consumir
        // efetivamente o token.
        const tokenAtualizado =
          await tx.alunoAccessToken.updateMany({
            where: {
              id: tokenAcesso.id,
              alunoId: tokenAcesso.alunoId,
              tipo: 'RECUPERACAO_SENHA',
              usadoEm: null,
              expiraEm: {
                gt: agora,
              },
            },
            data: {
              usadoEm: agora,
            },
          });

        if (tokenAtualizado.count !== 1) {
          throw new RecuperacaoSenhaIndisponivelError();
        }

        // A recuperacao so pode alterar uma
        // credencial canonica ja ativa.
        const usuarioAtualizado =
          await tx.usuario.updateMany({
            where: {
              pessoaId:
                tokenAcesso.aluno.pessoaId,
              status: 'ATIVO',
              senhaHash: {
                not: null,
              },
            },
            data: {
              senhaHash,
              mustChangePassword: false,
              passwordChangedAt: agora,
            },
          });

        if (usuarioAtualizado.count !== 1) {
          throw new RecuperacaoSenhaIndisponivelError();
        }

        // Mantem os modelos legados sincronizados
        // enquanto a E5 ainda esta em transicao.
        await definirCredencialCanonica(
          tx,
          {
            pessoaId:
              tokenAcesso.aluno.pessoaId,
            senhaHash,
            mustChangePassword: false,
            passwordChangedAt: agora,
            ativarUsuario: false,
          },
        );
      },
    );

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    if (
      error instanceof
      RecuperacaoSenhaIndisponivelError
    ) {
      return respostaErro(
        'Este link é inválido, expirou ou já foi utilizado.',
      );
    }

    console.error(
      'Erro ao redefinir senha do aluno:',
      error?.message,
    );

    return respostaErro(
      'Não foi possível redefinir a senha.',
      500,
    );
  }
}
