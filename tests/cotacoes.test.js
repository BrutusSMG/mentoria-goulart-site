// tests/cotacoes.test.js

import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  GRAMAS_POR_ONCA_TROY,
  coletarCotacoesMetais,
  converterUsdOzTroyParaBrlGrama,
} from '@/lib/cotacoes';

const PRECOS = {
  'BRL=X': 5.1624,
  'GC=F': 4391.2,
  'SI=F': 66.89,
  'PL=F': 1801.9,
  'PA=F': 1316.5,
};

const REFERENCIA_UNIX = 1789696000;

function respostaYahoo(preco, timestamp = REFERENCIA_UNIX) {
  return {
    chart: {
      result: [
        {
          meta: {
            regularMarketPrice: preco,
            regularMarketTime: timestamp,
          },
        },
      ],
      error: null,
    },
  };
}

function criarFetchYahoo({
  falhasHttp = {},
  payloads = {},
} = {}) {
  return vi.fn(async (url) => {
    const ticker = decodeURIComponent(
      String(url).split('/').pop(),
    );

    if (falhasHttp[ticker]) {
      return {
        ok: false,
        status: falhasHttp[ticker],
        json: vi.fn(),
      };
    }

    const payload =
      payloads[ticker]
      ?? respostaYahoo(PRECOS[ticker]);

    return {
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(payload),
    };
  });
}

function criarDb() {
  return {
    cotacaoMetal: {
      createMany: vi.fn().mockResolvedValue({
        count: 5,
      }),
    },
  };
}

describe('converterUsdOzTroyParaBrlGrama', () => {
  it('converte USD por onça troy para BRL por grama', () => {
    const resultado =
      converterUsdOzTroyParaBrlGrama(
        4391.2,
        5.1624,
      );

    expect(resultado).toBeCloseTo(
      (4391.2 * 5.1624) / GRAMAS_POR_ONCA_TROY,
      8,
    );
  });

  it('retorna null para valores inválidos', () => {
    expect(
      converterUsdOzTroyParaBrlGrama(null, 5),
    ).toBeNull();

    expect(
      converterUsdOzTroyParaBrlGrama(1000, 0),
    ).toBeNull();

    expect(
      converterUsdOzTroyParaBrlGrama('erro', 5),
    ).toBeNull();
  });
});

