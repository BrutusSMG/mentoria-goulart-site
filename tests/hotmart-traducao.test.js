import { describe, expect, it } from 'vitest';
import {
  decidirConsolidacaoFinanceiraHotmart,
  EFEITO_DIREITO_HOTMART,
  EVENTOS_TERMINAIS_DIREITO_HOTMART,
  STATUS_HOTMART_CONFLITO_TEMPORAL,
  traduzirEventoHotmart,
} from '../src/lib/hotmart-traducao';

describe('hotmart-traducao', () => {
  it.each([
    [
      'PURCHASE_BILLET_PRINTED',
      'BILLET_PRINTED',
      EFEITO_DIREITO_HOTMART.NENHUM,
      false,
    ],
    [
      'PURCHASE_APPROVED',
      'APPROVED',
      EFEITO_DIREITO_HOTMART.GARANTIR,
      false,
    ],
    [
      'PURCHASE_COMPLETE',
      'COMPLETED',
      EFEITO_DIREITO_HOTMART.GARANTIR,
      false,
    ],
    [
      'PURCHASE_CANCELED',
      'CANCELED',
      EFEITO_DIREITO_HOTMART.NENHUM,
      false,
    ],
    [
      'PURCHASE_REFUNDED',
      'REFUNDED',
      EFEITO_DIREITO_HOTMART.REVOGAR,
      true,
    ],
    [
      'PURCHASE_CHARGEBACK',
      'CHARGEBACK',
      EFEITO_DIREITO_HOTMART.REVOGAR,
      true,
    ],
  ])(
    'traduz %s para a classificação interna esperada',
    (evento, estadoFinanceiro, efeitoDireito, terminalDireito) => {
      expect(traduzirEventoHotmart(evento)).toEqual({
        conhecido: true,
        estadoFinanceiro,
        efeitoDireito,
        terminalDireito,
      });
    },
  );

  it('usa comportamento seguro para evento não mapeado', () => {
    expect(traduzirEventoHotmart('EVENTO_FUTURO_DESCONHECIDO')).toEqual({
      conhecido: false,
      estadoFinanceiro: null,
      efeitoDireito: EFEITO_DIREITO_HOTMART.NENHUM,
      terminalDireito: false,
    });
  });

  it('expõe somente os eventos terminais do direito', () => {
    expect(EVENTOS_TERMINAIS_DIREITO_HOTMART).toEqual([
      'PURCHASE_REFUNDED',
      'PURCHASE_CHARGEBACK',
    ]);
  });
});

