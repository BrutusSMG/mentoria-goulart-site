import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks = vi.hoisted(() => ({
  obterAcessoAdmin: vi.fn(),
  adminFindUnique: vi.fn(),
  adminCreate: vi.fn(),
  transaction: vi.fn(),
  bcryptHash: vi.fn(),
  sincronizar: vi.fn(),
  definirCredencial: vi.fn(),
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
    hash: mocks.bcryptHash,
  },
}));

vi.mock("@/lib/admin-permissoes", () => ({
  obterAcessoAdmin: mocks.obterAcessoAdmin,
  respostaAcessoNegado: vi.fn(),
  prisma: {
    adminUser: {
      findUnique: mocks.adminFindUnique,
    },
    $transaction: mocks.transaction,
  },
}));

vi.mock("@/lib/validacoes", () => ({
  emailFormatoAdminValido: vi.fn(() => true),
  nomeAdminValido: vi.fn(() => true),
  roleAdminValida: vi.fn(() => true),
  senhaAdminValida: vi.fn(() => true),
}));

vi.mock("@/lib/sincronizar-admin-usuario", () => ({
  sincronizarAdminUserComUsuario:
    mocks.sincronizar,
}));

vi.mock("@/lib/credencial-usuario", () => ({
  definirCredencialCanonica:
    mocks.definirCredencial,
}));

const { POST } = await import(
  "../src/app/api/admin/usuarios/route.js"
);

beforeEach(() => {
  vi.clearAllMocks();

  mocks.obterAcessoAdmin.mockResolvedValue({
    permitido: true,
  });

  mocks.adminFindUnique.mockResolvedValue(null);

  mocks.bcryptHash.mockResolvedValue(
    "$2b$12$hash-temporario",
  );

  mocks.adminCreate.mockResolvedValue({
    id: "admin-1",
    nome: "Parceiro Teste",
    email: "parceiro@example.com",
    role: "PARCEIRO",
    ativo: true,
    podeGerenciarSucatas: false,
    podeGerenciarDepoimentos: false,
    podeGerenciarJornada: false,
    mustChangePassword: true,
    passwordChangedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  mocks.sincronizar.mockResolvedValue({
    pessoaId: "pessoa-1",
  });

  mocks.definirCredencial.mockResolvedValue({});

  mocks.transaction.mockImplementation(
    async (callback) =>
      callback({
        adminUser: {
          create: mocks.adminCreate,
        },
      }),
  );
});

describe(
  "POST /api/admin/usuarios credencial canonica",
  () => {
    it(
      "define explicitamente a senha temporaria no Usuario",
      async () => {
        const req = {
          json: vi.fn().mockResolvedValue({
            nome: "Parceiro Teste",
            email: "parceiro@example.com",
            role: "PARCEIRO",
            senhaTemporaria:
              "senha-temporaria-segura",
          }),
        };

        const response = await POST(req);

        expect(response.status).toBe(201);

        expect(
          mocks.sincronizar,
        ).toHaveBeenCalledWith(
          expect.any(Object),
          "admin-1",
        );

        expect(
          mocks.definirCredencial,
        ).toHaveBeenCalledWith(
          expect.any(Object),
          {
            pessoaId: "pessoa-1",
            senhaHash:
              "$2b$12$hash-temporario",
            mustChangePassword: true,
            passwordChangedAt: null,
            ativarUsuario: true,
          },
        );
      },
    );
  },
);
