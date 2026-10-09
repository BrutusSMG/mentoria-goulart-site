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

  it('preserva bypass do contexto administrativo', async () => {
    getServerSessionMock.mockResolvedValue({
      user: {
        adminUserId: 'admin-1',
        papelAdministrativo: 'PARCEIRO',
      },
    });

    perfilFindManyMock.mockResolvedValue([]);

    const resposta = await GET();

    expect(resposta.status).toBe(200);
    expect(
      alunoTemAcessoComunidadeMock,
    ).not.toHaveBeenCalled();
  });

  it(
    'usa Pessoa como identidade e preserva nomeExibicao da comunidade',
    async () => {
      getServerSessionMock.mockResolvedValue({
        user: {
          alunoId: 'aluno-comunidade',
        },
      });

      alunoTemAcessoComunidadeMock.mockResolvedValue(true);

      perfilFindManyMock.mockResolvedValue([
        {
          alunoId: 'aluno-apelido',
          nomeExibicao: 'Garimpeiro Urbano',
          fotoUrl: null,
          cidade: null,
          estado: null,
          bio: null,
          experiencia: null,
          objetivos: null,
          mostrarFoto: false,
          mostrarLocalizacao: false,
          mostrarBio: false,
          mostrarExperiencia: false,
          mostrarObjetivos: false,
          mostrarWhatsapp: true,
          aluno: {
            nome: 'Nome legado alterado',
            whatsapp: '11911111111',
            pessoa: {
              nome: 'Nome Oficial',
              telefonePrincipal: '11999999999',
            },
          },
        },
        {
          alunoId: 'aluno-sem-apelido',
          nomeExibicao: null,
          fotoUrl: null,
          cidade: null,
          estado: null,
          bio: null,
          experiencia: null,
          objetivos: null,
          mostrarFoto: false,
          mostrarLocalizacao: false,
          mostrarBio: false,
          mostrarExperiencia: false,
          mostrarObjetivos: false,
          mostrarWhatsapp: true,
          aluno: {
            nome: 'Outro nome legado',
            whatsapp: '11811111111',
            pessoa: {
              nome: 'Outra Pessoa',
              telefonePrincipal: '11888888888',
            },
          },
        },
      ]);

      const resposta = await GET();
      const corpo = await resposta.json();

      expect(resposta.status).toBe(200);

      expect(corpo.alunos).toEqual([
        {
          id: 'aluno-apelido',
          nome: 'Garimpeiro Urbano',
          fotoUrl: null,
          cidade: null,
          estado: null,
          bio: null,
          experiencia: null,
          objetivos: null,
          whatsapp: '11999999999',
        },
        {
          id: 'aluno-sem-apelido',
          nome: 'Outra Pessoa',
          fotoUrl: null,
          cidade: null,
          estado: null,
          bio: null,
          experiencia: null,
          objetivos: null,
          whatsapp: '11888888888',
        },
      ]);
    },
  );
});
