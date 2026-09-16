import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { sendMock } = vi.hoisted(() => ({
  sendMock: vi.fn(),
}));

const alunoFindUniqueMock = vi.fn();
const tokenUpdateManyMock = vi.fn();
const tokenCreateMock = vi.fn();
const transactionMock = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    aluno: {
      findUnique: alunoFindUniqueMock,
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

describe('POST /api/alunos/esqueci-senha', () => {
  const apiKeyOriginal = process.env.RESEND_API_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = 'chave-teste';
  });

  afterEach(() => {
    if (apiKeyOriginal === undefined) {
      delete process.env.RESEND_API_KEY;
    } else {
      process.env.RESEND_API_KEY = apiKeyOriginal;
    }
  });

  it('não cria recuperação antes do primeiro acesso', async () => {
    alunoFindUniqueMock.mockResolvedValue({
      id: 'aluno-1',
      nome: 'Aluno Teste',
      status: 'ATIVO',
      senhaHash: null,
    });

    const request = {
      json: vi.fn().mockResolvedValue({
        email: ' aluno@example.com ',
      }),
    };

    const resposta = await POST(request);
    const corpo = await resposta.json();

    expect(resposta.status).toBe(200);
    expect(corpo).toEqual({
      ok: true,
      mensagem:
        'Se houver uma conta para este e-mail, enviaremos as instruções de recuperação.',
    });

    expect(tokenUpdateManyMock).not.toHaveBeenCalled();
    expect(tokenCreateMock).not.toHaveBeenCalled();
    expect(transactionMock).not.toHaveBeenCalled();
  });

  it('envia recuperacao com linguagem do Portal', async () => {
    alunoFindUniqueMock.mockResolvedValue({
      id: 'aluno-portal',
      nome: 'Cliente Portal',
      status: 'ATIVO',
      senhaHash: 'hash-existente',
    });

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

    const request = {
      json: vi.fn().mockResolvedValue({
        email: ' portal@example.com ',
      }),
    };

    const resposta = await POST(request);
    const corpo = await resposta.json();

    expect(resposta.status).toBe(200);
    expect(corpo.ok).toBe(true);

    expect(transactionMock).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledTimes(1);

    const mensagem = sendMock.mock.calls[0][0];

    expect(mensagem.to).toBe('portal@example.com');

    expect(mensagem.subject).toBe(
      'Recupera\u00e7\u00e3o de senha \u2014 Portal Garimpo Urbano',
    );

    expect(mensagem.html).toContain(
      'Portal Garimpo Urbano',
    );

    expect(mensagem.html).not.toContain(
      '\u00c1rea do Aluno',
    );
  });


  it('usa saudacao neutra na recuperacao quando nao houver nome', async () => {
    alunoFindUniqueMock.mockResolvedValue({
      id: 'aluno-sem-nome',
      nome: null,
      status: 'ATIVO',
      senhaHash: 'hash-existente',
    });

    tokenUpdateManyMock.mockReturnValue({
      operacao: 'invalidar-recuperacoes',
    });

    tokenCreateMock.mockReturnValue({
      operacao: 'criar-recuperacao',
    });

    transactionMock.mockResolvedValue([]);

    sendMock.mockResolvedValue({
      data: {
        id: 'email-sem-nome',
      },
      error: null,
    });

    const request = {
      json: vi.fn().mockResolvedValue({
        email: 'semnome@example.com',
      }),
    };

    const resposta = await POST(request);

    expect(resposta.status).toBe(200);
    expect(sendMock).toHaveBeenCalledTimes(1);

    const mensagem = sendMock.mock.calls[0][0];

    expect(mensagem.html).toContain(
      '<h1>Ol\u00e1.</h1>',
    );

    expect(mensagem.html).not.toContain(
      '<h1>Ol\u00e1, Aluno.</h1>',
    );
  });

});
