import { describe, expect, it } from 'vitest';

import { formatarPrecoProduto } from '@/lib/preco-produto';

describe('formatarPrecoProduto', () => {
  it('formata valor inteiro em BRL', () => {
    expect(
      formatarPrecoProduto('2497', 'BRL'),
    ).toBe('R$ 2.497,00');
  });

  it('preserva centavos do preco', () => {
    expect(
      formatarPrecoProduto('49.7', 'BRL'),
    ).toBe('R$ 49,70');
  });

  it('retorna null quando nao ha preco valido', () => {
    expect(formatarPrecoProduto(null, 'BRL')).toBeNull();
    expect(formatarPrecoProduto('invalido', 'BRL')).toBeNull();
  });
});
