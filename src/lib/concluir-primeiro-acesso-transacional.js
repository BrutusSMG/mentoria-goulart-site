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
 // Se qualquer atualização falhar, lança um erro para que
 // a transação inteira seja desfeita.
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
    !tokenAcesso?.aluno?.pessoaId ||
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

  // A credencial só pode nascer quando o Usuario ainda
  // estiver pendente e sem senha. O UPDATE condicional
  // também protege contra ativações concorrentes.
  const usuarioAtualizado =
    await tx.usuario.updateMany({
      where: {
        pessoaId: tokenAcesso.aluno.pessoaId,
        status: 'PENDENTE_ATIVACAO',
        senhaHash: null,
      },
      data: {
        senhaHash,
        status: 'ATIVO',
        mustChangePassword: false,
        passwordChangedAt: agora,
      },
    });

  if (usuarioAtualizado.count !== 1) {
    throw new ConvitePrimeiroAcessoIndisponivelError();
  }

  // O vínculo educacional também precisa continuar
  // elegível no momento da atualização.
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
      // Compatibilidade temporária até a remoção
      // definitiva da credencial legada do Aluno.
      senhaHash,
      emailVerificadoEm: agora,
    },
  });

  if (alunoAtualizado.count !== 1) {
    throw new ConvitePrimeiroAcessoIndisponivelError();
  }

  return { concluido: true };
}
