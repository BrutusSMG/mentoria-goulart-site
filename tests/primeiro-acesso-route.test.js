import { beforeEach, describe, expect, it, vi } from 'vitest';

const findUniqueMock = vi.fn();
const alunoUpdateMock = vi.fn();
const tokenUpdateManyMock = vi.fn();
const transactionMock = vi.fn();
const bcryptHashMock = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    alunoAccessToken: {
      findUnique: findUniqueMock,
      updateMany: tokenUpdateManyMock,
    },
    aluno: {
      update: alunoUpdateMock,
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

describe('POST /api/alunos/primeiro-acesso', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('conclui o primeiro acesso com convite válido', async () => {
    findUniqueMock.mockResolvedValue({
      id: 'token-1',
      alunoId: 'aluno-1',
      tipo: 'PRIMEIRO_ACESSO',
      usadoEm: null,
      expiraEm: new Date(Date.now() + 60 * 60 * 1000),
      aluno: {
        id: 'aluno-1',
        status: 'ATIVO',
        senhaHash: null,
      },
    });

    bcryptHashMock.mockResolvedValue('senha-hash');

    alunoUpdateMock.mockReturnValue({
      operacao: 'atualizar-aluno',
    });

    tokenUpdateManyMock.mockReturnValue({
      operacao: 'invalidar-convites',
    });

    transactionMock.mockResolvedValue([]);

    const request = {
      json: vi.fn().mockResolvedValue({
        token: 'token-valido',
        senha: 'Senha123!',
      }),
    };

    const resposta = await POST(request);
    const corpo = await resposta.json();

    expect(resposta.status).toBe(200);
    expect(corpo).toEqual({
      ok: true,
    });

    expect(bcryptHashMock).toHaveBeenCalledWith(
      'Senha123!',
      12,
    );

    expect(alunoUpdateMock).toHaveBeenCalledWith({
      where: {
        id: 'aluno-1',
      },
      data: {
        senhaHash: 'senha-hash',
        emailVerificadoEm: expect.any(Date),
      },
    });

    expect(tokenUpdateManyMock).toHaveBeenCalledWith({
      where: {
        alunoId: 'aluno-1',
        tipo: 'PRIMEIRO_ACESSO',
        usadoEm: null,
      },
      data: {
        usadoEm: expect.any(Date),
      },
    });

    expect(transactionMock).toHaveBeenCalledTimes(1);
  });

  it('rejeita convite expirado', async () => {
    findUniqueMock.mockResolvedValue({
      id: 'token-expirado',
      alunoId: 'aluno-1',
      tipo: 'PRIMEIRO_ACESSO',
      usadoEm: null,
      expiraEm: new Date(Date.now() - 60 * 1000),
      aluno: {
        id: 'aluno-1',
        status: 'ATIVO',
        senhaHash: null,
      },
    });

    const request = {
      json: vi.fn().mockResolvedValue({
        token: 'token-expirado',
        senha: 'Senha123!',
      }),
    };

    const resposta = await POST(request);
    const corpo = await resposta.json();

    expect(resposta.status).toBe(400);

    expect(corpo).toEqual({
      ok: false,
      erro: 'Este convite é inválido, expirou ou já foi utilizado.',
    });

    expect(bcryptHashMock).not.toHaveBeenCalled();
    expect(alunoUpdateMock).not.toHaveBeenCalled();
    expect(tokenUpdateManyMock).not.toHaveBeenCalled();
    expect(transactionMock).not.toHaveBeenCalled();
  });
});