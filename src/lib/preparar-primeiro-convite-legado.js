import {
  TIPO_PRIMEIRO_ACESSO,
  calcularExpiracaoConvitePrimeiroAcesso,
  gerarTokenPrimeiroAcesso,
  hashTokenAcesso,
} from '@/lib/convite-primeiro-acesso';

import { verificarElegibilidadeConviteLegado } from
  '@/lib/elegibilidade-convite-legado';

import { reservarPrimeiroConviteLegado } from
  '@/lib/reservar-convite-legado';

/**
 * Prepara o primeiro convite de um aluno legado.
 *
 * Executar exclusivamente dentro de:
 * prisma.$transaction(async (tx) => ...).
 *
 * O chamador deve verificar antes a autorização administrativa.
 * Esta função NÃO envia e-mails.
 *
 * O token retornado é secreto: deve permanecer no servidor
 * e nunca ser incluído na resposta de uma API ou em logs.
 */
export async function prepararPrimeiroConviteLegado(
  tx,
  alunoId,
  agora = new Date(),
) {
  if (typeof alunoId !== 'string' || !alunoId.trim()) {
    throw new Error('Aluno inválido para preparação do convite.');
  }

  if (
    !(agora instanceof Date) ||
    Number.isNaN(agora.getTime())
  ) {
    throw new Error('Data de preparação inválida.');
  }

  // Nova conferência dentro da transação, independentemente
  // da consulta feita anteriormente pela rota administrativa.
  const aluno = await tx.aluno.findUnique({
    where: { id: alunoId },
    select: {
      id: true,
      nome: true,
      email: true,
      origem: true,
      status: true,
      senhaHash: true,
      emailVerificadoEm: true,
      conviteLegadoEnviadoEm: true,
      pessoaId: true,
      pessoa: {
        select: {
          id: true,
          emailPrincipal: true,
          ativo: true,
        },
      },
    },
  });

  const elegibilidade =
    verificarElegibilidadeConviteLegado(aluno);

  if (!elegibilidade.permitido) {
    return {
      preparado: false,
      motivo: elegibilidade.motivo,
    };
  }

  // Um token anterior sem registro de uso exige conferência.
  // Não o invalidamos silenciosamente neste primeiro fluxo.
  const tokenAnterior = await tx.alunoAccessToken.findFirst({
    where: {
      alunoId,
      tipo: TIPO_PRIMEIRO_ACESSO,
      usadoEm: null,
    },
    select: { id: true },
  });

  if (tokenAnterior) {
    return {
      preparado: false,
      motivo: 'Existe um convite anterior que exige conferência.',
    };
  }

  const reserva = await reservarPrimeiroConviteLegado(
    tx,
    alunoId,
    agora,
  );

  if (!reserva.reservada) {
    return {
      preparado: false,
      motivo: 'O convite já foi reservado ou exige conferência.',
    };
  }

  // Somente a transação que conseguiu reservar a tentativa
  // poderá criar o token.
  const token = gerarTokenPrimeiroAcesso();

  await tx.alunoAccessToken.create({
    data: {
      alunoId,
      tokenHash: hashTokenAcesso(token),
      tipo: TIPO_PRIMEIRO_ACESSO,
      expiraEm:
        calcularExpiracaoConvitePrimeiroAcesso(agora),
    },
  });

  return {
    preparado: true,
    aluno: {
      id: aluno.id,
      nome: aluno.nome,
      email: aluno.email,
    },
    token,
  };
}
