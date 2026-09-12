import { beforeEach, describe, expect, it, vi } from 'vitest';

const webhookFindUniqueMock = vi.fn();
const webhookCreateMock = vi.fn();
const webhookFindFirstMock = vi.fn();

const leadFindUniqueMock = vi.fn();
const leadUpdateMock = vi.fn();

const transactionFindUniqueMock = vi.fn();
const transactionUpsertMock = vi.fn();
const transactionUpdateMock = vi.fn();

const vigenciaUpdateManyMock = vi.fn();

const prismaTransactionMock = vi.fn();

const provisionarAlunoHotmartMock = vi.fn();
const moverCompradorParaPosVendaMock = vi.fn();
const enviarConvitePrimeiroAcessoMock = vi.fn();

const txMock = {
  lead: {
    findUnique: leadFindUniqueMock,
    update: leadUpdateMock,
  },
  hotmartWebhookEvent: {
    create: webhookCreateMock,
    findFirst: webhookFindFirstMock,
  },
  hotmartTransaction: {
    findUnique: transactionFindUniqueMock,
    upsert: transactionUpsertMock,
    update: transactionUpdateMock,
  },
  vigenciaMatricula: {
    updateMany: vigenciaUpdateManyMock,
  },
};

vi.mock('@/lib/prisma', () => ({
  prisma: {
    hotmartWebhookEvent: {
      findUnique: webhookFindUniqueMock,
    },
    $transaction: prismaTransactionMock,
  },
}));

vi.mock('@/lib/provisionar-aluno', () => ({
  provisionarAlunoHotmart: provisionarAlunoHotmartMock,
}));

vi.mock('@/lib/brevo', () => ({
  moverCompradorParaPosVenda: moverCompradorParaPosVendaMock,
}));

vi.mock('@/lib/convite-primeiro-acesso', () => ({
  enviarConvitePrimeiroAcesso: enviarConvitePrimeiroAcessoMock,
}));

const { POST } = await import(
  '../src/app/api/webhooks/hotmart/route.js'
);

function criarRequest(payload) {
  return {
    headers: {
      get: vi.fn((nome) =>
        nome === 'x-hotmart-hottok' ? 'segredo-teste' : null,
      ),
    },
    json: vi.fn().mockResolvedValue(payload),
  };
}

