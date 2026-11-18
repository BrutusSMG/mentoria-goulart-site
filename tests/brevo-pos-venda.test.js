import { beforeEach, describe, expect, it, vi } from 'vitest';

const enviar = vi.fn();
vi.stubGlobal('fetch', enviar);

import { moverCompradorParaPosVenda } from '@/lib/brevo';

describe('sincronização Hotmart → Brevo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('BREVO_API_KEY', 'chave-de-teste');
    vi.stubEnv('BREVO_LIST_ID_EBOOK', '6');
    vi.stubEnv('BREVO_LIST_ID_CLIENTES_MENTORIA', '14');
    enviar.mockResolvedValue({ ok: true });
  });

  it('cria ou atualiza comprador diretamente na lista 14, sem depender da lista 6', async () => {
    await moverCompradorParaPosVenda('  COMPRADOR@EXEMPLO.COM  ');

    expect(enviar).toHaveBeenCalledTimes(2);
    expect(enviar.mock.calls[0][0]).toBe('https://api.brevo.com/v3/contacts');
    expect(JSON.parse(enviar.mock.calls[0][1].body)).toEqual({
      email: 'comprador@exemplo.com',
      listIds: [14],
      updateEnabled: true,
    });
    expect(enviar.mock.calls[1][0]).toBe('https://api.brevo.com/v3/contacts/lists/6/contacts/remove');
  });

  it('não remove da lista 6 quando a inclusão na lista 14 falha', async () => {
    enviar.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => 'erro de teste',
    });

    await expect(moverCompradorParaPosVenda('comprador@exemplo.com'))
      .rejects.toThrow('Brevo 400');
    expect(enviar).toHaveBeenCalledTimes(1);
  });

  it('rejeita comprador sem email e não comunica com o Brevo', async () => {
    await expect(moverCompradorParaPosVenda('')).rejects.toThrow('E-mail');
    expect(enviar).not.toHaveBeenCalled();
  });
});
