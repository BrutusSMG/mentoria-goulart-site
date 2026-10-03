import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const APLICAR = process.argv.includes("--apply");

const argumentoResolucao = process.argv.find(
  (arg) => arg.startsWith("--resolver-conflitos="),
);

const RESOLVER_CONFLITOS = argumentoResolucao
  ? argumentoResolucao.split("=")[1]
  : null;

if (
  RESOLVER_CONFLITOS &&
  RESOLVER_CONFLITOS !== "usuario"
) {
  throw new Error(
    "Resolu??o inv?lida. Use --resolver-conflitos=usuario.",
  );
}

function normalizarEmail(valor) {
  return String(valor || "").trim().toLowerCase();
}

async function localizarPessoa(tx, aluno) {
  const select = {
    id: true,
    emailPrincipal: true,

    aluno: {
      select: {
        id: true,
      },
    },

    adminUser: {
      select: {
        id: true,
      },
    },

    usuario: {
      select: {
        id: true,
        senhaHash: true,
        status: true,
      },
    },
  };

  if (aluno.pessoaId) {
    const pessoa = await tx.pessoa.findUnique({
      where: {
        id: aluno.pessoaId,
      },
      select,
    });

    if (!pessoa) {
      throw new Error(
        "Aluno aponta para Pessoa inexistente.",
      );
    }

    return {
      pessoa,
      origem: "VINCULO_EXISTENTE",
    };
  }

  const email = normalizarEmail(aluno.email);

  const pessoas = await tx.pessoa.findMany({
    where: {
      emailPrincipal: {
        equals: email,
        mode: "insensitive",
      },
    },
    select,
  });

  if (pessoas.length > 1) {
    throw new Error(
      "Mais de uma Pessoa encontrada para um e-mail de aluno.",
    );
  }

  return {
    pessoa: pessoas[0] || null,
    origem: pessoas.length
      ? "EMAIL_EXISTENTE"
      : "CRIAR",
  };
}

function analisarCredencial(aluno, pessoa) {
  const usuario = pessoa?.usuario || null;
  const senhaAluno = aluno.senhaHash || null;
  const senhaUsuario = usuario?.senhaHash || null;

  if (!usuario) {
    return senhaAluno
      ? {
          acao: "CRIAR_USUARIO_ATIVO",
          conflito: false,
        }
      : {
          acao: "CRIAR_USUARIO_PENDENTE",
          conflito: false,
        };
  }

  if (senhaAluno && senhaUsuario) {
    if (senhaAluno === senhaUsuario) {
      return {
        acao: "MANTER_CREDENCIAL",
        conflito: false,
      };
    }

    if (RESOLVER_CONFLITOS === "usuario") {
      return {
        acao: "ADOTAR_USUARIO_NO_ALUNO",
        conflito: true,
        resolvido: true,
      };
    }

    return {
      acao: "CONFLITO_CREDENCIAL",
      conflito: true,
      resolvido: false,
    };
  }

  if (!senhaAluno && senhaUsuario) {
    return {
      acao: "ESPELHAR_USUARIO_NO_ALUNO",
      conflito: false,
    };
  }

  if (senhaAluno && !senhaUsuario) {
    return {
      acao: "ADOTAR_ALUNO_NO_USUARIO",
      conflito: false,
    };
  }

  return {
    acao: "MANTER_PENDENTE",
    conflito: false,
  };
}

async function carregarPlano(tx) {
  const alunos = await tx.aluno.findMany({
    orderBy: {
      createdAt: "asc",
    },

    select: {
      id: true,
      nome: true,
      email: true,
      senhaHash: true,
      status: true,
      origem: true,
      ultimoLoginEm: true,
      pessoaId: true,
    },
  });

  const plano = [];

  for (const aluno of alunos) {
    const localizacao = await localizarPessoa(
      tx,
      aluno,
    );

    const pessoa = localizacao.pessoa;

    if (
      pessoa?.aluno &&
      pessoa.aluno.id !== aluno.id
    ) {
      throw new Error(
        "Pessoa j? vinculada a outro Aluno.",
      );
    }

    if (
      pessoa &&
      normalizarEmail(pessoa.emailPrincipal) !==
        normalizarEmail(aluno.email)
    ) {
      throw new Error(
        "E-mail principal da Pessoa diverge do Aluno.",
      );
    }

    const credencial =
      analisarCredencial(aluno, pessoa);

    plano.push({
      aluno,
      pessoa,
      origemPessoa: localizacao.origem,
      credencial,
    });
  }

  return plano;
}

