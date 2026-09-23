import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

const mocks = vi.hoisted(() => ({
  obterAcessoAdmin: vi.fn(),
  respostaAcessoNegado: vi.fn(),
  alunoFindUnique: vi.fn(),
}));

vi.mock('@/lib/admin-permissoes', () => ({
  obterAcessoAdmin: mocks.obterAcessoAdmin,
  respostaAcessoNegado: mocks.respostaAcessoNegado,
  prisma: {
    aluno: {
      findUnique: mocks.alunoFindUnique,
    },
  },
}));

import { POST } from
  '../src/app/api/admin/alunos/[id]/convite-legado/route';

function contexto(id = 'aluno-ficticio') {
  return {
    params: Promise.resolve({ id }),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('CONVITE_LEGADO_ADMIN_HABILITADO', '');

  mocks.obterAcessoAdmin.mockResolvedValue({
    permitido: true,
    status: 200,
    conta: { id: 'admin-ficticio', role: 'ADMIN' },
  });

  mocks.respostaAcessoNegado.mockImplementation(
    (acesso) =>
      Response.json(
        { ok: false, erro: acesso.motivo },
        { status: acesso.status },
      ),
  );

  mocks.alunoFindUnique.mockResolvedValue({
    id: 'aluno-ficticio',
    email: 'legado@example.test',
    origem: 'LEGADO',
    status: 'ATIVO',
    senhaHash: null,
    emailVerificadoEm: null,
    conviteLegadoEnviadoEm: null,
    pessoaId: 'pessoa-ficticia',
    pessoa: {
      id: 'pessoa-ficticia',
      emailPrincipal: 'legado@example.test',
      ativo: true,
    },
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('POST /api/admin/alunos/[id]/convite-legado', () => {
  it('permanece bloqueada por padrão', async () => {
    const resposta = await POST(
      null,
      contexto(),
    );

    expect(resposta.status).toBe(503);
    expect(
      mocks.obterAcessoAdmin,
    ).not.toHaveBeenCalled();

    expect(mocks.alunoFindUnique).not.toHaveBeenCalled();

    expect(
      resposta.headers.get('cache-control'),
    ).toContain('no-store');
  });

  it('nega acesso quando a conta não é administradora', async () => {
    vi.stubEnv(
      'CONVITE_LEGADO_ADMIN_HABILITADO',
      'true',
    );

    mocks.obterAcessoAdmin.mockResolvedValue({
      permitido: false,
      status: 403,
      motivo: 'Acesso restrito a administradores.',
    });

    const resposta = await POST(
      null,
      contexto(),
    );

    expect(resposta.status).toBe(403);
  });

  it('rejeita identificador de aluno vazio', async () => {
    vi.stubEnv(
      'CONVITE_LEGADO_ADMIN_HABILITADO',
      'true',
    );

    const resposta = await POST(
      null,
      contexto(''),
    );

    expect(resposta.status).toBe(400);
  });

  it('não realiza envio mesmo com a flag habilitada no teste', async () => {
    vi.stubEnv(
      'CONVITE_LEGADO_ADMIN_HABILITADO',
      'true',
    );

    const resposta = await POST(
      null,
      contexto(),
    );

    const corpo = await resposta.json();

    expect(resposta.status).toBe(503);
    expect(corpo.ok).toBe(false);
    expect(corpo.erro).toBe(
      'Envio de convite ainda não implementado.',
    );
  });

  it('retorna 404 quando o aluno não existe', async () => {
    vi.stubEnv('CONVITE_LEGADO_ADMIN_HABILITADO', 'true');

    mocks.alunoFindUnique.mockResolvedValue(null);

    const resposta = await POST(null, contexto());

    expect(resposta.status).toBe(404);
  });

  it('recusa convite para cadastro que não é legado', async () => {
    vi.stubEnv('CONVITE_LEGADO_ADMIN_HABILITADO', 'true');

    mocks.alunoFindUnique.mockResolvedValue({
      id: 'aluno-ficticio',
      origem: 'HOTMART',
    });

    const resposta = await POST(null, contexto());

    expect(resposta.status).toBe(409);
  });

  it('recusa convite quando Pessoa e Aluno têm e-mails diferentes', async () => {
    vi.stubEnv('CONVITE_LEGADO_ADMIN_HABILITADO', 'true');

    mocks.alunoFindUnique.mockResolvedValue({
      id: 'aluno-ficticio',
      email: 'legado@example.test',
      origem: 'LEGADO',
      status: 'ATIVO',
      senhaHash: null,
      emailVerificadoEm: null,
      conviteLegadoEnviadoEm: null,
      pessoaId: 'pessoa-ficticia',
      pessoa: {
        id: 'pessoa-ficticia',
        emailPrincipal: 'outra-pessoa@example.test',
        ativo: true,
      },
    });

    const resposta = await POST(null, contexto());

    expect(resposta.status).toBe(409);
  });

  it('consulta um legado elegível, mas continua sem executar envio', async () => {
    vi.stubEnv('CONVITE_LEGADO_ADMIN_HABILITADO', 'true');

    const resposta = await POST(null, contexto());
    const corpo = await resposta.json();

    expect(resposta.status).toBe(503);
    expect(corpo.elegivel).toBe(true);
    expect(corpo.erro).toBe(
      'Envio de convite ainda não implementado.',
    );

    expect(mocks.alunoFindUnique).toHaveBeenCalledWith({
      where: { id: 'aluno-ficticio' },
      select: {
        id: true,
        email: true,
        origem: true,
        status: true,
        senhaHash: true,
        emailVerificadoEm: true,
        conviteLegadoEnviadoEm: true,
        pessoaId: true,
        pessoa: {
          select: {
            id: true,
            emailPrincipal: true,
            ativo: true,
          },
        },
      },
    });
  });
});
