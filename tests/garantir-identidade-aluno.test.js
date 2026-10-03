import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  garantirIdentidadeAluno,
} from '../src/lib/garantir-identidade-aluno';

function criarTx() {
  return {
    pessoa: {
      findUnique: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({
        id: 'pessoa-1',
        emailPrincipal: 'aluno@example.com',
      }),
    },
    usuario: {
      create: vi.fn().mockResolvedValue({
        id: 'usuario-1',
        senhaHash: null,
        status: 'PENDENTE_ATIVACAO',
      }),
      update: vi.fn(),
    },
    aluno: {
      update: vi.fn().mockResolvedValue({}),
    },
  };
}

describe('garantirIdentidadeAluno', () => {
  it('cria Pessoa e Usuario pendente para novo Aluno sem senha', async () => {
    const tx = criarTx();

    const resultado =
      await garantirIdentidadeAluno(
        tx,
        {
          id: 'aluno-1',
          nome: 'Aluno Teste',
          email: 'aluno@example.com',
          whatsapp: '41999999999',
          senhaHash: null,
          pessoaId: null,
        },
      );

    expect(tx.pessoa.create).toHaveBeenCalledWith({
      data: {
        nome: 'Aluno Teste',
        emailPrincipal: 'aluno@example.com',
        telefonePrincipal: '41999999999',
        ativo: true,
      },
      select: {
        id: true,
        emailPrincipal: true,
      },
    });

    expect(tx.usuario.create).toHaveBeenCalledWith({
      data: {
        pessoaId: 'pessoa-1',
        senhaHash: null,
        status: 'PENDENTE_ATIVACAO',
      },
      select: {
        id: true,
        senhaHash: true,
        status: true,
      },
    });

    expect(tx.aluno.update).toHaveBeenCalledWith({
      where: {
        id: 'aluno-1',
      },
      data: {
        pessoaId: 'pessoa-1',
      },
    });

    expect(resultado.usuario.status).toBe(
      'PENDENTE_ATIVACAO',
    );
  });

  it('recusa Pessoa ja vinculada a outro Aluno', async () => {
    const tx = criarTx();

    tx.pessoa.findUnique.mockResolvedValue({
      id: 'pessoa-1',
      emailPrincipal: 'aluno@example.com',
      aluno: {
        id: 'outro-aluno',
      },
      usuario: {
        id: 'usuario-1',
        senhaHash: null,
        status: 'PENDENTE_ATIVACAO',
      },
    });

    await expect(
      garantirIdentidadeAluno(
        tx,
        {
          id: 'aluno-1',
          nome: 'Aluno',
          email: 'aluno@example.com',
          senhaHash: null,
          pessoaId: 'pessoa-1',
        },
      ),
    ).rejects.toThrow(
      'Pessoa ja vinculada a outro Aluno',
    );
  });

  it('reutiliza Usuario ativo e espelha sua senha no Aluno', async () => {
    const tx = criarTx();

    tx.pessoa.findMany.mockResolvedValue([
      {
        id: 'pessoa-admin',
        emailPrincipal: 'compartilhado@example.com',
        aluno: null,
        usuario: {
          id: 'usuario-admin',
          senhaHash: 'hash-canonico',
          status: 'ATIVO',
        },
      },
    ]);

    const resultado =
      await garantirIdentidadeAluno(
        tx,
        {
          id: 'aluno-novo',
          nome: 'Pessoa Compartilhada',
          email: 'compartilhado@example.com',
          senhaHash: null,
          pessoaId: null,
        },
      );

    expect(tx.usuario.create).not.toHaveBeenCalled();

    expect(tx.aluno.update).toHaveBeenCalledWith({
      where: {
        id: 'aluno-novo',
      },
      data: {
        pessoaId: 'pessoa-admin',
        senhaHash: 'hash-canonico',
      },
    });

    expect(resultado.senhaHash).toBe(
      'hash-canonico',
    );

    expect(resultado.usuario.status).toBe(
      'ATIVO',
    );
  });

  it('ativa Usuario pendente quando Aluno ja possui credencial', async () => {
    const tx = criarTx();

    tx.pessoa.findMany.mockResolvedValue([
      {
        id: 'pessoa-1',
        emailPrincipal: 'aluno@example.com',
        aluno: null,
        usuario: {
          id: 'usuario-1',
          senhaHash: null,
          status: 'PENDENTE_ATIVACAO',
        },
      },
    ]);

    tx.usuario.update.mockResolvedValue({
      id: 'usuario-1',
      senhaHash: 'hash-legado',
      status: 'ATIVO',
    });

    await garantirIdentidadeAluno(
      tx,
      {
        id: 'aluno-1',
        nome: 'Aluno',
        email: 'aluno@example.com',
        senhaHash: 'hash-legado',
        pessoaId: null,
      },
    );

    expect(tx.usuario.update).toHaveBeenCalledWith({
      where: {
        id: 'usuario-1',
      },
      data: {
        senhaHash: 'hash-legado',
        status: 'ATIVO',
      },
      select: {
        id: true,
        senhaHash: true,
        status: true,
      },
    });
  });

  it('recusa credenciais divergentes', async () => {
    const tx = criarTx();

    tx.pessoa.findMany.mockResolvedValue([
      {
        id: 'pessoa-1',
        emailPrincipal: 'aluno@example.com',
        aluno: null,
        usuario: {
          id: 'usuario-1',
          senhaHash: 'hash-usuario',
          status: 'ATIVO',
        },
      },
    ]);

    await expect(
      garantirIdentidadeAluno(
        tx,
        {
          id: 'aluno-1',
          nome: 'Aluno',
          email: 'aluno@example.com',
          senhaHash: 'hash-aluno',
          pessoaId: null,
        },
      ),
    ).rejects.toThrow(
      'credenciais divergentes',
    );
  });
});
