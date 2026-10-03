import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

const findUniqueMock = vi.fn();
const alunoUpdateManyMock = vi.fn();
const usuarioUpdateManyMock = vi.fn();
const tokenUpdateManyMock = vi.fn();
const transactionMock = vi.fn();
const bcryptHashMock = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    alunoAccessToken: {
      findUnique: findUniqueMock,
    },
    $transaction: transactionMock,
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: bcryptHashMock,
  },
}));

const { POST } = await import(
  '../src/app/api/alunos/primeiro-acesso/route.js'
);

function tokenFicticio({
  origem = 'HOTMART',
  confirmado = false,
  expirado = false,
} = {}) {
  return {
    id: 'token-ficticio',
    alunoId: 'aluno-ficticio',
    tipo: 'PRIMEIRO_ACESSO',
    usadoEm: null,
    expiraEm: new Date(
      Date.now() + (expirado ? -60_000 : 3_600_000),
    ),
    aluno: {
      id: 'aluno-ficticio',
      origem,
      status: 'ATIVO',
      senhaHash: null,
      emailVerificadoEm: null,
      conviteLegadoEnviadoEm: confirmado
        ? new Date()
        : null,
      pessoaId: 'pessoa-ficticia',
    },
  };
}

function requisicaoFicticia() {
  return {
    json: vi.fn().mockResolvedValue({
      token: 'token-secreto-ficticio',
      senha: 'Senha123!',
    }),
  };
}

beforeEach(() => {
  vi.clearAllMocks();

  findUniqueMock.mockResolvedValue(
    tokenFicticio(),
  );

  bcryptHashMock.mockResolvedValue(
    'hash-ficticio',
  );

  tokenUpdateManyMock.mockResolvedValue({
    count: 1,
  });

  usuarioUpdateManyMock.mockResolvedValue({
    count: 1,
  });

  alunoUpdateManyMock.mockResolvedValue({
    count: 1,
  });

  transactionMock.mockImplementation(
    async (operacao) =>
      operacao({
        alunoAccessToken: {
          updateMany: tokenUpdateManyMock,
        },
        usuario: {
          updateMany: usuarioUpdateManyMock,
        },
        aluno: {
          updateMany: alunoUpdateManyMock,
        },
      }),
  );
});

