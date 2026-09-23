import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

const mocks = vi.hoisted(() => ({
  preparar: vi.fn(),
  registrar: vi.fn(),
}));

vi.mock('@/lib/preparar-primeiro-convite-legado', () => ({
  prepararPrimeiroConviteLegado: mocks.preparar,
}));

vi.mock('@/lib/registrar-resultado-convite-legado', () => ({
  registrarResultadoPrimeiroConviteLegado: mocks.registrar,
}));

import { executarPrimeiroConviteLegado } from
  '../src/lib/executar-primeiro-convite-legado';

function criarCenario() {
  let transacaoAtiva = false;

  const prisma = {
    $transaction: vi.fn(async (operacao) => {
      expect(transacaoAtiva).toBe(false);

      transacaoAtiva = true;

      try {
        return await operacao({ transacaoFicticia: true });
      } finally {
        transacaoAtiva = false;
      }
    }),
  };

  const enviar = vi.fn();

  return {
    prisma,
    enviar,
    transacaoEstaAtiva: () => transacaoAtiva,
  };
}

beforeEach(() => {
  vi.clearAllMocks();

  mocks.preparar.mockResolvedValue({
    preparado: true,
    aluno: {
      id: 'aluno-ficticio',
      nome: 'Aluno Fictício',
      email: 'aluno@example.test',
    },
    token: 'token-secreto-ficticio',
  });

  mocks.registrar.mockResolvedValue({
    registrado: true,
  });
});

