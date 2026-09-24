import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

const findUniqueMock = vi.fn();
const alunoUpdateManyMock = vi.fn();
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

  findUniqueMock.mockResolvedValue(tokenFicticio());
  bcryptHashMock.mockResolvedValue('hash-ficticio');

  tokenUpdateManyMock.mockResolvedValue({ count: 1 });
  alunoUpdateManyMock.mockResolvedValue({ count: 1 });

  // Simula a execução do callback de uma transação
  // interativa, sem conectar ao banco real.
  transactionMock.mockImplementation(async (operacao) =>
    operacao({
      alunoAccessToken: {
        updateMany: tokenUpdateManyMock,
      },
      aluno: {
        updateMany: alunoUpdateManyMock,
      },
    }),
  );
});

describe('POST /api/alunos/primeiro-acesso', () => {
  it('conclui o primeiro acesso com convite válido', async () => {
    const resposta = await POST(requisicaoFicticia());

    expect(resposta.status).toBe(200);
    expect(await resposta.json()).toEqual({
      ok: true,
    });

    expect(bcryptHashMock).toHaveBeenCalledWith(
      'Senha123!',
      12,
    );

    expect(transactionMock).toHaveBeenCalledTimes(1);

    expect(tokenUpdateManyMock).toHaveBeenCalledWith({
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

    expect(alunoUpdateManyMock).toHaveBeenCalledWith({
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

  it('rejeita convite expirado sem iniciar transação', async () => {
    findUniqueMock.mockResolvedValue(
      tokenFicticio({ expirado: true }),
    );

    const resposta = await POST(requisicaoFicticia());

    expect(resposta.status).toBe(400);
    expect(await resposta.json()).toEqual({
      ok: false,
      erro:
        'Este convite é inválido, expirou ou já foi utilizado.',
    });

    expect(bcryptHashMock).not.toHaveBeenCalled();
    expect(transactionMock).not.toHaveBeenCalled();
  });

  it('não permite primeiro acesso legado com convite apenas preparado', async () => {
    findUniqueMock.mockResolvedValue(
      tokenFicticio({ origem: 'LEGADO' }),
    );

    const resposta = await POST(requisicaoFicticia());

    expect(resposta.status).toBe(400);
    expect(transactionMock).not.toHaveBeenCalled();
    expect(bcryptHashMock).not.toHaveBeenCalled();
  });

  it('permite primeiro acesso legado após confirmação do envio', async () => {
    findUniqueMock.mockResolvedValue(
      tokenFicticio({
        origem: 'LEGADO',
        confirmado: true,
      }),
    );

    const resposta = await POST(requisicaoFicticia());

    expect(resposta.status).toBe(200);
    expect(await resposta.json()).toEqual({
      ok: true,
    });

    expect(alunoUpdateManyMock).toHaveBeenCalledWith({
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

  it('recusa a segunda tentativa quando o mesmo token já foi consumido', async () => {
    // As duas requisições obtêm a mesma leitura inicial.
    findUniqueMock.mockResolvedValue(tokenFicticio());

    // Apenas a primeira atualização condicional do token
    // é aceita pelo banco simulado.
    tokenUpdateManyMock
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });

    const respostas = await Promise.all([
      POST(requisicaoFicticia()),
      POST(requisicaoFicticia()),
    ]);

    expect(
      respostas.map((resposta) => resposta.status).sort(),
    ).toEqual([200, 400]);

    expect(transactionMock).toHaveBeenCalledTimes(2);
    expect(tokenUpdateManyMock).toHaveBeenCalledTimes(2);
    expect(alunoUpdateManyMock).toHaveBeenCalledTimes(1);
  });

  it('recusa o convite quando o aluno deixa de ser elegível durante a transação', async () => {
    alunoUpdateManyMock.mockResolvedValue({
      count: 0,
    });

    const resposta = await POST(requisicaoFicticia());

    expect(resposta.status).toBe(400);
    expect(await resposta.json()).toEqual({
      ok: false,
      erro:
        'Este convite é inválido, expirou ou já foi utilizado.',
    });

    expect(tokenUpdateManyMock).toHaveBeenCalledTimes(1);
    expect(alunoUpdateManyMock).toHaveBeenCalledTimes(1);
  });

  it('retorna erro operacional sem expor detalhes da exceção', async () => {
    transactionMock.mockRejectedValue(
      new Error('Detalhe interno fictício'),
    );

    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    try {
      const resposta = await POST(requisicaoFicticia());
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