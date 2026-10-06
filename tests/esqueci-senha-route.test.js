import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

const { sendMock } = vi.hoisted(() => ({
  sendMock: vi.fn(),
}));

const pessoaFindFirstMock = vi.fn();
const tokenUpdateManyMock = vi.fn();
const tokenCreateMock = vi.fn();
const transactionMock = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    pessoa: {
      findFirst: pessoaFindFirstMock,
    },
    alunoAccessToken: {
      updateMany: tokenUpdateManyMock,
      create: tokenCreateMock,
    },
    $transaction: transactionMock,
  },
}));

vi.mock('resend', () => ({
  Resend: vi.fn(function Resend() {
    this.emails = {
      send: sendMock,
    };
  }),
}));

const { POST } = await import(
  '../src/app/api/alunos/esqueci-senha/route.js'
);

function pessoaFicticia({
  statusUsuario = 'ATIVO',
  senhaHash = 'hash-existente',
  possuiAluno = true,
  nome = 'Cliente Portal',
} = {}) {
  return {
    emailPrincipal: 'portal@example.com',
    usuario: {
      status: statusUsuario,
      senhaHash,
    },
    aluno: possuiAluno
      ? {
          id: 'aluno-portal',
          nome,
        }
      : null,
  };
}

function requisicao(email = ' portal@example.com ') {
  return {
    json: vi.fn().mockResolvedValue({
      email,
    }),
  };
}

describe('POST /api/alunos/esqueci-senha', () => {
  const apiKeyOriginal =
    process.env.RESEND_API_KEY;

  beforeEach(() => {
    vi.clearAllMocks();

    process.env.RESEND_API_KEY =
      'chave-teste';

    pessoaFindFirstMock.mockResolvedValue(
      pessoaFicticia(),
    );

    tokenUpdateManyMock.mockReturnValue({
      operacao: 'invalidar-recuperacoes',
    });

    tokenCreateMock.mockReturnValue({
      operacao: 'criar-recuperacao',
    });

    transactionMock.mockResolvedValue([]);

    sendMock.mockResolvedValue({
      data: {
        id: 'email-recuperacao',
      },
      error: null,
    });
  });

  afterEach(() => {
    if (apiKeyOriginal === undefined) {
      delete process.env.RESEND_API_KEY;
    } else {
      process.env.RESEND_API_KEY =
        apiKeyOriginal;
    }
  });

  it('nao cria recuperacao antes da ativacao do Usuario', async () => {
    pessoaFindFirstMock.mockResolvedValue(
      pessoaFicticia({
        statusUsuario: 'PENDENTE_ATIVACAO',
        senhaHash: null,
      }),
    );

    const resposta = await POST(
      requisicao(' aluno@example.com '),
    );

    expect(resposta.status).toBe(200);

    expect(
      transactionMock,
    ).not.toHaveBeenCalled();

    expect(
      tokenCreateMock,
    ).not.toHaveBeenCalled();

    expect(
      sendMock,
    ).not.toHaveBeenCalled();
  });

  it('nao cria recuperacao sem contexto de Aluno', async () => {
    pessoaFindFirstMock.mockResolvedValue(
      pessoaFicticia({
        possuiAluno: false,
      }),
    );

    const resposta = await POST(
      requisicao(),
    );

    expect(resposta.status).toBe(200);

    expect(
      transactionMock,
    ).not.toHaveBeenCalled();

    expect(
      sendMock,
    ).not.toHaveBeenCalled();
  });

  it('usa Pessoa e Usuario para criar recuperacao', async () => {
    const resposta = await POST(
      requisicao(' PORTAL@example.com '),
    );

    expect(resposta.status).toBe(200);

    expect(
      pessoaFindFirstMock,
    ).toHaveBeenCalledWith({
      where: {
        emailPrincipal: {
          equals: 'portal@example.com',
          mode: 'insensitive',
        },
      },
      select: {
        emailPrincipal: true,
        usuario: {
          select: {
            status: true,
            senhaHash: true,
          },
        },
        aluno: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    expect(
      transactionMock,
    ).toHaveBeenCalledTimes(1);

    expect(
      sendMock,
    ).toHaveBeenCalledTimes(1);

    const mensagem =
      sendMock.mock.calls[0][0];

    expect(mensagem.to).toBe(
      'portal@example.com',
    );

    expect(mensagem.subject).toBe(
      'Recuperação de senha — Portal Garimpo Urbano',
    );

    expect(mensagem.html).toContain(
      'Portal Garimpo Urbano',
    );
  });

  it('usa saudacao neutra quando Aluno nao possui nome', async () => {
    pessoaFindFirstMock.mockResolvedValue(
      pessoaFicticia({
        nome: null,
      }),
    );

    const resposta = await POST(
      requisicao(),
    );

    expect(resposta.status).toBe(200);

    expect(
      sendMock,
    ).toHaveBeenCalledTimes(1);

    const mensagem =
      sendMock.mock.calls[0][0];

    expect(mensagem.html).toContain(
      '<h1>Olá.</h1>',
    );

    expect(mensagem.html).not.toContain(
      '<h1>Olá, Aluno.</h1>',
    );
  });
});
