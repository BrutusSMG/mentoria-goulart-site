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
              mustChangePassword: true,
              acessoAdministrativo: {
                select: {
                  papel: true,
                  ativo: true,
                },
              },
            },
          },
          adminUser: {
            select: {
              id: true,
              nome: true,
              role: true,
              ativo: true,
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
        id: "usuario-1",
        email: "aluno@example.com",
        name: "Aluno Teste",
        tipoConta: "ALUNO",
        alunoId: "aluno-1",
        usuarioId: "usuario-1",
        pessoaId: "pessoa-1",
        adminUserId: null,
        papelAdministrativo: null,
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
  it(
    "autentica ADMIN pela mesma credencial canonica de Usuario",
    async () => {
      pessoaFindUniqueMock.mockResolvedValue({
        id: "pessoa-admin",
        nome: "Admin Canonico",
        emailPrincipal: "admin@example.com",

        usuario: {
          id: "usuario-admin",
          senhaHash: "hash-canonico-admin",
          status: "ATIVO",
          mustChangePassword: false,
          acessoAdministrativo: {
            papel: "ADMIN",
            ativo: true,
          },
        },

        aluno: null,

        adminUser: {
          id: "admin-legado",
          nome: "Admin Canonico",
          role: "ADMIN",
          ativo: true,
        },
      });

      bcryptCompareMock.mockResolvedValue(true);

      const usuario = await authorize({
        email: " ADMIN@example.com ",
        password: "SenhaAdmin123!",
        area: "admin",
      });

      expect(
        bcryptCompareMock,
      ).toHaveBeenCalledWith(
        "SenhaAdmin123!",
        "hash-canonico-admin",
      );

      expect(usuario).toEqual({
        id: "usuario-admin",
        email: "admin@example.com",
        name: "Admin Canonico",
        tipoConta: "ADMIN",
        alunoId: null,
        usuarioId: "usuario-admin",
        pessoaId: "pessoa-admin",
        adminUserId: "admin-legado",
        papelAdministrativo: "ADMIN",
        role: "ADMIN",
        mustChangePassword: false,
      });

      expect(
        adminFindUniqueMock,
      ).not.toHaveBeenCalled();
    },
  );

  it(
    "preserva contextos Aluno e administrativo na mesma sessao",
    async () => {
      pessoaFindUniqueMock.mockResolvedValue({
        id: "pessoa-compartilhada",
        nome: "Pessoa Compartilhada",
        emailPrincipal:
          "compartilhado@example.com",

        usuario: {
          id: "usuario-compartilhado",
          senhaHash: "hash-compartilhado",
          status: "ATIVO",
          mustChangePassword: true,
          acessoAdministrativo: {
            papel: "PARCEIRO",
            ativo: true,
          },
        },

        aluno: {
          id: "aluno-compartilhado",
          nome: "Pessoa Compartilhada",
          status: "ATIVO",
        },

        adminUser: {
          id: "admin-compartilhado",
          nome: "Pessoa Compartilhada",
          role: "PARCEIRO",
          ativo: true,
        },
      });

      bcryptCompareMock.mockResolvedValue(true);

      const usuario = await authorize({
        email: "compartilhado@example.com",
        password: "Senha123!",
        area: "aluno",
      });

      expect(usuario).toMatchObject({
        id: "usuario-compartilhado",
        usuarioId: "usuario-compartilhado",
        pessoaId: "pessoa-compartilhada",
        alunoId: "aluno-compartilhado",
        adminUserId: "admin-compartilhado",
        papelAdministrativo: "PARCEIRO",
        role: "PARCEIRO",
        tipoConta: "ALUNO",
        mustChangePassword: true,
      });
    },
  );

  it(
    "propaga os contextos canonicos para o JWT",
    async () => {
      const token = await authOptions.callbacks.jwt({
        token: {
          sub: "usuario-1",
        },
        user: {
          id: "usuario-1",
          tipoConta: "ALUNO",
          alunoId: "aluno-1",
          usuarioId: "usuario-1",
          pessoaId: "pessoa-1",
          adminUserId: "admin-1",
          papelAdministrativo: "PARCEIRO",
          role: "PARCEIRO",
          mustChangePassword: false,
        },
      });

      expect(token).toMatchObject({
        sub: "usuario-1",
        tipoConta: "ALUNO",
        alunoId: "aluno-1",
        usuarioId: "usuario-1",
        pessoaId: "pessoa-1",
        adminUserId: "admin-1",
        papelAdministrativo: "PARCEIRO",
        role: "PARCEIRO",
        mustChangePassword: false,
      });
    },
  );

  it(
    "expoe Usuario como id da sessao e preserva os contextos",
    async () => {
      const session =
        await authOptions.callbacks.session({
          session: {
            user: {
              name: "Pessoa Compartilhada",
              email: "compartilhado@example.com",
            },
          },
          token: {
            sub: "usuario-1",
            tipoConta: "ALUNO",
            alunoId: "aluno-1",
            usuarioId: "usuario-1",
            pessoaId: "pessoa-1",
            adminUserId: "admin-1",
            papelAdministrativo: "PARCEIRO",
            role: "PARCEIRO",
            mustChangePassword: false,
          },
        });

      expect(session.user).toMatchObject({
        id: "usuario-1",
        tipoConta: "ALUNO",
        alunoId: "aluno-1",
        usuarioId: "usuario-1",
        pessoaId: "pessoa-1",
        adminUserId: "admin-1",
        papelAdministrativo: "PARCEIRO",
        role: "PARCEIRO",
        mustChangePassword: false,
      });
    },
  );

});
