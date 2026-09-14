-- CreateEnum
CREATE TYPE "TipoProduto" AS ENUM ('CURSO', 'EBOOK');

-- CreateEnum
CREATE TYPE "ProvedorProduto" AS ENUM ('HOTMART');

-- AlterTable
ALTER TABLE "HotmartTransaction" ADD COLUMN     "produtoCatalogoId" TEXT;

-- CreateTable
CREATE TABLE "Produto" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" "TipoProduto" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "preco" DECIMAL(12,2),
    "precoPromocional" DECIMAL(12,2),
    "moeda" TEXT NOT NULL DEFAULT 'BRL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProdutoIntegracao" (
    "id" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "provedor" "ProvedorProduto" NOT NULL,
    "externalId" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProdutoIntegracao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Produto_slug_key" ON "Produto"("slug");

-- CreateIndex
CREATE INDEX "Produto_tipo_idx" ON "Produto"("tipo");

-- CreateIndex
CREATE INDEX "Produto_ativo_idx" ON "Produto"("ativo");

-- CreateIndex
CREATE INDEX "ProdutoIntegracao_produtoId_idx" ON "ProdutoIntegracao"("produtoId");

-- CreateIndex
CREATE INDEX "ProdutoIntegracao_ativo_idx" ON "ProdutoIntegracao"("ativo");

-- CreateIndex
CREATE UNIQUE INDEX "ProdutoIntegracao_provedor_externalId_key" ON "ProdutoIntegracao"("provedor", "externalId");

-- CreateIndex
CREATE INDEX "HotmartTransaction_produtoCatalogoId_idx" ON "HotmartTransaction"("produtoCatalogoId");

-- AddForeignKey
ALTER TABLE "ProdutoIntegracao" ADD CONSTRAINT "ProdutoIntegracao_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotmartTransaction" ADD CONSTRAINT "HotmartTransaction_produtoCatalogoId_fkey" FOREIGN KEY ("produtoCatalogoId") REFERENCES "Produto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- -------------------------------------------------------------------
-- Catálogo comercial inicial do MGU
-- -------------------------------------------------------------------

INSERT INTO "Produto" (
    "id",
    "nome",
    "slug",
    "descricao",
    "tipo",
    "ativo",
    "preco",
    "precoPromocional",
    "moeda",
    "createdAt",
    "updatedAt"
)
VALUES
(
    'prod_garimpo_mentoria',
    'Curso Garimpo Urbano com Mentoria',
    'curso-garimpo-urbano-com-mentoria',
    NULL,
    'CURSO',
    true,
    2497.00,
    NULL,
    'BRL',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'prod_garimpo_sem_mentoria',
    'Curso Garimpo Urbano (Sem Mentoria)',
    'curso-garimpo-urbano-sem-mentoria',
    NULL,
    'CURSO',
    true,
    997.00,
    NULL,
    'BRL',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'prod_curso_eletrodeposicao',
    'Curso de Eletrodeposição em Joias e Semi-Joias',
    'curso-eletrodeposicao-joias-semi-joias',
    NULL,
    'CURSO',
    true,
    147.00,
    NULL,
    'BRL',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'prod_guia_definitivo',
    'Guia Definitivo do Garimpo Urbano',
    'guia-definitivo-garimpo-urbano',
    NULL,
    'EBOOK',
    true,
    198.00,
    NULL,
    'BRL',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'prod_recuperacao_metais',
    'Recuperação de Metais Preciosos de Resíduos de Oficinas',
    'recuperacao-metais-preciosos-residuos-oficinas',
    NULL,
    'EBOOK',
    true,
    198.00,
    NULL,
    'BRL',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'prod_tesouros_escondidos',
    'TESOUROS ESCONDIDOS — Extração e Refino de Ouro e Prata',
    'tesouros-escondidos-extracao-refino-ouro-prata',
    NULL,
    'EBOOK',
    true,
    49.70,
    NULL,
    'BRL',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'prod_ebook_eletrodeposicao',
    'ELETRODEPOSIÇÃO — Galvanoplastia para a Indústria de Joias',
    'eletrodeposicao-galvanoplastia-industria-joias',
    NULL,
    'EBOOK',
    true,
    47.00,
    NULL,
    'BRL',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------------
-- Integrações Hotmart
-- -------------------------------------------------------------------

INSERT INTO "ProdutoIntegracao" (
    "id",
    "produtoId",
    "provedor",
    "externalId",
    "ativo",
    "createdAt",
    "updatedAt"
)
VALUES
(
    'int_hotmart_962959',
    'prod_garimpo_mentoria',
    'HOTMART',
    '962959',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'int_hotmart_8343505',
    'prod_garimpo_sem_mentoria',
    'HOTMART',
    '8343505',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'int_hotmart_1280432',
    'prod_curso_eletrodeposicao',
    'HOTMART',
    '1280432',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'int_hotmart_7445377',
    'prod_guia_definitivo',
    'HOTMART',
    '7445377',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'int_hotmart_1357907',
    'prod_guia_definitivo',
    'HOTMART',
    '1357907',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'int_hotmart_2454217',
    'prod_recuperacao_metais',
    'HOTMART',
    '2454217',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'int_hotmart_3019817',
    'prod_tesouros_escondidos',
    'HOTMART',
    '3019817',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'int_hotmart_1641689',
    'prod_ebook_eletrodeposicao',
    'HOTMART',
    '1641689',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------------
-- Backfill seguro das transações Hotmart históricas
--
-- produtoId continua preservado como identificador externo histórico.
-- Apenas transações com integração conhecida recebem produtoCatalogoId.
-- Produtos desconhecidos permanecem com produtoCatalogoId = NULL.
-- -------------------------------------------------------------------

UPDATE "HotmartTransaction" AS ht
SET "produtoCatalogoId" = pi."produtoId"
FROM "ProdutoIntegracao" AS pi
WHERE pi."provedor" = 'HOTMART'
  AND pi."externalId" = ht."produtoId"
  AND ht."produtoCatalogoId" IS NULL;