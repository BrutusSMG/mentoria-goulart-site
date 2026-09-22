import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  transaction: vi.fn(),
  alunoFindUnique: vi.fn(),
  pessoaFindUnique: vi.fn(),
  obterOuCriarPessoa: vi.fn(),
  vincularCadastroPessoa: vi.fn(),
}));

vi.mock('next-auth', () => ({
  getServerSession: mocks.getServerSession,
}));

vi.mock('@/app/api/auth/[...nextauth]/route', () => ({
  authOptions: {},
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: mocks.transaction,
  },
}));

vi.mock('@/lib/pessoa', () => ({
  obterOuCriarPessoa: mocks.obterOuCriarPessoa,
}));

vi.mock('@/lib/vincular-pessoa', () => ({
  vincularCadastroPessoa: mocks.vincularCadastroPessoa,
}));

import { POST } from '@/app/api/alunos/vincular-pessoa/route';

const tx = {
  aluno: {
    findUnique: mocks.alunoFindUnique,
  },
  pessoa: {
    findUnique: mocks.pessoaFindUnique,
  },
};

const alunoValido = {
  id: 'aluno_1',
  nome: 'Aluno Teste',
  email: 'aluno@example.com',
  whatsapp: null,
  status: 'ATIVO',
  emailVerificadoEm: new Date('2026-09-20T12:00:00Z'),
  pessoaId: null,
};

