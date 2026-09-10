import { describe, expect, it } from 'vitest';

import { obterSituacaoVigencia } from '../src/lib/situacao-vigencia';

describe('obterSituacaoVigencia', () => {
  const agora = new Date('2026-09-10T12:00:00.000Z');

  function criarVigencia(sobrescritas = {}) {
    return {
      status: 'ATIVA',
      iniciaEm: new Date('2026-09-01T12:00:00.000Z'),
      expiraEm: new Date('2027-09-01T12:00:00.000Z'),
      ...sobrescritas,
    };
  }

  it('retorna INDEFINIDA quando não há vigência', () => {
    expect(
      obterSituacaoVigencia(null, agora),
    ).toBe('INDEFINIDA');
  });

  it('mantém SUSPENSA como situação efetiva', () => {
    expect(
      obterSituacaoVigencia(
        criarVigencia({ status: 'SUSPENSA' }),
        agora,
      ),
    ).toBe('SUSPENSA');
  });

  it('mantém CANCELADA como situação efetiva', () => {
    expect(
      obterSituacaoVigencia(
        criarVigencia({ status: 'CANCELADA' }),
        agora,
      ),
    ).toBe('CANCELADA');
  });

  it('mantém ENCERRADA como situação efetiva', () => {
    expect(
      obterSituacaoVigencia(
        criarVigencia({ status: 'ENCERRADA' }),
        agora,
      ),
    ).toBe('ENCERRADA');
  });

  it('retorna AGENDADA quando a vigência ainda não iniciou', () => {
    expect(
      obterSituacaoVigencia(
        criarVigencia({
          status: 'AGENDADA',
          iniciaEm: new Date('2026-09-11T12:00:00.000Z'),
        }),
        agora,
      ),
    ).toBe('AGENDADA');
  });

  it('retorna ATIVA para AGENDADA cuja data de início já chegou', () => {
    expect(
      obterSituacaoVigencia(
        criarVigencia({
          status: 'AGENDADA',
          iniciaEm: agora,
        }),
        agora,
      ),
    ).toBe('ATIVA');
  });

  it('retorna ATIVA para vigência ativa dentro do período', () => {
    expect(
      obterSituacaoVigencia(criarVigencia(), agora),
    ).toBe('ATIVA');
  });

  it('retorna EXPIRADA quando ATIVA possui expiraEm no passado', () => {
    expect(
      obterSituacaoVigencia(
        criarVigencia({
          expiraEm: new Date('2026-09-09T12:00:00.000Z'),
        }),
        agora,
      ),
    ).toBe('EXPIRADA');
  });

  it('retorna EXPIRADA exatamente no instante da expiração', () => {
    expect(
      obterSituacaoVigencia(
        criarVigencia({
          expiraEm: agora,
        }),
        agora,
      ),
    ).toBe('EXPIRADA');
  });

  it('retorna ATIVA quando não existe vencimento definido', () => {
    expect(
      obterSituacaoVigencia(
        criarVigencia({
          expiraEm: null,
        }),
        agora,
      ),
    ).toBe('ATIVA');
  });
});
