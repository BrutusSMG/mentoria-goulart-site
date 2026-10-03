import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const APLICAR = process.argv.includes("--apply");

const MAPEAMENTO_PERMISSOES = [
  {
    campo: "podeGerenciarSucatas",
    codigo: "SUCATAS_GERENCIAR",
  },
  {
    campo: "podeGerenciarDepoimentos",
    codigo: "DEPOIMENTOS_GERENCIAR",
  },
  {
    campo: "podeGerenciarJornada",
    codigo: "JORNADA_GERENCIAR",
  },
];

function normalizarEmail(valor) {
  return String(valor || "").trim().toLowerCase();
}

async function carregarPlano(tx) {
  const admins = await tx.adminUser.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      nome: true,
      email: true,
      senha: true,
      role: true,
      ativo: true,
      mustChangePassword: true,
      passwordChangedAt: true,
      pessoaId: true,
      podeGerenciarSucatas: true,
      podeGerenciarDepoimentos: true,
      podeGerenciarJornada: true,
    },
  });

  const permissoes = await tx.permissao.findMany({
    where: {
      codigo: {
        in: MAPEAMENTO_PERMISSOES.map((item) => item.codigo),
      },
      ativo: true,
    },
    select: {
      id: true,
      codigo: true,
    },
  });

  const permissaoPorCodigo = new Map(
    permissoes.map((item) => [item.codigo, item]),
  );

  for (const item of MAPEAMENTO_PERMISSOES) {
    if (!permissaoPorCodigo.has(item.codigo)) {
      throw new Error(
        `Permiss?o obrigat?ria ausente ou inativa: ${item.codigo}`,
      );
    }
  }

  const plano = [];

  for (const admin of admins) {
    if (!["ADMIN", "PARCEIRO"].includes(admin.role)) {
      throw new Error(
        `Role administrativa n?o suportada na E5.3: ${admin.role}`,
      );
    }

    const email = normalizarEmail(admin.email);

    const pessoasPorEmail = await tx.pessoa.findMany({
      where: {
        emailPrincipal: {
          equals: email,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        emailPrincipal: true,
        adminUser: {
          select: { id: true },
        },
        usuario: {
          select: {
            id: true,
            senhaHash: true,
            acessoAdministrativo: {
              select: {
                papel: true,
                ativo: true,
              },
            },
          },
        },
      },
    });

    if (pessoasPorEmail.length > 1) {
      throw new Error(
        `Mais de uma Pessoa encontrada para uma conta administrativa.`,
      );
    }

    const pessoa = pessoasPorEmail[0] || null;

    if (
      pessoa?.adminUser &&
      pessoa.adminUser.id !== admin.id
    ) {
      throw new Error(
        `Pessoa j? vinculada a outro AdminUser.`,
      );
    }

    if (
      pessoa?.usuario?.senhaHash &&
      pessoa.usuario.senhaHash !== admin.senha
    ) {
      throw new Error(
        `Pessoa j? possui Usuario com credencial diferente.`,
      );
    }

    const codigosPermissao =
      admin.role === "PARCEIRO"
        ? MAPEAMENTO_PERMISSOES
            .filter((item) => admin[item.campo] === true)
            .map((item) => item.codigo)
        : [];

    plano.push({
      admin,
      email,
      pessoa,
      codigosPermissao,
      permissaoPorCodigo,
    });
  }

  return plano;
}

async function aplicarPlano(tx, plano) {
  for (const item of plano) {
    const {
      admin,
      email,
      codigosPermissao,
      permissaoPorCodigo,
    } = item;

    let pessoa = item.pessoa;

    if (!pessoa) {
      pessoa = await tx.pessoa.create({
        data: {
          nome: admin.nome,
          emailPrincipal: email,
          ativo: true,
        },
        select: {
          id: true,
        },
      });
    }

    if (admin.pessoaId !== pessoa.id) {
      await tx.adminUser.update({
        where: { id: admin.id },
        data: {
          pessoaId: pessoa.id,
        },
      });
    }

    const usuario = await tx.usuario.upsert({
      where: {
        pessoaId: pessoa.id,
      },
      create: {
        pessoaId: pessoa.id,
        senhaHash: admin.senha,
        status: "ATIVO",
        mustChangePassword: admin.mustChangePassword,
        passwordChangedAt: admin.passwordChangedAt,
      },
      update: {},
      select: {
        id: true,
      },
    });

    await tx.acessoAdministrativo.upsert({
      where: {
        usuarioId: usuario.id,
      },
      create: {
        usuarioId: usuario.id,
        papel: admin.role,
        ativo: admin.ativo,
      },
      update: {},
    });

    for (const codigo of codigosPermissao) {
      const permissao = permissaoPorCodigo.get(codigo);

      await tx.usuarioPermissao.upsert({
        where: {
          usuarioId_permissaoId: {
            usuarioId: usuario.id,
            permissaoId: permissao.id,
          },
        },
        create: {
          usuarioId: usuario.id,
          permissaoId: permissao.id,
        },
        update: {},
      });
    }
  }
}

async function main() {
  const resultado = await prisma.$transaction(async (tx) => {
    const plano = await carregarPlano(tx);

    const resumo = plano.map((item, indice) => ({
      conta: indice + 1,
      papel: item.admin.role,
      ativo: item.admin.ativo,
      pessoaExistente: Boolean(item.pessoa),
      usuarioExistente: Boolean(item.pessoa?.usuario),
      permissoes: item.codigosPermissao,
    }));

    if (APLICAR) {
      await aplicarPlano(tx, plano);
    }

    return resumo;
  });

  console.dir(
    {
      modo: APLICAR ? "APLICAR" : "DRY_RUN",
      contas: resultado,
    },
    { depth: null },
  );
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
