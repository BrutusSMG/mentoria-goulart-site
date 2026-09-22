import { describe, expect, it, vi } from 'vitest';

import { criarAlunoLegado } from
  '../src/lib/criar-aluno-legado';

const AGORA = new Date('2026-09-22T18:00:00.000Z');

function criarTx({ cadastroExistente = false } = {}) {
  const findFirst = vi.fn().mockResolvedValue(
    cadastroExistente ? { id: 'existente-1' } : null,
  );

  return {
    pessoa: {
      findFirst,
      create: vi.fn().mockResolvedValue({
        id: 'pessoa-1',
      }),
    },
    aluno: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({
        id: 'aluno-1',
      }),
    },
    lead: {
      findFirst: vi.fn().mockResolvedValue(null),
    },
    adminUser: {
      findFirst: vi.fn().mockResolvedValue(null),
    },
    produto: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 'curso-1',
          nome: 'Curso legado',
          tipo: 'CURSO',
          ativo: true,
          direitos: [
            {
              id: 'direito-1',
              tipo: 'CONTEUDO_PRODUTO',
              nivel: null,
            },
          ],
        },
      ]),
    },
    perfilAluno: {
      create: vi.fn().mockResolvedValue({
        id: 'perfil-1',
      }),
    },
    matricula: {
      create: vi.fn().mockResolvedValue({
        id: 'matricula-1',
      }),
    },
    vigenciaMatricula: {
      create: vi.fn().mockResolvedValue({
        id: 'vigencia-1',
      }),
    },
    direitoConcedido: {
      create: vi.fn().mockResolvedValue({
        id: 'concessao-1',
      }),
    },
  };
}

function dadosLegado(tipoDuracao, dataFimOriginal) {
  return {
    nome: ' Aluno Fictício ',
    email: ' FICTICIO@EXAMPLE.TEST ',
    produtoIds: ['curso-1'],
    vigencias: [{
      produtoId: 'curso-1',
      tipoDuracao,
      ...(dataFimOriginal
        ? { dataFimOriginal }
        : {}),
    }],
  };
}

describe('criarAlunoLegado', () => {
  it('cria aluno novo com acesso dentro do prazo original', async () => {
    const tx = criarTx();

    const resultado = await criarAlunoLegado(
      tx,
      dadosLegado('DEFINIDA', '2027-10-31'),
      AGORA,
    );

    expect(tx.pessoa.create).toHaveBeenCalledWith({
      data: {
        nome: 'Aluno Fictício',
        emailPrincipal: 'ficticio@example.test',
        telefonePrincipal: null,
      },
    });

    expect(tx.aluno.create).toHaveBeenCalledWith({
      data: {
        nome: 'Aluno Fictício',
        email: 'ficticio@example.test',
        whatsapp: null,
        origem: 'LEGADO',
        status: 'ATIVO',
        pessoaId: 'pessoa-1',
      },
    });

    expect(
      tx.direitoConcedido.create,
    ).toHaveBeenCalledTimes(1);

    expect(resultado.convite).toBe('PENDENTE');

    expect(resultado.produtos[0].expiraEm).toEqual(
      new Date('2027-11-01T03:00:00.000Z'),
    );
  });

  it('registra prazo encerrado sem conceder acesso ativo', async () => {
    const tx = criarTx();

    const resultado = await criarAlunoLegado(
      tx,
      dadosLegado('DEFINIDA', '2024-01-15'),
      AGORA,
    );

    expect(resultado.produtos[0].status).toBe(
      'ENCERRADA',
    );

    expect(
      tx.vigenciaMatricula.create,
    ).toHaveBeenCalledWith({
      data: expect.objectContaining({
        status: 'ENCERRADA',
        tipoDuracao: 'DEFINIDA',
      }),
    });

    expect(
      tx.direitoConcedido.create,
    ).not.toHaveBeenCalled();
  });

  it('interrompe o cadastro se a identidade já existir', async () => {
    const tx = criarTx({
      cadastroExistente: true,
    });

    await expect(
      criarAlunoLegado(
        tx,
        dadosLegado('VITALICIA'),
        AGORA,
      ),
    ).rejects.toThrow(
      'É necessária uma conferência',
    );

    expect(tx.pessoa.create).not.toHaveBeenCalled();
    expect(tx.aluno.create).not.toHaveBeenCalled();

    expect(
      tx.direitoConcedido.create,
    ).not.toHaveBeenCalled();
  });

  it('não grava registros se o produto estiver sem direitos', async () => {
    const tx = criarTx();

    tx.produto.findMany.mockResolvedValue([
      {
        id: 'curso-1',
        nome: 'Curso legado',
        tipo: 'CURSO',
        ativo: true,
        direitos: [],
      },
    ]);

    await expect(
      criarAlunoLegado(
        tx,
        dadosLegado('INDEFINIDA'),
        AGORA,
      ),
    ).rejects.toThrow(
      'Produto sem direitos ativos configurados',
    );

    expect(tx.pessoa.create).not.toHaveBeenCalled();
    expect(tx.aluno.create).not.toHaveBeenCalled();
  });

  it('concede acesso ao eBook legado sem criar matrícula', async () => {
    const tx = criarTx();

    tx.produto.findMany.mockResolvedValue([
      {
        id: 'ebook-1',
        nome: 'eBook legado',
        tipo: 'EBOOK',
        ativo: true,
        direitos: [
          {
            id: 'direito-ebook-1',
            tipo: 'CONTEUDO_PRODUTO',
            nivel: null,
          },
        ],
      },
    ]);

    const resultado = await criarAlunoLegado(
      tx,
      {
        nome: 'Aluno Fictício',
        email: 'ebook-legado@example.test',
        produtoIds: ['ebook-1'],
        vigencias: [
          {
            produtoId: 'ebook-1',
            tipoDuracao: 'VITALICIA',
          },
        ],
      },
      AGORA,
    );

    expect(tx.matricula.create).not.toHaveBeenCalled();

    expect(
      tx.vigenciaMatricula.create,
    ).not.toHaveBeenCalled();

    expect(
      tx.direitoConcedido.create,
    ).toHaveBeenCalledWith({
      data: expect.objectContaining({
        alunoId: 'aluno-1',
        produtoDireitoId: 'direito-ebook-1',
        origem: 'LEGADO',
        status: 'ATIVO',
        expiraEm: null,
      }),
    });

    expect(resultado.produtos).toEqual([
      expect.objectContaining({
        produtoId: 'ebook-1',
        matriculaId: null,
        tipoDuracao: 'VITALICIA',
        status: 'ATIVA',
      }),
    ]);
  });
});
