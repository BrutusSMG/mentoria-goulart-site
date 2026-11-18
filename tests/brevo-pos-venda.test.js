import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { moverCompradorParaPosVenda } from '../src/lib/brevo.js';

describe('moverCompradorParaPosVenda', () => {
  const fetchOriginal = globalThis.fetch;
  const envOriginal = {
    BREVO_API_KEY: process.env.BREVO_API_KEY,
    BREVO_LIST_ID_EBOOK: process.env.BREVO_LIST_ID_EBOOK,
    BREVO_LIST_ID_CLIENTES_MENTORIA: process.env.BREVO_LIST_ID_CLIENTES_MENTORIA,
  };

  beforeEach(() => {
    process.env.BREVO_API_KEY = 'chave-de-teste';
    process.env.BREVO_LIST_ID_EBOOK = '6';
    process.env.BREVO_LIST_ID_CLIENTES_MENTORIA = '14';
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
    });
  });

  afterEach(() => {
    globalThis.fetch = fetchOriginal;
    for (const [chave, valor] of Object.entries(envOriginal)) {
      if (valor === undefined) delete process.env[chave];
      else process.env[chave] = valor;
    }
    vi.restoreAllMocks();
  });

  it('cria comprador direto na lista #14 sem exigir passagem pela lista #6', async () => {
    await moverCompradorParaPosVenda('  DIRETO@EXAMPLE.COM  ');

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      1,
      'https://api.brevo.com/v3/contacts',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          email: 'direto@example.com',
          listIds: [14],
          updateEnabled: true,
        }),
      }),
    );
    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      2,
      'https://api.brevo.com/v3/contacts/lists/6/contacts/remove',
      expect.objectContaining({
        body: JSON.stringify({ emails: ['direto@example.com'] }),
      }),
    );
  });

  it('atualiza contato existente sem duplicar cadastro', async () => {
    await moverCompradorParaPosVenda('lead@example.com');
    const body = JSON.parse(globalThis.fetch.mock.calls[0][1].body);
    expect(body.updateEnabled).toBe(true);
    expect(body.listIds).toEqual([14]);
  });

  it('não remove da lista #6 se a criação/associação à #14 falhar', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => 'erro-de-teste',
    });
    await expect(moverCompradorParaPosVenda('erro@example.com')).rejects.toThrow(
      'Brevo 400',
    );
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('rejeita configuração ausente e email vazio sem chamar API', async () => {
    await expect(moverCompradorParaPosVenda('')).rejects.toThrow(
      'E-mail do comprador ausente',
    );
    delete process.env.BREVO_API_KEY;
    await expect(moverCompradorParaPosVenda('novo@example.com')).rejects.toThrow(
      'BREVO_API_KEY não configurada',
    );
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
