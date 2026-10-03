import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

const pessoaFindFirstMock = vi.fn();
const tokenFindFirstMock = vi.fn();
const tokenUpdateManyMock = vi.fn();
const tokenCreateMock = vi.fn();
const transactionMock = vi.fn();
const enviarConviteMock = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    pessoa: {
      findFirst: pessoaFindFirstMock,
    },
    alunoAccessToken: {
      findFirst: tokenFindFirstMock,
      updateMany: tokenUpdateManyMock,
      create: tokenCreateMock,
    },
    $transaction: transactionMock,
  },
}));

vi.mock('@/lib/convite-primeiro-acesso', () => ({
  TIPO_PRIMEIRO_ACESSO: 'PRIMEIRO_ACESSO',

  gerarTokenPrimeiroAcesso: vi.fn(
    () => 'token-reenvio',
  ),

  hashTokenAcesso: vi.fn(
    () => 'hash-token-reenvio',
  ),

  calcularExpiracaoConvitePrimeiroAcesso: vi.fn(
    (agora) =>
      new Date(
        agora.getTime() +
          72 * 60 * 60 * 1000,
      ),
  ),

  enviarConvitePrimeiroAcesso:
    enviarConviteMock,
}));

const { POST } = await import(
  '../src/app/api/alunos/reenviar-convite/route.js'
);

function pessoaFicticia({
  statusUsuario = 'PENDENTE_ATIVACAO',
  senhaHash = null,
  origem = 'HOTMART',
  conviteLegadoEnviadoEm = null,
  possuiAluno = true,
} = {}) {
  return {
    emailPrincipal: 'aluno@example.com',
    usuario: {
      id: 'usuario-1',
      status: statusUsuario,
      senhaHash,
    },
    aluno: possuiAluno
      ? {
          id: 'aluno-1',
          nome: 'Aluno Teste',
          email: 'aluno@example.com',
          status: 'ATIVO',
          origem,
          conviteLegadoEnviadoEm,
        }
      : null,
  };
}

function requisicao(
  email = ' ALUNO@example.com ',
) {
  return {
    json: vi.fn().mockResolvedValue({
      email,
    }),
  };
}

beforeEach(() => {
  vi.clearAllMocks();

  pessoaFindFirstMock.mockResolvedValue(
    pessoaFicticia(),
  );

  tokenFindFirstMock.mockResolvedValue(null);

  tokenUpdateManyMock.mockReturnValue({
    operacao: 'invalidar-convites',
  });

  tokenCreateMock.mockReturnValue({
    operacao: 'criar-convite',
  });

  transactionMock.mockResolvedValue([]);

  enviarConviteMock.mockResolvedValue({
    ok: true,
  });
});

describe(
  'POST /api/alunos/reenviar-convite',
  () => {
    it(
      'cria novo convite para Usuario pendente',
      async () => {
        const resposta = await POST(
          requisicao(),
        );

        expect(resposta.status).toBe(200);

        expect(
          pessoaFindFirstMock,
        ).toHaveBeenCalledWith({
          where: {
            emailPrincipal: {
              equals: 'aluno@example.com',
              mode: 'insensitive',
            },
          },
          select: {
            emailPrincipal: true,
            usuario: {
              select: {
                id: true,
                status: true,
                senhaHash: true,
              },
            },
            aluno: {
              select: {
                id: true,
                nome: true,
                email: true,
                status: true,
                origem: true,
                conviteLegadoEnviadoEm:
                  true,
              },
            },
          },
        });

        expect(
          transactionMock,
        ).toHaveBeenCalledTimes(1);

        expect(
          enviarConviteMock,
        ).toHaveBeenCalledWith({
          email: 'aluno@example.com',
          nome: 'Aluno Teste',
          token: 'token-reenvio',
        });
      },
    );

    it(
      'nao reenvia para Usuario ja ativo',
      async () => {
        pessoaFindFirstMock.mockResolvedValue(
          pessoaFicticia({
            statusUsuario: 'ATIVO',
            senhaHash: 'hash-existente',
          }),
        );

        const resposta = await POST(
          requisicao(),
        );

        expect(resposta.status).toBe(200);

        expect(
          transactionMock,
        ).not.toHaveBeenCalled();

        expect(
          enviarConviteMock,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'reenvia para legado somente apos envio inicial confirmado',
      async () => {
        pessoaFindFirstMock.mockResolvedValue(
          pessoaFicticia({
            origem: 'LEGADO',
            conviteLegadoEnviadoEm:
              new Date(
                '2026-09-22T18:00:00.000Z',
              ),
          }),
        );

        const resposta = await POST(
          requisicao(),
        );

        expect(resposta.status).toBe(200);

        expect(
          transactionMock,
        ).toHaveBeenCalledTimes(1);

        expect(
          enviarConviteMock,
        ).toHaveBeenCalledTimes(1);
      },
    );

    it(
      'bloqueia reenvio publico antes do primeiro envio legado',
      async () => {
        pessoaFindFirstMock.mockResolvedValue(
          pessoaFicticia({
            origem: 'LEGADO',
            conviteLegadoEnviadoEm: null,
          }),
        );

        const resposta = await POST(
          requisicao(),
        );

        expect(resposta.status).toBe(200);

        expect(
          transactionMock,
        ).not.toHaveBeenCalled();

        expect(
          enviarConviteMock,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'nao cria convite sem contexto de Aluno',
      async () => {
        pessoaFindFirstMock.mockResolvedValue(
          pessoaFicticia({
            possuiAluno: false,
          }),
        );

        const resposta = await POST(
          requisicao(),
        );

        expect(resposta.status).toBe(200);

        expect(
          transactionMock,
        ).not.toHaveBeenCalled();

        expect(
          enviarConviteMock,
        ).not.toHaveBeenCalled();
      },
    );
  },
);
