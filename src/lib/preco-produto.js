// src/lib/preco-produto.js

export function formatarPrecoProduto(preco, moeda = 'BRL') {
  if (
    preco === null
    || preco === undefined
    || String(preco).trim() === ''
  ) {
    return null;
  }

  const valor = Number(preco);

  if (!Number.isFinite(valor)) {
    return null;
  }

  const moedaNormalizada =
    String(moeda || 'BRL').trim().toUpperCase() || 'BRL';

  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: moedaNormalizada,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valor).replace(/[\u00a0\u202f]/g, ' ');
  } catch {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valor).replace(/[\u00a0\u202f]/g, ' ');
  }
}
