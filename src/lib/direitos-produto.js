// src/lib/direitos-produto.js
import { prisma } from './prisma';

const NIVEIS_ECOSSISTEMA = [
  'NENHUM',
  'BASICO',
  'COMPLETO',
  'PREMIUM',
];

const RANK_NIVEL_ECOSSISTEMA = new Map(
  NIVEIS_ECOSSISTEMA.map((nivel, indice) => [nivel, indice]),
);

const TIPOS_DIREITO_BINARIO = new Set([
  'AREA_ALUNO',
  'COMUNIDADE',
  'MENTORIA',
  'CONTEUDO_PRODUTO',
]);

function normalizarId(valor) {
  return String(valor || '').trim();
}

function dataValida(valor) {
  return valor instanceof Date && !Number.isNaN(valor.getTime());
}

function validarConfiguracaoProdutoDireito(direito) {
  if (!direito) {
    throw new TypeError('ProdutoDireito ausente.');
  }

  if (direito.tipo === 'ECOSSISTEMA') {
    if (
      !['BASICO', 'COMPLETO', 'PREMIUM'].includes(direito.nivel)
    ) {
      throw new Error(
        `Nivel de ECOSSISTEMA invalido no ProdutoDireito ${direito.id}.`,
      );
    }

    return;
  }

  if (!TIPOS_DIREITO_BINARIO.has(direito.tipo)) {
    throw new Error(
      `Tipo de ProdutoDireito invalido: ${direito.tipo}.`,
    );
  }

  if (direito.nivel !== null && direito.nivel !== undefined) {
    throw new Error(
      `Direito binario ${direito.tipo} nao pode possuir nivel.`,
    );
  }
}

function whereConcessaoValida(alunoId, agora) {
  const id = normalizarId(alunoId);

  if (!id) {
    return null;
  }

  if (!dataValida(agora)) {
    throw new TypeError('Data de consulta invalida.');
  }

  return {
    alunoId: id,
    status: 'ATIVO',
    iniciaEm: {
      lte: agora,
    },
    OR: [
      {
        expiraEm: null,
      },
      {
        expiraEm: {
          gt: agora,
        },
      },
    ],
    aluno: {
      status: 'ATIVO',
    },
  };
}

async function alunoTemDireitoBinario(
  alunoId,
  tipo,
  agora = new Date(),
  db = prisma,
) {
  const whereBase = whereConcessaoValida(alunoId, agora);

  if (!whereBase) {
    return false;
  }

  const direito = await db.direitoConcedido.findFirst({
    where: {
      ...whereBase,
      produtoDireito: {
        ativo: true,
        tipo,
      },
    },
    select: {
      id: true,
    },
  });

  return Boolean(direito);
}

export function direitoConcedidoValido(
  direito,
  agora = new Date(),
) {
  if (!direito || direito.status !== 'ATIVO') {
    return false;
  }

  if (!dataValida(agora)) {
    return false;
  }

  if (
    !dataValida(direito.iniciaEm) ||
    direito.iniciaEm > agora
  ) {
    return false;
  }

  if (
    direito.expiraEm !== null &&
    direito.expiraEm !== undefined
  ) {
    if (!dataValida(direito.expiraEm)) {
      return false;
    }

    if (agora >= direito.expiraEm) {
      return false;
    }
  }

  return true;
}

export function maiorNivelEcossistema(niveis = []) {
  let maiorRank = 0;

  for (const nivel of niveis) {
    const rank = RANK_NIVEL_ECOSSISTEMA.get(nivel);

    if (typeof rank === 'number' && rank > maiorRank) {
      maiorRank = rank;
    }
  }

  return NIVEIS_ECOSSISTEMA[maiorRank];
}

