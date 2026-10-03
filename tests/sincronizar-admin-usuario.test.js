import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  codigosPermissoesAdministrativas,
  sincronizarAdminUserComUsuario,
} from "../src/lib/sincronizar-admin-usuario";

describe("sincronizar-admin-usuario", () => {
  it("não cria permissões explícitas para ADMIN", () => {
    expect(
      codigosPermissoesAdministrativas({
        role: "ADMIN",
        podeGerenciarSucatas: true,
        podeGerenciarDepoimentos: true,
        podeGerenciarJornada: true,
      }),
    ).toEqual([]);
  });

  it("converte flags do PARCEIRO em códigos de permissão", () => {
    expect(
      codigosPermissoesAdministrativas({
        role: "PARCEIRO",
        podeGerenciarSucatas: true,
        podeGerenciarDepoimentos: false,
        podeGerenciarJornada: true,
      }),
    ).toEqual([
      "SUCATAS_GERENCIAR",
      "JORNADA_GERENCIAR",
    ]);
  });

  it("cria identidade administrativa e sincroniza permissões", async () => {
    const tx = {
      adminUser: {
        findUnique: vi.fn().mockResolvedValue({
          id: "admin-1",
          nome: "Parceiro Teste",
          email: "PARCEIRO@EXAMPLE.TEST",
          senha: "$2b$12$hash-ficticio",
          role: "PARCEIRO",
          ativo: true,
          mustChangePassword: false,
          passwordChangedAt: null,
          pessoaId: null,
          podeGerenciarSucatas: true,
          podeGerenciarDepoimentos: false,
          podeGerenciarJornada: true,
        }),
        update: vi.fn().mockResolvedValue({}),
      },

      pessoa: {
        findUnique: vi.fn(),
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({
          id: "pessoa-1",
        }),
        update: vi.fn().mockResolvedValue({}),
      },

      usuario: {
        upsert: vi.fn().mockResolvedValue({
          id: "usuario-1",
        }),
      },

      acessoAdministrativo: {
        upsert: vi.fn().mockResolvedValue({}),
      },

      permissao: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "perm-sucatas",
            codigo: "SUCATAS_GERENCIAR",
          },
          {
            id: "perm-depoimentos",
            codigo: "DEPOIMENTOS_GERENCIAR",
          },
          {
            id: "perm-jornada",
            codigo: "JORNADA_GERENCIAR",
          },
        ]),
      },

      usuarioPermissao: {
        deleteMany: vi.fn().mockResolvedValue({
          count: 0,
        }),
        createMany: vi.fn().mockResolvedValue({
          count: 2,
        }),
      },
    };

    const resultado =
      await sincronizarAdminUserComUsuario(
        tx,
        "admin-1",
      );

    expect(tx.pessoa.create).toHaveBeenCalledWith({
      data: {
        nome: "Parceiro Teste",
        emailPrincipal: "parceiro@example.test",
        ativo: true,
      },
      select: {
        id: true,
      },
    });

    expect(tx.adminUser.update).toHaveBeenCalledWith({
      where: { id: "admin-1" },
      data: {
        pessoaId: "pessoa-1",
      },
    });

    expect(tx.pessoa.update).toHaveBeenCalledWith({
      where: {
        id: "pessoa-1",
      },
      data: {
        nome: "Parceiro Teste",
      },
    });

    expect(tx.usuario.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          pessoaId: "pessoa-1",
          status: "ATIVO",
          senhaHash: "$2b$12$hash-ficticio",
        }),
        update: expect.objectContaining({
          senhaHash: "$2b$12$hash-ficticio",
        }),
      }),
    );

    expect(
      tx.acessoAdministrativo.upsert,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        create: {
          usuarioId: "usuario-1",
          papel: "PARCEIRO",
          ativo: true,
        },
        update: {
          papel: "PARCEIRO",
          ativo: true,
        },
      }),
    );

    expect(
      tx.usuarioPermissao.deleteMany,
    ).toHaveBeenCalledWith({
      where: {
        usuarioId: "usuario-1",
        permissaoId: {
          in: [
            "perm-sucatas",
            "perm-depoimentos",
            "perm-jornada",
          ],
        },
      },
    });

    expect(
      tx.usuarioPermissao.createMany,
    ).toHaveBeenCalledWith({
      data: [
        {
          usuarioId: "usuario-1",
          permissaoId: "perm-sucatas",
        },
        {
          usuarioId: "usuario-1",
          permissaoId: "perm-jornada",
        },
      ],
      skipDuplicates: true,
    });

    expect(resultado).toEqual({
      adminUserId: "admin-1",
      pessoaId: "pessoa-1",
      usuarioId: "usuario-1",
      papel: "PARCEIRO",
      ativo: true,
      permissoes: [
        "SUCATAS_GERENCIAR",
        "JORNADA_GERENCIAR",
      ],
    });
  });
});
