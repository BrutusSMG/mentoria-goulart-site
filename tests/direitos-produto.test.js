import { describe, expect, it, vi } from 'vitest';

import {
  alunoPodeAcessarProduto,
  alunoTemAcessoComunidade,
  concederDireitosProdutoHotmart,
  direitoConcedidoValido,
  maiorNivelEcossistema,
  nivelAcessoEcossistema,
  revogarDireitosPorTransacao,
} from '../src/lib/direitos-produto';

describe('direitoConcedidoValido', () => {
  const agora = new Date('2026-09-15T12:00:00.000Z');

  it('permite concessao ativa dentro da vigencia', () => {
    expect(
      direitoConcedidoValido(
        {
          status: 'ATIVO',
          iniciaEm: new Date('2026-09-01T12:00:00.000Z'),
          expiraEm: new Date('2026-10-01T12:00:00.000Z'),
        },
        agora,
      ),
    ).toBe(true);
  });

  it('nega concessao revogada', () => {
    expect(
      direitoConcedidoValido(
        {
          status: 'REVOGADO',
          iniciaEm: new Date('2026-09-01T12:00:00.000Z'),
          expiraEm: null,
        },
        agora,
      ),
    ).toBe(false);
  });

  it('nega concessao antes do inicio', () => {
    expect(
      direitoConcedidoValido(
        {
          status: 'ATIVO',
          iniciaEm: new Date('2026-09-16T12:00:00.000Z'),
          expiraEm: null,
        },
        agora,
      ),
    ).toBe(false);
  });

  it('nega concessao exatamente na expiracao', () => {
    expect(
      direitoConcedidoValido(
        {
          status: 'ATIVO',
          iniciaEm: new Date('2026-09-01T12:00:00.000Z'),
          expiraEm: agora,
        },
        agora,
      ),
    ).toBe(false);
  });
});

describe('maiorNivelEcossistema', () => {
  it('retorna o maior nivel acumulado', () => {
    expect(
      maiorNivelEcossistema([
        'BASICO',
        'PREMIUM',
        'COMPLETO',
      ]),
    ).toBe('PREMIUM');
  });

  it('retorna NENHUM quando nao ha nivel valido', () => {
    expect(maiorNivelEcossistema([])).toBe('NENHUM');
    expect(maiorNivelEcossistema([null, 'INVALIDO'])).toBe(
      'NENHUM',
    );
  });
});

describe('concederDireitosProdutoHotmart', () => {
  it('concede todos os direitos ativos do produto com idempotencia por transacao', async () => {
    const concedidoEm = new Date('2026-09-15T12:00:00.000Z');

    const tx = {
      produtoDireito: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'direito-comunidade',
            tipo: 'COMUNIDADE',
            nivel: null,
          },
          {
            id: 'direito-eco',
            tipo: 'ECOSSISTEMA',
            nivel: 'BASICO',
          },
        ]),
      },
      direitoConcedido: {
        upsert: vi.fn().mockImplementation(
          async ({ create }) => ({
            id: `concessao-${create.produtoDireitoId}`,
            ...create,
          }),
        ),
      },
    };

    const resultado = await concederDireitosProdutoHotmart(
      tx,
      {
        alunoId: 'aluno-1',
        produtoId: 'produto-1',
        transacaoOrigemId: 'transacao-1',
        concedidoEm,
      },
    );

    expect(tx.produtoDireito.findMany).toHaveBeenCalledWith({
      where: {
        produtoId: 'produto-1',
        ativo: true,
      },
      orderBy: {
        id: 'asc',
      },
      select: {
        id: true,
        tipo: true,
        nivel: true,
      },
    });

    expect(tx.direitoConcedido.upsert).toHaveBeenCalledTimes(2);

    expect(
      tx.direitoConcedido.upsert.mock.calls[0][0],
    ).toMatchObject({
      where: {
        produtoDireitoId_transacaoOrigemId: {
          produtoDireitoId: 'direito-comunidade',
          transacaoOrigemId: 'transacao-1',
        },
      },
      update: {},
      create: {
        alunoId: 'aluno-1',
        produtoDireitoId: 'direito-comunidade',
        transacaoOrigemId: 'transacao-1',
        origem: 'HOTMART',
        status: 'ATIVO',
        concedidoEm,
        iniciaEm: concedidoEm,
        expiraEm: null,
      },
    });

    expect(resultado).toHaveLength(2);
  });

  it('rejeita ProdutoDireito ECOSSISTEMA sem nivel valido', async () => {
    const tx = {
      produtoDireito: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'direito-invalido',
            tipo: 'ECOSSISTEMA',
            nivel: null,
          },
        ]),
      },
      direitoConcedido: {
        upsert: vi.fn(),
      },
    };

    await expect(
      concederDireitosProdutoHotmart(tx, {
        alunoId: 'aluno-1',
        produtoId: 'produto-1',
        transacaoOrigemId: 'transacao-1',
        concedidoEm: new Date('2026-09-15T12:00:00.000Z'),
      }),
    ).rejects.toThrow('Nivel de ECOSSISTEMA invalido');

    expect(tx.direitoConcedido.upsert).not.toHaveBeenCalled();
  });
});

