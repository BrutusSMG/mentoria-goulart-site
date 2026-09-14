// src/lib/produto-catalogo.js

/**
 * Resolve um identificador externo de produto para a identidade
 * comercial interna do MGU.
 *
 * Regras:
 * - a resolução é sempre por provedor + externalId;
 * - não utiliza nome, preço, ucode ou qualquer aproximação;
 * - integração inexistente retorna null;
 * - integração inativa retorna null;
 * - produto interno inativo retorna null.
 */
export async function resolverProdutoIntegracao(
  tx,
  {
    provedor,
    externalId,
  },
) {
  const provedorNormalizado = String(provedor || '').trim().toUpperCase();

  const externalIdNormalizado =
    externalId === null || externalId === undefined
      ? ''
      : String(externalId).trim();

  if (!provedorNormalizado || !externalIdNormalizado) {
    return null;
  }

  const integracao = await tx.produtoIntegracao.findUnique({
    where: {
      provedor_externalId: {
        provedor: provedorNormalizado,
        externalId: externalIdNormalizado,
      },
    },
    include: {
      produto: true,
    },
  });

  if (!integracao) {
    return null;
  }

  if (!integracao.ativo || !integracao.produto?.ativo) {
    return null;
  }

  return integracao;
}