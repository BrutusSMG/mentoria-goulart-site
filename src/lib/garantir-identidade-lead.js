import { normalizarEmail } from '@/lib/validacoes';
import { vincularCadastroPessoa } from '@/lib/vincular-pessoa';

const SELECAO_PESSOA_LEAD = {
  id: true,
  emailPrincipal: true,
  lead: {
    select: {
      id: true,
    },
  },
};

async function buscarPessoasPorEmail(tx, email) {
  return tx.pessoa.findMany({
    where: {
      emailPrincipal: {
        equals: email,
        mode: 'insensitive',
      },
    },
    select: SELECAO_PESSOA_LEAD,
  });
}

/**
 * Consolida a identidade de um Lead a partir de uma captura atual.
 *
 * Este helper pode reutilizar uma Pessoa existente com o mesmo e-mail
 * porque a captura atual fornece evidência nova do relacionamento de
 * marketing.
 *
 * Isso NÃO constitui regra genérica de vinculação histórica.
 * Backfills e vínculos legados continuam exigindo validação própria.
 *
 * Não cria Usuario, não concede direitos e não altera os dados de uma
 * Pessoa preexistente.
 */
export async function garantirIdentidadeLeadCapturado(
  tx,
  lead,
) {
  const email = normalizarEmail(lead?.email);

  if (!lead?.id || !email) {
    throw new Error(
      'Lead inválido para consolidação de identidade.',
    );
  }

  let pessoa = null;

  if (lead.pessoaId) {
    pessoa = await tx.pessoa.findUnique({
      where: {
        id: lead.pessoaId,
      },
      select: SELECAO_PESSOA_LEAD,
    });

    if (!pessoa) {
      throw new Error(
        'Lead aponta para Pessoa inexistente.',
      );
    }
  } else {
    const pessoas = await buscarPessoasPorEmail(
      tx,
      email,
    );

    if (pessoas.length > 1) {
      throw new Error(
        'Mais de uma Pessoa encontrada para o Lead.',
      );
    }

    pessoa = pessoas[0] || null;

    if (!pessoa) {
      try {
        pessoa = await tx.pessoa.create({
          data: {
            nome: lead.nome || 'Lead',
            emailPrincipal: email,
            telefonePrincipal:
              lead.whatsapp || null,
            ativo: true,
          },
          select: SELECAO_PESSOA_LEAD,
        });
      } catch (error) {
        /*
         * Duas capturas simultâneas do mesmo e-mail podem tentar
         * criar a Pessoa ao mesmo tempo. Se outra transação venceu
         * a corrida, relê a identidade já criada.
         */
        if (error?.code !== 'P2002') {
          throw error;
        }

        const pessoasAposConflito =
          await buscarPessoasPorEmail(tx, email);

        if (pessoasAposConflito.length !== 1) {
          throw new Error(
            'Conflito ao consolidar Pessoa do Lead.',
          );
        }

        pessoa = pessoasAposConflito[0];
      }
    }
  }

  if (
    normalizarEmail(pessoa.emailPrincipal) !==
    email
  ) {
    throw new Error(
      'E-mail do Lead diverge da Pessoa vinculada.',
    );
  }

  if (
    pessoa.lead &&
    pessoa.lead.id !== lead.id
  ) {
    throw new Error(
      'Pessoa já vinculada a outro Lead.',
    );
  }

  if (lead.pessoaId !== pessoa.id) {
    await vincularCadastroPessoa(tx, {
      tipo: 'lead',
      cadastroId: lead.id,
      pessoaId: pessoa.id,
    });
  }

  return {
    ...lead,
    pessoaId: pessoa.id,
  };
}