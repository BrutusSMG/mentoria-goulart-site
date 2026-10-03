import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  definirCredencialCanonica,
} from "../src/lib/credencial-usuario";

function criarTx() {
  return {
    pessoa: {
      findUnique: vi.fn().mockResolvedValue({
        id: "pessoa-1",
        aluno: {
          id: "aluno-1",
        },
        adminUser: {
          id: "admin-1",
        },
      }),
    },

    usuario: {
      upsert: vi.fn().mockResolvedValue({
        id: "usuario-1",
        status: "ATIVO",
      }),
    },

    adminUser: {
      update: vi.fn().mockResolvedValue({}),
    },

    aluno: {
      update: vi.fn().mockResolvedValue({}),
    },
  };
}

describe("credencial-usuario", () => {
  it(
    "espelha a mesma credencial para Usuario, AdminUser e Aluno",
    async () => {
      const tx = criarTx();
      const alteradoEm =
        new Date("2026-10-03T20:00:00.000Z");

      const resultado =
        await definirCredencialCanonica(tx, {
          pessoaId: "pessoa-1",
          senhaHash: "$2b$12$hash-canonico",
          mustChangePassword: false,
          passwordChangedAt: alteradoEm,
        });

      expect(tx.usuario.upsert).toHaveBeenCalledWith({
        where: {
          pessoaId: "pessoa-1",
        },
        create: {
          pessoaId: "pessoa-1",
          senhaHash: "$2b$12$hash-canonico",
          status: "ATIVO",
          mustChangePassword: false,
          passwordChangedAt: alteradoEm,
        },
        update: {
          senhaHash: "$2b$12$hash-canonico",
          mustChangePassword: false,
          passwordChangedAt: alteradoEm,
        },
        select: {
          id: true,
          status: true,
        },
      });

      expect(tx.adminUser.update).toHaveBeenCalledWith({
        where: {
          id: "admin-1",
        },
        data: {
          senha: "$2b$12$hash-canonico",
          mustChangePassword: false,
          passwordChangedAt: alteradoEm,
        },
      });

      expect(tx.aluno.update).toHaveBeenCalledWith({
        where: {
          id: "aluno-1",
        },
        data: {
          senhaHash: "$2b$12$hash-canonico",
        },
      });

      expect(resultado).toEqual({
        pessoaId: "pessoa-1",
        usuarioId: "usuario-1",
        statusUsuario: "ATIVO",
        possuiAdmin: true,
        possuiAluno: true,
      });
    },
  );

  it(
    "ativa explicitamente Usuario pendente no primeiro acesso",
    async () => {
      const tx = criarTx();

      await definirCredencialCanonica(tx, {
        pessoaId: "pessoa-1",
        senhaHash: "$2b$12$novo-hash",
        ativarUsuario: true,
      });

      expect(tx.usuario.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            senhaHash: "$2b$12$novo-hash",
            status: "ATIVO",
          }),
        }),
      );
    },
  );

  it(
    "n?o altera status do Usuario em troca comum de senha",
    async () => {
      const tx = criarTx();

      await definirCredencialCanonica(tx, {
        pessoaId: "pessoa-1",
        senhaHash: "$2b$12$novo-hash",
      });

      const chamada =
        tx.usuario.upsert.mock.calls[0][0];

      expect(chamada.update).not.toHaveProperty(
        "status",
      );
    },
  );
});
