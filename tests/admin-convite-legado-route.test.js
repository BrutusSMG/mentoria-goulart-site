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
  executarPrimeiroConviteLegado: vi.fn(),
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

vi.mock('@/lib/executar-primeiro-convite-legado', () => ({
  executarPrimeiroConviteLegado:
    mocks.executarPrimeiroConviteLegado,
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
  vi.stubEnv('CONVITE_LEGADO_ENVIO_REAL_HABILITADO', '');

  mocks.executarPrimeiroConviteLegado.mockResolvedValue({
    estado: 'ENVIADO',
  });

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
      'Envio de convite não habilitado.',
    );

    expect(
      mocks.executarPrimeiroConviteLegado,
    ).not.toHaveBeenCalled();
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
      'Envio de convite não habilitado.',
    );

    expect(
      mocks.executarPrimeiroConviteLegado,
    ).not.toHaveBeenCalled();

    expect(
      mocks.executarPrimeiroConviteLegado,
    ).not.toHaveBeenCalled();

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

  it('não executa o fluxo quando apenas a segunda flag está habilitada', async () => {
    vi.stubEnv('CONVITE_LEGADO_ENVIO_REAL_HABILITADO', 'true');

    const resposta = await POST(null, contexto());

    expect(resposta.status).toBe(503);
    expect(mocks.obterAcessoAdmin).not.toHaveBeenCalled();
    expect(
      mocks.executarPrimeiroConviteLegado,
    ).not.toHaveBeenCalled();
  });

  it('retorna ENVIADO quando o provedor aceitou o convite', async () => {
    vi.stubEnv('CONVITE_LEGADO_ADMIN_HABILITADO', 'true');
    vi.stubEnv('CONVITE_LEGADO_ENVIO_REAL_HABILITADO', 'true');

    const resposta = await POST(null, contexto());
    const corpo = await resposta.json();

    expect(resposta.status).toBe(200);
    expect(corpo).toEqual({
      ok: true,
      estado: 'ENVIADO',
      mensagem: 'Convite aceito pelo provedor de e-mail.',
    });

    expect(
      mocks.executarPrimeiroConviteLegado,
    ).toHaveBeenCalledExactlyOnceWith({
      prisma: expect.anything(),
      alunoId: 'aluno-ficticio',
    });
  });

  it('retorna RECUSADO quando a preparação não permite a tentativa', async () => {
    vi.stubEnv('CONVITE_LEGADO_ADMIN_HABILITADO', 'true');
    vi.stubEnv('CONVITE_LEGADO_ENVIO_REAL_HABILITADO', 'true');

    mocks.executarPrimeiroConviteLegado.mockResolvedValue({
      estado: 'RECUSADO',
      motivo: 'O convite já foi reservado.',
    });

    const resposta = await POST(null, contexto());
    const corpo = await resposta.json();

    expect(resposta.status).toBe(409);
    expect(corpo).toEqual({
      ok: false,
      estado: 'RECUSADO',
      erro: 'O convite já foi reservado.',
    });
  });

  it('retorna FALHA quando o envio não foi realizado', async () => {
    vi.stubEnv('CONVITE_LEGADO_ADMIN_HABILITADO', 'true');
    vi.stubEnv('CONVITE_LEGADO_ENVIO_REAL_HABILITADO', 'true');

    mocks.executarPrimeiroConviteLegado.mockResolvedValue({
      estado: 'FALHA',
    });

    const resposta = await POST(null, contexto());
    const corpo = await resposta.json();

    expect(resposta.status).toBe(503);
    expect(corpo.estado).toBe('FALHA');
    expect(corpo.ok).toBe(false);
  });

  it.each(['INDETERMINADO', 'CONFERIR'])(
    'exige conferência manual quando o estado é %s',
    async (estado) => {
      vi.stubEnv('CONVITE_LEGADO_ADMIN_HABILITADO', 'true');
      vi.stubEnv('CONVITE_LEGADO_ENVIO_REAL_HABILITADO', 'true');

      mocks.executarPrimeiroConviteLegado.mockResolvedValue({
        estado,
      });

      const resposta = await POST(null, contexto());
      const corpo = await resposta.json();

      expect(resposta.status).toBe(409);
      expect(corpo.estado).toBe(estado);
      expect(corpo.erro).toBe(
        'O resultado do convite exige conferência manual.',
      );
    },
  );

  it('retorna erro operacional sem expor detalhes da exceção', async () => {
    vi.stubEnv('CONVITE_LEGADO_ADMIN_HABILITADO', 'true');
    vi.stubEnv('CONVITE_LEGADO_ENVIO_REAL_HABILITADO', 'true');

    mocks.executarPrimeiroConviteLegado.mockRejectedValue(
      new Error('Detalhe interno fictício'),
    );

    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    try {
      const resposta = await POST(null, contexto());
      const corpo = await resposta.json();

      expect(resposta.status).toBe(500);
      expect(JSON.stringify(corpo)).not.toContain(
        'Detalhe interno fictício',
      );
    } finally {
      consoleError.mockRestore();
    }
  });
});
