import { beforeEach, describe, expect, it, vi } from 'vitest';

const getServerSessionMock = vi.fn();
const listarVigenciasAlunoMock = vi.fn();

vi.mock('next-auth', () => ({
  getServerSession: getServerSessionMock,
}));

vi.mock('@/app/api/auth/[...nextauth]/route', () => ({
  authOptions: {},
}));

vi.mock('@/lib/vigencias-aluno', () => ({
  listarVigenciasAluno: listarVigenciasAlunoMock,
}));

const { GET } = await import(
  '../src/app/api/alunos/minhas-vigencias/route.js'
);

describe('GET /api/alunos/minhas-vigencias', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna 401 sem sessão de aluno', async () => {
    getServerSessionMock.mockResolvedValue(null);

    const resposta = await GET();
    const corpo = await resposta.json();

    expect(resposta.status).toBe(401);
    expect(corpo).toEqual({
      ok: false,
      erro: 'Acesso não autorizado.',
    });

    expect(listarVigenciasAlunoMock).not.toHaveBeenCalled();
  });

  it('retorna 401 para outro tipo de conta', async () => {
    getServerSessionMock.mockResolvedValue({
      user: {
        tipoConta: 'ADMIN',
        alunoId: 'aluno-123',
      },
    });

    const resposta = await GET();

    expect(resposta.status).toBe(401);
    expect(listarVigenciasAlunoMock).not.toHaveBeenCalled();
  });

  it('retorna as vigências do aluno autenticado', async () => {
    getServerSessionMock.mockResolvedValue({
      user: {
        tipoConta: 'ALUNO',
        alunoId: 'aluno-123',
      },
    });

    listarVigenciasAlunoMock.mockResolvedValue([
      {
        id: 'vigencia-1',
        produtoNome: 'Curso Garimpo Urbano',
        situacao: 'EXPIRADA',
        iniciaEm: '2025-09-01T00:00:00.000Z',
        expiraEm: '2026-09-01T00:00:00.000Z',
      },
    ]);

    const resposta = await GET();
    const corpo = await resposta.json();

    expect(resposta.status).toBe(200);
    expect(corpo.ok).toBe(true);
    expect(corpo.vigencias).toHaveLength(1);

    expect(listarVigenciasAlunoMock).toHaveBeenCalledWith(
      'aluno-123',
    );
  });

  it('não exige acesso comercial ativo para consultar as vigências', async () => {
    getServerSessionMock.mockResolvedValue({
      user: {
        tipoConta: 'ALUNO',
        alunoId: 'aluno-expirado',
      },
    });

    listarVigenciasAlunoMock.mockResolvedValue([
      {
        id: 'vigencia-expirada',
        situacao: 'EXPIRADA',
      },
    ]);

    const resposta = await GET();
    const corpo = await resposta.json();

    expect(resposta.status).toBe(200);
    expect(corpo.vigencias[0].situacao).toBe('EXPIRADA');
  });

  it('retorna 500 quando ocorre erro ao consultar as vigências', async () => {
    getServerSessionMock.mockResolvedValue({
      user: {
        tipoConta: 'ALUNO',
        alunoId: 'aluno-123',
      },
    });

    listarVigenciasAlunoMock.mockRejectedValue(
      new Error('Falha simulada'),
    );

    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const resposta = await GET();
    const corpo = await resposta.json();

    expect(resposta.status).toBe(500);
    expect(corpo).toEqual({
      ok: false,
      erro: 'Não foi possível carregar suas vigências.',
    });

    consoleError.mockRestore();
  });
});
