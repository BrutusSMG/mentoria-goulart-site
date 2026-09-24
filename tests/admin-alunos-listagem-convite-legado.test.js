import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

const mocks = vi.hoisted(() => ({
  obterAcessoAdmin: vi.fn(),
  alunoCount: vi.fn(),
  alunoFindMany: vi.fn(),
}));

vi.mock('@/lib/admin-permissoes', () => ({
  obterAcessoAdmin: mocks.obterAcessoAdmin,
  respostaAcessoNegado: vi.fn(),
  prisma: {
    aluno: {
      count: mocks.alunoCount,
      findMany: mocks.alunoFindMany,
    },
  },
}));

import { GET } from
  '../src/app/api/admin/alunos/route.js';

function requisicao(query = '') {
  return new Request(
    `http://localhost/api/admin/alunos${query}`,
  );
}

function alunoFicticio({
  id = 'aluno-ficticio',
  origem = 'LEGADO',
  statusControle = 'PENDENTE',
  senhaHash = null,
  emailVerificadoEm = null,
  conviteLegadoEnviadoEm = null,
} = {}) {
  return {
    id,
    nome: 'Aluno Fictício',
    email: `${id}@example.test`,
    whatsapp: null,
    status: 'ATIVO',
    origem,
    senhaHash,
    emailVerificadoEm,
    conviteLegadoEnviadoEm,
    controleConviteLegado:
      statusControle === null
        ? null
        : { status: statusControle },
    ultimoLoginEm: null,
    createdAt: new Date(),
    perfil: null,
    matriculas: [],
  };
}

beforeEach(() => {
  vi.clearAllMocks();

  mocks.obterAcessoAdmin.mockResolvedValue({
    permitido: true,
  });

  mocks.alunoCount.mockResolvedValue(0);
  mocks.alunoFindMany.mockResolvedValue([]);
});

describe('GET /api/admin/alunos — convite legado', () => {
  it('calcula estados distintos sem expor os campos internos', async () => {
    mocks.alunoCount.mockResolvedValue(4);

    mocks.alunoFindMany.mockResolvedValue([
      alunoFicticio({
        id: 'legado-falha',
        statusControle: 'FALHA',
      }),
      alunoFicticio({
        id: 'legado-indeterminado',
        statusControle: 'INDETERMINADO',
      }),
      alunoFicticio({
        id: 'legado-concluido',
        statusControle: 'ENVIADO',
        senhaHash: 'hash-ficticio-confidencial',
        emailVerificadoEm: new Date(),
        conviteLegadoEnviadoEm: new Date(),
      }),
      alunoFicticio({
        id: 'aluno-hotmart',
        origem: 'HOTMART',
        statusControle: null,
      }),
    ]);

    const resposta = await GET(requisicao());
    const corpo = await resposta.json();

    expect(resposta.status).toBe(200);

    expect(
      corpo.items.map(
        (aluno) => aluno.estadoConviteLegado,
      ),
    ).toEqual([
      'FALHA',
      'INDETERMINADO',
      'PRIMEIRO_ACESSO_CONCLUIDO',
      null,
    ]);

    for (const aluno of corpo.items) {
      expect(aluno).not.toHaveProperty('senhaHash');
      expect(aluno).not.toHaveProperty(
        'emailVerificadoEm',
      );
      expect(aluno).not.toHaveProperty(
        'conviteLegadoEnviadoEm',
      );
      expect(aluno).not.toHaveProperty(
        'controleConviteLegado',
      );
    }

    expect(JSON.stringify(corpo)).not.toContain(
      'hash-ficticio-confidencial',
    );

    expect(mocks.alunoFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          senhaHash: true,
          emailVerificadoEm: true,
          conviteLegadoEnviadoEm: true,
          controleConviteLegado: {
            select: {
              status: true,
            },
          },
        }),
      }),
    );
  });

  it('sinaliza inconsistência entre controle e data de envio', async () => {
    mocks.alunoCount.mockResolvedValue(1);

    mocks.alunoFindMany.mockResolvedValue([
      alunoFicticio({
        statusControle: 'ENVIADO',
        conviteLegadoEnviadoEm: null,
      }),
    ]);

    const resposta = await GET(requisicao());
    const corpo = await resposta.json();

    expect(resposta.status).toBe(200);
    expect(
      corpo.items[0].estadoConviteLegado,
    ).toBe('CONFERIR');
  });

  it('preserva busca, filtro e paginação da listagem', async () => {
    mocks.alunoCount.mockResolvedValue(1);

    mocks.alunoFindMany.mockResolvedValue([
      alunoFicticio({
        id: 'legado-pendente',
        statusControle: 'PENDENTE',
      }),
    ]);

    const resposta = await GET(
      requisicao('?page=2&pageSize=10&q=Teste&status=ATIVO'),
    );

    const corpo = await resposta.json();

    expect(resposta.status).toBe(200);
    expect(corpo.items[0].estadoConviteLegado).toBe(
      'PENDENTE',
    );

    expect(corpo.pagination).toEqual({
      page: 2,
      pageSize: 10,
      total: 1,
      totalPages: 1,
    });

    expect(mocks.alunoFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
        where: {
          AND: [
            {
              OR: [
                {
                  nome: {
                    contains: 'Teste',
                    mode: 'insensitive',
                  },
                },
                {
                  email: {
                    contains: 'Teste',
                    mode: 'insensitive',
                  },
                },
              ],
            },
            { status: 'ATIVO' },
          ],
        },
      }),
    );
  });
});
