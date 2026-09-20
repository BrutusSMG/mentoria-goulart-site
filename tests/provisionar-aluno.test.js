import { describe, expect, it, vi } from 'vitest';

import {
  garantirContaHotmart,
  provisionarAlunoHotmart,
} from '../src/lib/provisionar-aluno';

describe('garantirContaHotmart', () => {
  it('cria ou reutiliza conta sem criar matricula, vigencia ou convite', async () => {
    const tx = {
      aluno: {
        findUnique: vi.fn().mockResolvedValue(null),
        upsert: vi.fn().mockResolvedValue({
          id: 'conta-ebook',
          email: 'ebook@example.com',
          status: 'ATIVO',
        }),
      },
      matricula: {
        upsert: vi.fn(),
      },
      vigenciaMatricula: {
        create: vi.fn(),
      },
      alunoAccessToken: {
        create: vi.fn(),
      },
    };

    const resultado = await garantirContaHotmart(tx, {
      leadId: 'lead-ebook',
      email: ' EBOOK@example.com ',
      nome: 'Comprador Ebook',
      whatsapp: '41999999999',
    });

    expect(tx.aluno.findUnique).toHaveBeenCalledWith({
      where: {
        email: 'ebook@example.com',
      },
      select: {
        id: true,
        nome: true,
        leadId: true,
        senhaHash: true,
        status: true,
      },
    });

    expect(tx.aluno.upsert).toHaveBeenCalledWith({
      where: {
        email: 'ebook@example.com',
      },
      update: {
        nome: 'Comprador Ebook',
        whatsapp: '41999999999',
        leadId: 'lead-ebook',
        status: 'ATIVO',
        origem: 'HOTMART',
      },
      create: {
        leadId: 'lead-ebook',
        nome: 'Comprador Ebook',
        email: 'ebook@example.com',
        whatsapp: '41999999999',
        status: 'ATIVO',
        origem: 'HOTMART',
      },
    });

    expect(resultado).toEqual({
      id: 'conta-ebook',
      email: 'ebook@example.com',
      status: 'ATIVO',
    });

    expect(tx.matricula.upsert).not.toHaveBeenCalled();
    expect(tx.vigenciaMatricula.create).not.toHaveBeenCalled();
    expect(tx.alunoAccessToken.create).not.toHaveBeenCalled();
  });

  it('preserva conta suspensa em nova compra', async () => {
    const tx = {
      aluno: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'conta-suspensa',
          nome: 'Comprador',
          leadId: null,
          senhaHash: 'hash',
          status: 'SUSPENSO',
        }),
        upsert: vi.fn().mockResolvedValue({
          id: 'conta-suspensa',
          status: 'SUSPENSO',
        }),
      },
    };

    await garantirContaHotmart(tx, {
      email: 'comprador@example.com',
      nome: 'Comprador',
    });

    expect(tx.aluno.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          status: 'SUSPENSO',
        }),
      }),
    );
  });
});

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

  it('provisiona a primeira compra com aluno, matrícula, vigência, perfil e convite', async () => {
    const aprovadoEm = new Date('2027-01-10T12:00:00.000Z');

    const tx = {
      aluno: {
        findUnique: vi.fn().mockResolvedValue(null),
        upsert: vi.fn().mockResolvedValue({
          id: 'aluno-novo',
          nome: 'Aluno Novo',
          leadId: null,
          senhaHash: null,
          status: 'ATIVO',
        }),
      },

      matricula: {
        upsert: vi.fn().mockResolvedValue({
          id: 'matricula-nova',
        }),
      },

      vigenciaMatricula: {
        findUnique: vi.fn().mockResolvedValue(null),
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({
          id: 'vigencia-nova',
        }),
      },

      perfilAluno: {
        upsert: vi.fn().mockResolvedValue({}),
      },

      alunoAccessToken: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({
          id: 'token-1',
        }),
      },
    };

    const resultado = await provisionarAlunoHotmart(tx, {
      email: ' NOVO@example.com ',
      nome: 'Aluno Novo',
      produtoId: ' produto-1 ',
      produtoNome: 'Curso Garimpo Urbano',
      transacaoOrigemId: 'transacao-primeira-compra',
      aprovadoEm,
    });

    expect(tx.aluno.upsert).toHaveBeenCalled();

    expect(tx.matricula.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          alunoId_produtoId: {
            alunoId: 'aluno-novo',
            produtoId: 'produto-1',
          },
        },
        create: expect.objectContaining({
          alunoId: 'aluno-novo',
          produtoId: 'produto-1',
          status: 'ATIVA',
          concedidaEm: aprovadoEm,
        }),
      }),
    );

    expect(tx.vigenciaMatricula.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          matriculaId: 'matricula-nova',
          transacaoOrigemId: 'transacao-primeira-compra',
          status: 'ATIVA',
          iniciaEm: aprovadoEm,
        }),
      }),
    );

    expect(tx.perfilAluno.upsert).toHaveBeenCalledWith({
      where: {
        alunoId: 'aluno-novo',
      },
      update: {},
      create: {
        alunoId: 'aluno-novo',
      },
    });

    expect(tx.alunoAccessToken.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        alunoId: 'aluno-novo',
        tokenHash: expect.any(String),
        expiraEm: expect.any(Date),
      }),
    });

    expect(resultado).toMatchObject({
      alunoId: 'aluno-novo',
      matriculaId: 'matricula-nova',
      vigenciaId: 'vigencia-nova',
      conviteNovo: true,
    });

    expect(resultado.conviteToken).toEqual(expect.any(String));
  });
});
