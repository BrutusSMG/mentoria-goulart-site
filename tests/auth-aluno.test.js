import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const pessoaFindUniqueMock = vi.fn();
const adminFindUniqueMock = vi.fn();
const bcryptCompareMock = vi.fn();

vi.mock("next-auth", () => ({
  default: vi.fn(() => vi.fn()),
}));

vi.mock("next-auth/providers/credentials", () => ({
  default: vi.fn((config) => config),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    pessoa: {
      findUnique: pessoaFindUniqueMock,
    },
    adminUser: {
      findUnique: adminFindUniqueMock,
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: bcryptCompareMock,
  },
}));

const { authOptions } = await import(
  "../src/app/api/auth/[...nextauth]/route.js"
);

const authorize =
  authOptions.providers[0].authorize;

describe("autenticação do aluno via Usuario", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it(
    "autentica pela credencial de Usuario e preserva alunoId",
    async () => {
      pessoaFindUniqueMock.mockResolvedValue({
        id: "pessoa-1",
        emailPrincipal: "aluno@example.com",

        usuario: {
          id: "usuario-1",
          senhaHash: "hash-canonico",
          status: "ATIVO",
        },

        aluno: {
          id: "aluno-1",
          nome: "Aluno Teste",
          status: "ATIVO",
        },
      });

      bcryptCompareMock.mockResolvedValue(true);

      const usuario = await authorize({
        email: " ALUNO@example.com ",
        password: "Senha123!",
        area: "aluno",
      });

      expect(
        pessoaFindUniqueMock,
      ).toHaveBeenCalledWith({
        where: {
          emailPrincipal:
            "aluno@example.com",
        },
        select: {
          id: true,
          emailPrincipal: true,
          usuario: {
            select: {
              id: true,
              senhaHash: true,
              status: true,
            },
          },
          aluno: {
            select: {
              id: true,
              nome: true,
              status: true,
            },
          },
        },
      });

      expect(
        bcryptCompareMock,
      ).toHaveBeenCalledWith(
        "Senha123!",
        "hash-canonico",
      );

      expect(usuario).toEqual({
        id: "aluno-1",
        email: "aluno@example.com",
        name: "Aluno Teste",
        tipoConta: "ALUNO",
        alunoId: "aluno-1",
        usuarioId: "usuario-1",
        pessoaId: "pessoa-1",
        role: null,
        mustChangePassword: false,
      });

      expect(
        adminFindUniqueMock,
      ).not.toHaveBeenCalled();
    },
  );

  it(
    "não usa status educacional do Aluno como status de login",
    async () => {
      pessoaFindUniqueMock.mockResolvedValue({
        id: "pessoa-1",
        emailPrincipal: "aluno@example.com",

        usuario: {
          id: "usuario-1",
          senhaHash: "hash-canonico",
          status: "ATIVO",
        },

        aluno: {
          id: "aluno-1",
          nome: "Aluno Teste",
          status: "SUSPENSO",
        },
      });

      bcryptCompareMock.mockResolvedValue(true);

      const usuario = await authorize({
        email: "aluno@example.com",
        password: "Senha123!",
        area: "aluno",
      });

      expect(usuario?.alunoId).toBe(
        "aluno-1",
      );

      expect(usuario?.usuarioId).toBe(
        "usuario-1",
      );
    },
  );

  it(
    "nega login quando Usuario está bloqueado",
    async () => {
      pessoaFindUniqueMock.mockResolvedValue({
        id: "pessoa-1",
        emailPrincipal: "aluno@example.com",

        usuario: {
          id: "usuario-1",
          senhaHash: "hash-canonico",
          status: "BLOQUEADO",
        },

        aluno: {
          id: "aluno-1",
          nome: "Aluno Teste",
          status: "ATIVO",
        },
      });

      const usuario = await authorize({
        email: "aluno@example.com",
        password: "Senha123!",
        area: "aluno",
      });

      expect(usuario).toBeNull();

      expect(
        bcryptCompareMock,
      ).not.toHaveBeenCalled();
    },
  );

  it(
    "nega login quando a senha de Usuario é inválida",
    async () => {
      pessoaFindUniqueMock.mockResolvedValue({
        id: "pessoa-1",
        emailPrincipal: "aluno@example.com",

        usuario: {
          id: "usuario-1",
          senhaHash: "hash-canonico",
          status: "ATIVO",
        },

        aluno: {
          id: "aluno-1",
          nome: "Aluno Teste",
          status: "ATIVO",
        },
      });

      bcryptCompareMock.mockResolvedValue(false);

      const usuario = await authorize({
        email: "aluno@example.com",
        password: "senha-incorreta",
        area: "aluno",
      });

      expect(usuario).toBeNull();
    },
  );

  it(
    "nega contexto de aluno quando Pessoa não possui Aluno",
    async () => {
      pessoaFindUniqueMock.mockResolvedValue({
        id: "pessoa-1",
        emailPrincipal: "admin@example.com",

        usuario: {
          id: "usuario-1",
          senhaHash: "hash-canonico",
          status: "ATIVO",
        },

        aluno: null,
      });

      const usuario = await authorize({
        email: "admin@example.com",
        password: "Senha123!",
        area: "aluno",
      });

      expect(usuario).toBeNull();
    },
  );
});
