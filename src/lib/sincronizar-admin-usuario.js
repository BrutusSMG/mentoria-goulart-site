// src/lib/sincronizar-admin-usuario.js

import {
  CAMPO_LEGADO_POR_PERMISSAO,
  PERMISSOES,
} from "@/lib/permissoes";

const CODIGOS_ADMINISTRATIVOS = Object.freeze(
  Object.values(PERMISSOES),
);

function normalizarEmail(valor) {
  return String(valor || "").trim().toLowerCase();
}

export function codigosPermissoesAdministrativas(admin) {
  if (admin?.role !== "PARCEIRO") {
    return [];
  }

  return CODIGOS_ADMINISTRATIVOS.filter((codigo) => {
    const campo = CAMPO_LEGADO_POR_PERMISSAO[codigo];
    return Boolean(campo && admin?.[campo]);
  });
}

export async function sincronizarAdminUserComUsuario(
  tx,
  adminUserId,
) {
  const admin = await tx.adminUser.findUnique({
    where: { id: adminUserId },
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

  if (!admin) {
    throw new Error("AdminUser n?o encontrado para sincroniza??o.");
  }

  if (!["ADMIN", "PARCEIRO"].includes(admin.role)) {
    throw new Error(
      `Role administrativa n?o suportada na E5: ${admin.role}`,
    );
  }

  const email = normalizarEmail(admin.email);

  let pessoa = null;

  if (admin.pessoaId) {
    pessoa = await tx.pessoa.findUnique({
      where: { id: admin.pessoaId },
      select: {
        id: true,
        adminUser: {
          select: { id: true },
        },
      },
    });

    if (!pessoa) {
      throw new Error(
        "AdminUser aponta para Pessoa inexistente.",
      );
    }
  } else {
    const pessoas = await tx.pessoa.findMany({
      where: {
        emailPrincipal: {
          equals: email,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        adminUser: {
          select: { id: true },
        },
        usuario: {
          select: {
            senhaHash: true,
          },
        },
      },
    });

    if (pessoas.length > 1) {
      throw new Error(
        "Mais de uma Pessoa encontrada para o e-mail administrativo.",
      );
    }

    pessoa = pessoas[0] || null;

    if (
      pessoa?.adminUser &&
      pessoa.adminUser.id !== admin.id
    ) {
      throw new Error(
        "Pessoa j? vinculada a outro AdminUser.",
      );
    }

    if (
      pessoa?.usuario?.senhaHash &&
      pessoa.usuario.senhaHash !== admin.senha
    ) {
      throw new Error(
        "Pessoa j? possui Usuario com credencial diferente.",
      );
    }

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

    await tx.adminUser.update({
      where: { id: admin.id },
      data: {
        pessoaId: pessoa.id,
      },
    });
  }

  await tx.pessoa.update({
    where: { id: pessoa.id },
    data: {
      nome: admin.nome,
    },
  });

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
    update: {
      senhaHash: admin.senha,
      mustChangePassword: admin.mustChangePassword,
      passwordChangedAt: admin.passwordChangedAt,
    },
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
    update: {
      papel: admin.role,
      ativo: admin.ativo,
    },
  });

  const permissoes = await tx.permissao.findMany({
    where: {
      codigo: {
        in: CODIGOS_ADMINISTRATIVOS,
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

  for (const codigo of CODIGOS_ADMINISTRATIVOS) {
    if (!permissaoPorCodigo.has(codigo)) {
      throw new Error(
        `Permiss?o administrativa ausente ou inativa: ${codigo}`,
      );
    }
  }

  const codigosDesejados =
    codigosPermissoesAdministrativas(admin);

  const idsAdministrativos = permissoes.map(
    (permissao) => permissao.id,
  );

  await tx.usuarioPermissao.deleteMany({
    where: {
      usuarioId: usuario.id,
      permissaoId: {
        in: idsAdministrativos,
      },
    },
  });

  if (codigosDesejados.length > 0) {
    await tx.usuarioPermissao.createMany({
      data: codigosDesejados.map((codigo) => ({
        usuarioId: usuario.id,
        permissaoId: permissaoPorCodigo.get(codigo).id,
      })),
      skipDuplicates: true,
    });
  }

  return {
    adminUserId: admin.id,
    pessoaId: pessoa.id,
    usuarioId: usuario.id,
    papel: admin.role,
    ativo: admin.ativo,
    permissoes: codigosDesejados,
  };
}