describe('consultas de direitos', () => {
  const agora = new Date('2026-09-15T12:00:00.000Z');

  it('permite comunidade quando existe concessao valida', async () => {
    const db = {
      direitoConcedido: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'concessao-1',
        }),
      },
    };

    await expect(
      alunoTemAcessoComunidade('aluno-1', agora, db),
    ).resolves.toBe(true);

    expect(db.direitoConcedido.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          alunoId: 'aluno-1',
          status: 'ATIVO',
          aluno: {
            status: 'ATIVO',
          },
          produtoDireito: {
            ativo: true,
            tipo: 'COMUNIDADE',
          },
        }),
      }),
    );
  });

  it('restringe conteudo ao produto correspondente', async () => {
    const db = {
      direitoConcedido: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'concessao-produto',
        }),
      },
    };

    await expect(
      alunoPodeAcessarProduto(
        'aluno-1',
        'produto-2',
        agora,
        db,
      ),
    ).resolves.toBe(true);

    expect(db.direitoConcedido.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          produtoDireito: {
            ativo: true,
            tipo: 'CONTEUDO_PRODUTO',
            produtoId: 'produto-2',
          },
        }),
      }),
    );
  });

  it('calcula maior nivel EcoMGU entre concessoes validas', async () => {
    const db = {
      direitoConcedido: {
        findMany: vi.fn().mockResolvedValue([
          {
            produtoDireito: {
              nivel: 'BASICO',
            },
          },
          {
            produtoDireito: {
              nivel: 'COMPLETO',
            },
          },
          {
            produtoDireito: {
              nivel: 'PREMIUM',
            },
          },
        ]),
      },
    };

    await expect(
      nivelAcessoEcossistema('aluno-1', agora, db),
    ).resolves.toBe('PREMIUM');

    expect(db.direitoConcedido.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          alunoId: 'aluno-1',
          status: 'ATIVO',
          produtoDireito: {
            ativo: true,
            tipo: 'ECOSSISTEMA',
          },
        }),
      }),
    );
  });

  it('retorna NENHUM sem identidade de conta', async () => {
    const db = {
      direitoConcedido: {
        findMany: vi.fn(),
      },
    };

    await expect(
      nivelAcessoEcossistema('', agora, db),
    ).resolves.toBe('NENHUM');

    expect(db.direitoConcedido.findMany).not.toHaveBeenCalled();
  });
});

describe('revogarDireitosPorTransacao', () => {
  it('revoga apenas concessoes da transacao informada', async () => {
    const revogadoEm = new Date('2026-09-15T18:00:00.000Z');

    const tx = {
      direitoConcedido: {
        updateMany: vi.fn().mockResolvedValue({
          count: 4,
        }),
      },
    };

    await expect(
      revogarDireitosPorTransacao(tx, {
        transacaoOrigemId: 'transacao-1',
        revogadoEm,
      }),
    ).resolves.toEqual({
      count: 4,
    });

    expect(tx.direitoConcedido.updateMany).toHaveBeenCalledWith({
      where: {
        transacaoOrigemId: 'transacao-1',
        status: {
          not: 'REVOGADO',
        },
      },
      data: {
        status: 'REVOGADO',
        revogadoEm,
        statusAlteradoEm: revogadoEm,
      },
    });
  });
});
