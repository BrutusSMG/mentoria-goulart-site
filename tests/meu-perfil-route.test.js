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

const { GET, PATCH } = await import(
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
        alunoId: 'aluno-ebook',
      },
    });

    alunoTemContaAtivaMock.mockResolvedValue(true);

    alunoFindUniqueMock.mockResolvedValue({
      nome: 'Nome legado',
      email: 'legado@example.com',
      whatsapp: '11911111111',
      pessoa: {
        nome: 'Comprador Ebook',
        emailPrincipal: 'ebook@example.com',
        telefonePrincipal: null,
      },
      perfil: null,
    });

    const resposta = await GET();
    const corpo = await resposta.json();

    expect(resposta.status).toBe(200);
    expect(corpo.ok).toBe(true);
    expect(corpo.aluno).toEqual({
      nome: 'Comprador Ebook',
      email: 'ebook@example.com',
      whatsapp: null,
    });
    expect(corpo.perfil.nomeExibicao).toBe(
      'Comprador Ebook',
    );

    expect(alunoTemContaAtivaMock).toHaveBeenCalledWith(
      'aluno-ebook',
    );
  });

  it(
    'permite aluno que tambem possui contexto administrativo',
    async () => {
      getServerSessionMock.mockResolvedValue({
        user: {
          alunoId: 'aluno-compartilhado',
          adminUserId: 'admin-1',
          papelAdministrativo: 'PARCEIRO',
        },
      });

      alunoTemContaAtivaMock.mockResolvedValue(true);

      alunoFindUniqueMock.mockResolvedValue({
        nome: 'Nome legado compartilhado',
        email: 'legado-compartilhado@example.com',
        whatsapp: null,
        pessoa: {
          nome: 'Pessoa Compartilhada',
          emailPrincipal: 'compartilhado@example.com',
          telefonePrincipal: null,
        },
        perfil: null,
      });

      const resposta = await GET();
      const corpo = await resposta.json();

      expect(resposta.status).toBe(200);
      expect(corpo.ok).toBe(true);
      expect(corpo.aluno.nome).toBe(
        'Pessoa Compartilhada',
      );

      expect(
        alunoTemContaAtivaMock,
      ).toHaveBeenCalledWith(
        'aluno-compartilhado',
      );
    },
  );

  it(
    'usa Pessoa como identidade mesmo quando Aluno possui nome legado divergente',
    async () => {
      getServerSessionMock.mockResolvedValue({
        user: {
          alunoId: 'aluno-divergente',
        },
      });

      alunoTemContaAtivaMock.mockResolvedValue(true);

      alunoFindUniqueMock.mockResolvedValue({
        nome: 'Fabio Teste',
        email: 'fsousam@hotmail.com',
        whatsapp: '11900000000',
        pessoa: {
          nome: 'Fabio Martins',
          emailPrincipal: 'fsousam@hotmail.com',
          telefonePrincipal: '11999999999',
        },
        perfil: null,
      });

      const resposta = await GET();
      const corpo = await resposta.json();

      expect(resposta.status).toBe(200);

      expect(corpo.aluno).toEqual({
        nome: 'Fabio Martins',
        email: 'fsousam@hotmail.com',
        whatsapp: '11999999999',
      });

      expect(corpo.perfil.nomeExibicao).toBe(
        'Fabio Martins',
      );
    },
  );
});

describe('PATCH /api/alunos/meu-perfil', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it(
    'altera nomeExibicao sem alterar a identidade do Aluno',
    async () => {
      getServerSessionMock.mockResolvedValue({
        user: {
          alunoId: 'aluno-perfil',
        },
      });

      alunoTemContaAtivaMock.mockResolvedValue(true);

      perfilUpsertMock.mockResolvedValue({
        alunoId: 'aluno-perfil',
        nomeExibicao: 'Aluno Teste',
      });

      const request = new Request(
        'http://localhost/api/alunos/meu-perfil',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nomeExibicao: 'Aluno Teste',
          }),
        },
      );

      const resposta = await PATCH(request);
      const corpo = await resposta.json();

      expect(resposta.status).toBe(200);
      expect(corpo.ok).toBe(true);

      expect(perfilUpsertMock).toHaveBeenCalledWith({
        where: {
          alunoId: 'aluno-perfil',
        },
        update: {
          nomeExibicao: 'Aluno Teste',
        },
        create: {
          alunoId: 'aluno-perfil',
          nomeExibicao: 'Aluno Teste',
        },
      });

      expect(alunoUpdateMock).not.toHaveBeenCalled();
    },
  );
});