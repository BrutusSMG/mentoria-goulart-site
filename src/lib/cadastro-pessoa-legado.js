import {
  emailValido,
  normalizarEmail,
} from '@/lib/validacoes';

/**
 * Prepara os dados de um cadastro administrativo de aluno legado.
 *
 * Não consulta o banco, não cria Pessoa ou Aluno,
 * não concede direitos e não envia convites.
 */
export function prepararCadastroPessoaLegado(dados) {
  const nome =
    typeof dados?.nome === 'string'
      ? dados.nome.trim()
      : '';

  const email = normalizarEmail(dados?.email);

  const telefone =
    typeof dados?.telefone === 'string'
      ? dados.telefone.trim() || null
      : null;

  if (nome.length < 2 || nome.length > 120) {
    throw new Error(
      'Informe um nome entre 2 e 120 caracteres.',
    );
  }

  if (!emailValido(email)) {
    throw new Error('Informe um e-mail válido.');
  }

  if (
    dados?.telefone !== undefined &&
    dados.telefone !== null &&
    typeof dados.telefone !== 'string'
  ) {
    throw new Error('Telefone inválido.');
  }

  if (
    !Array.isArray(dados?.produtoIds) ||
    dados.produtoIds.length === 0
  ) {
    throw new Error(
      'Selecione os produtos já adquiridos pelo aluno legado.',
    );
  }

  const produtoIds = dados.produtoIds.map((id) =>
    typeof id === 'string' ? id.trim() : '',
  );

  if (produtoIds.some((id) => !id)) {
    throw new Error('Identificador de produto inválido.');
  }

  if (new Set(produtoIds).size !== produtoIds.length) {
    throw new Error(
      'O mesmo produto não pode ser selecionado duas vezes.',
    );
  }

  return {
    nome,
    email,
    telefone,
    produtoIds,
    origem: 'LEGADO',
  };
}

/**
 * Confere os produtos selecionados e suas configurações de acesso.
 *
 * Recebe o cliente de uma transação Prisma (tx).
 * Apenas consulta: não cria cadastros nem concede direitos.
 */
export async function validarProdutosCadastroLegado(tx, produtoIds) {
  const produtos = await tx.produto.findMany({
    where: {
      id: { in: produtoIds },
    },
    select: {
      id: true,
      nome: true,
      tipo: true,
      ativo: true,
      direitos: {
        where: { ativo: true },
        select: {
          id: true,
          tipo: true,
          nivel: true,
        },
      },
    },
  });

  const produtosPorId = new Map(
    produtos.map((produto) => [produto.id, produto]),
  );

  // Mantém a ordem escolhida pelo administrador e verifica
  // cada produto antes de iniciar qualquer gravação.
  return produtoIds.map((produtoId) => {
    const produto = produtosPorId.get(produtoId);

    if (!produto) {
      throw new Error(
        `Produto não encontrado no catálogo: ${produtoId}.`,
      );
    }

    if (!produto.ativo) {
      throw new Error(
        `Produto inativo no catálogo: ${produtoId}.`,
      );
    }

    if (produto.direitos.length === 0) {
      throw new Error(
        `Produto sem direitos ativos configurados: ${produtoId}.`,
      );
    }

    return produto;
  });
}

const TIPOS_DURACAO_LEGADO = new Set([
  'DEFINIDA',
  'INDEFINIDA',
  'VITALICIA',
]);

function dataCivilValida(valor) {
  if (
    typeof valor !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(valor)
  ) {
    return false;
  }

  const data = new Date(`${valor}T12:00:00.000Z`);

  return (
    !Number.isNaN(data.getTime()) &&
    data.toISOString().slice(0, 10) === valor
  );
}

/**
 * Valida uma vigência para cada produto legado.
 *
 * dataFimOriginal representa a data registrada no histórico
 * da compra antiga, não uma nova duração a partir da migração.
 *
 * Esta função não consulta nem altera o banco.
 */
export function prepararVigenciasLegado(produtoIds, vigencias) {
  if (
    !Array.isArray(produtoIds) ||
    produtoIds.length === 0 ||
    !Array.isArray(vigencias) ||
    vigencias.length !== produtoIds.length
  ) {
    throw new Error(
      'Informe exatamente uma vigência para cada produto legado.',
    );
  }

  const produtosEsperados = new Set(produtoIds);

  if (produtosEsperados.size !== produtoIds.length) {
    throw new Error('Há produtos duplicados no cadastro.');
  }

  const produtosProcessados = new Set();

  return vigencias.map((vigencia) => {
    const produtoId =
      typeof vigencia?.produtoId === 'string'
        ? vigencia.produtoId.trim()
        : '';

    const tipoDuracao = vigencia?.tipoDuracao;

    if (
      !produtosEsperados.has(produtoId) ||
      produtosProcessados.has(produtoId)
    ) {
      throw new Error(
        'A vigência possui produto desconhecido ou duplicado.',
      );
    }

    produtosProcessados.add(produtoId);

    if (!TIPOS_DURACAO_LEGADO.has(tipoDuracao)) {
      throw new Error(
        `Modalidade de vigência inválida para ${produtoId}.`,
      );
    }

    if (tipoDuracao === 'DEFINIDA') {
      const dataFimOriginal = vigencia?.dataFimOriginal;

      if (!dataCivilValida(dataFimOriginal)) {
        throw new Error(
          `Informe a data original de término de ${produtoId} no formato AAAA-MM-DD.`,
        );
      }

      return {
        produtoId,
        tipoDuracao,
        dataFimOriginal,
      };
    }

    if (
      vigencia.dataFimOriginal !== undefined &&
      vigencia.dataFimOriginal !== null &&
      vigencia.dataFimOriginal !== ''
    ) {
      throw new Error(
        `A modalidade ${tipoDuracao} não admite data de término.`,
      );
    }

    return {
      produtoId,
      tipoDuracao,
      dataFimOriginal: null,
    };
  });
}