const pessoaValida = {
  id: 'pessoa_1',
  emailPrincipal: 'aluno@example.com',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('PESSOA_VINCULO_ALUNO_HABILITADO', 'true');

  mocks.getServerSession.mockResolvedValue({
    user: {
      tipoConta: 'ALUNO',
      alunoId: 'aluno_1',
    },
  });

  mocks.transaction.mockImplementation(async (operacao) => operacao(tx));

  mocks.alunoFindUnique.mockResolvedValue({ ...alunoValido });
  mocks.obterOuCriarPessoa.mockResolvedValue({ ...pessoaValida });

  mocks.pessoaFindUnique.mockResolvedValue({
    lead: null,
    aluno: null,
    adminUser: null,
  });

  mocks.vincularCadastroPessoa.mockResolvedValue({
    cadastroId: 'aluno_1',
    pessoaId: 'pessoa_1',
    jaVinculado: false,
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('POST /api/alunos/vincular-pessoa', () => {
  it('retorna 401 quando não existe sessão de aluno', async () => {
    mocks.getServerSession.mockResolvedValue(null);

    const resposta = await POST();

    expect(resposta.status).toBe(401);
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.obterOuCriarPessoa).not.toHaveBeenCalled();
  });

  it('retorna 401 quando a sessão é administrativa', async () => {
    mocks.getServerSession.mockResolvedValue({
      user: {
        tipoConta: 'ADMIN',
        alunoId: 'aluno_1',
      },
    });

    const resposta = await POST();

    expect(resposta.status).toBe(401);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it('retorna 403 quando a conta não está ativa', async () => {
    mocks.alunoFindUnique.mockResolvedValue({
      ...alunoValido,
      status: 'SUSPENSO',
    });

    const resposta = await POST();

    expect(resposta.status).toBe(403);
    expect(mocks.obterOuCriarPessoa).not.toHaveBeenCalled();
    expect(mocks.vincularCadastroPessoa).not.toHaveBeenCalled();
  });

  it('retorna 403 quando o e-mail do aluno não foi verificado', async () => {
    mocks.alunoFindUnique.mockResolvedValue({
      ...alunoValido,
      emailVerificadoEm: null,
    });

    const resposta = await POST();

    expect(resposta.status).toBe(403);
    expect(mocks.obterOuCriarPessoa).not.toHaveBeenCalled();
    expect(mocks.vincularCadastroPessoa).not.toHaveBeenCalled();
  });

  it('vincula apenas a conta identificada pela sessão', async () => {
    const resposta = await POST();
    const corpo = await resposta.json();

    expect(resposta.status).toBe(200);
    expect(corpo).toEqual({
      ok: true,
      cadastroId: 'aluno_1',
      pessoaId: 'pessoa_1',
      jaVinculado: false,
    });

    expect(mocks.alunoFindUnique).toHaveBeenCalledWith({
      where: { id: 'aluno_1' },
      select: {
        id: true,
        nome: true,
        email: true,
        whatsapp: true,
        status: true,
        emailVerificadoEm: true,
        pessoaId: true,
      },
    });

    expect(mocks.obterOuCriarPessoa).toHaveBeenCalledWith(tx, {
      nome: 'Aluno Teste',
      email: 'aluno@example.com',
      telefone: null,
    });

    expect(mocks.vincularCadastroPessoa).toHaveBeenCalledWith(tx, {
      tipo: 'aluno',
      cadastroId: 'aluno_1',
      pessoaId: 'pessoa_1',
    });

    expect(mocks.transaction).toHaveBeenCalledOnce();
  });

  it.each([
    ['Lead', { lead: { id: 'lead_1' } }],
    ['AdminUser', { adminUser: { id: 'admin_1' } }],
  ])(
    'retorna 409 quando a Pessoa já possui vínculo com %s',
    async (_tipo, vinculoExistente) => {
      mocks.pessoaFindUnique.mockResolvedValue({
        lead: null,
        aluno: null,
        adminUser: null,
        ...vinculoExistente,
      });

      const resposta = await POST();

      expect(resposta.status).toBe(409);
      expect(mocks.vincularCadastroPessoa).not.toHaveBeenCalled();
    },
  );

  it('retorna 409 quando a Pessoa pertence a outro aluno', async () => {
    mocks.pessoaFindUnique.mockResolvedValue({
      lead: null,
      aluno: { id: 'aluno_2' },
      adminUser: null,
    });

    const resposta = await POST();

    expect(resposta.status).toBe(409);
    expect(mocks.vincularCadastroPessoa).not.toHaveBeenCalled();
  });

  it('retorna 409 quando o aluno já está vinculado a outra Pessoa', async () => {
    mocks.alunoFindUnique.mockResolvedValue({
      ...alunoValido,
      pessoaId: 'pessoa_outra',
    });

    const resposta = await POST();

    expect(resposta.status).toBe(409);
    expect(mocks.vincularCadastroPessoa).not.toHaveBeenCalled();
  });

  it('retorna 404 quando o aluno da sessão não existe', async () => {
    mocks.alunoFindUnique.mockResolvedValue(null);

    const resposta = await POST();

    expect(resposta.status).toBe(404);
    expect(mocks.obterOuCriarPessoa).not.toHaveBeenCalled();
    expect(mocks.vincularCadastroPessoa).not.toHaveBeenCalled();
  });

  it('aceita repetir um vínculo já existente com a mesma Pessoa', async () => {
    mocks.alunoFindUnique.mockResolvedValue({
      ...alunoValido,
      pessoaId: 'pessoa_1',
    });

    mocks.pessoaFindUnique.mockResolvedValue({
      lead: null,
      aluno: { id: 'aluno_1' },
      adminUser: null,
    });

    mocks.vincularCadastroPessoa.mockResolvedValue({
      cadastroId: 'aluno_1',
      pessoaId: 'pessoa_1',
      jaVinculado: true,
    });

    const resposta = await POST();
    const corpo = await resposta.json();

    expect(resposta.status).toBe(200);
    expect(corpo).toEqual({
      ok: true,
      cadastroId: 'aluno_1',
      pessoaId: 'pessoa_1',
      jaVinculado: true,
    });

    expect(mocks.vincularCadastroPessoa).toHaveBeenCalledWith(
      tx,
        {
        tipo: 'aluno',
        cadastroId: 'aluno_1',
        pessoaId: 'pessoa_1',
      },
    );
  });

  it('mantém a rota indisponível quando a integração não foi habilitada', async () => {
    vi.stubEnv('PESSOA_VINCULO_ALUNO_HABILITADO', '');

    const resposta = await POST();

    expect(resposta.status).toBe(503);
    expect(mocks.getServerSession).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.obterOuCriarPessoa).not.toHaveBeenCalled();
    expect(mocks.vincularCadastroPessoa).not.toHaveBeenCalled();
  });
});