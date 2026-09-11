import { beforeEach, describe, expect, it, vi } from 'vitest';

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
      send: vi.fn(),
    };
  }),
}));

const { POST } = await import(
  '../src/app/api/alunos/esqueci-senha/route.js'
);

describe('POST /api/alunos/esqueci-senha', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});