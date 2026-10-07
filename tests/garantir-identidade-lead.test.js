import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  garantirIdentidadeLeadCapturado,
} from '../src/lib/garantir-identidade-lead';

function criarLead(
  sobrescritas = {},
) {
  return {
    id: 'lead-1',
    nome: 'Lead Teste',
    email: ' lead@example.com ',
    whatsapp: '41999999999',
    pessoaId: null,
    ...sobrescritas,
  };
}

function criarPessoa(
  sobrescritas = {},
) {
  return {
    id: 'pessoa-1',
    emailPrincipal: 'lead@example.com',
    lead: null,
    ...sobrescritas,
  };
}

function criarTx() {
  const pessoa = criarPessoa();

  return {
    pessoa: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(pessoa),
      create: vi.fn().mockResolvedValue(pessoa),
    },
    lead: {
      findUnique: vi.fn().mockResolvedValue(
        criarLead(),
      ),
      updateMany: vi.fn().mockResolvedValue({
        count: 1,
      }),
    },
  };
}

describe('garantirIdentidadeLeadCapturado', () => {
  it('cria Pessoa para uma nova captura sem identidade existente', async () => {
    const tx = criarTx();
    const lead = criarLead();

    const resultado =
      await garantirIdentidadeLeadCapturado(
        tx,
        lead,
      );

    expect(tx.pessoa.create).toHaveBeenCalledWith({
      data: {
        nome: 'Lead Teste',
        emailPrincipal: 'lead@example.com',
        telefonePrincipal: '41999999999',
        ativo: true,
      },
      select: {
        id: true,
        emailPrincipal: true,
        lead: {
          select: {
            id: true,
          },
        },
      },
    });

    expect(tx.lead.updateMany).toHaveBeenCalledOnce();

    expect(resultado.pessoaId).toBe(
      'pessoa-1',
    );
  });

  it('reutiliza Pessoa existente em uma captura atual sem alterar a Pessoa', async () => {
    const tx = criarTx();
    const pessoa = criarPessoa();

    tx.pessoa.findMany.mockResolvedValue([
      pessoa,
    ]);

    const resultado =
      await garantirIdentidadeLeadCapturado(
        tx,
        criarLead(),
      );

    expect(tx.pessoa.create).not.toHaveBeenCalled();

    expect(tx.lead.updateMany).toHaveBeenCalledOnce();

    expect(resultado.pessoaId).toBe(
      'pessoa-1',
    );
  });

  it('preserva Lead que já está corretamente vinculado', async () => {
    const tx = criarTx();

    const lead = criarLead({
      pessoaId: 'pessoa-1',
      email: 'lead@example.com',
    });

    tx.pessoa.findUnique.mockResolvedValue(
      criarPessoa({
        lead: {
          id: 'lead-1',
        },
      }),
    );

    const resultado =
      await garantirIdentidadeLeadCapturado(
        tx,
        lead,
      );

    expect(tx.pessoa.findMany).not.toHaveBeenCalled();
    expect(tx.pessoa.create).not.toHaveBeenCalled();
    expect(tx.lead.updateMany).not.toHaveBeenCalled();

    expect(resultado.pessoaId).toBe(
      'pessoa-1',
    );
  });

  it('rejeita Pessoa já vinculada a outro Lead', async () => {
    const tx = criarTx();

    tx.pessoa.findMany.mockResolvedValue([
      criarPessoa({
        lead: {
          id: 'lead-outro',
        },
      }),
    ]);

    await expect(
      garantirIdentidadeLeadCapturado(
        tx,
        criarLead(),
      ),
    ).rejects.toThrow(
      'Pessoa já vinculada a outro Lead.',
    );

    expect(tx.lead.updateMany).not.toHaveBeenCalled();
  });

  it('rejeita múltiplas Pessoas case-insensitive para o mesmo e-mail', async () => {
    const tx = criarTx();

    tx.pessoa.findMany.mockResolvedValue([
      criarPessoa({
        id: 'pessoa-1',
      }),
      criarPessoa({
        id: 'pessoa-2',
        emailPrincipal: 'LEAD@EXAMPLE.COM',
      }),
    ]);

    await expect(
      garantirIdentidadeLeadCapturado(
        tx,
        criarLead(),
      ),
    ).rejects.toThrow(
      'Mais de uma Pessoa encontrada para o Lead.',
    );

    expect(tx.pessoa.create).not.toHaveBeenCalled();
    expect(tx.lead.updateMany).not.toHaveBeenCalled();
  });

  it('recupera Pessoa criada por captura concorrente', async () => {
    const tx = criarTx();
    const pessoa = criarPessoa();

    tx.pessoa.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        pessoa,
      ]);

    tx.pessoa.create.mockRejectedValue({
      code: 'P2002',
    });

    const resultado =
      await garantirIdentidadeLeadCapturado(
        tx,
        criarLead(),
      );

    expect(tx.pessoa.findMany).toHaveBeenCalledTimes(2);
    expect(tx.lead.updateMany).toHaveBeenCalledOnce();

    expect(resultado.pessoaId).toBe(
      'pessoa-1',
    );
  });

  it('rejeita divergência entre e-mail do Lead e Pessoa já vinculada', async () => {
    const tx = criarTx();

    tx.pessoa.findUnique.mockResolvedValue(
      criarPessoa({
        emailPrincipal:
          'outra-pessoa@example.com',
        lead: {
          id: 'lead-1',
        },
      }),
    );

    await expect(
      garantirIdentidadeLeadCapturado(
        tx,
        criarLead({
          pessoaId: 'pessoa-1',
        }),
      ),
    ).rejects.toThrow(
      'E-mail do Lead diverge da Pessoa vinculada.',
    );

    expect(tx.lead.updateMany).not.toHaveBeenCalled();
  });
});