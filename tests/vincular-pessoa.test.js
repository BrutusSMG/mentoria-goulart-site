import { describe, expect, it, vi } from 'vitest';

import { vincularCadastroPessoa } from '../src/lib/vincular-pessoa';

function criarTx({
  cadastro = {
    id: 'lead_1',
    email: ' Teste@Example.COM ',
    pessoaId: null,
  },
  pessoa = {
    id: 'pessoa_1',
    emailPrincipal: 'teste@example.com',
    lead: null,
  },
  quantidadeAtualizada = 1,
} = {}) {
  return {
    lead: {
      findUnique: vi.fn().mockResolvedValue(cadastro),
      updateMany: vi.fn().mockResolvedValue({
        count: quantidadeAtualizada,
      }),
    },
    pessoa: {
      findUnique: vi.fn().mockResolvedValue(pessoa),
    },
  };
}

const dadosVinculo = {
  tipo: 'lead',
  cadastroId: 'lead_1',
  pessoaId: 'pessoa_1',
};

describe('vincularCadastroPessoa', () => {
  it('vincula um cadastro sem vínculo quando os e-mails coincidem', async () => {
    const tx = criarTx();

    const resultado = await vincularCadastroPessoa(
      tx,
      dadosVinculo,
    );

    expect(tx.lead.findUnique).toHaveBeenCalledWith({
      where: { id: 'lead_1' },
      select: {
        id: true,
        email: true,
        pessoaId: true,
      },
    });

    expect(tx.pessoa.findUnique).toHaveBeenCalledWith({
      where: { id: 'pessoa_1' },
      select: {
        id: true,
        emailPrincipal: true,
        lead: {
          select: { id: true },
        },
      },
    });

    expect(tx.lead.updateMany).toHaveBeenCalledExactlyOnceWith({
      where: {
        id: 'lead_1',
        email: ' Teste@Example.COM ',
        pessoaId: null,
      },
      data: {
        pessoaId: 'pessoa_1',
      },
    });

    expect(resultado).toEqual({
      cadastroId: 'lead_1',
      pessoaId: 'pessoa_1',
      jaVinculado: false,
    });
  });

  it('reconhece um vínculo existente sem atualizar o cadastro', async () => {
    const tx = criarTx({
      cadastro: {
        id: 'lead_1',
        email: 'teste@example.com',
        pessoaId: 'pessoa_1',
      },
      pessoa: {
        id: 'pessoa_1',
        emailPrincipal: 'teste@example.com',
        lead: { id: 'lead_1' },
      },
    });

    const resultado = await vincularCadastroPessoa(
      tx,
      dadosVinculo,
    );

    expect(resultado).toEqual({
      cadastroId: 'lead_1',
      pessoaId: 'pessoa_1',
      jaVinculado: true,
    });

    expect(tx.lead.updateMany).not.toHaveBeenCalled();
  });

  it('rejeita e-mails incompatíveis sem alterar o cadastro', async () => {
    const tx = criarTx({
      cadastro: {
        id: 'lead_1',
        email: 'outra@example.com',
        pessoaId: null,
      },
    });

    await expect(
      vincularCadastroPessoa(tx, dadosVinculo),
    ).rejects.toThrow('E-mails incompatíveis para vinculação.');

    expect(tx.lead.updateMany).not.toHaveBeenCalled();
  });

  it('rejeita cadastro já associado a outra Pessoa', async () => {
    const tx = criarTx({
      cadastro: {
        id: 'lead_1',
        email: 'teste@example.com',
        pessoaId: 'pessoa_outra',
      },
    });

    await expect(
      vincularCadastroPessoa(tx, dadosVinculo),
    ).rejects.toThrow('Cadastro já vinculado a outra Pessoa.');

    expect(tx.pessoa.findUnique).not.toHaveBeenCalled();
    expect(tx.lead.updateMany).not.toHaveBeenCalled();
  });

  it('rejeita Pessoa já associada a outro cadastro do mesmo tipo', async () => {
    const tx = criarTx({
      pessoa: {
        id: 'pessoa_1',
        emailPrincipal: 'teste@example.com',
        lead: { id: 'lead_outro' },
      },
    });

    await expect(
      vincularCadastroPessoa(tx, dadosVinculo),
    ).rejects.toThrow(
      'Pessoa já vinculada a outro cadastro deste tipo.',
    );

    expect(tx.lead.updateMany).not.toHaveBeenCalled();
  });

  it('rejeita quando o cadastro muda durante a vinculação', async () => {
    const tx = criarTx({
      quantidadeAtualizada: 0,
    });

    await expect(
      vincularCadastroPessoa(tx, dadosVinculo),
    ).rejects.toThrow(
      'O cadastro mudou durante a vinculação.',
    );

    expect(tx.lead.updateMany).toHaveBeenCalledOnce();
  });

  it('propaga erro do banco se houver conflito na atualização', async () => {
    const tx = criarTx();
    const erroBanco = new Error('Conflito de chave única');

    tx.lead.updateMany.mockRejectedValue(erroBanco);

    await expect(
      vincularCadastroPessoa(tx, dadosVinculo),
    ).rejects.toBe(erroBanco);
  });

  it('rejeita tipo de cadastro não permitido', async () => {
    const tx = criarTx();

    await expect(
      vincularCadastroPessoa(tx, {
        ...dadosVinculo,
        tipo: 'matricula',
      }),
    ).rejects.toThrow('Dados inválidos para vinculação de Pessoa.');

    expect(tx.lead.findUnique).not.toHaveBeenCalled();
    expect(tx.pessoa.findUnique).not.toHaveBeenCalled();
  });
});