describe('POST /api/alunos/primeiro-acesso', () => {
  it('conclui o primeiro acesso com convite valido', async () => {
    const resposta = await POST(
      requisicaoFicticia(),
    );

    expect(resposta.status).toBe(200);

    expect(await resposta.json()).toEqual({
      ok: true,
    });

    expect(bcryptHashMock).toHaveBeenCalledWith(
      'Senha123!',
      12,
    );

    expect(
      transactionMock,
    ).toHaveBeenCalledTimes(1);

    expect(
      tokenUpdateManyMock,
    ).toHaveBeenCalledWith({
      where: {
        id: 'token-ficticio',
        alunoId: 'aluno-ficticio',
        tipo: 'PRIMEIRO_ACESSO',
        usadoEm: null,
        expiraEm: {
          gt: expect.any(Date),
        },
      },
      data: {
        usadoEm: expect.any(Date),
      },
    });

    expect(
      usuarioUpdateManyMock,
    ).toHaveBeenCalledWith({
      where: {
        pessoaId: 'pessoa-ficticia',
        status: 'PENDENTE_ATIVACAO',
        senhaHash: null,
      },
      data: {
        senhaHash: 'hash-ficticio',
        status: 'ATIVO',
        mustChangePassword: false,
        passwordChangedAt: expect.any(Date),
      },
    });

    expect(
      alunoUpdateManyMock,
    ).toHaveBeenCalledWith({
      where: {
        id: 'aluno-ficticio',
        origem: 'HOTMART',
        status: 'ATIVO',
        senhaHash: null,
        emailVerificadoEm: null,
      },
      data: {
        senhaHash: 'hash-ficticio',
        emailVerificadoEm: expect.any(Date),
      },
    });
  });

  it('rejeita quando Usuario foi ativado antes da transacao', async () => {
    usuarioUpdateManyMock.mockResolvedValue({
      count: 0,
    });

    const resposta = await POST(
      requisicaoFicticia(),
    );

    expect(resposta.status).toBe(400);

    expect(
      transactionMock,
    ).toHaveBeenCalledTimes(1);

    expect(
      tokenUpdateManyMock,
    ).toHaveBeenCalledTimes(1);

    expect(
      usuarioUpdateManyMock,
    ).toHaveBeenCalledTimes(1);

    expect(
      alunoUpdateManyMock,
    ).not.toHaveBeenCalled();
  });

  it('rejeita convite expirado sem iniciar transacao', async () => {
    findUniqueMock.mockResolvedValue(
      tokenFicticio({
        expirado: true,
      }),
    );

    const resposta = await POST(
      requisicaoFicticia(),
    );

    expect(resposta.status).toBe(400);

    expect(
      bcryptHashMock,
    ).not.toHaveBeenCalled();

    expect(
      transactionMock,
    ).not.toHaveBeenCalled();
  });

  it('nao permite primeiro acesso legado com convite apenas preparado', async () => {
    findUniqueMock.mockResolvedValue(
      tokenFicticio({
        origem: 'LEGADO',
      }),
    );

    const resposta = await POST(
      requisicaoFicticia(),
    );

    expect(resposta.status).toBe(400);

    expect(
      transactionMock,
    ).not.toHaveBeenCalled();
  });

  it('permite primeiro acesso legado apos confirmacao do envio', async () => {
    findUniqueMock.mockResolvedValue(
      tokenFicticio({
        origem: 'LEGADO',
        confirmado: true,
      }),
    );

    const resposta = await POST(
      requisicaoFicticia(),
    );

    expect(resposta.status).toBe(200);

    expect(
      alunoUpdateManyMock,
    ).toHaveBeenCalledWith({
      where: {
        id: 'aluno-ficticio',
        origem: 'LEGADO',
        status: 'ATIVO',
        senhaHash: null,
        emailVerificadoEm: null,
        conviteLegadoEnviadoEm: {
          not: null,
        },
      },
      data: {
        senhaHash: 'hash-ficticio',
        emailVerificadoEm: expect.any(Date),
      },
    });
  });

  it('recusa a segunda tentativa quando o mesmo token ja foi consumido', async () => {
    findUniqueMock.mockResolvedValue(
      tokenFicticio(),
    );

    tokenUpdateManyMock
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });

    const respostas = await Promise.all([
      POST(requisicaoFicticia()),
      POST(requisicaoFicticia()),
    ]);

    expect(
      respostas
        .map((resposta) => resposta.status)
        .sort(),
    ).toEqual([200, 400]);

    expect(
      transactionMock,
    ).toHaveBeenCalledTimes(2);

    expect(
      tokenUpdateManyMock,
    ).toHaveBeenCalledTimes(2);

    expect(
      usuarioUpdateManyMock,
    ).toHaveBeenCalledTimes(1);

    expect(
      alunoUpdateManyMock,
    ).toHaveBeenCalledTimes(1);
  });

  it('recusa quando o aluno deixa de ser elegivel durante a transacao', async () => {
    alunoUpdateManyMock.mockResolvedValue({
      count: 0,
    });

    const resposta = await POST(
      requisicaoFicticia(),
    );

    expect(resposta.status).toBe(400);

    expect(
      tokenUpdateManyMock,
    ).toHaveBeenCalledTimes(1);

    expect(
      usuarioUpdateManyMock,
    ).toHaveBeenCalledTimes(1);

    expect(
      alunoUpdateManyMock,
    ).toHaveBeenCalledTimes(1);
  });

  it('retorna erro operacional sem expor detalhes da excecao', async () => {
    transactionMock.mockRejectedValue(
      new Error('Detalhe interno ficticio'),
    );

    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    try {
      const resposta = await POST(
        requisicaoFicticia(),
      );

      const corpo = await resposta.json();

      expect(resposta.status).toBe(500);

      expect(
        JSON.stringify(corpo),
      ).not.toContain(
        'Detalhe interno ficticio',
      );
    } finally {
      consoleError.mockRestore();
    }
  });
});