describe('POST /api/webhooks/hotmart', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.HOTMART_HOTTOK = 'segredo-teste';
    process.env.HOTMART_ALLOWED_PRODUCT_IDS = '';
    process.env.HOTMART_SYNC_BREVO = 'false';

    webhookFindUniqueMock.mockResolvedValue(null);
    leadFindUniqueMock.mockResolvedValue(null);

    prismaTransactionMock.mockImplementation(async (callback) =>
      callback(txMock),
    );
  });

  it('cancela somente a vigência originada pela transação reembolsada', async () => {
    const momentoEvento = new Date('2026-09-12T01:00:00.000Z');

    transactionFindUniqueMock.mockResolvedValue({
      id: 'transacao-1',
      status: 'APPROVED',
      ultimoEventoHotmartEm: new Date(
        '2026-09-11T23:00:00.000Z',
      ),
      ultimoEventoHotmartId: 'evt-approved',
    });

    transactionUpsertMock.mockResolvedValue({
      id: 'transacao-1',
      status: 'REFUNDED',
      aprovadoEm: new Date('2026-09-11T23:00:00.000Z'),
    });

    vigenciaUpdateManyMock.mockResolvedValue({
      count: 1,
    });

    const request = criarRequest({
      id: 'evt-refunded',
      event: 'PURCHASE_REFUNDED',
      creation_date: momentoEvento.getTime(),
      data: {
        product: {
          id: 123,
          name: 'Mentoria Garimpo Urbano',
        },
        purchase: {
          transaction: 'HP-TESTE-1',
          status: 'REFUNDED',
          full_price: {
            value: 100,
            currency_value: 'BRL',
          },
        },
        buyer: {
          email: 'aluno@example.com',
          name: 'Aluno Teste',
        },
      },
    });

    const resposta = await POST(request);
    const corpo = await resposta.json();

    expect(resposta.status).toBe(200);
    expect(corpo).toEqual({
      received: true,
    });

    expect(vigenciaUpdateManyMock).toHaveBeenCalledWith({
      where: {
        transacaoOrigemId: 'transacao-1',
      },
      data: {
        status: 'CANCELADA',
        canceladaEm: momentoEvento,
        statusAlteradoEm: momentoEvento,
      },
    });

    expect(provisionarAlunoHotmartMock).not.toHaveBeenCalled();
    expect(leadUpdateMock).not.toHaveBeenCalled();
    expect(moverCompradorParaPosVendaMock).not.toHaveBeenCalled();
    expect(enviarConvitePrimeiroAcessoMock).not.toHaveBeenCalled();
  });

  it('bloqueia aprovação tardia quando já existe evento terminal da mesma transação', async () => {
    const aprovadoEm = new Date('2026-09-12T00:00:00.000Z');
    const momentoAprovacao = new Date('2026-09-12T00:05:00.000Z');

    process.env.HOTMART_SYNC_BREVO = 'true';

    leadFindUniqueMock.mockResolvedValue({
      id: 'lead-1',
    });

    webhookFindFirstMock.mockResolvedValue({
      id: 'evento-terminal-existente',
    });

    transactionFindUniqueMock.mockResolvedValue({
      id: 'transacao-1',
      status: 'REFUNDED',
      ultimoEventoHotmartEm: new Date(
        '2026-09-12T01:00:00.000Z',
      ),
      ultimoEventoHotmartId: 'evt-refunded',
    });

    transactionUpsertMock.mockResolvedValue({
      id: 'transacao-1',
      status: 'REFUNDED',
      aprovadoEm,
    });

    const request = criarRequest({
      id: 'evt-approved-tardio',
      event: 'PURCHASE_APPROVED',
      creation_date: momentoAprovacao.getTime(),
      data: {
        product: {
          id: 123,
          name: 'Mentoria Garimpo Urbano',
        },
        purchase: {
          transaction: 'HP-TESTE-1',
          status: 'APPROVED',
          approved_date: aprovadoEm.getTime(),
          full_price: {
            value: 100,
            currency_value: 'BRL',
          },
        },
        buyer: {
          email: 'aluno@example.com',
          name: 'Aluno Teste',
        },
      },
    });

    const resposta = await POST(request);
    const corpo = await resposta.json();
    const chamadaUpsert = transactionUpsertMock.mock.calls[0][0];

    expect(chamadaUpsert.update).not.toHaveProperty('status');
    expect(chamadaUpsert.update).not.toHaveProperty(
      'ultimoEventoHotmartEm',
    );
    expect(chamadaUpsert.update).not.toHaveProperty(
      'ultimoEventoHotmartId',
    );

    expect(resposta.status).toBe(200);
    expect(corpo).toEqual({
      received: true,
    });

    expect(webhookFindFirstMock).toHaveBeenCalledWith({
      where: {
        transacaoCodigo: 'HP-TESTE-1',
        evento: {
          in: [
            'PURCHASE_REFUNDED',
            'PURCHASE_CHARGEBACK',
          ],
        },
      },
      select: {
        id: true,
      },
    });

    expect(provisionarAlunoHotmartMock).not.toHaveBeenCalled();
    expect(leadUpdateMock).not.toHaveBeenCalled();
    expect(vigenciaUpdateManyMock).not.toHaveBeenCalled();
    expect(moverCompradorParaPosVendaMock).not.toHaveBeenCalled();
    expect(enviarConvitePrimeiroAcessoMock).not.toHaveBeenCalled();
  });

  it('mantém o provisionamento normal de compra aprovada sem evento terminal', async () => {
    const aprovadoEm = new Date('2026-09-12T01:00:00.000Z');

    leadFindUniqueMock.mockResolvedValue({
      id: 'lead-1',
    });

    webhookFindFirstMock.mockResolvedValue(null);

    transactionFindUniqueMock.mockResolvedValue(null);

    transactionUpsertMock.mockResolvedValue({
      id: 'transacao-1',
      status: 'APPROVED',
      aprovadoEm,
    });

    provisionarAlunoHotmartMock.mockResolvedValue({
      alunoId: 'aluno-1',
      matriculaId: 'matricula-1',
      vigenciaId: 'vigencia-1',
      conviteNovo: false,
      conviteToken: null,
    });

    const request = criarRequest({
      id: 'evt-approved',
      event: 'PURCHASE_APPROVED',
      creation_date: aprovadoEm.getTime(),
      data: {
        product: {
          id: 123,
          name: 'Mentoria Garimpo Urbano',
        },
        purchase: {
          transaction: 'HP-TESTE-2',
          status: 'APPROVED',
          approved_date: aprovadoEm.getTime(),
          full_price: {
            value: 100,
            currency_value: 'BRL',
          },
        },
        buyer: {
          email: 'aluno@example.com',
          name: 'Aluno Teste',
        },
      },
    });

    const resposta = await POST(request);
    const corpo = await resposta.json();

    expect(resposta.status).toBe(200);
    expect(corpo).toEqual({
      received: true,
    });

    expect(webhookFindFirstMock).toHaveBeenCalledTimes(1);

    expect(provisionarAlunoHotmartMock).toHaveBeenCalledWith(
      txMock,
      expect.objectContaining({
        leadId: 'lead-1',
        email: 'aluno@example.com',
        produtoId: '123',
        produtoNome: 'Mentoria Garimpo Urbano',
        transacaoOrigemId: 'transacao-1',
        aprovadoEm,
      }),
    );

    expect(leadUpdateMock).toHaveBeenCalledWith({
      where: {
        id: 'lead-1',
      },
      data: {
        comprouMentoria: true,
        comprouMentoriaEm: aprovadoEm,
      },
    });

    expect(transactionUpdateMock).toHaveBeenCalledWith({
      where: {
        id: 'transacao-1',
      },
      data: {
        alunoId: 'aluno-1',
        matriculaId: 'matricula-1',
      },
    });

    expect(vigenciaUpdateManyMock).not.toHaveBeenCalled();
  });

  it('registra boleto sem conceder direito nem aceitar approved_date como aprovação', async () => {
    const momentoEvento = new Date('2026-09-12T01:30:00.000Z');
    const approvedDateSintetico = new Date('2026-09-12T01:00:00.000Z');

    transactionFindUniqueMock.mockResolvedValue(null);

    transactionUpsertMock.mockResolvedValue({
      id: 'transacao-boleto',
      status: 'BILLET_PRINTED',
      aprovadoEm: null,
    });

    const request = criarRequest({
      id: 'evt-billet',
      event: 'PURCHASE_BILLET_PRINTED',
      creation_date: momentoEvento.getTime(),
      data: {
        product: {
          id: 123,
          name: 'Mentoria Garimpo Urbano',
        },
        purchase: {
          transaction: 'HP-BOLETO-1',
          status: 'BILLET_PRINTED',
          approved_date: approvedDateSintetico.getTime(),
          full_price: {
            value: 100,
            currency_value: 'BRL',
          },
        },
        buyer: {
          email: 'aluno@example.com',
          name: 'Aluno Teste',
        },
      },
    });

    const resposta = await POST(request);
    const corpo = await resposta.json();

    expect(resposta.status).toBe(200);
    expect(corpo).toEqual({
      received: true,
    });

    const chamadaUpsert = transactionUpsertMock.mock.calls[0][0];

    expect(chamadaUpsert.create).toEqual(
      expect.objectContaining({
        status: 'BILLET_PRINTED',
        aprovadoEm: null,
        ultimoEventoHotmartEm: momentoEvento,
        ultimoEventoHotmartId: 'evt-billet',
      }),
    );

    expect(webhookFindFirstMock).not.toHaveBeenCalled();
    expect(provisionarAlunoHotmartMock).not.toHaveBeenCalled();
    expect(leadUpdateMock).not.toHaveBeenCalled();
    expect(vigenciaUpdateManyMock).not.toHaveBeenCalled();
    expect(moverCompradorParaPosVendaMock).not.toHaveBeenCalled();
    expect(enviarConvitePrimeiroAcessoMock).not.toHaveBeenCalled();
  });

  it('cancela somente a vigência originada pela transação em chargeback', async () => {
    const momentoEvento = new Date('2026-09-12T02:00:00.000Z');

    transactionFindUniqueMock.mockResolvedValue({
      id: 'transacao-chargeback',
      status: 'APPROVED',
      ultimoEventoHotmartEm: new Date(
        '2026-09-12T01:00:00.000Z',
      ),
      ultimoEventoHotmartId: 'evt-approved-anterior',
    });

    transactionUpsertMock.mockResolvedValue({
      id: 'transacao-chargeback',
      status: 'CHARGEBACK',
      aprovadoEm: new Date('2026-09-12T01:00:00.000Z'),
    });

    vigenciaUpdateManyMock.mockResolvedValue({
      count: 1,
    });

    const request = criarRequest({
      id: 'evt-chargeback',
      event: 'PURCHASE_CHARGEBACK',
      creation_date: momentoEvento.getTime(),
      data: {
        product: {
          id: 123,
          name: 'Mentoria Garimpo Urbano',
        },
        purchase: {
          transaction: 'HP-CHARGEBACK-1',
          status: 'CHARGEBACK',
          full_price: {
            value: 100,
            currency_value: 'BRL',
          },
        },
        buyer: {
          email: 'aluno@example.com',
          name: 'Aluno Teste',
        },
      },
    });

    const resposta = await POST(request);
    const corpo = await resposta.json();

    expect(resposta.status).toBe(200);
    expect(corpo).toEqual({
      received: true,
    });

    expect(vigenciaUpdateManyMock).toHaveBeenCalledWith({
      where: {
        transacaoOrigemId: 'transacao-chargeback',
      },
      data: {
        status: 'CANCELADA',
        canceladaEm: momentoEvento,
        statusAlteradoEm: momentoEvento,
      },
    });

    expect(provisionarAlunoHotmartMock).not.toHaveBeenCalled();
    expect(leadUpdateMock).not.toHaveBeenCalled();
    expect(moverCompradorParaPosVendaMock).not.toHaveBeenCalled();
    expect(enviarConvitePrimeiroAcessoMock).not.toHaveBeenCalled();
  });

  it('registra compra cancelada sem revogar direito existente', async () => {
    const momentoEvento = new Date('2026-09-12T02:30:00.000Z');

    transactionFindUniqueMock.mockResolvedValue({
      id: 'transacao-cancelada',
      status: 'APPROVED',
      ultimoEventoHotmartEm: new Date(
        '2026-09-12T01:00:00.000Z',
      ),
      ultimoEventoHotmartId: 'evt-approved-anterior',
    });

    transactionUpsertMock.mockResolvedValue({
      id: 'transacao-cancelada',
      status: 'CANCELED',
      aprovadoEm: new Date('2026-09-12T01:00:00.000Z'),
    });

    const request = criarRequest({
      id: 'evt-canceled',
      event: 'PURCHASE_CANCELED',
      creation_date: momentoEvento.getTime(),
      data: {
        product: {
          id: 123,
          name: 'Mentoria Garimpo Urbano',
        },
        purchase: {
          transaction: 'HP-CANCELED-1',
          status: 'CANCELED',
          full_price: {
            value: 100,
            currency_value: 'BRL',
          },
        },
        buyer: {
          email: 'aluno@example.com',
          name: 'Aluno Teste',
        },
      },
    });

    const resposta = await POST(request);
    const corpo = await resposta.json();

    expect(resposta.status).toBe(200);
    expect(corpo).toEqual({
      received: true,
    });

    const chamadaUpsert = transactionUpsertMock.mock.calls[0][0];

    expect(chamadaUpsert.update).toEqual(
      expect.objectContaining({
        status: 'CANCELED',
        ultimoEventoHotmartEm: momentoEvento,
        ultimoEventoHotmartId: 'evt-canceled',
      }),
    );

    expect(webhookFindFirstMock).not.toHaveBeenCalled();
    expect(provisionarAlunoHotmartMock).not.toHaveBeenCalled();
    expect(leadUpdateMock).not.toHaveBeenCalled();
    expect(vigenciaUpdateManyMock).not.toHaveBeenCalled();
    expect(moverCompradorParaPosVendaMock).not.toHaveBeenCalled();
    expect(enviarConvitePrimeiroAcessoMock).not.toHaveBeenCalled();
  });

  it('processa compra completa da mesma transação sem gerar novo convite', async () => {
    const aprovadoEm = new Date('2026-09-12T01:00:00.000Z');
    const momentoComplete = new Date('2026-09-12T03:00:00.000Z');

    webhookFindFirstMock.mockResolvedValue(null);

    transactionFindUniqueMock.mockResolvedValue({
      id: 'transacao-complete',
      status: 'APPROVED',
      ultimoEventoHotmartEm: aprovadoEm,
      ultimoEventoHotmartId: 'evt-approved-anterior',
    });

    transactionUpsertMock.mockResolvedValue({
      id: 'transacao-complete',
      status: 'COMPLETED',
      aprovadoEm,
    });

    provisionarAlunoHotmartMock.mockResolvedValue({
      alunoId: 'aluno-1',
      matriculaId: 'matricula-1',
      vigenciaId: 'vigencia-existente',
      conviteNovo: false,
      conviteToken: null,
    });

    const request = criarRequest({
      id: 'evt-complete',
      event: 'PURCHASE_COMPLETE',
      creation_date: momentoComplete.getTime(),
      data: {
        product: {
          id: 123,
          name: 'Mentoria Garimpo Urbano',
        },
        purchase: {
          transaction: 'HP-COMPLETE-1',
          status: 'COMPLETED',
          approved_date: aprovadoEm.getTime(),
          full_price: {
            value: 100,
            currency_value: 'BRL',
          },
        },
        buyer: {
          email: 'aluno@example.com',
          name: 'Aluno Teste',
        },
      },
    });

    const resposta = await POST(request);
    const corpo = await resposta.json();

    expect(resposta.status).toBe(200);
    expect(corpo).toEqual({
      received: true,
    });

    expect(webhookFindFirstMock).toHaveBeenCalledTimes(1);

    expect(provisionarAlunoHotmartMock).toHaveBeenCalledTimes(1);
    expect(provisionarAlunoHotmartMock).toHaveBeenCalledWith(
      txMock,
      expect.objectContaining({
        email: 'aluno@example.com',
        transacaoOrigemId: 'transacao-complete',
        aprovadoEm,
      }),
    );

    expect(transactionUpdateMock).toHaveBeenCalledWith({
      where: {
        id: 'transacao-complete',
      },
      data: {
        alunoId: 'aluno-1',
        matriculaId: 'matricula-1',
      },
    });

    expect(vigenciaUpdateManyMock).not.toHaveBeenCalled();
    expect(enviarConvitePrimeiroAcessoMock).not.toHaveBeenCalled();
  });

  it('audita evento desconhecido sem criar transação nem conceder direito', async () => {
    const momentoEvento = new Date('2026-09-12T03:30:00.000Z');

    transactionFindUniqueMock.mockResolvedValue(null);

    const request = criarRequest({
      id: 'evt-desconhecido',
      event: 'PURCHASE_EVENTO_NOVO',
      creation_date: momentoEvento.getTime(),
      data: {
        product: {
          id: 123,
          name: 'Mentoria Garimpo Urbano',
        },
        purchase: {
          transaction: 'HP-DESCONHECIDO-1',
          status: 'STATUS_NOVO_HOTMART',
          full_price: {
            value: 100,
            currency_value: 'BRL',
          },
        },
        buyer: {
          email: 'aluno@example.com',
          name: 'Aluno Teste',
        },
      },
    });

    const resposta = await POST(request);
    const corpo = await resposta.json();

    expect(resposta.status).toBe(200);
    expect(corpo).toEqual({
      received: true,
    });

    expect(webhookCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          hotmartEventId: 'evt-desconhecido',
          evento: 'PURCHASE_EVENTO_NOVO',
          transacaoCodigo: 'HP-DESCONHECIDO-1',
          criadoNaHotmartEm: momentoEvento,
        }),
      }),
    );

    expect(transactionFindUniqueMock).toHaveBeenCalledTimes(1);
    expect(transactionUpsertMock).not.toHaveBeenCalled();

    expect(webhookFindFirstMock).not.toHaveBeenCalled();
    expect(provisionarAlunoHotmartMock).not.toHaveBeenCalled();
    expect(leadUpdateMock).not.toHaveBeenCalled();
    expect(vigenciaUpdateManyMock).not.toHaveBeenCalled();
    expect(moverCompradorParaPosVendaMock).not.toHaveBeenCalled();
    expect(enviarConvitePrimeiroAcessoMock).not.toHaveBeenCalled();
  });

  it('revoga o direito mesmo sem creation_date usando o momento técnico do MGU', async () => {
    const antesDoPost = new Date();

    transactionFindUniqueMock.mockResolvedValue({
      id: 'transacao-refund-sem-data',
      status: 'APPROVED',
      ultimoEventoHotmartEm: new Date(
        '2026-09-12T01:00:00.000Z',
      ),
      ultimoEventoHotmartId: 'evt-approved-anterior',
    });

    transactionUpsertMock.mockResolvedValue({
      id: 'transacao-refund-sem-data',
      status: 'APPROVED',
      aprovadoEm: new Date('2026-09-12T01:00:00.000Z'),
    });

    vigenciaUpdateManyMock.mockResolvedValue({
      count: 1,
    });

    const request = criarRequest({
      id: 'evt-refund-sem-data',
      event: 'PURCHASE_REFUNDED',
      data: {
        product: {
          id: 123,
          name: 'Mentoria Garimpo Urbano',
        },
        purchase: {
          transaction: 'HP-REFUND-SEM-DATA',
          status: 'REFUNDED',
          full_price: {
            value: 100,
            currency_value: 'BRL',
          },
        },
        buyer: {
          email: 'aluno@example.com',
          name: 'Aluno Teste',
        },
      },
    });

    const resposta = await POST(request);
    const depoisDoPost = new Date();
    const corpo = await resposta.json();

    expect(resposta.status).toBe(200);
    expect(corpo).toEqual({
      received: true,
    });

    expect(vigenciaUpdateManyMock).toHaveBeenCalledTimes(1);

    const chamadaRevogacao =
      vigenciaUpdateManyMock.mock.calls[0][0];

    expect(chamadaRevogacao.where).toEqual({
      transacaoOrigemId: 'transacao-refund-sem-data',
    });

    expect(chamadaRevogacao.data.status).toBe('CANCELADA');

    expect(
      chamadaRevogacao.data.canceladaEm.getTime(),
    ).toBeGreaterThanOrEqual(antesDoPost.getTime());

    expect(
      chamadaRevogacao.data.canceladaEm.getTime(),
    ).toBeLessThanOrEqual(depoisDoPost.getTime());

    expect(chamadaRevogacao.data.statusAlteradoEm).toEqual(
      chamadaRevogacao.data.canceladaEm,
    );

    const chamadaUpsert = transactionUpsertMock.mock.calls[0][0];

    expect(chamadaUpsert.update).not.toHaveProperty('status');
    expect(chamadaUpsert.update).not.toHaveProperty(
      'ultimoEventoHotmartEm',
    );
    expect(chamadaUpsert.update).not.toHaveProperty(
      'ultimoEventoHotmartId',
    );

    expect(provisionarAlunoHotmartMock).not.toHaveBeenCalled();
  });

  it('bloqueia direito quando reembolso chega antes da aprovação e antes da vigência', async () => {
    const momentoAprovacao = new Date('2026-09-12T01:00:00.000Z');
    const momentoReembolso = new Date('2026-09-12T02:00:00.000Z');

    transactionFindUniqueMock
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'transacao-fora-de-ordem',
        status: 'REFUNDED',
        ultimoEventoHotmartEm: momentoReembolso,
        ultimoEventoHotmartId: 'evt-refund-primeiro',
      });

    transactionUpsertMock
      .mockResolvedValueOnce({
        id: 'transacao-fora-de-ordem',
        status: 'REFUNDED',
        aprovadoEm: null,
      })
      .mockResolvedValueOnce({
        id: 'transacao-fora-de-ordem',
        status: 'REFUNDED',
        aprovadoEm: momentoAprovacao,
      });

    vigenciaUpdateManyMock.mockResolvedValue({
      count: 0,
    });

    webhookFindFirstMock.mockResolvedValue({
      id: 'auditoria-refund-existente',
    });

    const requestRefund = criarRequest({
      id: 'evt-refund-primeiro',
      event: 'PURCHASE_REFUNDED',
      creation_date: momentoReembolso.getTime(),
      data: {
        product: {
          id: 123,
          name: 'Mentoria Garimpo Urbano',
        },
        purchase: {
          transaction: 'HP-FORA-DE-ORDEM-1',
          status: 'REFUNDED',
          full_price: {
            value: 100,
            currency_value: 'BRL',
          },
      },
      buyer: {
        email: 'aluno@example.com',
        name: 'Aluno Teste',
      },
    },
  });

  const respostaRefund = await POST(requestRefund);

  expect(respostaRefund.status).toBe(200);

  expect(vigenciaUpdateManyMock).toHaveBeenCalledWith({
    where: {
      transacaoOrigemId: 'transacao-fora-de-ordem',
    },
    data: {
      status: 'CANCELADA',
      canceladaEm: momentoReembolso,
      statusAlteradoEm: momentoReembolso,
    },
  });

  const requestApproved = criarRequest({
    id: 'evt-approved-tardio',
    event: 'PURCHASE_APPROVED',
    creation_date: momentoAprovacao.getTime(),
    data: {
      product: {
        id: 123,
        name: 'Mentoria Garimpo Urbano',
      },
      purchase: {
        transaction: 'HP-FORA-DE-ORDEM-1',
        status: 'APPROVED',
        approved_date: momentoAprovacao.getTime(),
        full_price: {
          value: 100,
          currency_value: 'BRL',
        },
      },
      buyer: {
        email: 'aluno@example.com',
        name: 'Aluno Teste',
      },
    },
  });

  const respostaApproved = await POST(requestApproved);

  expect(respostaApproved.status).toBe(200);

  expect(webhookFindFirstMock).toHaveBeenCalledWith({
    where: {
      transacaoCodigo: 'HP-FORA-DE-ORDEM-1',
      evento: {
        in: [
          'PURCHASE_REFUNDED',
          'PURCHASE_CHARGEBACK',
        ],
      },
    },
    select: {
      id: true,
    },
  });

  expect(provisionarAlunoHotmartMock).not.toHaveBeenCalled();
  expect(leadUpdateMock).not.toHaveBeenCalled();
  expect(enviarConvitePrimeiroAcessoMock).not.toHaveBeenCalled();

  const segundaChamadaUpsert =
    transactionUpsertMock.mock.calls[1][0];

  expect(segundaChamadaUpsert.update).not.toHaveProperty(
    'status',
  );
  expect(segundaChamadaUpsert.update).not.toHaveProperty(
    'ultimoEventoHotmartEm',
  );
  expect(segundaChamadaUpsert.update).not.toHaveProperty(
    'ultimoEventoHotmartId',
  );
});
});