import {
  TIPO_PRIMEIRO_ACESSO,
} from '@/lib/convite-primeiro-acesso';

export class ConvitePrimeiroAcessoIndisponivelError
  extends Error {
  constructor() {
    super('Convite de primeiro acesso indisponível.');
    this.name = 'ConvitePrimeiroAcessoIndisponivelError';
  }
}

/**
 * Executar exclusivamente dentro de uma transação interativa:
 *
 * prisma.$transaction((tx) =>
 *   concluirPrimeiroAcessoTransacional(tx, dados)
 * );
 *
 * Se qualquer atualização falhar, lança um erro para que
 * a transação inteira seja desfeita.
 */
export async function concluirPrimeiroAcessoTransacional(
  tx,
  {
    tokenAcesso,
    senhaHash,
    agora = new Date(),
  },
) {
  if (
    !tokenAcesso?.id ||
    !tokenAcesso?.alunoId ||
    !['HOTMART', 'LEGADO', 'MANUAL'].includes(
      tokenAcesso?.aluno?.origem,
    ) ||
    typeof senhaHash !== 'string' ||
    !senhaHash ||
    !(agora instanceof Date) ||
    Number.isNaN(agora.getTime())
  ) {
    throw new ConvitePrimeiroAcessoIndisponivelError();
  }

  // Somente uma requisição pode consumir este token.
  // A validade é conferida novamente no próprio UPDATE.
  const tokenAtualizado =
    await tx.alunoAccessToken.updateMany({
      where: {
        id: tokenAcesso.id,
        alunoId: tokenAcesso.alunoId,
        tipo: TIPO_PRIMEIRO_ACESSO,
        usadoEm: null,
        expiraEm: {
          gt: agora,
        },
      },
      data: {
        usadoEm: agora,
      },
    });

  if (tokenAtualizado.count !== 1) {
    throw new ConvitePrimeiroAcessoIndisponivelError();
  }

  const origem = tokenAcesso.aluno.origem;

  // A conta também precisa continuar elegível no momento
  // da atualização. Para LEGADO, o envio deve estar
  // confirmado no banco.
  const alunoAtualizado = await tx.aluno.updateMany({
    where: {
      id: tokenAcesso.alunoId,
      origem,
      status: 'ATIVO',
      senhaHash: null,
      emailVerificadoEm: null,
      ...(origem === 'LEGADO'
        ? {
            conviteLegadoEnviadoEm: {
              not: null,
            },
          }
        : {}),
    },
    data: {
      senhaHash,
      emailVerificadoEm: agora,
    },
  });

  if (alunoAtualizado.count !== 1) {
    // O erro desfaz também a atualização do token.
    throw new ConvitePrimeiroAcessoIndisponivelError();
  }

  return { concluido: true };
}
