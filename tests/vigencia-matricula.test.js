import { describe, expect, it, vi } from 'vitest';

import {
  adicionarAnosCalendario,
  adicionarDias,
  calcularVigenciaInicialMgu,
  provisionarPrimeiraVigenciaHotmart,
} from '../src/lib/vigencia-matricula';

describe('vigencia-matricula', () => {
  it('adiciona dias sem alterar a data original', () => {
    const original = new Date('2026-09-08T12:00:00.000Z');

    const resultado = adicionarDias(original, 7);

    expect(resultado.toISOString()).toBe('2026-09-15T12:00:00.000Z');
    expect(original.toISOString()).toBe('2026-09-08T12:00:00.000Z');
  });

  it('adiciona um ano-calendário preservando data e horário', () => {
    const original = new Date('2026-09-08T12:34:56.000Z');

    const resultado = adicionarAnosCalendario(original, 1);

    expect(resultado.toISOString()).toBe('2027-09-08T12:34:56.000Z');
  });

  it('trata 29 de fevereiro como último dia de fevereiro no ano seguinte', () => {
    const original = new Date('2024-02-29T10:00:00.000Z');

    const resultado = adicionarAnosCalendario(original, 1);

    expect(resultado.toISOString()).toBe('2025-02-28T10:00:00.000Z');
  });

  it('calcula a primeira vigência do MGU como 1 ano-calendário mais 7 dias', () => {
    const aprovadoEm = new Date('2026-09-08T12:00:00.000Z');

    const vigencia = calcularVigenciaInicialMgu(aprovadoEm);

    expect(vigencia.concedidaEm.toISOString()).toBe(
      '2026-09-08T12:00:00.000Z',
    );
    expect(vigencia.iniciaEm.toISOString()).toBe(
      '2026-09-08T12:00:00.000Z',
    );
    expect(vigencia.garantiaAte.toISOString()).toBe(
      '2026-09-15T12:00:00.000Z',
    );
    expect(vigencia.expiraEm.toISOString()).toBe(
      '2027-09-15T12:00:00.000Z',
    );
  });

  it('calcula corretamente vigência iniciada em 29 de fevereiro', () => {
    const aprovadoEm = new Date('2024-02-29T10:00:00.000Z');

    const vigencia = calcularVigenciaInicialMgu(aprovadoEm);

    expect(vigencia.garantiaAte.toISOString()).toBe(
      '2024-03-07T10:00:00.000Z',
    );
    expect(vigencia.expiraEm.toISOString()).toBe(
      '2025-03-07T10:00:00.000Z',
    );
  });

  it('rejeita data de aprovação inválida', () => {
    expect(() =>
      calcularVigenciaInicialMgu(new Date('data-invalida')),
    ).toThrow('Data de aprovação inválida.');
  });

    it('reutiliza a vigência quando a mesma transação já foi provisionada', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      id: 'vigencia-existente',
    });

    const findFirst = vi.fn();
    const create = vi.fn();

    const tx = {
      vigenciaMatricula: {
        findUnique,
        findFirst,
        create,
      },
    };

    const resultado = await provisionarPrimeiraVigenciaHotmart(tx, {
      matriculaId: 'matricula-1',
      transacaoOrigemId: 'transacao-1',
      aprovadoEm: new Date('2026-09-08T12:00:00.000Z'),
    });

    expect(resultado).toEqual({
      id: 'vigencia-existente',
    });

    expect(findUnique).toHaveBeenCalledWith({
      where: {
        transacaoOrigemId: 'transacao-1',
      },
      select: {
        id: true,
      },
    });

    expect(findFirst).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it('cria a primeira vigência Hotmart quando a matrícula ainda não possui vigência', async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    const findFirst = vi.fn().mockResolvedValue(null);
    const create = vi.fn().mockResolvedValue({
      id: 'vigencia-nova',
    });

    const tx = {
      vigenciaMatricula: {
        findUnique,
        findFirst,
        create,
      },
    };

    const aprovadoEm = new Date('2026-09-08T12:00:00.000Z');

    const resultado = await provisionarPrimeiraVigenciaHotmart(tx, {
      matriculaId: 'matricula-1',
      transacaoOrigemId: 'transacao-1',
      aprovadoEm,
    });

    expect(resultado).toEqual({
      id: 'vigencia-nova',
    });

    expect(findFirst).toHaveBeenCalledWith({
      where: {
        matriculaId: 'matricula-1',
      },
      select: {
        id: true,
      },
    });

    expect(create).toHaveBeenCalledTimes(1);

    const chamadaCreate = create.mock.calls[0][0];

    expect(chamadaCreate.select).toEqual({
      id: true,
    });

    expect(chamadaCreate.data).toMatchObject({
      matriculaId: 'matricula-1',
      transacaoOrigemId: 'transacao-1',
      origem: 'HOTMART',
      tipoDuracao: 'DEFINIDA',
      status: 'ATIVA',
    });

    expect(chamadaCreate.data.concedidaEm.toISOString()).toBe(
      '2026-09-08T12:00:00.000Z',
    );
    expect(chamadaCreate.data.iniciaEm.toISOString()).toBe(
      '2026-09-08T12:00:00.000Z',
    );
    expect(chamadaCreate.data.garantiaAte.toISOString()).toBe(
      '2026-09-15T12:00:00.000Z',
    );
    expect(chamadaCreate.data.expiraEm.toISOString()).toBe(
      '2027-09-15T12:00:00.000Z',
    );
  });

  it('não cria segunda vigência na E1.4 quando outra transação chega para matrícula que já possui vigência', async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    const findFirst = vi.fn().mockResolvedValue({
      id: 'vigencia-anterior',
    });
    const create = vi.fn();

    const tx = {
      vigenciaMatricula: {
        findUnique,
        findFirst,
        create,
      },
    };

    const resultado = await provisionarPrimeiraVigenciaHotmart(tx, {
      matriculaId: 'matricula-1',
      transacaoOrigemId: 'transacao-renovacao',
      aprovadoEm: new Date('2027-08-01T12:00:00.000Z'),
    });

    expect(resultado).toBeNull();
    expect(create).not.toHaveBeenCalled();
  });
});