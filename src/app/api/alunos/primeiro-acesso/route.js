// src/app/api/alunos/primeiro-acesso/route.js
import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import bcrypt from 'bcryptjs';


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

    if (!token) {
      return respostaErro('Token de primeiro acesso não informado.');
    }

    if (senha.length < 8) {
      return respostaErro('A senha precisa ter pelo menos 8 caracteres.');
    }

    if (senha.length > 128) {
      return respostaErro('A senha não pode ter mais de 128 caracteres.');
    }

    const tokenAcesso = await prisma.alunoAccessToken.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { aluno: true },
    });

    const tokenInvalido =
      !tokenAcesso ||
      tokenAcesso.tipo !== 'PRIMEIRO_ACESSO' ||
      tokenAcesso.usadoEm ||
      tokenAcesso.expiraEm <= new Date();

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
          status: 'ATIVO',
          emailVerificadoEm: agora,
        },
      }),
      prisma.alunoAccessToken.update({
        where: { id: tokenAcesso.id },
        data: { usadoEm: agora },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Erro no primeiro acesso do aluno:', error?.message);
    return respostaErro('Não foi possível concluir o primeiro acesso.', 500);
  }
}