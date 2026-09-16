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

const garantirContaHotmartMock = vi.fn();
const provisionarAlunoHotmartMock = vi.fn();
const concederDireitosProdutoHotmartMock = vi.fn();
const revogarDireitosPorTransacaoMock = vi.fn();
const moverCompradorParaPosVendaMock = vi.fn();
const enviarConvitePrimeiroAcessoMock = vi.fn();
const resolverProdutoIntegracaoMock = vi.fn();

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

    create: vi.fn(async ({ data }) =>
      transactionUpsertMock({
        create: data,
      }),
    ),

    update: vi.fn(async (args) => {
      // Atualização posterior para associar aluno/matrícula.
      if (args?.where?.id) {
        return transactionUpdateMock(args);
      }

      // Atualização financeira da transação existente.
      return transactionUpsertMock({
        update: args.data,
      });
    }),
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
  garantirContaHotmart: garantirContaHotmartMock,
  provisionarAlunoHotmart: provisionarAlunoHotmartMock,
}));

vi.mock('@/lib/direitos-produto', () => ({
  concederDireitosProdutoHotmart:
    concederDireitosProdutoHotmartMock,
  revogarDireitosPorTransacao:
    revogarDireitosPorTransacaoMock,
}));

vi.mock('@/lib/brevo', () => ({
  moverCompradorParaPosVenda: moverCompradorParaPosVendaMock,
}));

vi.mock('@/lib/convite-primeiro-acesso', () => ({
  enviarConvitePrimeiroAcesso: enviarConvitePrimeiroAcessoMock,
}));

