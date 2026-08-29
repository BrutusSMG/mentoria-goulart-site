// src/app/api/alunos/redefinir-senha/route.js
import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

    if (!token) return respostaErro('Link de recuperação inválido.');
    if (senha.length < 8) return respostaErro('A senha precisa ter pelo menos 8 caracteres.');
    if (senha.length > 128) return respostaErro('A senha não pode ter mais de 128 caracteres.');

    const tokenAcesso = await prisma.alunoAccessToken.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { aluno: true },
    });

    const invalido =
      !tokenAcesso
      || tokenAcesso.tipo !== 'RECUPERACAO_SENHA'
      || tokenAcesso.usadoEm
      || tokenAcesso.expiraEm <= new Date()
      || tokenAcesso.aluno.status === 'INATIVO';

    if (invalido) return respostaErro('Este link é inválido, expirou ou já foi utilizado.');

    const senhaHash = await bcrypt.hash(senha, 12);
    const agora = new Date();

    await prisma.$transaction([
      prisma.aluno.update({
        where: { id: tokenAcesso.alunoId },
        data: {
          senhaHash,
          status: 'ATIVO',
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