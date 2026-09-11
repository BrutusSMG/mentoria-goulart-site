import { beforeEach, describe, expect, it, vi } from 'vitest';

const alunoFindUniqueMock = vi.fn();
const tokenFindFirstMock = vi.fn();
const tokenUpdateManyMock = vi.fn();
const tokenCreateMock = vi.fn();
const transactionMock = vi.fn();
const enviarConviteMock = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    aluno: {
      findUnique: alunoFindUniqueMock,
    },
    alunoAccessToken: {
      findFirst: tokenFindFirstMock,
      updateMany: tokenUpdateManyMock,
      create: tokenCreateMock,
    },
    $transaction: transactionMock,
  },
}));

vi.mock('@/lib/convite-primeiro-acesso', () => ({
  TIPO_PRIMEIRO_ACESSO: 'PRIMEIRO_ACESSO',

  gerarTokenPrimeiroAcesso: vi.fn(
    () => 'token-reenvio',
  ),

  hashTokenAcesso: vi.fn(
    () => 'hash-token-reenvio',
  ),

  calcularExpiracaoConvitePrimeiroAcesso: vi.fn(
    (agora) =>
      new Date(
        agora.getTime() + 72 * 60 * 60 * 1000,
      ),
  ),

  enviarConvitePrimeiroAcesso: enviarConviteMock,
}));

const { POST } = await import(
  '../src/app/api/alunos/reenviar-convite/route.js'
);

describe('POST /api/alunos/reenviar-convite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cria e envia novo convite para aluno elegível', async () => {
    alunoFindUniqueMock.mockResolvedValue({
      id: 'aluno-1',
      nome: 'Aluno Teste',
      email: 'aluno@example.com',
      senhaHash: null,
      status: 'ATIVO',
    });

    tokenFindFirstMock.mockResolvedValue(null);

    tokenUpdateManyMock.mockReturnValue({
      operacao: 'invalidar-convites',
    });

    tokenCreateMock.mockReturnValue({
      operacao: 'criar-convite',
    });

    transactionMock.mockResolvedValue([]);

    enviarConviteMock.mockResolvedValue({
      ok: true,
    });

    const request = {
      json: vi.fn().mockResolvedValue({
        email: ' ALUNO@example.com ',
      }),
    };

    const resposta = await POST(request);
    const corpo = await resposta.json();

    expect(resposta.status).toBe(200);
    expect(corpo.ok).toBe(true);

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

    expect(tokenCreateMock).toHaveBeenCalledWith({
      data: {
        alunoId: 'aluno-1',
        tokenHash: 'hash-token-reenvio',
        tipo: 'PRIMEIRO_ACESSO',
        expiraEm: expect.any(Date),
      },
    });

    expect(transactionMock).toHaveBeenCalledTimes(1);

    expect(enviarConviteMock).toHaveBeenCalledWith({
      email: 'aluno@example.com',
      nome: 'Aluno Teste',
      token: 'token-reenvio',
    });
  });

  it('reenvia convite para aluno legado sem primeiro acesso concluído', async () => {
    alunoFindUniqueMock.mockResolvedValue({
      id: 'aluno-legado',
      nome: 'Aluno Legado',
      email: 'legado@example.com',
      senhaHash: null,
      status: 'ATIVO',
      origem: 'LEGADO',
    });

    tokenFindFirstMock.mockResolvedValue(null);

    tokenUpdateManyMock.mockReturnValue({
      operacao: 'invalidar-convites',
    });

    tokenCreateMock.mockReturnValue({
      operacao: 'criar-convite',
    });

    transactionMock.mockResolvedValue([]);

    enviarConviteMock.mockResolvedValue({
      ok: true,
    });

    const request = {
      json: vi.fn().mockResolvedValue({
        email: 'legado@example.com',
      }),
    };

    const resposta = await POST(request);
    const corpo = await resposta.json();

    expect(resposta.status).toBe(200);
    expect(corpo.ok).toBe(true);

    expect(alunoFindUniqueMock).toHaveBeenCalledWith({
      where: {
        email: 'legado@example.com',
      },
      select: {
        id: true,
        nome: true,
        email: true,
        senhaHash: true,
        status: true,
      },
    });

    expect(tokenCreateMock).toHaveBeenCalledWith({
      data: {
        alunoId: 'aluno-legado',
        tokenHash: 'hash-token-reenvio',
        tipo: 'PRIMEIRO_ACESSO',
        expiraEm: expect.any(Date),
      },
    });

    expect(enviarConviteMock).toHaveBeenCalledWith({
      email: 'legado@example.com',
      nome: 'Aluno Legado',
      token: 'token-reenvio',
    });
  });

  it('reenvia convite para aluno manual sem primeiro acesso concluído', async () => {
    alunoFindUniqueMock.mockResolvedValue({
      id: 'aluno-manual',
      nome: 'Aluno Manual',
      email: 'manual@example.com',
      senhaHash: null,
      status: 'ATIVO',
      origem: 'MANUAL',
    });

    tokenFindFirstMock.mockResolvedValue(null);

    tokenUpdateManyMock.mockReturnValue({
      operacao: 'invalidar-convites',
    });

    tokenCreateMock.mockReturnValue({
      operacao: 'criar-convite',
    });

    transactionMock.mockResolvedValue([]);

    enviarConviteMock.mockResolvedValue({
      ok: true,
    });

    const request = {
      json: vi.fn().mockResolvedValue({
        email: 'manual@example.com',
      }),
    };

    const resposta = await POST(request);
    const corpo = await resposta.json();

    expect(resposta.status).toBe(200);
    expect(corpo.ok).toBe(true);

    expect(tokenCreateMock).toHaveBeenCalledWith({
      data: {
        alunoId: 'aluno-manual',
        tokenHash: 'hash-token-reenvio',
        tipo: 'PRIMEIRO_ACESSO',
        expiraEm: expect.any(Date),
      },
    });

    expect(enviarConviteMock).toHaveBeenCalledWith({
      email: 'manual@example.com',
      nome: 'Aluno Manual',
      token: 'token-reenvio',
    });
  });
});