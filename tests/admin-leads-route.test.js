import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks = vi.hoisted(() => ({
  obterAcessoAdmin: vi.fn(),
  respostaAcessoNegado: vi.fn(),
  count: vi.fn(),
  findMany: vi.fn(),
}));

vi.mock("@/lib/admin-permissoes", () => ({
  obterAcessoAdmin:
    mocks.obterAcessoAdmin,

  respostaAcessoNegado:
    mocks.respostaAcessoNegado,

  prisma: {
    lead: {
      count: mocks.count,
      findMany: mocks.findMany,
    },
  },
}));

import {
  GET,
} from "@/app/api/admin/leads/route";

beforeEach(() => {
  vi.clearAllMocks();

  mocks.obterAcessoAdmin
    .mockResolvedValue({
      permitido: true,
      status: 200,
      ehAdmin: true,
    });

  mocks.respostaAcessoNegado
    .mockImplementation(
      (acesso) =>
        Response.json(
          {
            error:
              acesso.motivo ||
              "Acesso negado.",
          },
          {
            status:
              acesso.status || 403,
          },
        ),
    );

  mocks.count.mockResolvedValue(2);

  mocks.findMany.mockImplementation(
    async (args) => {
      if (args.distinct) {
        return [
          {
            utmSource: "google",
          },
          {
            utmSource: "instagram",
          },
        ];
      }

      return [
        {
          id: "lead-1",
          nome: "Lead com histórico",
          email: "historico@example.com",
          whatsapp: "41999999999",
          baixouEbook: true,
          utmSource: "instagram",
          utmMedium: "social",
          utmCampaign: "campanha-2",
          utmContent: null,
          utmTerm: null,
          createdAt:
            new Date(
              "2026-10-08T10:00:00Z",
            ),
          pessoaId: "pessoa-1",
          pessoa: {
            interacoesMarketing: [
              {
                tipo:
                  "EBOOK_SOLICITADO",
                origem:
                  "Página principal",
                utmSource: "google",
                utmMedium: "cpc",
                utmCampaign:
                  "campanha-1",
                utmTerm: null,
                utmContent: null,
                pagina: null,
                createdAt:
                  new Date(
                    "2026-10-08T10:00:00Z",
                  ),
              },
              {
                tipo:
                  "EBOOK_SOLICITADO",
                origem:
                  "Anúncio Ebook",
                utmSource:
                  "instagram",
                utmMedium:
                  "social",
                utmCampaign:
                  "campanha-2",
                utmTerm: null,
                utmContent: null,
                pagina: null,
                createdAt:
                  new Date(
                    "2026-10-08T12:00:00Z",
                  ),
              },
              {
                tipo:
                  "EBOOK_DOWNLOAD",
                origem: null,
                utmSource: null,
                utmMedium: null,
                utmCampaign: null,
                utmTerm: null,
                utmContent: null,
                pagina: "/api/ebook",
                createdAt:
                  new Date(
                    "2026-10-08T13:00:00Z",
                  ),
              },
            ],
          },
        },
        {
          id: "lead-legado",
          nome: "Lead legado",
          email: "legado@example.com",
          whatsapp: null,
          baixouEbook: true,
          utmSource:
            "Subdominio - Anuncio Ebook",
          utmMedium: null,
          utmCampaign:
            "Acesso direto",
          utmContent: null,
          utmTerm: null,
          createdAt:
            new Date(
              "2026-09-01T10:00:00Z",
            ),
          pessoaId: null,
          pessoa: null,
        },
      ];
    },
  );
});

describe(
  "GET /api/admin/leads — histórico de marketing",
  () => {
    it(
      "enriquece Lead com primeira, última atribuição e última interação",
      async () => {
        const resposta = await GET(
          new Request(
            "http://localhost/api/admin/leads?page=1&pageSize=20",
          ),
        );

        expect(resposta.status).toBe(200);

        const body =
          await resposta.json();

        const lead =
          body.items[0];

        expect(
          lead.marketing
            .historicoDisponivel,
        ).toBe(true);

        expect(
          lead.marketing
            .totalInteracoes,
        ).toBe(3);

        expect(
          lead.marketing
            .primeiraAtribuicao
            .utmSource,
        ).toBe("google");

        expect(
          lead.marketing
            .ultimaAtribuicao
            .utmSource,
        ).toBe("instagram");

        expect(
          lead.marketing
            .ultimaInteracao
            .tipo,
        ).toBe("EBOOK_DOWNLOAD");
      },
    );

    it(
      "não inventa histórico para Lead legado",
      async () => {
        const resposta = await GET(
          new Request(
            "http://localhost/api/admin/leads",
          ),
        );

        const body =
          await resposta.json();

        const legado =
          body.items[1];

        expect(
          legado.utmSource,
        ).toBe(
          "Subdominio - Anuncio Ebook",
        );

        expect(
          legado.marketing,
        ).toEqual({
          historicoDisponivel: false,
          totalInteracoes: 0,
          primeiraAtribuicao: null,
          ultimaAtribuicao: null,
          ultimaInteracao: null,
        });
      },
    );

    it(
      "mantém filtro de origem sobre Lead durante a compatibilidade",
      async () => {
        await GET(
          new Request(
            "http://localhost/api/admin/leads?source=instagram&ebook=downloaded",
          ),
        );

        expect(
          mocks.count,
        ).toHaveBeenCalledWith({
          where: {
            AND: [
              {
                utmSource:
                  "instagram",
              },
              {
                baixouEbook:
                  true,
              },
            ],
          },
        });
      },
    );

    it(
      "solicita o histórico relacionado à Pessoa",
      async () => {
        await GET(
          new Request(
            "http://localhost/api/admin/leads",
          ),
        );

        const chamadaLista =
          mocks.findMany.mock.calls
            .map(
              ([args]) => args,
            )
            .find(
              (args) =>
                !args.distinct,
            );

        expect(
          chamadaLista
            .select
            .pessoa
            .select
            .interacoesMarketing,
        ).toEqual(
          expect.objectContaining({
            orderBy: {
              createdAt:
                "asc",
            },
          }),
        );
      },
    );

    it(
      "bloqueia acesso administrativo inválido",
      async () => {
        mocks.obterAcessoAdmin
          .mockResolvedValue({
            permitido: false,
            status: 403,
            motivo:
              "Acesso restrito.",
          });

        const resposta = await GET(
          new Request(
            "http://localhost/api/admin/leads",
          ),
        );

        expect(
          resposta.status,
        ).toBe(403);

        expect(
          mocks.count,
        ).not.toHaveBeenCalled();
      },
    );
  },
);
