import { describe, expect, it, vi } from 'vitest';

import {
  prepararCadastroPessoaLegado,
  validarProdutosCadastroLegado,
  prepararVigenciasLegado,
} from '../src/lib/cadastro-pessoa-legado';

describe('prepararCadastroPessoaLegado', () => {
  it('normaliza os dados e aceita telefone opcional', () => {
    const resultado = prepararCadastroPessoaLegado({
      nome: ' Aluno Legado ',
      email: ' LEGADO@EXAMPLE.COM ',
      produtoIds: [' produto_1 ', 'produto_2'],
    });

    expect(resultado).toEqual({
      nome: 'Aluno Legado',
      email: 'legado@example.com',
      telefone: null,
      produtoIds: ['produto_1', 'produto_2'],
      origem: 'LEGADO',
    });
  });

  it('exige nome e e-mail válidos', () => {
    expect(() =>
      prepararCadastroPessoaLegado({
        nome: ' ',
        email: 'legado@example.com',
        produtoIds: ['produto_1'],
      }),
    ).toThrow('Informe um nome');

    expect(() =>
      prepararCadastroPessoaLegado({
        nome: 'Aluno Legado',
        email: 'email-invalido',
        produtoIds: ['produto_1'],
      }),
    ).toThrow('Informe um e-mail válido.');
  });

  it('exige a seleção dos produtos já adquiridos', () => {
    expect(() =>
      prepararCadastroPessoaLegado({
        nome: 'Aluno Legado',
        email: 'legado@example.com',
        produtoIds: [],
      }),
    ).toThrow('Selecione os produtos já adquiridos');
  });

  it('rejeita a seleção duplicada de um produto', () => {
    expect(() =>
      prepararCadastroPessoaLegado({
        nome: 'Aluno Legado',
        email: 'legado@example.com',
        produtoIds: ['produto_1', ' produto_1 '],
      }),
    ).toThrow(
      'O mesmo produto não pode ser selecionado duas vezes.',
    );
  });
});

describe('validarProdutosCadastroLegado', () => {
  function criarTx(produtos) {
    return {
      produto: {
        findMany: vi.fn().mockResolvedValue(produtos),
      },
    };
  }

  const produtoValido = {
    id: 'produto_1',
    nome: 'Curso legado',
    tipo: 'CURSO',
    ativo: true,
    direitos: [
      {
        id: 'direito_1',
        tipo: 'CONTEUDO_PRODUTO',
        nivel: null,
      },
    ],
  };

  it('retorna os produtos com seus direitos ativos', async () => {
    const tx = criarTx([produtoValido]);

    const resultado = await validarProdutosCadastroLegado(
      tx,
      ['produto_1'],
    );

    expect(resultado).toEqual([produtoValido]);

    expect(tx.produto.findMany).toHaveBeenCalledWith({
      where: {
        id: { in: ['produto_1'] },
      },
      select: {
        id: true,
        nome: true,
        tipo: true,
        ativo: true,
        direitos: {
          where: { ativo: true },
          select: {
            id: true,
            tipo: true,
            nivel: true,
          },
        },
      },
    });
  });

  it('rejeita produto inexistente', async () => {
    const tx = criarTx([]);

    await expect(
      validarProdutosCadastroLegado(tx, ['produto_1']),
    ).rejects.toThrow('Produto não encontrado no catálogo');
  });

  it('rejeita produto inativo', async () => {
    const tx = criarTx([
      { ...produtoValido, ativo: false },
    ]);

    await expect(
      validarProdutosCadastroLegado(tx, ['produto_1']),
    ).rejects.toThrow('Produto inativo no catálogo');
  });

  it('rejeita produto sem direitos ativos', async () => {
    const tx = criarTx([
      { ...produtoValido, direitos: [] },
    ]);

    await expect(
      validarProdutosCadastroLegado(tx, ['produto_1']),
    ).rejects.toThrow(
      'Produto sem direitos ativos configurados',
    );
  });
});

describe('prepararVigenciasLegado', () => {
  it('preserva a data original de término', () => {
    expect(
      prepararVigenciasLegado(
        ['curso_1'],
        [{
          produtoId: 'curso_1',
          tipoDuracao: 'DEFINIDA',
          dataFimOriginal: '2027-10-31',
        }],
      ),
    ).toEqual([{
      produtoId: 'curso_1',
      tipoDuracao: 'DEFINIDA',
      dataFimOriginal: '2027-10-31',
    }]);
  });

  it('aceita prazo indeterminado e acesso vitalício', () => {
    expect(
      prepararVigenciasLegado(
        ['ebook_1', 'mentoria_1'],
        [
          {
            produtoId: 'ebook_1',
            tipoDuracao: 'INDEFINIDA',
          },
          {
            produtoId: 'mentoria_1',
            tipoDuracao: 'VITALICIA',
          },
        ],
      ),
    ).toEqual([
      {
        produtoId: 'ebook_1',
        tipoDuracao: 'INDEFINIDA',
        dataFimOriginal: null,
      },
      {
        produtoId: 'mentoria_1',
        tipoDuracao: 'VITALICIA',
        dataFimOriginal: null,
      },
    ]);
  });

  it('aceita uma data histórica sem transformá-la em novo prazo', () => {
    const resultado = prepararVigenciasLegado(
      ['curso_1'],
      [{
        produtoId: 'curso_1',
        tipoDuracao: 'DEFINIDA',
        dataFimOriginal: '2024-01-15',
      }],
    );

    expect(resultado[0].dataFimOriginal).toBe('2024-01-15');
  });

  it('rejeita data de término inválida', () => {
    expect(() =>
      prepararVigenciasLegado(
        ['curso_1'],
        [{
          produtoId: 'curso_1',
          tipoDuracao: 'DEFINIDA',
          dataFimOriginal: '2027-02-30',
        }],
      ),
    ).toThrow('Informe a data original de término');
  });

  it('rejeita produto sem vigência', () => {
    expect(() =>
      prepararVigenciasLegado(
        ['curso_1', 'ebook_1'],
        [{
          produtoId: 'curso_1',
          tipoDuracao: 'VITALICIA',
        }],
      ),
    ).toThrow(
      'Informe exatamente uma vigência para cada produto legado.',
    );
  });

  it('rejeita produto duplicado nas vigências', () => {
    expect(() =>
      prepararVigenciasLegado(
        ['curso_1', 'ebook_1'],
        [
          {
            produtoId: 'curso_1',
            tipoDuracao: 'VITALICIA',
          },
          {
            produtoId: 'curso_1',
            tipoDuracao: 'VITALICIA',
          },
        ],
      ),
    ).toThrow(
      'A vigência possui produto desconhecido ou duplicado.',
    );
  });

  it('não aceita data de término em acesso vitalício', () => {
    expect(() =>
      prepararVigenciasLegado(
        ['curso_1'],
        [{
          produtoId: 'curso_1',
          tipoDuracao: 'VITALICIA',
          dataFimOriginal: '2027-10-31',
        }],
      ),
    ).toThrow('não admite data de término');
  });
});
