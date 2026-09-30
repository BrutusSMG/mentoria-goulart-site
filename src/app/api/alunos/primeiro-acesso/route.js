// src/app/api/alunos/primeiro-acesso/route.js
import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import bcrypt from 'bcryptjs';
import {
  SENHA_ALUNO_MIN,
  SENHA_ALUNO_MAX,
  senhaAlunoValida,
} from "@/lib/validacoes";
import {
  TIPO_PRIMEIRO_ACESSO,
  hashTokenAcesso,
} from '@/lib/convite-primeiro-acesso';
import {
  concluirPrimeiroAcessoTransacional,
  ConvitePrimeiroAcessoIndisponivelError,
} from '@/lib/concluir-primeiro-acesso-transacional';

function respostaErro(mensagem, status = 400) {
  return NextResponse.json({ ok: false, erro: mensagem }, { status });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const token = typeof body?.token === 'string' ? body.token.trim() : '';
    const senha = typeof body?.senha === 'string' ? body.senha : '';

    if (!token) {
      return respostaErro('Token de primeiro acesso não informado.');
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

    const tokenAcesso = await prisma.alunoAccessToken.findUnique({
      where: { tokenHash: hashTokenAcesso(token) },
      include: { aluno: true },
    });

    const tokenInvalido =
      !tokenAcesso ||
      tokenAcesso.tipo !== TIPO_PRIMEIRO_ACESSO ||
      tokenAcesso.usadoEm ||
      tokenAcesso.expiraEm <= new Date() ||
      tokenAcesso.aluno.status !== 'ATIVO' ||
      tokenAcesso.aluno.senhaHash ||
      (
        tokenAcesso.aluno.origem === 'LEGADO' &&
        !tokenAcesso.aluno.conviteLegadoEnviadoEm
      );

    if (tokenInvalido) {
      return respostaErro('Este convite é inválido, expirou ou já foi utilizado.');
    }

    const senhaHash = await bcrypt.hash(senha, 12);
    const agora = new Date();

    await prisma.$transaction((tx) =>
      concluirPrimeiroAcessoTransacional(tx, {
        tokenAcesso,
        senhaHash,
        agora,
      }),
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (
      error instanceof
      ConvitePrimeiroAcessoIndisponivelError
    ) {
      return respostaErro(
        'Este convite é inválido, expirou ou já foi utilizado.',
      );
    }

    // Não incluir token, senha ou detalhes da exceção no log.
    console.error(
      'Falha operacional ao concluir o primeiro acesso do aluno.',
    );

    return respostaErro(
      'Não foi possível concluir o primeiro acesso.',
      500,
    );
  }
}