describe('executarPrimeiroConviteLegado', () => {
  it('envia fora da transação e registra a aceitação do provedor', async () => {
    const cenario = criarCenario();

    cenario.enviar.mockImplementation(async () => {
      expect(cenario.transacaoEstaAtiva()).toBe(false);

      return {
        ok: true,
        resultado: 'ENVIADO',
        mensagemProvedorId: 'mensagem-ficticia-123',
      };
    });

    const resposta = await executarPrimeiroConviteLegado({
      prisma: cenario.prisma,
      alunoId: 'aluno-ficticio',
      enviar: cenario.enviar,
    });

    expect(resposta).toEqual({
      estado: 'ENVIADO',
    });

    expect(cenario.prisma.$transaction).toHaveBeenCalledTimes(2);

    expect(cenario.enviar).toHaveBeenCalledExactlyOnceWith({
      email: 'aluno@example.test',
      nome: 'Aluno Fictício',
      token: 'token-secreto-ficticio',
      detalharResultado: true,
    });

    expect(mocks.registrar).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        alunoId: 'aluno-ficticio',
        resultado: 'ENVIADO',
        mensagemProvedorId: 'mensagem-ficticia-123',
      }),
    );

    // O token e o identificador do provedor não
    // aparecem na resposta destinada à rota.
    expect(JSON.stringify(resposta)).not.toContain(
      'token-secreto-ficticio',
    );
    expect(JSON.stringify(resposta)).not.toContain(
      'mensagem-ficticia-123',
    );
  });

  it('registra FALHA quando o envio não foi iniciado', async () => {
    const cenario = criarCenario();

    cenario.enviar.mockResolvedValue({
      ok: false,
      resultado: 'FALHA',
    });

    const resposta = await executarPrimeiroConviteLegado({
      prisma: cenario.prisma,
      alunoId: 'aluno-ficticio',
      enviar: cenario.enviar,
    });

    expect(resposta).toEqual({ estado: 'FALHA' });

    expect(mocks.registrar).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        resultado: 'FALHA',
        mensagemProvedorId: null,
      }),
    );
  });

  it('registra INDETERMINADO quando o provedor não confirma o envio', async () => {
    const cenario = criarCenario();

    cenario.enviar.mockResolvedValue({
      ok: false,
      resultado: 'INDETERMINADO',
    });

    const resposta = await executarPrimeiroConviteLegado({
      prisma: cenario.prisma,
      alunoId: 'aluno-ficticio',
      enviar: cenario.enviar,
    });

    expect(resposta).toEqual({
      estado: 'INDETERMINADO',
    });

    expect(mocks.registrar).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        resultado: 'INDETERMINADO',
      }),
    );

    expect(cenario.enviar).toHaveBeenCalledTimes(1);
  });

  it('trata exceção do provedor como INDETERMINADO sem reenviar', async () => {
    const cenario = criarCenario();

    cenario.enviar.mockRejectedValue(
      new Error('Conexão interrompida — teste'),
    );

    const resposta = await executarPrimeiroConviteLegado({
      prisma: cenario.prisma,
      alunoId: 'aluno-ficticio',
      enviar: cenario.enviar,
    });

    expect(resposta).toEqual({
      estado: 'INDETERMINADO',
    });

    expect(cenario.enviar).toHaveBeenCalledTimes(1);
    expect(mocks.registrar).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        resultado: 'INDETERMINADO',
      }),
    );
  });

  it('recusa a tentativa sem chamar o provedor quando a preparação falha', async () => {
    const cenario = criarCenario();

    mocks.preparar.mockResolvedValue({
      preparado: false,
      motivo: 'O convite já foi reservado.',
    });

    const resposta = await executarPrimeiroConviteLegado({
      prisma: cenario.prisma,
      alunoId: 'aluno-ficticio',
      enviar: cenario.enviar,
    });

    expect(resposta).toEqual({
      estado: 'RECUSADO',
      motivo: 'O convite já foi reservado.',
    });

    expect(cenario.prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(cenario.enviar).not.toHaveBeenCalled();
    expect(mocks.registrar).not.toHaveBeenCalled();
  });

  it('não confirma ENVIADO sem identificador do provedor', async () => {
    const cenario = criarCenario();

    cenario.enviar.mockResolvedValue({
      ok: true,
      resultado: 'ENVIADO',
    });

    const resposta = await executarPrimeiroConviteLegado({
      prisma: cenario.prisma,
      alunoId: 'aluno-ficticio',
      enviar: cenario.enviar,
    });

    expect(resposta).toEqual({
      estado: 'INDETERMINADO',
    });

    expect(mocks.registrar).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        resultado: 'INDETERMINADO',
        mensagemProvedorId: null,
      }),
    );
  });

  it('exige conferência quando o banco não registra o resultado', async () => {
    const cenario = criarCenario();

    cenario.enviar.mockResolvedValue({
      ok: true,
      resultado: 'ENVIADO',
      mensagemProvedorId: 'mensagem-ficticia',
    });

    mocks.registrar.mockResolvedValue({
      registrado: false,
    });

    const resposta = await executarPrimeiroConviteLegado({
      prisma: cenario.prisma,
      alunoId: 'aluno-ficticio',
      enviar: cenario.enviar,
    });

    expect(resposta.estado).toBe('CONFERIR');
    expect(cenario.enviar).toHaveBeenCalledTimes(1);
  });

  it('não reenvia quando o registro no banco lança erro', async () => {
    const cenario = criarCenario();

    cenario.enviar.mockResolvedValue({
      ok: true,
      resultado: 'ENVIADO',
      mensagemProvedorId: 'mensagem-ficticia',
    });

    mocks.registrar.mockRejectedValue(
      new Error('Falha fictícia de gravação'),
    );

    const resposta = await executarPrimeiroConviteLegado({
      prisma: cenario.prisma,
      alunoId: 'aluno-ficticio',
      enviar: cenario.enviar,
    });

    expect(resposta.estado).toBe('CONFERIR');
    expect(cenario.enviar).toHaveBeenCalledTimes(1);
  });

  it('não chama o provedor quando a transação de preparação falha', async () => {
    const cenario = criarCenario();

    mocks.preparar.mockRejectedValue(
      new Error('Falha fictícia na preparação'),
    );

    await expect(
      executarPrimeiroConviteLegado({
        prisma: cenario.prisma,
        alunoId: 'aluno-ficticio',
        enviar: cenario.enviar,
      }),
    ).rejects.toThrow('Falha fictícia na preparação');

    expect(cenario.enviar).not.toHaveBeenCalled();
    expect(mocks.registrar).not.toHaveBeenCalled();
  });
});
