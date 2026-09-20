// tests/cron-cotacoes-route.test.js

import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

const coletarCotacoesMetaisMock = vi.fn();

const prismaMock = {
  cotacaoMetal: {
    createMany: vi.fn(),
  },
};

vi.mock('@/lib/cotacoes', () => ({
  coletarCotacoesMetais:
    coletarCotacoesMetaisMock,
}));

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));

const { GET } = await import(
  '../src/app/api/cron/atualizar-cotacoes/route.js'
);

function criarRequest(authorization = null) {
  return {
    headers: {
      get: vi.fn((nome) =>
        nome === 'authorization'
          ? authorization
          : null,
      ),
    },
  };
}

describe('GET /api/cron/atualizar-cotacoes', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.CRON_SECRET =
      'segredo-cron-teste';
  });

  it('rejeita chamada sem autenticação', async () => {
    const resposta = await GET(criarRequest());

    expect(resposta.status).toBe(401);

    expect(
      coletarCotacoesMetaisMock,
    ).not.toHaveBeenCalled();
  });

  it('executa a coleta autenticada e retorna o resumo', async () => {
    const coletadoEm =
      new Date('2026-09-18T21:00:00.000Z');

    coletarCotacoesMetaisMock.mockResolvedValue({
      coletaId: 'coleta-route-1',
      coletadoEm,
      registros: [
        {
          metal: 'OURO',
          status: 'SUCESSO',
        },
        {
          metal: 'PRATA',
          status: 'SUCESSO',
        },
        {
          metal: 'PLATINA',
          status: 'SUCESSO',
        },
        {
          metal: 'PALADIO',
          status: 'SUCESSO',
        },
        {
          metal: 'RODIO',
          status: 'INDISPONIVEL',
        },
      ],
      resumo: {
        OURO: 'SUCESSO',
        PRATA: 'SUCESSO',
        PLATINA: 'SUCESSO',
        PALADIO: 'SUCESSO',
        RODIO: 'INDISPONIVEL',
      },
    });

    const resposta = await GET(
      criarRequest(
        'Bearer segredo-cron-teste',
      ),
    );

    const corpo = await resposta.json();

    expect(resposta.status).toBe(200);

    expect(
      coletarCotacoesMetaisMock,
    ).toHaveBeenCalledTimes(1);

    expect(
      coletarCotacoesMetaisMock,
    ).toHaveBeenCalledWith({
      db: prismaMock,
    });

    expect(corpo).toEqual({
      success: true,
      coletaId: 'coleta-route-1',
      coletadoEm:
        '2026-09-18T21:00:00.000Z',
      resumo: {
        OURO: 'SUCESSO',
        PRATA: 'SUCESSO',
        PLATINA: 'SUCESSO',
        PALADIO: 'SUCESSO',
        RODIO: 'INDISPONIVEL',
      },
    });
  });

  it('retorna 503 quando nenhuma cotação útil é obtida', async () => {
    coletarCotacoesMetaisMock.mockResolvedValue({
      coletaId: 'coleta-route-erro',
      coletadoEm:
        new Date('2026-09-18T21:05:00.000Z'),
      registros: [
        {
          metal: 'OURO',
          status: 'ERRO',
        },
        {
          metal: 'PRATA',
          status: 'ERRO',
        },
        {
          metal: 'PLATINA',
          status: 'ERRO',
        },
        {
          metal: 'PALADIO',
          status: 'ERRO',
        },
        {
          metal: 'RODIO',
          status: 'INDISPONIVEL',
        },
      ],
      resumo: {
        OURO: 'ERRO',
        PRATA: 'ERRO',
        PLATINA: 'ERRO',
        PALADIO: 'ERRO',
        RODIO: 'INDISPONIVEL',
      },
    });

    const resposta = await GET(
      criarRequest(
        'Bearer segredo-cron-teste',
      ),
    );

    const corpo = await resposta.json();

    expect(resposta.status).toBe(503);
    expect(corpo.success).toBe(false);

    // Mesmo com falha de mercado, a coleta ocorreu
    // e os estados individuais foram registrados.
    expect(
      coletarCotacoesMetaisMock,
    ).toHaveBeenCalledTimes(1);
  });

  it('retorna 500 quando ocorre falha operacional', async () => {
    coletarCotacoesMetaisMock.mockRejectedValue(
      new Error('Banco indisponível'),
    );

    const resposta = await GET(
      criarRequest(
        'Bearer segredo-cron-teste',
      ),
    );

    const corpo = await resposta.json();

    expect(resposta.status).toBe(500);

    expect(corpo).toEqual({
      success: false,
      error: 'Falha ao atualizar cotações',
    });
  });
});