describe('decidirConsolidacaoFinanceiraHotmart', () => {
  it('consolida o primeiro evento conhecido da transação', () => {
    const criadoNaHotmartEm = new Date('2026-09-11T12:00:00.000Z');
    const traducaoEvento = traduzirEventoHotmart('PURCHASE_APPROVED');

    expect(
      decidirConsolidacaoFinanceiraHotmart({
        traducaoEvento,
        hotmartEventId: 'evt-approved',
        criadoNaHotmartEm,
      }),
    ).toEqual({
      deveAtualizar: true,
      status: 'APPROVED',
      ultimoEventoHotmartEm: criadoNaHotmartEm,
      ultimoEventoHotmartId: 'evt-approved',
    });
  });

  it('aceita evento financeiro posterior', () => {
    const novaData = new Date('2026-09-11T13:00:00.000Z');

    expect(
      decidirConsolidacaoFinanceiraHotmart({
        traducaoEvento: traduzirEventoHotmart('PURCHASE_COMPLETE'),
        hotmartEventId: 'evt-complete',
        criadoNaHotmartEm: novaData,
        transacaoAtual: {
          status: 'APPROVED',
          ultimoEventoHotmartEm: new Date('2026-09-11T12:00:00.000Z'),
          ultimoEventoHotmartId: 'evt-approved',
        },
      }),
    ).toEqual({
      deveAtualizar: true,
      status: 'COMPLETED',
      ultimoEventoHotmartEm: novaData,
      ultimoEventoHotmartId: 'evt-complete',
    });
  });

  it('não permite que evento antigo regrida o estado consolidado', () => {
    expect(
      decidirConsolidacaoFinanceiraHotmart({
        traducaoEvento: traduzirEventoHotmart('PURCHASE_APPROVED'),
        hotmartEventId: 'evt-approved-antigo',
        criadoNaHotmartEm: new Date('2026-09-11T12:00:00.000Z'),
        transacaoAtual: {
          status: 'COMPLETED',
          ultimoEventoHotmartEm: new Date('2026-09-11T13:00:00.000Z'),
          ultimoEventoHotmartId: 'evt-complete',
        },
      }),
    ).toEqual({
      deveAtualizar: false,
    });
  });

  it('mantém o estado quando mesmo timestamp representa o mesmo estado financeiro', () => {
    const data = new Date('2026-09-11T12:00:00.000Z');

    expect(
      decidirConsolidacaoFinanceiraHotmart({
        traducaoEvento: traduzirEventoHotmart('PURCHASE_APPROVED'),
        hotmartEventId: 'evt-approved-2',
        criadoNaHotmartEm: data,
        transacaoAtual: {
          status: 'APPROVED',
          ultimoEventoHotmartEm: data,
          ultimoEventoHotmartId: 'evt-approved-1',
        },
      }),
    ).toEqual({
      deveAtualizar: false,
    });
  });

  it('marca conflito temporal quando mesmo timestamp representa estados diferentes', () => {
    const data = new Date('2026-09-11T12:00:00.000Z');

    expect(
      decidirConsolidacaoFinanceiraHotmart({
        traducaoEvento: traduzirEventoHotmart('PURCHASE_COMPLETE'),
        hotmartEventId: 'evt-complete',
        criadoNaHotmartEm: data,
        transacaoAtual: {
          status: 'APPROVED',
          ultimoEventoHotmartEm: data,
          ultimoEventoHotmartId: 'evt-approved',
        },
      }),
    ).toEqual({
      deveAtualizar: true,
      status: STATUS_HOTMART_CONFLITO_TEMPORAL,
      ultimoEventoHotmartEm: data,
      ultimoEventoHotmartId: null,
    });
  });

  it('não deixa evento sem creation_date regredir estado com data confiável', () => {
    expect(
      decidirConsolidacaoFinanceiraHotmart({
        traducaoEvento: traduzirEventoHotmart('PURCHASE_REFUNDED'),
        hotmartEventId: 'evt-refunded',
        criadoNaHotmartEm: null,
        transacaoAtual: {
          status: 'APPROVED',
          ultimoEventoHotmartEm: new Date('2026-09-11T12:00:00.000Z'),
          ultimoEventoHotmartId: 'evt-approved',
        },
      }),
    ).toEqual({
      deveAtualizar: false,
    });
  });

  it('marca conflito quando dois estados diferentes não possuem creation_date', () => {
    expect(
      decidirConsolidacaoFinanceiraHotmart({
        traducaoEvento: traduzirEventoHotmart('PURCHASE_COMPLETE'),
        hotmartEventId: 'evt-complete',
        criadoNaHotmartEm: null,
        transacaoAtual: {
          status: 'APPROVED',
          ultimoEventoHotmartEm: null,
          ultimoEventoHotmartId: 'evt-approved',
        },
      }),
    ).toEqual({
      deveAtualizar: true,
      status: STATUS_HOTMART_CONFLITO_TEMPORAL,
      ultimoEventoHotmartEm: null,
      ultimoEventoHotmartId: null,
    });
  });

  it('ignora evento não mapeado para consolidação financeira', () => {
    expect(
      decidirConsolidacaoFinanceiraHotmart({
        traducaoEvento: traduzirEventoHotmart('EVENTO_DESCONHECIDO'),
        hotmartEventId: 'evt-desconhecido',
        criadoNaHotmartEm: new Date('2026-09-11T14:00:00.000Z'),
        transacaoAtual: {
          status: 'APPROVED',
          ultimoEventoHotmartEm: new Date('2026-09-11T12:00:00.000Z'),
          ultimoEventoHotmartId: 'evt-approved',
        },
      }),
    ).toEqual({
      deveAtualizar: false,
    });
  });
});