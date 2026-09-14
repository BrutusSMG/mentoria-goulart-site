import { describe, expect, it, vi } from 'vitest';
import { resolverProdutoIntegracao } from '../src/lib/produto-catalogo';

describe('resolverProdutoIntegracao', () => {
  it('resolve produto conhecido por provedor + externalId', async () => {
    const integracao = {
      id: 'int_hotmart_962959',
      produtoId: 'prod_garimpo_mentoria',
      provedor: 'HOTMART',
      externalId: '962959',
      ativo: true,
      produto: {
        id: 'prod_garimpo_mentoria',
        nome: 'Curso Garimpo Urbano com Mentoria',
        ativo: true,
      },
    };

    const tx = {
      produtoIntegracao: {
        findUnique: vi.fn().mockResolvedValue(integracao),
      },
    };

    const resultado = await resolverProdutoIntegracao(tx, {
      provedor: 'HOTMART',
      externalId: '962959',
    });

    expect(resultado).toEqual(integracao);

    expect(tx.produtoIntegracao.findUnique).toHaveBeenCalledWith({
      where: {
        provedor_externalId: {
          provedor: 'HOTMART',
          externalId: '962959',
        },
      },
      include: {
        produto: true,
      },
    });
  });

  it('normaliza espaços do identificador externo', async () => {
    const tx = {
      produtoIntegracao: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    };

    await resolverProdutoIntegracao(tx, {
      provedor: ' hotmart ',
      externalId: ' 962959 ',
    });

    expect(tx.produtoIntegracao.findUnique).toHaveBeenCalledWith({
      where: {
        provedor_externalId: {
          provedor: 'HOTMART',
          externalId: '962959',
        },
      },
      include: {
        produto: true,
      },
    });
  });

  it('retorna null para produto externo desconhecido', async () => {
    const tx = {
      produtoIntegracao: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    };

    const resultado = await resolverProdutoIntegracao(tx, {
      provedor: 'HOTMART',
      externalId: '999999999',
    });

    expect(resultado).toBeNull();
  });

  it('retorna null para integração inativa', async () => {
    const tx = {
      produtoIntegracao: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'integracao-inativa',
          ativo: false,
          produto: {
            id: 'produto-1',
            ativo: true,
          },
        }),
      },
    };

    const resultado = await resolverProdutoIntegracao(tx, {
      provedor: 'HOTMART',
      externalId: '123',
    });

    expect(resultado).toBeNull();
  });

  it('retorna null para produto interno inativo', async () => {
    const tx = {
      produtoIntegracao: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'integracao-1',
          ativo: true,
          produto: {
            id: 'produto-inativo',
            ativo: false,
          },
        }),
      },
    };

    const resultado = await resolverProdutoIntegracao(tx, {
      provedor: 'HOTMART',
      externalId: '123',
    });

    expect(resultado).toBeNull();
  });

  it('não consulta o banco quando externalId está ausente', async () => {
    const findUnique = vi.fn();

    const tx = {
      produtoIntegracao: {
        findUnique,
      },
    };

    const resultado = await resolverProdutoIntegracao(tx, {
      provedor: 'HOTMART',
      externalId: null,
    });

    expect(resultado).toBeNull();
    expect(findUnique).not.toHaveBeenCalled();
  });
});