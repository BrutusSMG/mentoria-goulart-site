import { beforeEach, describe, expect, it, vi } from 'vitest';

const alunoFindUniqueMock = vi.fn();
const adminFindUniqueMock = vi.fn();
const bcryptCompareMock = vi.fn();

vi.mock('next-auth', () => ({
  default: vi.fn(() => vi.fn()),
}));

vi.mock('next-auth/providers/credentials', () => ({
  default: vi.fn((config) => config),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    aluno: {
      findUnique: alunoFindUniqueMock,
    },
    adminUser: {
      findUnique: adminFindUniqueMock,
    },
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    compare: bcryptCompareMock,
  },
}));

const { authOptions } = await import(
  '../src/app/api/auth/[...nextauth]/route.js'
);

const authorize = authOptions.providers[0].authorize;

describe('autenticação do aluno', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('autentica aluno ativo com senha válida', async () => {
    alunoFindUniqueMock.mockResolvedValue({
      id: 'aluno-1',
      nome: 'Aluno Teste',
      email: 'aluno@example.com',
      senhaHash: 'hash-senha',
      status: 'ATIVO',
    });

    bcryptCompareMock.mockResolvedValue(true);

    const usuario = await authorize({
      email: ' ALUNO@example.com ',
      password: 'Senha123!',
      area: 'aluno',
    });

    expect(alunoFindUniqueMock).toHaveBeenCalledWith({
      where: {
        email: 'aluno@example.com',
      },
      select: {
        id: true,
        nome: true,
        email: true,
        senhaHash: true,
        status: true,
      },
    });

    expect(bcryptCompareMock).toHaveBeenCalledWith(
      'Senha123!',
      'hash-senha',
    );

    expect(usuario).toEqual({
      id: 'aluno-1',
      email: 'aluno@example.com',
      name: 'Aluno Teste',
      tipoConta: 'ALUNO',
      alunoId: 'aluno-1',
      role: null,
      mustChangePassword: false,
    });

    expect(adminFindUniqueMock).not.toHaveBeenCalled();
  });

  it('nega login quando a senha do aluno é inválida', async () => {
    alunoFindUniqueMock.mockResolvedValue({
      id: 'aluno-1',
      nome: 'Aluno Teste',
      email: 'aluno@example.com',
      senhaHash: 'hash-senha',
      status: 'ATIVO',
    });

    bcryptCompareMock.mockResolvedValue(false);

    const usuario = await authorize({
      email: 'aluno@example.com',
      password: 'senha-incorreta',
      area: 'aluno',
    });

    expect(usuario).toBeNull();
    expect(adminFindUniqueMock).not.toHaveBeenCalled();
  });
});