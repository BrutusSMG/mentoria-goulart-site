import { describe, expect, it } from 'vitest';
import { extrairValorBrutoHotmart } from '@/lib/hotmart-valor';

describe('valor financeiro da Hotmart', () => {
  it('diferencia preço ausente de zero explícito', () => {
    expect(extrairValorBrutoHotmart({})).toBeNull();
    expect(extrairValorBrutoHotmart({ full_price: {} })).toBeNull();
    expect(extrairValorBrutoHotmart({ full_price: { value: 0 } })).toBe('0');
    expect(extrairValorBrutoHotmart({ price: { value: '0.00' } })).toBe('0.00');
  });
  it('prioriza full_price e usa price quando não informado', () => {
    expect(extrairValorBrutoHotmart({ full_price: { value: 120.5 }, price: { value: 99 } })).toBe('120.5');
    expect(extrairValorBrutoHotmart({ price: { value: 99.9 } })).toBe('99.9');
  });
  it('recusa preço inválido sem convertê-lo silenciosamente em zero', () => {
    expect(extrairValorBrutoHotmart({ price: { value: '-4' } })).toBeNull();
    expect(extrairValorBrutoHotmart({ price: { value: 'invalido' } })).toBeNull();
  });
});
