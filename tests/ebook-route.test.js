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
  update: vi.fn(),
  registrarInteracaoMarketing: vi.fn(),
  readFile: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: mocks.transaction,
  },
}));

vi.mock('@/lib/interacao-marketing', () => ({
  TIPOS_INTERACAO_MARKETING: {
    EBOOK_SOLICITADO: 'EBOOK_SOLICITADO',
    EBOOK_DOWNLOAD: 'EBOOK_DOWNLOAD',
    JORNADA_CONTRIBUICAO:
      'JORNADA_CONTRIBUICAO',
  },
  registrarInteracaoMarketing:
    mocks.registrarInteracaoMarketing,
}));

vi.mock('fs/promises', () => ({
  readFile: mocks.readFile,
}));

import { GET } from '@/app/api/ebook/route';

beforeEach(() => {
  vi.clearAllMocks();

  mocks.transaction.mockImplementation(
    async (callback) =>
      callback({
        lead: {
          findUnique: mocks.findUnique,
          update: mocks.update,
        },
      }),
  );

  mocks.update.mockResolvedValue({
    id: 'lead-1',
    baixouEbook: true,
  });

  mocks.registrarInteracaoMarketing
    .mockResolvedValue({
      id: 'interacao-download-1',
    });

  mocks.readFile.mockResolvedValue(
    Buffer.from('pdf-ficticio'),
  );
});

describe('GET /api/ebook — download e histórico', () => {
  it('marca o download e registra EBOOK_DOWNLOAD para Lead com Pessoa', async () => {
    mocks.findUnique.mockResolvedValue({
      id: 'lead-1',
      pessoaId: 'pessoa-1',
    });

    const resposta = await GET(
      new Request(
        'http://localhost/api/ebook?leadId=lead-1',
      ),
    );

    expect(resposta.status).toBe(200);

    expect(
      mocks.update,
    ).toHaveBeenCalledWith({
      where: {
        id: 'lead-1',
      },
      data: {
        baixouEbook: true,
      },
    });

    expect(
      mocks.registrarInteracaoMarketing,
    ).toHaveBeenCalledOnce();

    const [
      ,
      dadosInteracao,
    ] =
      mocks.registrarInteracaoMarketing
        .mock.calls[0];

    expect(dadosInteracao).toEqual({
      pessoaId: 'pessoa-1',
      tipo: 'EBOOK_DOWNLOAD',
      pagina: '/api/ebook',
    });

    expect(
      resposta.headers.get('content-type'),
    ).toBe('application/pdf');
  });

  it('mantém download para Lead histórico sem Pessoa sem criar vínculo implícito', async () => {
    mocks.findUnique.mockResolvedValue({
      id: 'lead-legado',
      pessoaId: null,
    });

    const resposta = await GET(
      new Request(
        'http://localhost/api/ebook?leadId=lead-legado',
      ),
    );

    expect(resposta.status).toBe(200);

    expect(
      mocks.update,
    ).toHaveBeenCalledWith({
      where: {
        id: 'lead-legado',
      },
      data: {
        baixouEbook: true,
      },
    });

    expect(
      mocks.registrarInteracaoMarketing,
    ).not.toHaveBeenCalled();

    expect(
      mocks.readFile,
    ).toHaveBeenCalledOnce();
  });

  it('redireciona quando o Lead não existe e não registra download', async () => {
    mocks.findUnique.mockResolvedValue(null);

    const resposta = await GET(
      new Request(
        'http://localhost/api/ebook?leadId=inexistente',
      ),
    );

    expect(resposta.status).toBeGreaterThanOrEqual(
      300,
    );

    expect(resposta.status).toBeLessThan(400);

    expect(
      mocks.update,
    ).not.toHaveBeenCalled();

    expect(
      mocks.registrarInteracaoMarketing,
    ).not.toHaveBeenCalled();

    expect(
      mocks.readFile,
    ).not.toHaveBeenCalled();
  });
});
