// src/lib/provisionar-aluno.js
import {
  TIPO_PRIMEIRO_ACESSO,
  calcularExpiracaoConvitePrimeiroAcesso,
  gerarTokenPrimeiroAcesso,
  hashTokenAcesso,
} from '@/lib/convite-primeiro-acesso';
import { provisionarVigenciaHotmart } from '@/lib/vigencia-matricula';

function normalizarEmail(email) {
  const valor = String(email || '').trim().toLowerCase();
  return valor || null;
}

export async function provisionarAlunoHotmart(tx, {
  leadId = null,
  email,
  nome,
  whatsapp = null,
  produtoId,
  produtoUcode = null,
  produtoNome,
  transacaoOrigemId,
  aprovadoEm,
}) {
  const emailNormalizado = normalizarEmail(email);
  const produtoIdNormalizado = String(produtoId || '').trim();

  if (!emailNormalizado || !produtoIdNormalizado) {
    return null;
  }

  const transacaoOrigemIdNormalizado = String(
    transacaoOrigemId || '',
  ).trim();

  if (
    !transacaoOrigemIdNormalizado ||
    !(aprovadoEm instanceof Date) ||
    Number.isNaN(aprovadoEm.getTime())
  ) {
    throw new TypeError(
      'Transação de origem e data de aprovação são obrigatórias para vigência Hotmart.',
    );
  }

  const vigenciaJaProvisionada =
    await tx.vigenciaMatricula.findUnique({
      where: {
        transacaoOrigemId: transacaoOrigemIdNormalizado,
      },
      select: {
        id: true,
        matriculaId: true,
        matricula: {
          select: {
            alunoId: true,
          },
        },
      },
    });

  if (vigenciaJaProvisionada) {
    return {
      alunoId: vigenciaJaProvisionada.matricula.alunoId,
      matriculaId: vigenciaJaProvisionada.matriculaId,
      vigenciaId: vigenciaJaProvisionada.id,
      conviteToken: null,
      conviteNovo: false,
    };
  }

  const alunoExistente = await tx.aluno.findUnique({
    where: { email: emailNormalizado },
    select: {
      id: true,
      nome: true,
      leadId: true,
      senhaHash: true,
      status: true,
    },
  });

  const statusAluno =
    alunoExistente &&
    ['SUSPENSO', 'INATIVO'].includes(alunoExistente.status)
      ? alunoExistente.status
      : 'ATIVO';

  const aluno = await tx.aluno.upsert({
    where: { email: emailNormalizado },
    update: {
      nome: nome || alunoExistente?.nome || 'Aluno',
      ...(whatsapp ? { whatsapp } : {}),
      ...(alunoExistente?.leadId || leadId ? { leadId: alunoExistente?.leadId || leadId } : {}),
      status: statusAluno,
      origem: 'HOTMART',
    },
    create: {
      leadId: leadId || null,
      nome: nome || 'Aluno',
      email: emailNormalizado,
      whatsapp: whatsapp || null,
      status: 'ATIVO',
      origem: 'HOTMART',
    },
  });

  const matricula = await tx.matricula.upsert({
    where: {
      alunoId_produtoId: {
        alunoId: aluno.id,
        produtoId: produtoIdNormalizado,
      },
    },
    update: {
      produtoUcode: produtoUcode || null,
      produtoNome: produtoNome || 'Produto Hotmart',
      status: 'ATIVA',
      suspensaEm: null,
      encerradaEm: null,
    },
    create: {
      alunoId: aluno.id,
      produtoId: produtoIdNormalizado,
      produtoUcode: produtoUcode || null,
      produtoNome: produtoNome || 'Produto Hotmart',
      origem: 'HOTMART',
      status: 'ATIVA',
      concedidaEm: aprovadoEm,
    },
  });

  const vigencia = await provisionarVigenciaHotmart(tx, {
    matriculaId: matricula.id,
    transacaoOrigemId: transacaoOrigemIdNormalizado,
    aprovadoEm,
  });

  await tx.perfilAluno.upsert({
    where: { alunoId: aluno.id },
    update: {},
    create: { alunoId: aluno.id },
  });

  let conviteToken = null;

  if (!aluno.senhaHash && aluno.status === 'ATIVO') {
    const conviteExistente = await tx.alunoAccessToken.findFirst({
      where: {
        alunoId: aluno.id,
        tipo: TIPO_PRIMEIRO_ACESSO,
        usadoEm: null,
        expiraEm: { gt: new Date() },
      },
      select: { id: true },
    });

    if (!conviteExistente) {
      conviteToken = gerarTokenPrimeiroAcesso();
      await tx.alunoAccessToken.create({
        data: {
          alunoId: aluno.id,
          tokenHash: hashTokenAcesso(conviteToken),
          tipo: TIPO_PRIMEIRO_ACESSO,
          expiraEm: calcularExpiracaoConvitePrimeiroAcesso(),
        },
      });
    }
  }

  return {
    alunoId: aluno.id,
    matriculaId: matricula.id,
    vigenciaId: vigencia?.id || null,
    conviteToken,
    conviteNovo: Boolean(conviteToken),
  };
}