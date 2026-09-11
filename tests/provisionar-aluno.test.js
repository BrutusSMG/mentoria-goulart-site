import { describe, expect, it, vi } from 'vitest';

import { provisionarAlunoHotmart } from '../src/lib/provisionar-aluno';

describe('provisionarAlunoHotmart', () => {
  it('reutiliza a mesma matrícula do aluno e reativa seu estado em uma nova compra', async () => {
    const aprovadoEm = new Date('2027-08-01T12:00:00.000Z');

    const tx = {
      aluno: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'aluno-1',
          nome: 'Aluno Teste',
          leadId: null,
          senhaHash: 'hash-existente',
          status: 'ATIVO',
        }),

        upsert: vi.fn().mockResolvedValue({
          id: 'aluno-1',
          nome: 'Aluno Teste',
          leadId: null,
          senhaHash: 'hash-existente',
          status: 'ATIVO',
        }),
      },

      matricula: {
        upsert: vi.fn().mockResolvedValue({
          id: 'matricula-existente',
        }),
      },

      vigenciaMatricula: {
        findUnique: vi.fn().mockResolvedValue(null),
        findFirst: vi.fn().mockResolvedValue({
          id: 'vigencia-atual',
          status: 'ATIVA',
          expiraEm: new Date('2027-09-15T12:00:00.000Z'),
        }),
        create: vi.fn().mockResolvedValue({
          id: 'vigencia-renovacao',
        }),
      },

      perfilAluno: {
        upsert: vi.fn().mockResolvedValue({}),
      },

      alunoAccessToken: {
        findFirst: vi.fn(),
        create: vi.fn(),
      },
    };

    const resultado = await provisionarAlunoHotmart(tx, {
      email: 'aluno@example.com',
      nome: 'Aluno Teste',
      produtoId: 'produto-1',
      produtoNome: 'Curso Garimpo Urbano',
      transacaoOrigemId: 'transacao-renovacao',
      aprovadoEm,
    });

    expect(tx.matricula.upsert).toHaveBeenCalledWith({
      where: {
        alunoId_produtoId: {
          alunoId: 'aluno-1',
          produtoId: 'produto-1',
        },
      },
      update: {
        produtoUcode: null,
        produtoNome: 'Curso Garimpo Urbano',
        status: 'ATIVA',
        suspensaEm: null,
        encerradaEm: null,
      },
      create: {
        alunoId: 'aluno-1',
        produtoId: 'produto-1',
        produtoUcode: null,
        produtoNome: 'Curso Garimpo Urbano',
        origem: 'HOTMART',
        status: 'ATIVA',
        concedidaEm: aprovadoEm,
      },
    });

    expect(resultado).toMatchObject({
      alunoId: 'aluno-1',
      matriculaId: 'matricula-existente',
      vigenciaId: 'vigencia-renovacao',
      conviteNovo: false,
    });
  });

  it('não reativa a matrícula ao reprocessar uma compra que já possui vigência', async () => {
    const aprovadoEm = new Date('2027-08-01T12:00:00.000Z');

    const tx = {
      aluno: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'aluno-1',
          nome: 'Aluno Teste',
          leadId: null,
          senhaHash: 'hash-existente',
          status: 'ATIVO',
        }),

        upsert: vi.fn().mockResolvedValue({
          id: 'aluno-1',
          senhaHash: 'hash-existente',
          status: 'ATIVO',
        }),
      },

      matricula: {
        upsert: vi.fn().mockResolvedValue({
          id: 'matricula-1',
        }),
      },

      vigenciaMatricula: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'vigencia-existente',
          matriculaId: 'matricula-1',
          matricula: {
            alunoId: 'aluno-1',
          },
        }),
        findFirst: vi.fn(),
        create: vi.fn(),
      },

      perfilAluno: {
        upsert: vi.fn().mockResolvedValue({}),
      },

      alunoAccessToken: {
        findFirst: vi.fn(),
        create: vi.fn(),
      },
    };

    const resultado = await provisionarAlunoHotmart(tx, {
      email: 'aluno@example.com',
      nome: 'Aluno Teste',
      produtoId: 'produto-1',
      produtoNome: 'Curso Garimpo Urbano',
      transacaoOrigemId: 'transacao-ja-processada',
      aprovadoEm,
    });

    expect(resultado).toMatchObject({
      alunoId: 'aluno-1',
      matriculaId: 'matricula-1',
      vigenciaId: 'vigencia-existente',
      conviteNovo: false,
    });

    expect(tx.aluno.upsert).not.toHaveBeenCalled();
    expect(tx.matricula.upsert).not.toHaveBeenCalled();
    expect(tx.perfilAluno.upsert).not.toHaveBeenCalled();
  });
});