describe('coletarCotacoesMetais', () => {
  it('grava quatro metais com sucesso e ródio indisponível', async () => {
    const fetchImpl = criarFetchYahoo();
    const db = criarDb();

    const coletadoEm =
      new Date('2026-09-18T20:00:00.000Z');

    const resultado = await coletarCotacoesMetais({
      db,
      fetchImpl,
      coletaId: 'coleta-teste-1',
      coletadoEm,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(5);

    expect(
      fetchImpl.mock.calls.every(([url]) =>
        String(url).startsWith(
          'https://query1.finance.yahoo.com/',
        ),
      ),
    ).toBe(true);

    expect(
      db.cotacaoMetal.createMany,
    ).toHaveBeenCalledTimes(1);

    const dados =
      db.cotacaoMetal.createMany.mock.calls[0][0].data;

    expect(dados).toHaveLength(5);

    expect(
      dados.every(
        (registro) =>
          registro.coletaId === 'coleta-teste-1'
          && registro.coletadoEm === coletadoEm,
      ),
    ).toBe(true);

    const ouro = dados.find(
      (registro) => registro.metal === 'OURO',
    );

    expect(ouro).toMatchObject({
      metal: 'OURO',
      valorOriginal: 4391.2,
      unidadeOriginal: 'onca_troy',
      moedaOriginal: 'USD',
      dolarBrl: 5.1624,
      fonte: 'Yahoo Finance',
      fonteDolar: 'Yahoo Finance',
      status: 'SUCESSO',
      erro: null,
    });

    expect(ouro.valorBrlGrama).toBeCloseTo(
      (4391.2 * 5.1624) / GRAMAS_POR_ONCA_TROY,
      8,
    );

    expect(ouro.referenciaEm).toEqual(
      new Date(REFERENCIA_UNIX * 1000),
    );

    const rodio = dados.find(
      (registro) => registro.metal === 'RODIO',
    );

    expect(rodio).toMatchObject({
      metal: 'RODIO',
      valorOriginal: null,
      unidadeOriginal: null,
      moedaOriginal: null,
      dolarBrl: 5.1624,
      valorBrlGrama: null,
      fonte: 'GoldAPI',
      fonteDolar: 'Yahoo Finance',
      referenciaEm: null,
      status: 'INDISPONIVEL',
    });

    expect(rodio.erro).toContain(
      'Ródio indisponível',
    );

    expect(resultado.resumo).toEqual({
      OURO: 'SUCESSO',
      PRATA: 'SUCESSO',
      PLATINA: 'SUCESSO',
      PALADIO: 'SUCESSO',
      RODIO: 'INDISPONIVEL',
    });
  });

  it('não derruba a coleta quando um metal falha', async () => {
    const fetchImpl = criarFetchYahoo({
      falhasHttp: {
        'PL=F': 503,
      },
    });

    const db = criarDb();

    await coletarCotacoesMetais({
      db,
      fetchImpl,
      coletaId: 'coleta-teste-2',
      coletadoEm:
        new Date('2026-09-18T20:05:00.000Z'),
    });

    const dados =
      db.cotacaoMetal.createMany.mock.calls[0][0].data;

    const platina = dados.find(
      (registro) => registro.metal === 'PLATINA',
    );

    expect(platina).toMatchObject({
      metal: 'PLATINA',
      valorOriginal: null,
      valorBrlGrama: null,
      dolarBrl: 5.1624,
      status: 'ERRO',
    });

    expect(platina.erro).toContain('HTTP 503');

    expect(
      dados.find((r) => r.metal === 'OURO').status,
    ).toBe('SUCESSO');

    expect(
      dados.find((r) => r.metal === 'PRATA').status,
    ).toBe('SUCESSO');

    expect(
      dados.find((r) => r.metal === 'PALADIO').status,
    ).toBe('SUCESSO');

    expect(
      dados.find((r) => r.metal === 'RODIO').status,
    ).toBe('INDISPONIVEL');
  });

  it('preserva a cotação original como PARCIAL quando o dólar falha', async () => {
    const fetchImpl = criarFetchYahoo({
      falhasHttp: {
        'BRL=X': 503,
      },
    });

    const db = criarDb();

    await coletarCotacoesMetais({
      db,
      fetchImpl,
      coletaId: 'coleta-teste-3',
      coletadoEm:
        new Date('2026-09-18T20:10:00.000Z'),
    });

    const dados =
      db.cotacaoMetal.createMany.mock.calls[0][0].data;

    for (
      const metal of [
        'OURO',
        'PRATA',
        'PLATINA',
        'PALADIO',
      ]
    ) {
      const registro = dados.find(
        (item) => item.metal === metal,
      );

      expect(registro.status).toBe('PARCIAL');
      expect(registro.valorOriginal).not.toBeNull();
      expect(registro.dolarBrl).toBeNull();
      expect(registro.valorBrlGrama).toBeNull();
      expect(registro.erro).toContain(
        'dólar está indisponível',
      );
    }

    const rodio = dados.find(
      (registro) => registro.metal === 'RODIO',
    );

    expect(rodio.status).toBe('INDISPONIVEL');
    expect(rodio.dolarBrl).toBeNull();
  });

  it('registra erro quando Yahoo responde sem preço válido', async () => {
    const fetchImpl = criarFetchYahoo({
      payloads: {
        'SI=F': {
          chart: {
            result: [
              {
                meta: {
                  regularMarketTime:
                    REFERENCIA_UNIX,
                },
              },
            ],
            error: null,
          },
        },
      },
    });

    const db = criarDb();

    await coletarCotacoesMetais({
      db,
      fetchImpl,
      coletaId: 'coleta-teste-4',
      coletadoEm:
        new Date('2026-09-18T20:15:00.000Z'),
    });

    const dados =
      db.cotacaoMetal.createMany.mock.calls[0][0].data;

    const prata = dados.find(
      (registro) => registro.metal === 'PRATA',
    );

    expect(prata.status).toBe('ERRO');
    expect(prata.valorOriginal).toBeNull();
    expect(prata.valorBrlGrama).toBeNull();
    expect(prata.erro).toContain(
      'não retornou preço válido',
    );
  });
});
