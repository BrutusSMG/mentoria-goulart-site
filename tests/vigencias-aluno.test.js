import { describe, expect, it, vi } from 'vitest';

import { listarVigenciasAluno } from '../src/lib/vigencias-aluno';

describe('listarVigenciasAluno', () => {
  const agora = new Date('2026-09-10T12:00:00.000Z');

  it('retorna vazio sem alunoId e não consulta o banco', async () => {
    const db = {
      matricula: {
        findMany: vi.fn(),
      },
    };

    const resultado = await listarVigenciasAluno(
      '   ',
      agora,
      db,
    );

    expect(resultado).toEqual([]);
    expect(db.matricula.findMany).not.toHaveBeenCalled();
  });

  it('consulta somente as matrículas do aluno com suas vigências', async () => {
    const db = {
      matricula: {
        findMany: vi.fn().mockResolvedValue([]),
      },
    };

    await listarVigenciasAluno(
      'aluno-123',
      agora,
      db,
    );

    expect(db.matricula.findMany).toHaveBeenCalledWith({
      where: {
        alunoId: 'aluno-123',
      },

      select: {
        id: true,
        produtoId: true,
        produtoNome: true,
        status: true,

        vigencias: {
          select: {
            id: true,
            status: true,
            tipoDuracao: true,
            iniciaEm: true,
            expiraEm: true,
          },

          orderBy: [
            {
              iniciaEm: 'desc',
            },
            {
              createdAt: 'desc',
            },
          ],
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  });

  it('preserva múltiplas vigências da mesma matrícula', async () => {
    const db = {
      matricula: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'matricula-1',
            produtoId: 'produto-1',
            produtoNome: 'Curso Garimpo Urbano',
            status: 'ATIVA',
            vigencias: [
              {
                id: 'vigencia-2',
                status: 'AGENDADA',
                tipoDuracao: 'DEFINIDA',
                iniciaEm: new Date('2027-01-01T00:00:00.000Z'),
                expiraEm: new Date('2028-01-01T00:00:00.000Z'),
              },
              {
                id: 'vigencia-1',
                status: 'ATIVA',
                tipoDuracao: 'DEFINIDA',
                iniciaEm: new Date('2026-01-01T00:00:00.000Z'),
                expiraEm: new Date('2027-01-01T00:00:00.000Z'),
              },
            ],
          },
        ]),
      },
    };

    const resultado = await listarVigenciasAluno(
      'aluno-123',
      agora,
      db,
    );

    expect(resultado).toHaveLength(2);

    expect(resultado[0]).toEqual({
      id: 'vigencia-2',
      matriculaId: 'matricula-1',
      produtoId: 'produto-1',
      produtoNome: 'Curso Garimpo Urbano',
      matriculaStatus: 'ATIVA',
      status: 'AGENDADA',
      situacao: 'AGENDADA',
      tipoDuracao: 'DEFINIDA',
      iniciaEm: new Date('2027-01-01T00:00:00.000Z'),
      expiraEm: new Date('2028-01-01T00:00:00.000Z'),
    });

    expect(resultado[1].situacao).toBe('ATIVA');
  });

  it('exibe como EXPIRADA uma vigência persistida como ATIVA cujo prazo terminou', async () => {
    const db = {
      matricula: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'matricula-1',
            produtoId: 'produto-1',
            produtoNome: 'Curso Garimpo Urbano',
            status: 'ATIVA',
            vigencias: [
              {
                id: 'vigencia-expirada',
                status: 'ATIVA',
                tipoDuracao: 'DEFINIDA',
                iniciaEm: new Date('2025-09-01T00:00:00.000Z'),
                expiraEm: new Date('2026-09-01T00:00:00.000Z'),
              },
            ],
          },
        ]),
      },
    };

    const resultado = await listarVigenciasAluno(
      'aluno-123',
      agora,
      db,
    );

    expect(resultado[0].status).toBe('ATIVA');
    expect(resultado[0].situacao).toBe('EXPIRADA');
  });

  it('mantém acesso sem vencimento definido como ATIVA', async () => {
    const db = {
      matricula: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'matricula-legado',
            produtoId: 'produto-legado',
            produtoNome: 'Garimpo Urbano',
            status: 'ATIVA',
            vigencias: [
              {
                id: 'vigencia-legado',
                status: 'ATIVA',
                tipoDuracao: 'INDEFINIDA',
                iniciaEm: new Date('2024-01-01T00:00:00.000Z'),
                expiraEm: null,
              },
            ],
          },
        ]),
      },
    };

    const resultado = await listarVigenciasAluno(
      'aluno-123',
      agora,
      db,
    );

    expect(resultado[0].situacao).toBe('ATIVA');
    expect(resultado[0].expiraEm).toBeNull();
  });

  it('exibe SUSPENSA quando a matrícula está suspensa mesmo com vigência ativa', async () => {
    const db = {
      matricula: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'matricula-1',
            produtoId: 'produto-1',
            produtoNome: 'Curso Garimpo Urbano',
            status: 'SUSPENSA',
            vigencias: [
              {
                id: 'vigencia-1',
                status: 'ATIVA',
                tipoDuracao: 'DEFINIDA',
                iniciaEm: new Date('2026-01-01T00:00:00.000Z'),
                expiraEm: new Date('2027-01-01T00:00:00.000Z'),
              },
            ],
          },
        ]),
      },
    };

    const resultado = await listarVigenciasAluno(
      'aluno-123',
      agora,
      db,
    );

    expect(resultado[0].status).toBe('ATIVA');
    expect(resultado[0].matriculaStatus).toBe('SUSPENSA');
    expect(resultado[0].situacao).toBe('SUSPENSA');
  });

  it('exibe CANCELADA quando a matrícula está cancelada', async () => {
    const db = {
      matricula: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'matricula-1',
            produtoId: 'produto-1',
            produtoNome: 'Curso Garimpo Urbano',
            status: 'CANCELADA',
            vigencias: [
              {
                id: 'vigencia-1',
                status: 'ATIVA',
                tipoDuracao: 'DEFINIDA',
                iniciaEm: new Date('2026-01-01T00:00:00.000Z'),
                expiraEm: new Date('2027-01-01T00:00:00.000Z'),
              },
            ],
          },
        ]),
      },
    };

    const resultado = await listarVigenciasAluno(
      'aluno-123',
      agora,
      db,
    );

    expect(resultado[0].situacao).toBe('CANCELADA');
  });

  it('exibe ENCERRADA quando a matrícula está encerrada', async () => {
    const db = {
      matricula: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'matricula-1',
            produtoId: 'produto-1',
            produtoNome: 'Curso Garimpo Urbano',
            status: 'ENCERRADA',
            vigencias: [
              {
                id: 'vigencia-1',
                status: 'ATIVA',
                tipoDuracao: 'DEFINIDA',
                iniciaEm: new Date('2026-01-01T00:00:00.000Z'),
                expiraEm: new Date('2027-01-01T00:00:00.000Z'),
              },
            ],
          },
        ]),
      },
    };

    const resultado = await listarVigenciasAluno(
      'aluno-123',
      agora,
      db,
    );

    expect(resultado[0].situacao).toBe('ENCERRADA');
  });

  it('exibe PENDENTE quando a matrícula ainda está pendente', async () => {
    const db = {
      matricula: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'matricula-1',
            produtoId: 'produto-1',
            produtoNome: 'Curso Garimpo Urbano',
            status: 'PENDENTE',
            vigencias: [
              {
                id: 'vigencia-1',
                status: 'ATIVA',
                tipoDuracao: 'DEFINIDA',
                iniciaEm: new Date('2026-01-01T00:00:00.000Z'),
                expiraEm: new Date('2027-01-01T00:00:00.000Z'),
              },
            ],
          },
        ]),
      },
    };

    const resultado = await listarVigenciasAluno(
      'aluno-123',
      agora,
      db,
    );

    expect(resultado[0].situacao).toBe('PENDENTE');
  });
});
