import { beforeEach, describe, expect, it, vi } from 'vitest';

const getServerSessionMock = vi.fn();
const alunoTemContaAtivaMock = vi.fn();
const alunoFindUniqueMock = vi.fn();
const alunoUpdateMock = vi.fn();
const perfilUpsertMock = vi.fn();

vi.mock('next-auth', () => ({
  getServerSession: getServerSessionMock,
}));

vi.mock('@/app/api/auth/[...nextauth]/route', () => ({
  authOptions: {},
}));

vi.mock('@/lib/acesso-aluno', () => ({
  alunoTemContaAtiva: alunoTemContaAtivaMock,
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    aluno: {
      findUnique: alunoFindUniqueMock,
      update: alunoUpdateMock,
    },
    perfilAluno: {
      upsert: perfilUpsertMock,
    },
  },
}));

const { GET } = await import(
  '../src/app/api/alunos/meu-perfil/route.js'
);

describe('GET /api/alunos/meu-perfil', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna 401 sem sessao de aluno', async () => {
    getServerSessionMock.mockResolvedValue(null);

    const resposta = await GET();

    expect(resposta.status).toBe(401);
    expect(alunoTemContaAtivaMock).not.toHaveBeenCalled();
  });

  it('retorna 403 quando a conta nao esta ativa', async () => {
    getServerSessionMock.mockResolvedValue({
      user: {
        tipoConta: 'ALUNO',
        alunoId: 'aluno-inativo',
      },
    });

    alunoTemContaAtivaMock.mockResolvedValue(false);

    const resposta = await GET();

    expect(resposta.status).toBe(403);
    expect(alunoFindUniqueMock).not.toHaveBeenCalled();
  });

  it('permite conta ativa sem exigir matricula', async () => {
    getServerSessionMock.mockResolvedValue({
      user: {
        tipoConta: 'ALUNO',
        alunoId: 'aluno-ebook',
      },
    });

    alunoTemContaAtivaMock.mockResolvedValue(true);

    alunoFindUniqueMock.mockResolvedValue({
      nome: 'Comprador Ebook',
      email: 'ebook@example.com',
      whatsapp: null,
      perfil: null,
    });

    const resposta = await GET();
    const corpo = await resposta.json();

    expect(resposta.status).toBe(200);
    expect(corpo.ok).toBe(true);
    expect(corpo.aluno.email).toBe('ebook@example.com');

    expect(alunoTemContaAtivaMock).toHaveBeenCalledWith(
      'aluno-ebook',
    );
  });
});
