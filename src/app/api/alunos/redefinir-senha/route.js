// src/app/api/alunos/redefinir-senha/route.js
import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import {
  SENHA_ALUNO_MIN,
  SENHA_ALUNO_MAX,
  senhaAlunoValida,
} from "@/lib/validacoes";

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function respostaErro(mensagem, status = 400) {
  return NextResponse.json({ ok: false, erro: mensagem }, { status });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const token = typeof body?.token === 'string' ? body.token.trim() : '';
    const senha = typeof body?.senha === 'string' ? body.senha : '';

    if (!token) return respostaErro('Link de recuperação inválido.');
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
      where: { tokenHash: hashToken(token) },
      include: { aluno: true },
    });

    const invalido =
      !tokenAcesso
      || tokenAcesso.tipo !== 'RECUPERACAO_SENHA'
      || tokenAcesso.usadoEm
      || tokenAcesso.expiraEm <= new Date()
      || tokenAcesso.aluno.status !== 'ATIVO';

    if (invalido) return respostaErro('Este link é inválido, expirou ou já foi utilizado.');

    const senhaHash = await bcrypt.hash(senha, 12);
    const agora = new Date();

    await prisma.$transaction([
      prisma.aluno.update({
        where: { id: tokenAcesso.alunoId },
        data: {
          senhaHash,
        },
      }),
      prisma.alunoAccessToken.update({
        where: { id: tokenAcesso.id },
        data: { usadoEm: agora },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Erro ao redefinir senha do aluno:', error?.message);
    return respostaErro('Não foi possível redefinir a senha.', 500);
  }
}