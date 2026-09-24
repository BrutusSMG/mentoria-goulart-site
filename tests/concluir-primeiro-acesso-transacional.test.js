import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  concluirPrimeiroAcessoTransacional,
  ConvitePrimeiroAcessoIndisponivelError,
} from '../src/lib/concluir-primeiro-acesso-transacional';

const AGORA = new Date('2026-09-23T22:00:00.000Z');

function criarCenario(origem = 'HOTMART') {
  const tx = {
    alunoAccessToken: {
      updateMany: vi.fn().mockResolvedValue({
        count: 1,
      }),
    },
    aluno: {
      updateMany: vi.fn().mockResolvedValue({
        count: 1,
      }),
    },
  };

  const dados = {
    tokenAcesso: {
      id: 'token-ficticio',
      alunoId: 'aluno-ficticio',
      aluno: { origem },
    },
    senhaHash: 'hash-ficticio',
    agora: AGORA,
  };

  return { tx, dados };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('concluirPrimeiroAcessoTransacional', () => {
  it('consome o token específico e atualiza o aluno elegível', async () => {
    const { tx, dados } = criarCenario();

    const resultado =
      await concluirPrimeiroAcessoTransacional(
        tx,
        dados,
      );

    expect(resultado).toEqual({ concluido: true });

    expect(
      tx.alunoAccessToken.updateMany,
    ).toHaveBeenCalledExactlyOnceWith({
      where: {
        id: 'token-ficticio',
        alunoId: 'aluno-ficticio',
        tipo: 'PRIMEIRO_ACESSO',
        usadoEm: null,
        expiraEm: {
          gt: AGORA,
        },
      },
      data: {
        usadoEm: AGORA,
      },
    });

    expect(tx.aluno.updateMany).toHaveBeenCalledExactlyOnceWith({
      where: {
        id: 'aluno-ficticio',
        origem: 'HOTMART',
        status: 'ATIVO',
        senhaHash: null,
        emailVerificadoEm: null,
      },
      data: {
        senhaHash: 'hash-ficticio',
        emailVerificadoEm: AGORA,
      },
    });
  });

  it('exige envio confirmado para aluno legado', async () => {
    const { tx, dados } = criarCenario('LEGADO');

    await concluirPrimeiroAcessoTransacional(
      tx,
      dados,
    );

    expect(tx.aluno.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'aluno-ficticio',
        origem: 'LEGADO',
        status: 'ATIVO',
        senhaHash: null,
        emailVerificadoEm: null,
        conviteLegadoEnviadoEm: {
          not: null,
        },
      },
      data: {
        senhaHash: 'hash-ficticio',
        emailVerificadoEm: AGORA,
      },
    });
  });

  it('rejeita uma segunda tentativa quando o token já foi consumido', async () => {
    const { tx, dados } = criarCenario();

    tx.alunoAccessToken.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });

    await concluirPrimeiroAcessoTransacional(
      tx,
      dados,
    );

    await expect(
      concluirPrimeiroAcessoTransacional(
        tx,
        dados,
      ),
    ).rejects.toBeInstanceOf(
      ConvitePrimeiroAcessoIndisponivelError,
    );

    expect(
      tx.alunoAccessToken.updateMany,
    ).toHaveBeenCalledTimes(2);

    // A segunda tentativa não chega a atualizar o aluno.
    expect(tx.aluno.updateMany).toHaveBeenCalledTimes(1);
  });

  it('lança erro para desfazer o token quando o aluno deixou de ser elegível', async () => {
    const { tx, dados } = criarCenario();

    tx.aluno.updateMany.mockResolvedValue({
      count: 0,
    });

    await expect(
      concluirPrimeiroAcessoTransacional(
        tx,
        dados,
      ),
    ).rejects.toBeInstanceOf(
      ConvitePrimeiroAcessoIndisponivelError,
    );

    expect(
      tx.alunoAccessToken.updateMany,
    ).toHaveBeenCalledTimes(1);
    expect(tx.aluno.updateMany).toHaveBeenCalledTimes(1);
  });

  it('rejeita dados inválidos antes de atualizar o banco', async () => {
    const { tx, dados } = criarCenario();

    dados.tokenAcesso.aluno.origem = undefined;

    await expect(
      concluirPrimeiroAcessoTransacional(
        tx,
        dados,
      ),
    ).rejects.toBeInstanceOf(
      ConvitePrimeiroAcessoIndisponivelError,
    );

    expect(
      tx.alunoAccessToken.updateMany,
    ).not.toHaveBeenCalled();
    expect(tx.aluno.updateMany).not.toHaveBeenCalled();
  });
});
