const RESULTADOS_VALIDOS = new Set([
  'ENVIADO',
  'FALHA',
  'INDETERMINADO',
]);

/**
 * Registra o resultado da primeira tentativa de convite legado.
 *
 * Executar exclusivamente dentro de:
 * prisma.$transaction(async (tx) => ...).
 *
 * A chamada ao provedor de e-mail deve acontecer FORA
 * dessa transação. Esta função não cria token nem envia e-mail.
 */
export async function registrarResultadoPrimeiroConviteLegado(
  tx,
  {
    alunoId,
    resultado,
    agora = new Date(),
    mensagemProvedorId = null,
  },
) {
  if (typeof alunoId !== 'string' || !alunoId.trim()) {
    throw new Error('Aluno inválido para registro do convite.');
  }

  if (!RESULTADOS_VALIDOS.has(resultado)) {
    throw new Error('Resultado de convite inválido.');
  }

  if (
    !(agora instanceof Date) ||
    Number.isNaN(agora.getTime())
  ) {
    throw new Error('Data de resultado inválida.');
  }

  const controleAtualizado =
    await tx.controleConviteLegado.updateMany({
      where: {
        alunoId,
        status: 'EM_ANDAMENTO',
        tentativas: 1,
      },
      data: {
        status: resultado,
        tentativaEncerradaEm: agora,
        ultimoErro:
          resultado === 'FALHA'
            ? 'Envio não aceito pelo provedor.'
            : resultado === 'INDETERMINADO'
              ? 'Resultado do envio não confirmado. Exige conferência.'
              : null,
        mensagemProvedorId:
          resultado === 'ENVIADO' &&
          typeof mensagemProvedorId === 'string' &&
          mensagemProvedorId.trim()
            ? mensagemProvedorId.trim()
            : null,
      },
    });

  if (controleAtualizado.count !== 1) {
    return { registrado: false };
  }

  if (resultado === 'ENVIADO') {
    const alunoAtualizado = await tx.aluno.updateMany({
      where: {
        id: alunoId,
        origem: 'LEGADO',
        status: 'ATIVO',
        senhaHash: null,
        emailVerificadoEm: null,
        conviteLegadoEnviadoEm: null,
      },
      data: {
        conviteLegadoEnviadoEm: agora,
      },
    });

    if (alunoAtualizado.count !== 1) {
      // A transação precisa ser desfeita: não podemos
      // registrar ENVIADO em apenas uma das duas tabelas.
      throw new Error(
        'Não foi possível registrar o envio de forma consistente. ' +
        'É necessária conferência manual.',
      );
    }
  }

  return { registrado: true };
}
