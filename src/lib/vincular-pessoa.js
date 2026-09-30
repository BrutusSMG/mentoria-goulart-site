import { normalizarEmail } from '@/lib/validacoes';

const MODELOS_PERMITIDOS = Object.freeze({
  lead: 'lead',
  aluno: 'aluno',
  adminUser: 'adminUser',
});

/**
 * Vincula um cadastro existente a uma Pessoa existente.
 *
 * Uso interno: o chamador deve ter verificado previamente que o
 * cadastro pertence à pessoa identificada. Igualdade de e-mail,
 * isoladamente, não constitui essa verificação.
 *
 * Recebe o cliente de uma transação Prisma (tx).
 * Não cria cadastros, não altera acessos e não concede direitos.
 */
export async function vincularCadastroPessoa(
  tx,
  { tipo, cadastroId, pessoaId },
) {
  const modelo = MODELOS_PERMITIDOS[tipo];

  if (!modelo || !cadastroId || !pessoaId) {
    throw new Error('Dados inválidos para vinculação de Pessoa.');
  }

  const cadastro = await tx[modelo].findUnique({
    where: { id: cadastroId },
    select: {
      id: true,
      email: true,
      pessoaId: true,
    },
  });

  if (!cadastro) {
    throw new Error('Cadastro não encontrado para vinculação.');
  }

  if (cadastro.pessoaId && cadastro.pessoaId !== pessoaId) {
    throw new Error('Cadastro já vinculado a outra Pessoa.');
  }

  const pessoa = await tx.pessoa.findUnique({
    where: { id: pessoaId },
    select: {
      id: true,
      emailPrincipal: true,
      [modelo]: {
        select: { id: true },
      },
    },
  });

  if (!pessoa) {
    throw new Error('Pessoa não encontrada para vinculação.');
  }

  const emailCadastro = normalizarEmail(cadastro.email);
  const emailPessoa = normalizarEmail(pessoa.emailPrincipal);

  if (!emailCadastro || emailCadastro !== emailPessoa) {
    throw new Error('E-mails incompatíveis para vinculação.');
  }

  if (pessoa[modelo] && pessoa[modelo].id !== cadastroId) {
    throw new Error('Pessoa já vinculada a outro cadastro deste tipo.');
  }

  if (cadastro.pessoaId === pessoaId) {
    return {
      cadastroId,
      pessoaId,
      jaVinculado: true,
    };
  }

  const resultado = await tx[modelo].updateMany({
    where: {
      id: cadastroId,
      email: cadastro.email,
      pessoaId: null,
    },
    data: {
      pessoaId,
    },
  });

  if (resultado.count !== 1) {
    throw new Error(
      'O cadastro mudou durante a vinculação. Tente novamente após conferir os dados.',
    );
  }

  return {
    cadastroId,
    pessoaId,
    jaVinculado: false,
  };
}