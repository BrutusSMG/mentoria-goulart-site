import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

const mocks = vi.hoisted(() => ({
  transaction: vi.fn(),
  findUnique: vi.fn(),
  leadUpsert: vi.fn(),
  contribuicaoCreate: vi.fn(),
  garantirIdentidadeLead: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: mocks.transaction,
    jornadaContribuicao: {
      findUnique: mocks.findUnique,
    },
  },
}));

vi.mock('@/lib/garantir-identidade-lead', () => ({
  garantirIdentidadeLeadCapturado:
    mocks.garantirIdentidadeLead,
}));

vi.mock('@/lib/jornada-config', () => ({
  JORNADA_FLAGS: {
    externalNotifications: false,
    brevo: false,
    trello: false,
  },
}));

vi.mock('resend', () => ({
  Resend: class {
    constructor() {
      this.emails = {
        send: vi.fn(),
      };
    }
  },
}));

import { POST } from '@/app/api/jornada/contribuicoes/route';

function requisicaoJornada(
  sobrescritas = {},
) {
  return new Request(
    'http://localhost/api/jornada/contribuicoes',
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        nome: 'Aluno Jornada',
        email: ' Jornada@Example.com ',
        whatsapp: '(41) 99999-9999',
        caminho: 'HISTORIA',
        idempotencyKey: 'jornada-chave-1',
        produtosDeclarados: [
          'curso-garimpo-urbano-com-mentoria',
        ],
        respostas: {
          resumo: 'Minha experiência com o Garimpo Urbano.',
        },
        utms: {
          utm_source: 'teste',
          utm_campaign: 'e6',
        },
        ...sobrescritas,
      }),
    },
  );
}

beforeEach(() => {
  vi.clearAllMocks();

  mocks.findUnique.mockResolvedValue(null);

  mocks.leadUpsert.mockResolvedValue({
    id: 'lead-jornada-1',
    nome: 'Aluno Jornada',
    email: 'jornada@example.com',
    whatsapp: '41999999999',
    pessoaId: null,
  });

  mocks.garantirIdentidadeLead.mockImplementation(
    async (_tx, lead) => ({
      ...lead,
      pessoaId: 'pessoa-jornada-1',
    }),
  );

  mocks.contribuicaoCreate.mockResolvedValue({
    id: 'contribuicao-1',
    leadId: 'lead-jornada-1',
  });

  mocks.transaction.mockImplementation(
    async (callback) => callback({
      lead: {
        upsert: mocks.leadUpsert,
      },
      jornadaContribuicao: {
        create: mocks.contribuicaoCreate,
      },
    }),
  );
});

describe('POST /api/jornada/contribuicoes — identidade do Lead', () => {
  it('consolida Pessoa e contribuição na mesma transação', async () => {
    const resposta = await POST(
      requisicaoJornada(),
    );

    expect(resposta.status).toBe(201);

    expect(mocks.transaction).toHaveBeenCalledOnce();
    expect(mocks.leadUpsert).toHaveBeenCalledOnce();

    expect(
      mocks.garantirIdentidadeLead,
    ).toHaveBeenCalledOnce();

    expect(
      mocks.contribuicaoCreate,
    ).toHaveBeenCalledOnce();

    expect(mocks.leadUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          email: 'jornada@example.com',
        },
      }),
    );

    expect(
      mocks.contribuicaoCreate,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          leadId: 'lead-jornada-1',
          idempotencyKey: 'jornada-chave-1',
        }),
      }),
    );

    const body = await resposta.json();

    expect(body).toEqual({
      success: true,
      leadId: 'lead-jornada-1',
      contributionId: 'contribuicao-1',
    });
  });

  it('mantém o comportamento idempotente sem abrir nova transação', async () => {
    mocks.findUnique.mockResolvedValue({
      id: 'contribuicao-existente',
      leadId: 'lead-existente',
    });

    const resposta = await POST(
      requisicaoJornada(),
    );

    expect(resposta.status).toBe(200);

    expect(mocks.transaction).not.toHaveBeenCalled();

    expect(
      mocks.garantirIdentidadeLead,
    ).not.toHaveBeenCalled();

    expect(
      mocks.contribuicaoCreate,
    ).not.toHaveBeenCalled();

    const body = await resposta.json();

    expect(body).toEqual({
      success: true,
      duplicate: true,
      contributionId: 'contribuicao-existente',
      leadId: 'lead-existente',
    });
  });
});
