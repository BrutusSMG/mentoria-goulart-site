import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks = vi.hoisted(() => ({
  obterAcessoAtual: vi.fn(),
  adminFindUnique: vi.fn(),
  adminUpdate: vi.fn(),
  transaction: vi.fn(),
  bcryptCompare: vi.fn(),
  bcryptHash: vi.fn(),
  sincronizar: vi.fn(),
}));

vi.mock("next/server", () => ({
  NextResponse: {
    json(data, init = {}) {
      return Response.json(data, init);
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: mocks.bcryptCompare,
    hash: mocks.bcryptHash,
  },
}));

vi.mock("@/lib/admin-permissoes", () => ({
  obterAcessoAtual: mocks.obterAcessoAtual,
  respostaAcessoNegado: vi.fn(),
  prisma: {
    adminUser: {
      findUnique: mocks.adminFindUnique,
    },
    $transaction: mocks.transaction,
  },
}));

vi.mock("@/lib/sincronizar-admin-usuario", () => ({
  sincronizarAdminUserComUsuario: mocks.sincronizar,
}));

import { POST } from "../src/app/api/admin/alterar-minha-senha/route";

beforeEach(() => {
  vi.clearAllMocks();

  mocks.obterAcessoAtual.mockResolvedValue({
    permitido: true,
    conta: {
      id: "admin-1",
    },
  });

  mocks.adminFindUnique.mockResolvedValue({
    id: "admin-1",
    senha: "$2b$12$hash-temporario",
    ativo: true,
    mustChangePassword: true,
  });

  mocks.bcryptCompare.mockResolvedValue(true);
  mocks.bcryptHash.mockResolvedValue(
    "$2b$12$hash-definitivo",
  );

  mocks.adminUpdate.mockResolvedValue({});

  mocks.transaction.mockImplementation(
    async (callback) =>
      callback({
        adminUser: {
          update: mocks.adminUpdate,
        },
      }),
  );

  mocks.sincronizar.mockResolvedValue({});
});

describe("alterar-minha-senha dual-write", () => {
  it("sincroniza Usuario ap?s alterar a senha do AdminUser", async () => {
    const req = {
      json: vi.fn().mockResolvedValue({
        senhaTemporaria: "senha-temporaria-123",
        novaSenha: "nova-senha-definitiva-123",
        confirmarSenha: "nova-senha-definitiva-123",
      }),
    };

    const response = await POST(req);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      success: true,
    });

    expect(mocks.transaction).toHaveBeenCalledTimes(1);

    expect(mocks.adminUpdate).toHaveBeenCalledWith({
      where: {
        id: "admin-1",
      },
      data: {
        senha: "$2b$12$hash-definitivo",
        mustChangePassword: false,
        passwordChangedAt: expect.any(Date),
      },
    });

    expect(mocks.sincronizar).toHaveBeenCalledWith(
      expect.any(Object),
      "admin-1",
    );
  });
});
