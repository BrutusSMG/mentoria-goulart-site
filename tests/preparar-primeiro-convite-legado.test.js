import { describe, expect, it, vi } from 'vitest';

import { prepararPrimeiroConviteLegado } from
  '../src/lib/preparar-primeiro-convite-legado';

import {
  TIPO_PRIMEIRO_ACESSO,
  hashTokenAcesso,
} from '../src/lib/convite-primeiro-acesso';

const AGORA = new Date('2026-09-23T22:00:00.000Z');

function criarTx() {
  return {
    aluno: {
      findUnique: vi.fn().mockResolvedValue({
        id: 'aluno-ficticio',
        nome: 'Aluno Fictício',
        email: 'legado@example.test',
        origem: 'LEGADO',
        status: 'ATIVO',
        senhaHash: null,
        emailVerificadoEm: null,
        conviteLegadoEnviadoEm: null,
        pessoaId: 'pessoa-ficticia',
        pessoa: {
          id: 'pessoa-ficticia',
          emailPrincipal: 'legado@example.test',
          ativo: true,
        },
      }),
    },
    alunoAccessToken: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({
        id: 'token-ficticio',
      }),
    },
    controleConviteLegado: {
      updateMany: vi.fn().mockResolvedValue({
        count: 1,
      }),
    },
  };
}

describe('prepararPrimeiroConviteLegado', () => {
  it('reserva a tentativa e cria o token de primeiro acesso', async () => {
    const tx = criarTx();

    const resultado = await prepararPrimeiroConviteLegado(
      tx,
      'aluno-ficticio',
      AGORA,
    );

    expect(resultado.preparado).toBe(true);
    expect(resultado.aluno.email).toBe('legado@example.test');
    expect(typeof resultado.token).toBe('string');

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

    expect(tx.alunoAccessToken.create).toHaveBeenCalledWith({
      data: {
        alunoId: 'aluno-ficticio',
        tokenHash: hashTokenAcesso(resultado.token),
        tipo: TIPO_PRIMEIRO_ACESSO,
        expiraEm: new Date('2026-09-26T22:00:00.000Z'),
      },
    });

    // O banco recebe o hash, não o token original.
    expect(
      tx.alunoAccessToken.create.mock.calls[0][0]
        .data.tokenHash,
    ).not.toBe(resultado.token);
  });

  it('recusa aluno inelegível antes de reservar', async () => {
    const tx = criarTx();

    tx.aluno.findUnique.mockResolvedValue({
      id: 'aluno-ficticio',
      origem: 'HOTMART',
    });

    const resultado = await prepararPrimeiroConviteLegado(
      tx,
      'aluno-ficticio',
      AGORA,
    );

    expect(resultado.preparado).toBe(false);
    expect(
      tx.controleConviteLegado.updateMany,
    ).not.toHaveBeenCalled();
    expect(
      tx.alunoAccessToken.create,
    ).not.toHaveBeenCalled();
  });

  it('recusa convite anterior sem uso', async () => {
    const tx = criarTx();

    tx.alunoAccessToken.findFirst.mockResolvedValue({
      id: 'token-anterior',
    });

    const resultado = await prepararPrimeiroConviteLegado(
      tx,
      'aluno-ficticio',
      AGORA,
    );

    expect(resultado.preparado).toBe(false);
    expect(
      tx.controleConviteLegado.updateMany,
    ).not.toHaveBeenCalled();
    expect(
      tx.alunoAccessToken.create,
    ).not.toHaveBeenCalled();
  });

  it('não cria token quando a reserva foi recusada', async () => {
    const tx = criarTx();

    tx.controleConviteLegado.updateMany.mockResolvedValue({
      count: 0,
    });

    const resultado = await prepararPrimeiroConviteLegado(
      tx,
      'aluno-ficticio',
      AGORA,
    );

    expect(resultado.preparado).toBe(false);
    expect(
      tx.alunoAccessToken.create,
    ).not.toHaveBeenCalled();
  });

  it('propaga falha na criação do token para desfazer a transação', async () => {
    const tx = criarTx();

    tx.alunoAccessToken.create.mockRejectedValue(
      new Error('Falha fictícia ao gravar token.'),
    );

    await expect(
      prepararPrimeiroConviteLegado(
        tx,
        'aluno-ficticio',
        AGORA,
      ),
    ).rejects.toThrow('Falha fictícia ao gravar token.');

    expect(
      tx.controleConviteLegado.updateMany,
    ).toHaveBeenCalledTimes(1);
  });

  it('rejeita identificador vazio antes de consultar o banco', async () => {
    const tx = criarTx();

    await expect(
      prepararPrimeiroConviteLegado(tx, ' ', AGORA),
    ).rejects.toThrow('Aluno inválido');

    expect(tx.aluno.findUnique).not.toHaveBeenCalled();
  });
});