async function aplicarPlano(tx, plano) {
  for (const item of plano) {
    const {
      aluno,
      credencial,
    } = item;

    let pessoa = item.pessoa;

    if (!pessoa) {
      pessoa = await tx.pessoa.create({
        data: {
          nome: aluno.nome,
          emailPrincipal:
            normalizarEmail(aluno.email),
          ativo: true,
        },

        select: {
          id: true,
        },
      });
    }

    if (aluno.pessoaId !== pessoa.id) {
      await tx.aluno.update({
        where: {
          id: aluno.id,
        },

        data: {
          pessoaId: pessoa.id,
        },
      });
    }

    const usuarioExistente =
      item.pessoa?.usuario || null;

    if (!usuarioExistente) {
      await tx.usuario.create({
        data: {
          pessoaId: pessoa.id,
          senhaHash: aluno.senhaHash || null,

          status: aluno.senhaHash
            ? "ATIVO"
            : "PENDENTE_ATIVACAO",

          mustChangePassword: false,
          passwordChangedAt: null,
          ultimoLoginEm:
            aluno.ultimoLoginEm || null,
        },
      });

      continue;
    }

    if (
      credencial.acao ===
        "ADOTAR_USUARIO_NO_ALUNO" ||
      credencial.acao ===
        "ESPELHAR_USUARIO_NO_ALUNO"
    ) {
      await tx.aluno.update({
        where: {
          id: aluno.id,
        },

        data: {
          senhaHash:
            usuarioExistente.senhaHash,
        },
      });

      continue;
    }

    if (
      credencial.acao ===
      "ADOTAR_ALUNO_NO_USUARIO"
    ) {
      await tx.usuario.update({
        where: {
          id: usuarioExistente.id,
        },

        data: {
          senhaHash: aluno.senhaHash,

          ...(usuarioExistente.status ===
          "PENDENTE_ATIVACAO"
            ? {
                status: "ATIVO",
              }
            : {}),
        },
      });

      continue;
    }

    if (
      credencial.acao ===
      "CONFLITO_CREDENCIAL"
    ) {
      throw new Error(
        "Conflito de credencial n?o resolvido.",
      );
    }
  }
}

function resumir(plano) {
  const contas = plano.map(
    (item, indice) => ({
      conta: indice + 1,

      aluno: {
        status: item.aluno.status,
        origem: item.aluno.origem,
        possuiSenha:
          Boolean(item.aluno.senhaHash),
      },

      pessoa: {
        acao: item.origemPessoa,
        compartilhadaComAdmin:
          Boolean(item.pessoa?.adminUser),
      },

      usuario: {
        existente:
          Boolean(item.pessoa?.usuario),
        statusAtual:
          item.pessoa?.usuario?.status ||
          null,
      },

      credencial: item.credencial,
    }),
  );

  const conflitos = plano.filter(
    (item) => item.credencial.conflito,
  );

  const naoResolvidos = conflitos.filter(
    (item) =>
      item.credencial.resolvido !== true,
  );

  return {
    totalAlunos: plano.length,

    novasPessoas: plano.filter(
      (item) =>
        item.origemPessoa === "CRIAR",
    ).length,

    novosUsuariosAtivos: plano.filter(
      (item) =>
        item.credencial.acao ===
        "CRIAR_USUARIO_ATIVO",
    ).length,

    novosUsuariosPendentes: plano.filter(
      (item) =>
        item.credencial.acao ===
        "CRIAR_USUARIO_PENDENTE",
    ).length,

    conflitosCredencial:
      conflitos.length,

    conflitosResolvidos:
      conflitos.filter(
        (item) =>
          item.credencial.resolvido === true,
      ).length,

    aplicavel:
      naoResolvidos.length === 0,

    contas,
  };
}

async function main() {
  const resultado =
    await prisma.$transaction(async (tx) => {
      const plano =
        await carregarPlano(tx);

      const resumo = resumir(plano);

      if (
        APLICAR &&
        !resumo.aplicavel
      ) {
        throw new Error(
          "Existem conflitos de credencial n?o resolvidos. Nenhuma altera??o foi aplicada.",
        );
      }

      if (APLICAR) {
        await aplicarPlano(tx, plano);
      }

      return resumo;
    });

  console.dir(
    {
      modo: APLICAR
        ? "APLICAR"
        : "DRY_RUN",

      resolverConflitos:
        RESOLVER_CONFLITOS,

      ...resultado,
    },
    {
      depth: null,
    },
  );
}

main()
  .catch((erro) => {
    console.error(erro.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
