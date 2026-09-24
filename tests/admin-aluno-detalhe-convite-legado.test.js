import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

const mocks = vi.hoisted(() => ({
  obterAcessoAdmin: vi.fn(),
  alunoFindUnique: vi.fn(),
}));

vi.mock('@/lib/admin-permissoes', () => ({
  obterAcessoAdmin: mocks.obterAcessoAdmin,
  respostaAcessoNegado: vi.fn(),
  prisma: {
    aluno: {
      findUnique: mocks.alunoFindUnique,
    },
  },
}));

import { GET } from
  '../src/app/api/admin/alunos/[id]/route.js';

function contexto() {
  return {
    params: Promise.resolve({ id: 'aluno-ficticio' }),
  };
}

function alunoFicticio() {
  return {
    id: 'aluno-ficticio',
    nome: 'Aluno Fictício',
    email: 'aluno@example.test',
    origem: 'LEGADO',
    status: 'ATIVO',
    senhaHash: null,
    emailVerificadoEm: null,
    conviteLegadoEnviadoEm: null,
    controleConviteLegado: {
      status: 'FALHA',
    },
    perfil: null,
    matriculas: [],
    transacoesHotmart: [],
  };
}

beforeEach(() => {
  vi.clearAllMocks();

  mocks.obterAcessoAdmin.mockResolvedValue({
    permitido: true,
    conta: {
      role: 'ADMIN',
    },
  });

  mocks.alunoFindUnique.mockResolvedValue(
    alunoFicticio(),
  );
});

describe('GET /api/admin/alunos/[id] — convite legado', () => {
  it('retorna o estado FALHA sem expor o hash da senha', async () => {
    const resposta = await GET(null, contexto());
    const corpo = await resposta.json();

    expect(resposta.status).toBe(200);
    expect(corpo.item.estadoConviteLegado).toBe('FALHA');
    expect(corpo.item).not.toHaveProperty('senhaHash');

    expect(
      mocks.alunoFindUnique,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'aluno-ficticio' },
        select: expect.objectContaining({
          senhaHash: true,
          conviteLegadoEnviadoEm: true,
          controleConviteLegado: {
            select: {
              status: true,
              tentativas: true,
              tentativaIniciadaEm: true,
              tentativaEncerradaEm: true,
            },
          },
        }),
      }),
    );
  });

  it('identifica primeiro acesso concluído sem divulgar o hash', async () => {
    mocks.alunoFindUnique.mockResolvedValue({
      ...alunoFicticio(),
      senhaHash: 'hash-ficticio-que-nao-pode-ser-exposto',
      emailVerificadoEm: new Date(),
      conviteLegadoEnviadoEm: new Date(),
      controleConviteLegado: {
        status: 'ENVIADO',
      },
    });

    const resposta = await GET(null, contexto());
    const corpo = await resposta.json();

    expect(resposta.status).toBe(200);
    expect(corpo.item.estadoConviteLegado).toBe(
      'PRIMEIRO_ACESSO_CONCLUIDO',
    );

    expect(corpo.item).not.toHaveProperty('senhaHash');
    expect(JSON.stringify(corpo)).not.toContain(
      'hash-ficticio-que-nao-pode-ser-exposto',
    );
  });

  it('não atribui estado de convite legado a aluno de outra origem', async () => {
    mocks.alunoFindUnique.mockResolvedValue({
      ...alunoFicticio(),
      origem: 'HOTMART',
      controleConviteLegado: null,
    });

    const resposta = await GET(null, contexto());
    const corpo = await resposta.json();

    expect(resposta.status).toBe(200);
    expect(corpo.item.estadoConviteLegado).toBeNull();
  });

  it('retorna somente os dados de auditoria permitidos', async () => {
    const inicio = new Date('2026-09-20T10:00:00.000Z');
    const fim = new Date('2026-09-20T10:01:00.000Z');

    mocks.alunoFindUnique.mockResolvedValue({
      ...alunoFicticio(),
      controleConviteLegado: {
        status: 'INDETERMINADO',
        tentativas: 1,
        tentativaIniciadaEm: inicio,
        tentativaEncerradaEm: fim,
        ultimoErro: 'detalhe-operacional-confidencial',
        mensagemProvedorId: 'identificador-privado',
      },
    });

    const resposta = await GET(null, contexto());
    const corpo = await resposta.json();

    expect(resposta.status).toBe(200);
    expect(corpo.item.estadoConviteLegado).toBe(
      'INDETERMINADO',
    );

    expect(corpo.item.controleConviteLegado).toEqual({
      status: 'INDETERMINADO',
      tentativas: 1,
      tentativaIniciadaEm: inicio.toISOString(),
      tentativaEncerradaEm: fim.toISOString(),
    });

    const respostaSerializada = JSON.stringify(corpo);

    expect(respostaSerializada).not.toContain(
      'detalhe-operacional-confidencial',
    );
    expect(respostaSerializada).not.toContain(
      'identificador-privado',
    );

    expect(mocks.alunoFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          controleConviteLegado: {
            select: {
              status: true,
              tentativas: true,
              tentativaIniciadaEm: true,
              tentativaEncerradaEm: true,
            },
          },
        }),
      }),
    );
  });

  it('exige conferência quando não existe controle de convite', async () => {
    mocks.alunoFindUnique.mockResolvedValue({
      ...alunoFicticio(),
      controleConviteLegado: null,
    });

    const resposta = await GET(null, contexto());
    const corpo = await resposta.json();

    expect(resposta.status).toBe(200);
    expect(corpo.item.estadoConviteLegado).toBe(
      'CONFERIR',
    );
    expect(corpo.item.controleConviteLegado).toBeNull();
  });
});
