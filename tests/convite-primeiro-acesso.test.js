import { describe, expect, it } from 'vitest';
import {
  TIPO_PRIMEIRO_ACESSO,
  VALIDADE_CONVITE_PRIMEIRO_ACESSO_MS,
  calcularExpiracaoConvitePrimeiroAcesso,
  gerarTokenPrimeiroAcesso,
  hashTokenAcesso,
} from '../src/lib/convite-primeiro-acesso.js';

describe('convite de primeiro acesso', () => {
  it('mantém o tipo oficial do token', () => {
    expect(TIPO_PRIMEIRO_ACESSO).toBe('PRIMEIRO_ACESSO');
  });

  it('gera token criptograficamente aleatório de 32 bytes em hexadecimal', () => {
    const token = gerarTokenPrimeiroAcesso();

    expect(token).toMatch(/^[a-f0-9]{64}$/);
  });

  it('gera tokens diferentes em chamadas sucessivas', () => {
    const primeiro = gerarTokenPrimeiroAcesso();
    const segundo = gerarTokenPrimeiroAcesso();

    expect(primeiro).not.toBe(segundo);
  });

  it('gera hash SHA-256 determinístico sem armazenar o token original', () => {
    const token = 'token-de-teste';

    const hash1 = hashTokenAcesso(token);
    const hash2 = hashTokenAcesso(token);

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(token);
    expect(hash1).toMatch(/^[a-f0-9]{64}$/);
  });

  it('mantém validade de 72 horas', () => {
    expect(VALIDADE_CONVITE_PRIMEIRO_ACESSO_MS).toBe(
      72 * 60 * 60 * 1000,
    );

    const agora = new Date('2026-09-07T12:00:00.000Z');
    const expiracao =
      calcularExpiracaoConvitePrimeiroAcesso(agora);

    expect(expiracao.toISOString()).toBe(
      '2026-09-10T12:00:00.000Z',
    );
  });

  it('não altera o objeto Date recebido ao calcular a expiração', () => {
    const agora = new Date('2026-09-07T12:00:00.000Z');
    const original = agora.toISOString();

    calcularExpiracaoConvitePrimeiroAcesso(agora);

    expect(agora.toISOString()).toBe(original);
  });
});