export async function concederDireitosProdutoHotmart(
  tx,
  {
    alunoId,
    produtoId,
    transacaoOrigemId,
    concedidoEm,
    iniciaEm = concedidoEm,
    expiraEm = null,
  },
) {
  const alunoIdNormalizado = normalizarId(alunoId);
  const produtoIdNormalizado = normalizarId(produtoId);
  const transacaoOrigemIdNormalizado =
    normalizarId(transacaoOrigemId);

  if (
    !alunoIdNormalizado ||
    !produtoIdNormalizado ||
    !transacaoOrigemIdNormalizado
  ) {
    throw new TypeError(
      'Aluno, produto e transacao de origem sao obrigatorios.',
    );
  }

  if (!dataValida(concedidoEm) || !dataValida(iniciaEm)) {
    throw new TypeError(
      'Datas de concessao e inicio sao obrigatorias.',
    );
  }

  if (expiraEm !== null && !dataValida(expiraEm)) {
    throw new TypeError('Data de expiracao invalida.');
  }

  const direitosProduto = await tx.produtoDireito.findMany({
    where: {
      produtoId: produtoIdNormalizado,
      ativo: true,
    },
    orderBy: {
      id: 'asc',
    },
    select: {
      id: true,
      tipo: true,
      nivel: true,
    },
  });

  const concessoes = [];

  for (const direito of direitosProduto) {
    validarConfiguracaoProdutoDireito(direito);

    const concessao = await tx.direitoConcedido.upsert({
      where: {
        produtoDireitoId_transacaoOrigemId: {
          produtoDireitoId: direito.id,
          transacaoOrigemId: transacaoOrigemIdNormalizado,
        },
      },
      update: {},
      create: {
        alunoId: alunoIdNormalizado,
        produtoDireitoId: direito.id,
        transacaoOrigemId: transacaoOrigemIdNormalizado,
        origem: 'HOTMART',
        status: 'ATIVO',
        concedidoEm,
        iniciaEm,
        expiraEm,
      },
      select: {
        id: true,
        alunoId: true,
        produtoDireitoId: true,
        transacaoOrigemId: true,
        status: true,
      },
    });

    concessoes.push(concessao);
  }

  return concessoes;
}

export async function revogarDireitosPorTransacao(
  tx,
  {
    transacaoOrigemId,
    revogadoEm = new Date(),
  },
) {
  const id = normalizarId(transacaoOrigemId);

  if (!id) {
    throw new TypeError('Transacao de origem obrigatoria.');
  }

  if (!dataValida(revogadoEm)) {
    throw new TypeError('Data de revogacao invalida.');
  }

  return tx.direitoConcedido.updateMany({
    where: {
      transacaoOrigemId: id,
      status: {
        not: 'REVOGADO',
      },
    },
    data: {
      status: 'REVOGADO',
      revogadoEm,
      statusAlteradoEm: revogadoEm,
    },
  });
}

export async function alunoTemAcessoComunidade(
  alunoId,
  agora = new Date(),
  db = prisma,
) {
  return alunoTemDireitoBinario(
    alunoId,
    'COMUNIDADE',
    agora,
    db,
  );
}

export async function alunoTemMentoriaAtiva(
  alunoId,
  agora = new Date(),
  db = prisma,
) {
  return alunoTemDireitoBinario(
    alunoId,
    'MENTORIA',
    agora,
    db,
  );
}

export async function alunoPodeAcessarProduto(
  alunoId,
  produtoId,
  agora = new Date(),
  db = prisma,
) {
  const idProduto = normalizarId(produtoId);
  const whereBase = whereConcessaoValida(alunoId, agora);

  if (!whereBase || !idProduto) {
    return false;
  }

  const direito = await db.direitoConcedido.findFirst({
    where: {
      ...whereBase,
      produtoDireito: {
        ativo: true,
        tipo: 'CONTEUDO_PRODUTO',
        produtoId: idProduto,
      },
    },
    select: {
      id: true,
    },
  });

  return Boolean(direito);
}

export async function nivelAcessoEcossistema(
  alunoId,
  agora = new Date(),
  db = prisma,
) {
  const whereBase = whereConcessaoValida(alunoId, agora);

  if (!whereBase) {
    return 'NENHUM';
  }

  const concessoes = await db.direitoConcedido.findMany({
    where: {
      ...whereBase,
      produtoDireito: {
        ativo: true,
        tipo: 'ECOSSISTEMA',
      },
    },
    select: {
      produtoDireito: {
        select: {
          nivel: true,
        },
      },
    },
  });

  return maiorNivelEcossistema(
    concessoes.map(
      (concessao) => concessao.produtoDireito?.nivel,
    ),
  );
}
