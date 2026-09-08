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
      tokenAcesso.aluno.senhaHash;

    if (tokenInvalido) {
      return respostaErro('Este convite é inválido, expirou ou já foi utilizado.');
    }

    const senhaHash = await bcrypt.hash(senha, 12);
    const agora = new Date();

    await prisma.$transaction([
      prisma.aluno.update({
        where: { id: tokenAcesso.alunoId },
        data: {
          senhaHash,
          emailVerificadoEm: agora,
        },
      }),
      prisma.alunoAccessToken.updateMany({
        where: {
          alunoId: tokenAcesso.alunoId,
          tipo: TIPO_PRIMEIRO_ACESSO,
          usadoEm: null,
        },
        data: {
          usadoEm: agora,
        },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Erro no primeiro acesso do aluno:', error?.message);
    return respostaErro('Não foi possível concluir o primeiro acesso.', 500);
  }
}