vi.mock('@/lib/produto-catalogo', () => ({
  resolverProdutoIntegracao: resolverProdutoIntegracaoMock,
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

    garantirContaHotmartMock.mockResolvedValue({
      id: 'aluno-conta-hotmart',
    });
    concederDireitosProdutoHotmartMock.mockResolvedValue([]);
    revogarDireitosPorTransacaoMock.mockResolvedValue({
      count: 0,
    });

    process.env.HOTMART_HOTTOK = 'segredo-teste';
    process.env.HOTMART_ALLOWED_PRODUCT_IDS = '';
    process.env.HOTMART_SYNC_BREVO = 'false';

    webhookFindUniqueMock.mockResolvedValue(null);
    webhookFindFirstMock.mockResolvedValue(null);
    leadFindUniqueMock.mockResolvedValue(null);

    prismaTransactionMock.mockImplementation(async (callback) =>
      callback(txMock),
    );

    resolverProdutoIntegracaoMock.mockResolvedValue({
      id: 'int-hotmart-123',
      produtoId: 'prod_garimpo_mentoria',
      provedor: 'HOTMART',
      externalId: '123',
      ativo: true,
      produto: {
        id: 'prod_garimpo_mentoria',
        tipo: 'CURSO',
        ativo: true,
      },
    });
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

    expect(revogarDireitosPorTransacaoMock).toHaveBeenCalledWith(
      txMock,
      {
        transacaoOrigemId: 'transacao-1',
        revogadoEm: momentoEvento,
      },
    );

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

    expect(revogarDireitosPorTransacaoMock).toHaveBeenCalledWith(
      txMock,
      {
        transacaoOrigemId: 'transacao-chargeback',
        revogadoEm: momentoEvento,
      },
    );

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
    expect(revogarDireitosPorTransacaoMock).not.toHaveBeenCalled();
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

    expect(concederDireitosProdutoHotmartMock).toHaveBeenCalledWith(
      txMock,
      {
        alunoId: 'aluno-1',
        produtoId: 'prod_garimpo_mentoria',
        transacaoOrigemId: 'transacao-complete',
        concedidoEm: aprovadoEm,
      },
    );

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
    expect(garantirContaHotmartMock).not.toHaveBeenCalled();
    expect(concederDireitosProdutoHotmartMock).not.toHaveBeenCalled();
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
  expect(garantirContaHotmartMock).not.toHaveBeenCalled();
  expect(concederDireitosProdutoHotmartMock).not.toHaveBeenCalled();
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

it('registra produto desconhecido sem conceder direito', async () => {
  const aprovadoEm = new Date('2026-09-14T20:00:00.000Z');

  resolverProdutoIntegracaoMock.mockResolvedValueOnce(null);

  leadFindUniqueMock.mockResolvedValue({
    id: 'lead-produto-desconhecido',
  });

  transactionFindUniqueMock.mockResolvedValue(null);

  transactionUpsertMock.mockResolvedValue({
    id: 'transacao-produto-desconhecido',
    status: 'APPROVED',
    aprovadoEm,
  });

  const request = criarRequest({
    id: 'evt-produto-desconhecido',
    event: 'PURCHASE_APPROVED',
    creation_date: aprovadoEm.getTime(),
    data: {
      product: {
        id: 9999999,
        name: 'Produto não catalogado',
      },
      purchase: {
        transaction: 'HP-PRODUTO-DESCONHECIDO',
        status: 'APPROVED',
        approved_date: aprovadoEm.getTime(),
        full_price: {
          value: 100,
          currency_value: 'BRL',
        },
      },
      buyer: {
        email: 'desconhecido@example.com',
        name: 'Comprador Desconhecido',
      },
    },
  });

  const resposta = await POST(request);

  expect(resposta.status).toBe(200);

  expect(resolverProdutoIntegracaoMock).toHaveBeenCalledWith(
    expect.anything(),
    {
      provedor: 'HOTMART',
      externalId: '9999999',
    },
  );

  const chamadaCreate = transactionUpsertMock.mock.calls[0][0];

  expect(chamadaCreate.create).toEqual(
    expect.objectContaining({
      produtoId: '9999999',
      produtoCatalogoId: null,
    }),
  );

  expect(provisionarAlunoHotmartMock).not.toHaveBeenCalled();
  expect(garantirContaHotmartMock).not.toHaveBeenCalled();
  expect(concederDireitosProdutoHotmartMock).not.toHaveBeenCalled();
  expect(leadUpdateMock).not.toHaveBeenCalled();
});

it('registra ebook catalogado sem criar matrícula', async () => {
  const aprovadoEm = new Date('2026-09-14T20:30:00.000Z');

  resolverProdutoIntegracaoMock.mockResolvedValueOnce({
    id: 'int-hotmart-3019817',
    produtoId: 'prod_tesouros_escondidos',
    provedor: 'HOTMART',
    externalId: '3019817',
    ativo: true,
    produto: {
      id: 'prod_tesouros_escondidos',
      tipo: 'EBOOK',
      ativo: true,
    },
  });

  leadFindUniqueMock.mockResolvedValue({
    id: 'lead-ebook',
  });

  transactionFindUniqueMock.mockResolvedValue(null);

  transactionUpsertMock.mockResolvedValue({
    id: 'transacao-ebook',
    status: 'APPROVED',
    aprovadoEm,
  });

  const request = criarRequest({
    id: 'evt-ebook-approved',
    event: 'PURCHASE_APPROVED',
    creation_date: aprovadoEm.getTime(),
    data: {
      product: {
        id: 3019817,
        name: 'TESOUROS ESCONDIDOS',
      },
      purchase: {
        transaction: 'HP-EBOOK-1',
        status: 'APPROVED',
        approved_date: aprovadoEm.getTime(),
        full_price: {
          value: 49.7,
          currency_value: 'BRL',
        },
      },
      buyer: {
        email: 'ebook@example.com',
        name: 'Comprador Ebook',
      },
    },
  });

  const resposta = await POST(request);

  expect(resposta.status).toBe(200);

  expect(resolverProdutoIntegracaoMock).toHaveBeenCalledWith(
    expect.anything(),
    {
      provedor: 'HOTMART',
      externalId: '3019817',
    },
  );

  const chamadaCreate = transactionUpsertMock.mock.calls[0][0];

  expect(chamadaCreate.create).toEqual(
    expect.objectContaining({
      produtoId: '3019817',
      produtoCatalogoId: 'prod_tesouros_escondidos',
    }),
  );

  expect(provisionarAlunoHotmartMock).not.toHaveBeenCalled();

  expect(garantirContaHotmartMock).toHaveBeenCalledTimes(1);
  expect(garantirContaHotmartMock).toHaveBeenCalledWith(
    txMock,
    expect.objectContaining({
      leadId: 'lead-ebook',
      email: 'ebook@example.com',
      nome: 'Comprador Ebook',
    }),
  );

  expect(transactionUpdateMock).toHaveBeenCalledWith({
    where: {
      id: 'transacao-ebook',
    },
    data: {
      alunoId: 'aluno-conta-hotmart',
    },
  });

  expect(concederDireitosProdutoHotmartMock).toHaveBeenCalledWith(
    txMock,
    {
      alunoId: 'aluno-conta-hotmart',
      produtoId: 'prod_tesouros_escondidos',
      transacaoOrigemId: 'transacao-ebook',
      concedidoEm: aprovadoEm,
    },
  );

  expect(enviarConvitePrimeiroAcessoMock).not.toHaveBeenCalled();
  expect(leadUpdateMock).not.toHaveBeenCalled();
});

it('provisiona curso catalogado sem marcar compra de mentoria', async () => {
  const aprovadoEm = new Date('2026-09-14T21:00:00.000Z');

  resolverProdutoIntegracaoMock.mockResolvedValueOnce({
    id: 'int-hotmart-8343505',
    produtoId: 'prod_garimpo_sem_mentoria',
    provedor: 'HOTMART',
    externalId: '8343505',
    ativo: true,
    produto: {
      id: 'prod_garimpo_sem_mentoria',
      tipo: 'CURSO',
      ativo: true,
    },
  });

  leadFindUniqueMock.mockResolvedValue({
    id: 'lead-curso-sem-mentoria',
  });

  transactionFindUniqueMock.mockResolvedValue(null);

  transactionUpsertMock.mockResolvedValue({
    id: 'transacao-curso-sem-mentoria',
    status: 'APPROVED',
    aprovadoEm,
  });

  provisionarAlunoHotmartMock.mockResolvedValue({
    alunoId: 'aluno-sem-mentoria',
    matriculaId: 'matricula-sem-mentoria',
    vigenciaId: 'vigencia-sem-mentoria',
    conviteNovo: false,
    conviteToken: null,
  });

  const request = criarRequest({
    id: 'evt-curso-sem-mentoria',
    event: 'PURCHASE_APPROVED',
    creation_date: aprovadoEm.getTime(),
    data: {
      product: {
        id: 8343505,
        name: 'Curso Garimpo Urbano (Sem Mentoria)',
      },
      purchase: {
        transaction: 'HP-CURSO-SEM-MENTORIA',
        status: 'APPROVED',
        approved_date: aprovadoEm.getTime(),
        full_price: {
          value: 997,
          currency_value: 'BRL',
        },
      },
      buyer: {
        email: 'curso@example.com',
        name: 'Comprador Curso',
      },
    },
  });

  const resposta = await POST(request);

  expect(resposta.status).toBe(200);

  const chamadaCreate = transactionUpsertMock.mock.calls[0][0];

  expect(chamadaCreate.create).toEqual(
    expect.objectContaining({
      produtoId: '8343505',
      produtoCatalogoId: 'prod_garimpo_sem_mentoria',
    }),
  );

  expect(provisionarAlunoHotmartMock).toHaveBeenCalledTimes(1);

  expect(provisionarAlunoHotmartMock).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      produtoId: '8343505',
      transacaoOrigemId: 'transacao-curso-sem-mentoria',
    }),
  );

  expect(garantirContaHotmartMock).not.toHaveBeenCalled();

  expect(concederDireitosProdutoHotmartMock).toHaveBeenCalledWith(
    txMock,
    {
      alunoId: 'aluno-sem-mentoria',
      produtoId: 'prod_garimpo_sem_mentoria',
      transacaoOrigemId: 'transacao-curso-sem-mentoria',
      concedidoEm: aprovadoEm,
    },
  );

  expect(transactionUpdateMock).toHaveBeenCalledWith({
    where: {
      id: 'transacao-curso-sem-mentoria',
    },
    data: {
      alunoId: 'aluno-sem-mentoria',
      matriculaId: 'matricula-sem-mentoria',
    },
  });

  expect(leadUpdateMock).not.toHaveBeenCalled();
});
});