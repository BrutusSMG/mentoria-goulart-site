import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

const mocks = vi.hoisted(() => ({
  tokenFindUnique: vi.fn(),
  tokenUpdateMany: vi.fn(),
  usuarioUpdateMany: vi.fn(),
  transaction: vi.fn(),
  bcryptHash: vi.fn(),
  definirCredencial: vi.fn(),
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json(data, init = {}) {
      return Response.json(data, init);
    },
  },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    alunoAccessToken: {
      findUnique: mocks.tokenFindUnique,
    },
    $transaction: mocks.transaction,
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: mocks.bcryptHash,
  },
}));

vi.mock('@/lib/credencial-usuario', () => ({
  definirCredencialCanonica:
    mocks.definirCredencial,
}));

const { POST } = await import(
  '../src/app/api/alunos/redefinir-senha/route.js'
);

function tokenFicticio({
  usadoEm = null,
  expirado = false,
  pessoaId = 'pessoa-1',
} = {}) {
  return {
    id: 'token-1',
    alunoId: 'aluno-1',
    tipo: 'RECUPERACAO_SENHA',
    usadoEm,
    expiraEm: new Date(
      Date.now() +
        (expirado ? -60_000 : 3_600_000),
    ),
    aluno: {
      id: 'aluno-1',
      pessoaId,
      status: 'ATIVO',
    },
  };
}

function requisicao() {
  return {
    json: vi.fn().mockResolvedValue({
      token: 'token-secreto',
      senha: 'NovaSenha123!',
    }),
  };
}

beforeEach(() => {
  vi.clearAllMocks();

  mocks.tokenFindUnique.mockResolvedValue(
    tokenFicticio(),
  );

  mocks.bcryptHash.mockResolvedValue(
    'hash-novo',
  );

  mocks.tokenUpdateMany.mockResolvedValue({
    count: 1,
  });

  mocks.usuarioUpdateMany.mockResolvedValue({
    count: 1,
  });

  mocks.definirCredencial.mockResolvedValue(
    {},
  );

  mocks.transaction.mockImplementation(
    async (callback) =>
      callback({
        alunoAccessToken: {
          updateMany:
            mocks.tokenUpdateMany,
        },
        usuario: {
          updateMany:
            mocks.usuarioUpdateMany,
        },
      }),
  );
});

describe(
  'POST /api/alunos/redefinir-senha',
  () => {
    it(
      'redefine a credencial canonica e consome o token',
      async () => {
        const response = await POST(
          requisicao(),
        );

        expect(response.status).toBe(200);

        expect(
          await response.json(),
        ).toEqual({
          ok: true,
        });

        expect(
          mocks.tokenUpdateMany,
        ).toHaveBeenCalledWith({
          where: {
            id: 'token-1',
            alunoId: 'aluno-1',
            tipo: 'RECUPERACAO_SENHA',
            usadoEm: null,
            expiraEm: {
              gt: expect.any(Date),
            },
          },
          data: {
            usadoEm: expect.any(Date),
          },
        });

        expect(
          mocks.usuarioUpdateMany,
        ).toHaveBeenCalledWith({
          where: {
            pessoaId: 'pessoa-1',
            status: 'ATIVO',
            senhaHash: {
              not: null,
            },
          },
          data: {
            senhaHash: 'hash-novo',
            mustChangePassword: false,
            passwordChangedAt:
              expect.any(Date),
          },
        });

        expect(
          mocks.definirCredencial,
        ).toHaveBeenCalledWith(
          expect.any(Object),
          {
            pessoaId: 'pessoa-1',
            senhaHash: 'hash-novo',
            mustChangePassword: false,
            passwordChangedAt:
              expect.any(Date),
            ativarUsuario: false,
          },
        );
      },
    );

    it(
      'rejeita token ja utilizado antes de iniciar transacao',
      async () => {
        mocks.tokenFindUnique.mockResolvedValue(
          tokenFicticio({
            usadoEm: new Date(),
          }),
        );

        const response = await POST(
          requisicao(),
        );

        expect(response.status).toBe(400);

        expect(
          mocks.transaction,
        ).not.toHaveBeenCalled();

        expect(
          mocks.bcryptHash,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'rejeita corrida quando outro processo consumiu o token',
      async () => {
        mocks.tokenUpdateMany.mockResolvedValue({
          count: 0,
        });

        const response = await POST(
          requisicao(),
        );

        expect(response.status).toBe(400);

        expect(
          mocks.tokenUpdateMany,
        ).toHaveBeenCalledTimes(1);

        expect(
          mocks.usuarioUpdateMany,
        ).not.toHaveBeenCalled();

        expect(
          mocks.definirCredencial,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'rejeita quando Usuario deixou de possuir credencial ativa',
      async () => {
        mocks.usuarioUpdateMany.mockResolvedValue({
          count: 0,
        });

        const response = await POST(
          requisicao(),
        );

        expect(response.status).toBe(400);

        expect(
          mocks.usuarioUpdateMany,
        ).toHaveBeenCalledTimes(1);

        expect(
          mocks.definirCredencial,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'rejeita token sem vinculo com Pessoa',
      async () => {
        mocks.tokenFindUnique.mockResolvedValue(
          tokenFicticio({
            pessoaId: null,
          }),
        );

        const response = await POST(
          requisicao(),
        );

        expect(response.status).toBe(400);

        expect(
          mocks.transaction,
        ).not.toHaveBeenCalled();
      },
    );
  },
);
