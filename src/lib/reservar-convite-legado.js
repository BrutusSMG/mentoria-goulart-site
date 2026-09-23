/**
 * Reserva a primeira tentativa de convite de um aluno legado.
 *
 * Deve ser chamada após verificar a autorização administrativa
 * e a elegibilidade do aluno.
 *
 * Não gera token e não envia e-mail.
 */
export async function reservarPrimeiroConviteLegado(
  tx,
  alunoId,
  agora = new Date(),
) {
  if (typeof alunoId !== 'string' || !alunoId.trim()) {
    throw new Error('Aluno inválido para reserva de convite.');
  }

  if (
    !(agora instanceof Date) ||
    Number.isNaN(agora.getTime())
  ) {
    throw new Error('Data de tentativa inválida.');
  }

  const resultado = await tx.controleConviteLegado.updateMany({
    where: {
      alunoId,
      status: 'PENDENTE',
      tentativas: 0,
    },
    data: {
      status: 'EM_ANDAMENTO',
      tentativas: { increment: 1 },
      tentativaIniciadaEm: agora,
      tentativaEncerradaEm: null,
      ultimoErro: null,
    },
  });

  return {
    reservada: resultado.count === 1,
  };
}
