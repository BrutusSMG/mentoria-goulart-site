import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  adminFindUnique: vi.fn(),
}));

vi.mock('next-auth/next', () => ({
  getServerSession: mocks.getServerSession,
}));

vi.mock('@/app/api/auth/[...nextauth]/route', () => ({
  authOptions: {},
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    adminUser: {
      findUnique: mocks.adminFindUnique,
    },
  },
}));

import {
  obterAcessoAdmin,
  obterAcessoAtual,
  obterAcessoModulo,
} from '../src/lib/admin-permissoes';

beforeEach(() => {
  vi.clearAllMocks();

  mocks.getServerSession.mockResolvedValue({
    user: {
      id: 'admin-ficticio',
    },
  });

  mocks.adminFindUnique.mockResolvedValue({
    id: 'admin-ficticio',
    nome: 'Admin Fictício',
    email: 'admin@example.test',
    role: 'ADMIN',
    ativo: true,
    mustChangePassword: false,
    podeGerenciarSucatas: false,
    podeGerenciarDepoimentos: false,
    podeGerenciarJornada: false,
  });
});

describe('admin-permissoes', () => {
  it('nega acesso quando não existe sessão autenticada', async () => {
    mocks.getServerSession.mockResolvedValue(null);

    const acesso = await obterAcessoAtual();

    expect(acesso).toEqual({
      permitido: false,
      status: 401,
      motivo: 'Não autorizado.',
    });

    expect(
      mocks.adminFindUnique,
    ).not.toHaveBeenCalled();
  });

  it('nega acesso administrativo para conta inativa', async () => {
    mocks.adminFindUnique.mockResolvedValue({
      id: 'admin-ficticio',
      role: 'ADMIN',
      ativo: false,
      mustChangePassword: false,
    });

    const acesso = await obterAcessoAdmin();

    expect(acesso.permitido).toBe(false);
    expect(acesso.status).toBe(403);
    expect(acesso.motivo).toBe('Conta inativa.');
  });

  it('nega acesso administrativo para role diferente de ADMIN', async () => {
    mocks.adminFindUnique.mockResolvedValue({
      id: 'parceiro-ficticio',
      role: 'PARCEIRO',
      ativo: true,
      mustChangePassword: false,
    });

    const acesso = await obterAcessoAdmin();

    expect(acesso.permitido).toBe(false);
    expect(acesso.status).toBe(403);
    expect(acesso.motivo).toBe(
      'Acesso restrito a administradores.',
    );
  });

  it('mantém acesso básico para ADMIN com troca de senha pendente', async () => {
    mocks.adminFindUnique.mockResolvedValue({
      id: 'admin-ficticio',
      role: 'ADMIN',
      ativo: true,
      mustChangePassword: true,
    });

    const acesso = await obterAcessoAtual();

    expect(acesso.permitido).toBe(true);
    expect(acesso.conta.mustChangePassword).toBe(true);
  });

  it('bloqueia operações administrativas enquanto a troca de senha estiver pendente', async () => {
    mocks.adminFindUnique.mockResolvedValue({
      id: 'admin-ficticio',
      role: 'ADMIN',
      ativo: true,
      mustChangePassword: true,
    });

    const acesso = await obterAcessoAdmin();

    expect(acesso.permitido).toBe(false);
    expect(acesso.status).toBe(403);
    expect(acesso.motivo).toBe(
      'É necessário definir uma nova senha antes de continuar.',
    );
  });

  it('permite ADMIN ativo sem troca de senha pendente', async () => {
    const acesso = await obterAcessoAdmin();

    expect(acesso.permitido).toBe(true);
    expect(acesso.status).toBe(200);
    expect(acesso.ehAdmin).toBe(true);
    expect(acesso.conta.id).toBe('admin-ficticio');
  });

  it('mantém flag legada como fallback para PARCEIRO', async () => {
    mocks.adminFindUnique.mockResolvedValue({
      id: 'parceiro-ficticio',
      role: 'PARCEIRO',
      ativo: true,
      mustChangePassword: false,
      podeGerenciarSucatas: true,
      podeGerenciarDepoimentos: false,
      podeGerenciarJornada: false,
      pessoa: {
        usuario: null,
      },
    });

    const acesso = await obterAcessoModulo('SUCATAS');

    expect(acesso.permitido).toBe(true);
    expect(acesso.ehAdmin).toBe(false);
  });

  it('permite PARCEIRO pela nova UsuarioPermissao ativa', async () => {
    mocks.adminFindUnique.mockResolvedValue({
      id: 'parceiro-ficticio',
      role: 'PARCEIRO',
      ativo: true,
      mustChangePassword: false,
      podeGerenciarSucatas: false,
      podeGerenciarDepoimentos: false,
      podeGerenciarJornada: false,
      pessoa: {
        usuario: {
          id: 'usuario-ficticio',
          status: 'ATIVO',
          acessoAdministrativo: {
            papel: 'PARCEIRO',
            ativo: true,
          },
          permissoes: [
            {
              permissao: {
                codigo: 'DEPOIMENTOS_GERENCIAR',
                ativo: true,
              },
            },
          ],
        },
      },
    });

    const acesso = await obterAcessoModulo('DEPOIMENTOS');

    expect(acesso.permitido).toBe(true);
    expect(acesso.ehAdmin).toBe(false);
  });

  it('não concede permissão nova quando Usuario está bloqueado', async () => {
    mocks.adminFindUnique.mockResolvedValue({
      id: 'parceiro-ficticio',
      role: 'PARCEIRO',
      ativo: true,
      mustChangePassword: false,
      podeGerenciarSucatas: false,
      podeGerenciarDepoimentos: false,
      podeGerenciarJornada: true,
      pessoa: {
        usuario: {
          id: 'usuario-ficticio',
          status: 'BLOQUEADO',
          acessoAdministrativo: {
            papel: 'PARCEIRO',
            ativo: true,
          },
          permissoes: [
            {
              permissao: {
                codigo: 'JORNADA_GERENCIAR',
                ativo: true,
              },
            },
          ],
        },
      },
    });

    const acesso = await obterAcessoModulo('JORNADA');

    expect(acesso.permitido).toBe(false);
    expect(acesso.status).toBe(403);
  });

  it('mantém ADMIN com acesso total sem depender de UsuarioPermissao', async () => {
    const acesso = await obterAcessoModulo('SUCATAS');

    expect(acesso.permitido).toBe(true);
    expect(acesso.ehAdmin).toBe(true);
  });


  it('projeta UsuarioPermissao nos campos efetivos usados pela interface', async () => {
    mocks.adminFindUnique.mockResolvedValue({
      id: 'parceiro-ficticio',
      role: 'PARCEIRO',
      ativo: true,
      mustChangePassword: false,
      podeGerenciarSucatas: false,
      podeGerenciarDepoimentos: false,
      podeGerenciarJornada: false,
      pessoa: {
        usuario: {
          id: 'usuario-ficticio',
          status: 'ATIVO',
          acessoAdministrativo: {
            papel: 'PARCEIRO',
            ativo: true,
          },
          permissoes: [
            {
              permissao: {
                codigo: 'SUCATAS_GERENCIAR',
                ativo: true,
              },
            },
          ],
        },
      },
    });

    const acesso = await obterAcessoAtual();

    expect(acesso.permitido).toBe(true);
    expect(acesso.conta.podeGerenciarSucatas).toBe(true);
    expect(acesso.conta.podeGerenciarDepoimentos).toBe(false);
    expect(acesso.conta.podeGerenciarJornada).toBe(false);
  });

});
