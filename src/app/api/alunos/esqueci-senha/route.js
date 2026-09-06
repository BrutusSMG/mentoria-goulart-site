// src/app/api/alunos/esqueci-senha/route.js
import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import {
  emailFormatoValido,
  normalizarEmail,
} from '@/lib/validacoes';

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function escaparHtml(valor = '') {
  const caracteres = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return String(valor).replace(/[&<>"']/g, (caractere) => caracteres[caractere]);
}

function respostaGenerica() {
  return NextResponse.json({
    ok: true,
    mensagem: 'Se houver uma conta para este e-mail, enviaremos as instruções de recuperação.',
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
      select: { id: true, nome: true, status: true },
    });

    if (!aluno || aluno.status !== 'ATIVO') {
      return respostaGenerica();
    }

    const token = crypto.randomBytes(32).toString('hex');
    const agora = new Date();
    const expiraEm = new Date(agora.getTime() + 60 * 60 * 1000);

    await prisma.$transaction([
      prisma.alunoAccessToken.updateMany({
        where: {
          alunoId: aluno.id,
          tipo: 'RECUPERACAO_SENHA',
          usadoEm: null,
        },
        data: { usadoEm: agora },
      }),
      prisma.alunoAccessToken.create({
        data: {
          alunoId: aluno.id,
          tokenHash: hashToken(token),
          tipo: 'RECUPERACAO_SENHA',
          expiraEm,
        },
      }),
    ]);

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const baseAluno = process.env.NEXT_PUBLIC_ALUNO_URL
        || process.env.NEXT_PUBLIC_BASE_URL
        || 'http://localhost:3000';
      const link = `${baseAluno}/aluno/redefinir-senha?token=${encodeURIComponent(token )}`;
      const resend = new Resend(apiKey);
      const nomeSeguro = escaparHtml(aluno.nome || 'Aluno');

      try {
        await resend.emails.send({
          from: 'Prof. Goulart <contato@mentoriagarimpourbano.com.br>',
          to: email,
          subject: 'Recuperação de senha — Área do Aluno',
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:32px;border-radius:16px">
              <p style="color:#d89900;font-weight:bold;letter-spacing:2px">GARIMPO URBANO</p>
              <h1>Olá, ${nomeSeguro}.</h1>
              <p>Recebemos uma solicitação para criar uma nova senha para a sua conta na Área do Aluno.</p>
              <p><a href="${link}" style="display:inline-block;background:#d89900;color:#000;padding:14px 20px;border-radius:8px;text-decoration:none;font-weight:bold">CRIAR NOVA SENHA</a></p>
              <p style="color:#a3a3a3;font-size:13px">Este link expira em 1 hora e pode ser usado uma única vez. Se você não fez esta solicitação, ignore este e-mail.</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Erro ao enviar recuperação de senha:', emailError?.message);
      }
    } else {
      console.warn('[RESEND] RESEND_API_KEY ausente; recuperação criada sem envio de e-mail.');
    }

    return respostaGenerica();
  } catch (error) {
    console.error('Erro ao solicitar recuperação de senha:', error?.message);
    return respostaGenerica();
  }
}