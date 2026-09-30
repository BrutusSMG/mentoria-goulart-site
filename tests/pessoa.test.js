import { describe, expect, it, vi } from 'vitest';

import { obterOuCriarPessoa } from '../src/lib/pessoa';

describe('obterOuCriarPessoa', () => {
  it('normaliza o email ao localizar ou criar uma pessoa', async () => {
    const pessoa = {
      id: 'pessoa_1',
      nome: 'Pessoa Teste',
      emailPrincipal: 'teste@example.com',
    };

    const tx = {
      pessoa: {
        upsert: vi.fn().mockResolvedValue(pessoa),
      },
    };

    const resultado = await obterOuCriarPessoa(tx, {
      nome: ' Pessoa Teste ',
      email: ' Teste@Example.COM ',
      telefone: '11999999999',
    });

    expect(tx.pessoa.upsert).toHaveBeenCalledExactlyOnceWith({
      where: {
        emailPrincipal: 'teste@example.com',
      },
      update: {},
      create: {
        nome: 'Pessoa Teste',
        emailPrincipal: 'teste@example.com',
        telefonePrincipal: '11999999999',
      },
    });

    expect(resultado).toEqual(pessoa);
  });

  it('não solicita sobrescrita dos dados de uma pessoa existente', async () => {
    const pessoaExistente = {
      id: 'pessoa_existente',
      nome: 'Nome já cadastrado',
      emailPrincipal: 'existente@example.com',
      telefonePrincipal: '11911111111',
    };

    const tx = {
      pessoa: {
        upsert: vi.fn().mockResolvedValue(pessoaExistente),
      },
    };

    const resultado = await obterOuCriarPessoa(tx, {
      nome: 'Nome vindo de outro cadastro',
      email: ' EXISTENTE@example.com ',
      telefone: '11922222222',
    });

    expect(tx.pessoa.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          emailPrincipal: 'existente@example.com',
        },
        update: {},
      }),
    );

    expect(resultado).toEqual(pessoaExistente);
  });

  it('rejeita email inválido antes de consultar o banco', async () => {
    const tx = {
      pessoa: {
        upsert: vi.fn(),
      },
    };

    await expect(
      obterOuCriarPessoa(tx, {
        nome: 'Pessoa Teste',
        email: 'email-invalido',
      }),
    ).rejects.toThrow('E-mail inválido para identificação da pessoa.');

    expect(tx.pessoa.upsert).not.toHaveBeenCalled();
  });

  it('rejeita nome vazio antes de consultar o banco', async () => {
    const tx = {
      pessoa: {
        upsert: vi.fn(),
      },
    };

    await expect(
      obterOuCriarPessoa(tx, {
        nome: '   ',
        email: 'teste@example.com',
      }),
    ).rejects.toThrow('Nome obrigatório para identificação da pessoa.');

    expect(tx.pessoa.upsert).not.toHaveBeenCalled();
  });
});