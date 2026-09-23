import { describe, expect, it, vi } from 'vitest';

import { registrarResultadoPrimeiroConviteLegado } from
  '../src/lib/registrar-resultado-convite-legado';

const AGORA = new Date('2026-09-23T22:00:00.000Z');

function criarTx() {
  return {
    controleConviteLegado: {
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    aluno: {
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
  };
}

describe('registrarResultadoPrimeiroConviteLegado', () => {
  it('registra envio aceito nas duas tabelas', async () => {
    const tx = criarTx();

    const resultado = await registrarResultadoPrimeiroConviteLegado(
      tx,
      {
        alunoId: 'aluno-ficticio',
        resultado: 'ENVIADO',
        agora: AGORA,
        mensagemProvedorId: 'mensagem-ficticia',
      },
    );

    expect(resultado).toEqual({ registrado: true });

    expect(
      tx.controleConviteLegado.updateMany,
    ).toHaveBeenCalledWith({
      where: {
        alunoId: 'aluno-ficticio',
        status: 'EM_ANDAMENTO',
        tentativas: 1,
      },
      data: {
        status: 'ENVIADO',
        tentativaEncerradaEm: AGORA,
        ultimoErro: null,
        mensagemProvedorId: 'mensagem-ficticia',
      },
    });

    expect(tx.aluno.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'aluno-ficticio',
        origem: 'LEGADO',
        status: 'ATIVO',
        senhaHash: null,
        emailVerificadoEm: null,
        conviteLegadoEnviadoEm: null,
      },
      data: {
        conviteLegadoEnviadoEm: AGORA,
      },
    });
  });

  it('registra falha sem marcar o convite como enviado', async () => {
    const tx = criarTx();

    const resultado = await registrarResultadoPrimeiroConviteLegado(
      tx,
      {
        alunoId: 'aluno-ficticio',
        resultado: 'FALHA',
        agora: AGORA,
      },
    );

    expect(resultado).toEqual({ registrado: true });

    expect(
      tx.controleConviteLegado.updateMany,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'FALHA',
          mensagemProvedorId: null,
        }),
      }),
    );

    expect(tx.aluno.updateMany).not.toHaveBeenCalled();
  });

  it('registra resultado indeterminado sem marcar envio', async () => {
    const tx = criarTx();

    const resultado = await registrarResultadoPrimeiroConviteLegado(
      tx,
      {
        alunoId: 'aluno-ficticio',
        resultado: 'INDETERMINADO',
        agora: AGORA,
      },
    );

    expect(resultado).toEqual({ registrado: true });

    expect(
      tx.controleConviteLegado.updateMany,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'INDETERMINADO',
        }),
      }),
    );

    expect(tx.aluno.updateMany).not.toHaveBeenCalled();
  });

  it('não altera o aluno se a tentativa já foi encerrada', async () => {
    const tx = criarTx();

    tx.controleConviteLegado.updateMany.mockResolvedValue({
      count: 0,
    });

    const resultado = await registrarResultadoPrimeiroConviteLegado(
      tx,
      {
        alunoId: 'aluno-ficticio',
        resultado: 'ENVIADO',
        agora: AGORA,
      },
    );

    expect(resultado).toEqual({ registrado: false });
    expect(tx.aluno.updateMany).not.toHaveBeenCalled();
  });

  it('interrompe a transação se não conseguir registrar a data no aluno', async () => {
    const tx = criarTx();

    tx.aluno.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      registrarResultadoPrimeiroConviteLegado(
        tx,
        {
          alunoId: 'aluno-ficticio',
          resultado: 'ENVIADO',
          agora: AGORA,
        },
      ),
    ).rejects.toThrow('conferência manual');
  });

  it('rejeita resultado desconhecido antes de acessar o banco', async () => {
    const tx = criarTx();

    await expect(
      registrarResultadoPrimeiroConviteLegado(
        tx,
        {
          alunoId: 'aluno-ficticio',
          resultado: 'ENTREGUE',
          agora: AGORA,
        },
      ),
    ).rejects.toThrow('Resultado de convite inválido');

    expect(
      tx.controleConviteLegado.updateMany,
    ).not.toHaveBeenCalled();
  });
});
