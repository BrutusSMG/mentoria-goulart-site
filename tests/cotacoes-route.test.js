// tests/cotacoes-route.test.js

import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

const cotacaoMetalFindFirstMock = vi.fn();
const cotacaoMetalFindManyMock = vi.fn();
const cotacaoHistoricoFindFirstMock = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    cotacaoMetal: {
      findFirst: cotacaoMetalFindFirstMock,
      findMany: cotacaoMetalFindManyMock,
    },
    cotacaoHistorico: {
      findFirst: cotacaoHistoricoFindFirstMock,
    },
  },
}));

const { GET } = await import(
  '../src/app/api/cotacoes/route.js'
);

function registroMetal({
  metal,
  status = 'SUCESSO',
  valorOriginal,
  valorBrlGrama,
  fonte = 'Yahoo Finance',
  erro = null,
}) {
  return {
    id: `id-${metal}`,
    coletaId: 'coleta-api-1',
    metal,
    valorOriginal,
    unidadeOriginal:
      valorOriginal == null
        ? null
        : 'onca_troy',
    moedaOriginal:
      valorOriginal == null
        ? null
        : 'USD',
    dolarBrl: 5.1402,
    valorBrlGrama,
    fonte,
    fonteDolar: 'Yahoo Finance',
    referenciaEm:
      valorOriginal == null
        ? null
        : new Date('2026-09-18T20:59:55.000Z'),
    coletadoEm:
      new Date('2026-09-18T21:09:59.025Z'),
    status,
    erro,
    createdAt:
      new Date('2026-09-18T21:09:59.025Z'),
  };
}

describe('GET /api/cotacoes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna somente o lote consolidado mais recente', async () => {
    cotacaoMetalFindFirstMock.mockResolvedValue({
      coletaId: 'coleta-api-1',
    });

    cotacaoMetalFindManyMock.mockResolvedValue([
      registroMetal({
        metal: 'OURO',
        valorOriginal: 4416.3,
        valorBrlGrama: 729.843336,
      }),
      registroMetal({
        metal: 'PRATA',
        valorOriginal: 66.78,
        valorBrlGrama: 11.036147,
      }),
      registroMetal({
        metal: 'PLATINA',
        valorOriginal: 1804.7,
        valorBrlGrama: 298.247009,
      }),
      registroMetal({
        metal: 'PALADIO',
        valorOriginal: 1314.5,
        valorBrlGrama: 217.235936,
      }),
      registroMetal({
        metal: 'RODIO',
        status: 'INDISPONIVEL',
        valorOriginal: null,
        valorBrlGrama: null,
        fonte: 'GoldAPI',
        erro:
          'Ródio indisponível na fonte atualmente configurada',
      }),
    ]);

    const resposta = await GET();
    const corpo = await resposta.json();

    expect(resposta.status).toBe(200);

    expect(
      cotacaoMetalFindManyMock,
    ).toHaveBeenCalledWith({
      where: {
        coletaId: 'coleta-api-1',
      },
      orderBy: {
        metal: 'asc',
      },
    });

    expect(
      cotacaoHistoricoFindFirstMock,
    ).not.toHaveBeenCalled();

    expect(corpo.origem).toBe('CONSOLIDADA');
    expect(corpo.coletaId).toBe('coleta-api-1');
    expect(corpo.dolarBrl).toBe(5.1402);

    expect(corpo.metais.ouro).toMatchObject({
      status: 'SUCESSO',
      valorOriginal: 4416.3,
      valorBrlGrama: 729.843336,
      unidadeOriginal: 'onca_troy',
      moedaOriginal: 'USD',
      fonte: 'Yahoo Finance',
    });

    expect(corpo.metais.rodio).toMatchObject({
      status: 'INDISPONIVEL',
      valorOriginal: null,
      valorBrlGrama: null,
      fonte: 'GoldAPI',
    });

    // Compatibilidade temporária com a home antiga.
    expect(corpo.ouro).toBe(4416.3);
    expect(corpo.prata).toBe(66.78);
    expect(corpo.rodio).toBeNull();
    expect(corpo.dolar).toBe(5.1402);
  });

  it('não mistura registros de coletas diferentes', async () => {
    cotacaoMetalFindFirstMock.mockResolvedValue({
      coletaId: 'coleta-mais-recente',
    });

    cotacaoMetalFindManyMock.mockResolvedValue([]);

    cotacaoHistoricoFindFirstMock.mockResolvedValue(null);

    await GET();

    expect(
      cotacaoMetalFindManyMock,
    ).toHaveBeenCalledWith({
      where: {
        coletaId: 'coleta-mais-recente',
      },
      orderBy: {
        metal: 'asc',
      },
    });
  });

  it('usa legado explicitamente quando ainda não existe CotacaoMetal', async () => {
    cotacaoMetalFindFirstMock.mockResolvedValue(null);

    cotacaoHistoricoFindFirstMock.mockResolvedValue({
      dolar: 5.1917,
      ouro: 4474.3,
      prata: 66.36,
      platina: 1787.8,
      paladio: 1337,
      rodio: null,
      criadoEm:
        new Date('2026-08-17T15:05:36.307Z'),
    });

    const resposta = await GET();
    const corpo = await resposta.json();

    expect(resposta.status).toBe(200);
    expect(corpo.origem).toBe('LEGADO');
    expect(corpo.coletaId).toBeNull();
    expect(corpo.metais.ouro).toBeNull();
    expect(corpo.metais.rodio).toBeNull();

    expect(corpo).toMatchObject({
      dolar: 5.1917,
      ouro: 4474.3,
      prata: 66.36,
      platina: 1787.8,
      paladio: 1337,
      rodio: null,
    });
  });

  it('retorna SEM_DADOS quando os dois modelos estão vazios', async () => {
    cotacaoMetalFindFirstMock.mockResolvedValue(null);
    cotacaoHistoricoFindFirstMock.mockResolvedValue(null);

    const resposta = await GET();
    const corpo = await resposta.json();

    expect(resposta.status).toBe(200);

    expect(corpo).toEqual({
      origem: 'SEM_DADOS',
      coletaId: null,
      atualizadoEm: null,
      dolarBrl: null,
      metais: {
        ouro: null,
        prata: null,
        platina: null,
        paladio: null,
        rodio: null,
      },
      ouro: null,
      prata: null,
      platina: null,
      paladio: null,
      rodio: null,
      dolar: null,
    });
  });

  it('retorna 503 sem vazar detalhes de erro operacional', async () => {
    cotacaoMetalFindFirstMock.mockRejectedValue(
      new Error('Falha interna do banco'),
    );

    const resposta = await GET();
    const corpo = await resposta.json();

    expect(resposta.status).toBe(503);
    expect(corpo.origem).toBe('SEM_DADOS');

    expect(
      JSON.stringify(corpo),
    ).not.toContain('Falha interna do banco');
  });
});
