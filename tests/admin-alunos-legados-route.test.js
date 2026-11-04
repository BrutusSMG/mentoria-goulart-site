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
  transaction: vi.fn(),
  criarAlunoLegado: vi.fn(),
}));

vi.mock('@/lib/admin-permissoes', () => ({
  obterAcessoAdmin: mocks.obterAcessoAdmin,
  respostaAcessoNegado: mocks.respostaAcessoNegado,
  prisma: {
    $transaction: mocks.transaction,
  },
}));

vi.mock('@/lib/criar-aluno-legado', () => ({
  criarAlunoLegado: mocks.criarAlunoLegado,
}));

import { POST } from
  '../src/app/api/admin/alunos/legados/route';

function requisicao(body, origem = 'https://admin.example.test') {
  return new Request(
    `${origem}/api/admin/alunos/legados`,
    {
      method: 'POST',
      headers: {
        Origin: origem,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  );
}

const dados = {
  nome: 'Aluno Fict\u00edcio',
  email: 'aluno@example.test',
  telefone: null,
  produtoIds: ['curso-1'],
  vigencias: [
    {
      produtoId: 'curso-1',
      tipoDuracao: 'VITALICIA',
      dataFimOriginal: null,
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();

  vi.stubEnv(
    'CADASTRO_LEGADO_ADMIN_HABILITADO',
    'true',
  );

  mocks.obterAcessoAdmin.mockResolvedValue({
    permitido: true,
    status: 200,
    conta: {
      id: 'admin-1',
      role: 'ADMIN',
    },
  });

  mocks.respostaAcessoNegado.mockImplementation(
    (acesso) =>
      Response.json(
        { error: acesso.motivo },
        { status: acesso.status },
      ),
  );

  mocks.transaction.mockImplementation(
    async (callback) => callback({ tx: true }),
  );

  mocks.criarAlunoLegado.mockResolvedValue({
    pessoaId: 'pessoa-1',
    alunoId: 'aluno-1',
    origem: 'LEGADO',
    convite: 'PENDENTE',
    produtos: [],
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('POST /api/admin/alunos/legados', () => {
  it('permanece bloqueado por padrão', async () => {
    vi.stubEnv(
      'CADASTRO_LEGADO_ADMIN_HABILITADO',
      '',
    );

    const resposta = await POST(requisicao(dados));
    const corpo = await resposta.json();

    expect(resposta.status).toBe(503);
    expect(corpo.erro).toBe(
      'Cadastro de aluno legado indisponível.',
    );

    expect(
      mocks.obterAcessoAdmin,
    ).not.toHaveBeenCalled();

    expect(
      mocks.transaction,
    ).not.toHaveBeenCalled();
  });

  it('nega requisi\u00e7\u00e3o sem mesma origem', async () => {
    const request = new Request(
      'https://admin.example.test/api/admin/alunos/legados',
      {
        method: 'POST',
        headers: {
          Origin: 'https://externo.example.test',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
      },
    );

    const resposta = await POST(request);

    expect(resposta.status).toBe(403);
    expect(
      mocks.obterAcessoAdmin,
    ).not.toHaveBeenCalled();
  });

  it('nega conta sem acesso administrativo', async () => {
    mocks.obterAcessoAdmin.mockResolvedValue({
      permitido: false,
      status: 403,
      motivo: 'Acesso restrito a administradores.',
    });

    const resposta = await POST(requisicao(dados));

    expect(resposta.status).toBe(403);
    expect(
      mocks.transaction,
    ).not.toHaveBeenCalled();
  });

  it('rejeita JSON inv\u00e1lido', async () => {
    const origem = 'https://admin.example.test';

    const request = new Request(
      `${origem}/api/admin/alunos/legados`,
      {
        method: 'POST',
        headers: {
          Origin: origem,
          'Content-Type': 'application/json',
        },
        body: '{',
      },
    );

    const resposta = await POST(request);

    expect(resposta.status).toBe(400);
    expect(
      mocks.transaction,
    ).not.toHaveBeenCalled();
  });

  it('cadastra aluno legado em transa\u00e7\u00e3o', async () => {
    const resposta = await POST(requisicao(dados));
    const corpo = await resposta.json();

    expect(resposta.status).toBe(201);
    expect(corpo.ok).toBe(true);
    expect(corpo.item.alunoId).toBe('aluno-1');

    expect(
      mocks.criarAlunoLegado,
    ).toHaveBeenCalledExactlyOnceWith(
      expect.anything(),
      dados,
    );

    expect(
      resposta.headers.get('cache-control'),
    ).toContain('no-store');
  });

  it('retorna conflito para e-mail j\u00e1 cadastrado', async () => {
    mocks.criarAlunoLegado.mockRejectedValue(
      new Error(
        'J\u00e1 existe um cadastro com este e-mail. ' +
          '\u00c9 necess\u00e1ria uma confer\u00eancia antes de vincular o aluno legado.',
      ),
    );

    const resposta = await POST(requisicao(dados));
    const corpo = await resposta.json();

    expect(resposta.status).toBe(409);
    expect(corpo.ok).toBe(false);
  });

  it('retorna 400 para erro de valida\u00e7\u00e3o conhecido', async () => {
    mocks.criarAlunoLegado.mockRejectedValue(
      new Error('Informe um e-mail v\u00e1lido.'),
    );

    const resposta = await POST(requisicao(dados));
    const corpo = await resposta.json();

    expect(resposta.status).toBe(400);
    expect(corpo.erro).toBe(
      'Informe um e-mail v\u00e1lido.',
    );
  });

  it('n\u00e3o exp\u00f5e detalhes de erro operacional', async () => {
    mocks.criarAlunoLegado.mockRejectedValue(
      new Error('detalhe interno sens\u00edvel'),
    );

    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    try {
      const resposta = await POST(requisicao(dados));
      const corpo = await resposta.json();

      expect(resposta.status).toBe(500);
      expect(JSON.stringify(corpo)).not.toContain(
        'detalhe interno sens\u00edvel',
      );
    } finally {
      consoleError.mockRestore();
    }
  });
});
