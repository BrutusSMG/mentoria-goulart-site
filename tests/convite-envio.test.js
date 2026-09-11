import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { sendMock } = vi.hoisted(() => ({
  sendMock: vi.fn(),
}));

vi.mock('resend', () => ({
  Resend: vi.fn(function Resend() {
    this.emails = {
      send: sendMock,
    };
  }),
}));

const { enviarConvitePrimeiroAcesso } = await import(
  '../src/lib/convite-primeiro-acesso.js'
);

describe('envio do convite de primeiro acesso', () => {
  const apiKeyOriginal = process.env.RESEND_API_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = 'chave-teste';
  });

  afterEach(() => {
    if (apiKeyOriginal === undefined) {
      delete process.env.RESEND_API_KEY;
    } else {
      process.env.RESEND_API_KEY = apiKeyOriginal;
    }
  });

  it('trata falha do provedor sem lançar erro', async () => {
    sendMock.mockResolvedValue({
      error: {
        message: 'Falha simulada no envio',
      },
    });

    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const resultado = await enviarConvitePrimeiroAcesso({
      email: 'aluno@example.com',
      nome: 'Aluno Teste',
      token: 'token-de-teste',
    });

    expect(resultado).toEqual({
      ok: false,
    });

    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it('envia convite de primeiro acesso com sucesso', async () => {
    sendMock.mockResolvedValue({
      data: {
        id: 'email-1',
      },
      error: null,
    });

    const consoleInfo = vi
      .spyOn(console, 'info')
      .mockImplementation(() => {});

    const resultado = await enviarConvitePrimeiroAcesso({
      email: 'aluno@example.com',
      nome: 'Aluno Teste',
      token: 'token-de-teste',
    });

    expect(resultado).toEqual({
      ok: true,
    });

    expect(sendMock).toHaveBeenCalledTimes(1);

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'Prof. Goulart <contato@mentoriagarimpourbano.com.br>',
        to: 'aluno@example.com',
        subject: 'Seu acesso à Área do Aluno — Garimpo Urbano',
        html: expect.stringContaining('token-de-teste'),
      }),
    );

    expect(consoleInfo).toHaveBeenCalled();

    consoleInfo.mockRestore();
  });
});