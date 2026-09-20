import { beforeEach, describe, expect, it, vi } from 'vitest';

const getServerSessionMock = vi.fn();
const alunoTemAcessoComunidadeMock = vi.fn();
const perfilFindManyMock = vi.fn();

vi.mock('next-auth', () => ({
  getServerSession: getServerSessionMock,
}));

vi.mock('@/app/api/auth/[...nextauth]/route', () => ({
  authOptions: {},
}));

vi.mock('@/lib/direitos-produto', () => ({
  alunoTemAcessoComunidade: alunoTemAcessoComunidadeMock,
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    perfilAluno: {
      findMany: perfilFindManyMock,
    },
  },
}));

const { GET } = await import(
  '../src/app/api/alunos/comunidade/route.js'
);

describe('GET /api/alunos/comunidade', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna 401 sem sessao', async () => {
    getServerSessionMock.mockResolvedValue(null);

    const resposta = await GET();

    expect(resposta.status).toBe(401);
    expect(
      alunoTemAcessoComunidadeMock,
    ).not.toHaveBeenCalled();
    expect(perfilFindManyMock).not.toHaveBeenCalled();
  });

  it('retorna 403 para aluno sem direito COMUNIDADE', async () => {
    getServerSessionMock.mockResolvedValue({
      user: {
        tipoConta: 'ALUNO',
        alunoId: 'aluno-ebook',
      },
    });

    alunoTemAcessoComunidadeMock.mockResolvedValue(false);

    const resposta = await GET();

    expect(resposta.status).toBe(403);
    expect(
      alunoTemAcessoComunidadeMock,
    ).toHaveBeenCalledWith('aluno-ebook');
    expect(perfilFindManyMock).not.toHaveBeenCalled();
  });

  it('permite aluno com direito COMUNIDADE sem depender de matricula', async () => {
    getServerSessionMock.mockResolvedValue({
      user: {
        tipoConta: 'ALUNO',
        alunoId: 'aluno-ebook',
      },
    });

    alunoTemAcessoComunidadeMock.mockResolvedValue(true);
    perfilFindManyMock.mockResolvedValue([]);

    const resposta = await GET();
    const corpo = await resposta.json();

    expect(resposta.status).toBe(200);
    expect(corpo).toEqual({
      ok: true,
      alunos: [],
    });

    expect(
      alunoTemAcessoComunidadeMock,
    ).toHaveBeenCalledWith('aluno-ebook');

    expect(perfilFindManyMock).toHaveBeenCalledTimes(1);
  });

  it('preserva bypass administrativo', async () => {
    getServerSessionMock.mockResolvedValue({
      user: {
        tipoConta: 'ADMIN',
      },
    });

    perfilFindManyMock.mockResolvedValue([]);

    const resposta = await GET();

    expect(resposta.status).toBe(200);
    expect(
      alunoTemAcessoComunidadeMock,
    ).not.toHaveBeenCalled();
  });
});
