import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

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

import { enviarConvitePrimeiroAcesso } from
  '../src/lib/convite-primeiro-acesso';

const dadosFicticios = {
  email: 'aluno-ficticio@example.test',
  nome: 'Aluno Fictício',
  token: 'token-ficticio',
  detalharResultado: true,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('RESEND_API_KEY', 'chave-ficticia');

  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('resultado detalhado do primeiro convite legado', () => {
  it('registra confirmação do provedor com identificador', async () => {
    sendMock.mockResolvedValue({
      data: { id: 'mensagem-ficticia-123' },
      error: null,
    });

    const resultado = await enviarConvitePrimeiroAcesso(
      dadosFicticios,
    );

    expect(resultado).toEqual({
      ok: true,
      resultado: 'ENVIADO',
      mensagemProvedorId: 'mensagem-ficticia-123',
    });

    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it('classifica ausência da chave como FALHA sem chamar o provedor', async () => {
    vi.stubEnv('RESEND_API_KEY', '');

    const resultado = await enviarConvitePrimeiroAcesso(
      dadosFicticios,
    );

    expect(resultado).toEqual({
      ok: false,
      resultado: 'FALHA',
    });

    expect(sendMock).not.toHaveBeenCalled();
  });

  it('classifica resposta de erro do provedor como INDETERMINADO', async () => {
    sendMock.mockResolvedValue({
      data: null,
      error: { message: 'Erro fictício do provedor' },
    });

    const resultado = await enviarConvitePrimeiroAcesso(
      dadosFicticios,
    );

    expect(resultado).toEqual({
      ok: false,
      resultado: 'INDETERMINADO',
    });
  });

  it('classifica exceção de conexão como INDETERMINADO', async () => {
    sendMock.mockRejectedValue(
      new Error('Conexão interrompida — teste fictício'),
    );

    const resultado = await enviarConvitePrimeiroAcesso(
      dadosFicticios,
    );

    expect(resultado).toEqual({
      ok: false,
      resultado: 'INDETERMINADO',
    });
  });

  it('não confirma envio quando falta o identificador do provedor', async () => {
    sendMock.mockResolvedValue({
      data: {},
      error: null,
    });

    const resultado = await enviarConvitePrimeiroAcesso(
      dadosFicticios,
    );

    expect(resultado).toEqual({
      ok: false,
      resultado: 'INDETERMINADO',
    });
  });
});
