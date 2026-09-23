import { describe, expect, it, vi } from 'vitest';

import { reservarPrimeiroConviteLegado } from
  '../src/lib/reservar-convite-legado';

const AGORA = new Date('2026-09-23T21:00:00.000Z');

function criarTx() {
  return {
    controleConviteLegado: {
      updateMany: vi.fn(),
    },
  };
}

describe('reservarPrimeiroConviteLegado', () => {
  it('reserva a primeira tentativa pendente', async () => {
    const tx = criarTx();

    tx.controleConviteLegado.updateMany.mockResolvedValue({
      count: 1,
    });

    const resultado = await reservarPrimeiroConviteLegado(
      tx,
      'aluno-ficticio',
      AGORA,
    );

    expect(resultado).toEqual({ reservada: true });

    expect(
      tx.controleConviteLegado.updateMany,
    ).toHaveBeenCalledWith({
      where: {
        alunoId: 'aluno-ficticio',
        status: 'PENDENTE',
        tentativas: 0,
      },
      data: {
        status: 'EM_ANDAMENTO',
        tentativas: { increment: 1 },
        tentativaIniciadaEm: AGORA,
        tentativaEncerradaEm: null,
        ultimoErro: null,
      },
    });
  });

  it('não confirma reserva quando o registro não atende às condições', async () => {
    const tx = criarTx();

    tx.controleConviteLegado.updateMany.mockResolvedValue({
      count: 0,
    });

    const resultado = await reservarPrimeiroConviteLegado(
      tx,
      'aluno-ficticio',
      AGORA,
    );

    expect(resultado).toEqual({ reservada: false });
  });

  it('rejeita identificador de aluno vazio', async () => {
    const tx = criarTx();

    await expect(
      reservarPrimeiroConviteLegado(tx, ' ', AGORA),
    ).rejects.toThrow('Aluno inválido');

    expect(
      tx.controleConviteLegado.updateMany,
    ).not.toHaveBeenCalled();
  });

  it('rejeita data de tentativa inválida', async () => {
    const tx = criarTx();

    await expect(
      reservarPrimeiroConviteLegado(
        tx,
        'aluno-ficticio',
        new Date('data-invalida'),
      ),
    ).rejects.toThrow('Data de tentativa inválida');

    expect(
      tx.controleConviteLegado.updateMany,
    ).not.toHaveBeenCalled();
  });
});
