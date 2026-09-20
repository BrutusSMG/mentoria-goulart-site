-- E3.3: catalogo e direitos, migracao aditiva para teste controlado.
-- Nao executar em producao antes da reconciliacao Prisma e aprovacao.

-- CreateEnum
CREATE TYPE "TipoProduto" AS ENUM ('CURSO', 'EBOOK');

-- CreateEnum
CREATE TYPE "ProvedorProduto" AS ENUM ('HOTMART');

-- CreateEnum
CREATE TYPE "TipoDireitoProduto" AS ENUM ('AREA_ALUNO', 'COMUNIDADE', 'MENTORIA', 'CONTEUDO_PRODUTO', 'ECOSSISTEMA');

-- CreateEnum
CREATE TYPE "NivelEcossistema" AS ENUM ('NENHUM', 'BASICO', 'COMPLETO', 'PREMIUM');

-- CreateEnum
CREATE TYPE "OrigemDireitoConcedido" AS ENUM ('HOTMART', 'LEGADO', 'MANUAL');

-- CreateEnum
CREATE TYPE "StatusDireitoConcedido" AS ENUM ('ATIVO', 'REVOGADO', 'EXPIRADO');

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

-- CreateTable
CREATE TABLE "ProdutoDireito" (
    "id" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "tipo" "TipoDireitoProduto" NOT NULL,
    "nivel" "NivelEcossistema",
    "configuracao" JSONB,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProdutoDireito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DireitoConcedido" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "produtoDireitoId" TEXT NOT NULL,
    "transacaoOrigemId" TEXT,
    "origem" "OrigemDireitoConcedido" NOT NULL,
    "status" "StatusDireitoConcedido" NOT NULL DEFAULT 'ATIVO',
    "concedidoEm" TIMESTAMP(3) NOT NULL,
    "iniciaEm" TIMESTAMP(3) NOT NULL,
    "expiraEm" TIMESTAMP(3),
    "revogadoEm" TIMESTAMP(3),
    "statusAlteradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DireitoConcedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EcoModulo" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "nivelMinimo" "NivelEcossistema" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EcoModulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EcoModuloRecurso" (
    "id" TEXT NOT NULL,
    "moduloId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nivelMinimo" "NivelEcossistema" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EcoModuloRecurso_pkey" PRIMARY KEY ("id")
);

-- Nova coluna opcional na tabela existente:

ALTER TABLE "HotmartTransaction" ADD COLUMN "produtoCatalogoId" TEXT;

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
CREATE INDEX "ProdutoDireito_tipo_idx" ON "ProdutoDireito"("tipo");

-- CreateIndex
CREATE INDEX "ProdutoDireito_ativo_idx" ON "ProdutoDireito"("ativo");

-- CreateIndex
CREATE UNIQUE INDEX "ProdutoDireito_produtoId_tipo_key" ON "ProdutoDireito"("produtoId", "tipo");

-- CreateIndex
CREATE INDEX "DireitoConcedido_alunoId_idx" ON "DireitoConcedido"("alunoId");

-- CreateIndex
CREATE INDEX "DireitoConcedido_produtoDireitoId_idx" ON "DireitoConcedido"("produtoDireitoId");

-- CreateIndex
CREATE INDEX "DireitoConcedido_transacaoOrigemId_idx" ON "DireitoConcedido"("transacaoOrigemId");

-- CreateIndex
CREATE INDEX "DireitoConcedido_status_idx" ON "DireitoConcedido"("status");

-- CreateIndex
CREATE INDEX "DireitoConcedido_alunoId_status_idx" ON "DireitoConcedido"("alunoId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "DireitoConcedido_produtoDireitoId_transacaoOrigemId_key" ON "DireitoConcedido"("produtoDireitoId", "transacaoOrigemId");

-- CreateIndex
CREATE UNIQUE INDEX "EcoModulo_slug_key" ON "EcoModulo"("slug");

-- CreateIndex
CREATE INDEX "EcoModulo_ativo_idx" ON "EcoModulo"("ativo");

-- CreateIndex
CREATE INDEX "EcoModulo_nivelMinimo_idx" ON "EcoModulo"("nivelMinimo");

-- CreateIndex
CREATE INDEX "EcoModuloRecurso_moduloId_idx" ON "EcoModuloRecurso"("moduloId");

-- CreateIndex
CREATE INDEX "EcoModuloRecurso_ativo_idx" ON "EcoModuloRecurso"("ativo");

-- CreateIndex
CREATE INDEX "EcoModuloRecurso_nivelMinimo_idx" ON "EcoModuloRecurso"("nivelMinimo");

-- CreateIndex
CREATE UNIQUE INDEX "EcoModuloRecurso_moduloId_codigo_key" ON "EcoModuloRecurso"("moduloId", "codigo");

-- Indice da nova coluna:

CREATE INDEX "HotmartTransaction_produtoCatalogoId_idx" ON "HotmartTransaction"("produtoCatalogoId");

-- AddForeignKey
ALTER TABLE "ProdutoIntegracao" ADD CONSTRAINT "ProdutoIntegracao_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdutoDireito" ADD CONSTRAINT "ProdutoDireito_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DireitoConcedido" ADD CONSTRAINT "DireitoConcedido_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DireitoConcedido" ADD CONSTRAINT "DireitoConcedido_produtoDireitoId_fkey" FOREIGN KEY ("produtoDireitoId") REFERENCES "ProdutoDireito"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DireitoConcedido" ADD CONSTRAINT "DireitoConcedido_transacaoOrigemId_fkey" FOREIGN KEY ("transacaoOrigemId") REFERENCES "HotmartTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EcoModuloRecurso" ADD CONSTRAINT "EcoModuloRecurso_moduloId_fkey" FOREIGN KEY ("moduloId") REFERENCES "EcoModulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Chave estrangeira da nova coluna:

ALTER TABLE "HotmartTransaction" ADD CONSTRAINT "HotmartTransaction_produtoCatalogoId_fkey" FOREIGN KEY ("produtoCatalogoId") REFERENCES "Produto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ===================================================================
-- DADOS ESTRUTURAIS DO MGU PRESERVADOS DO HISTORICO
-- ===================================================================

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

-- UPDATE de transacoes historicas separado para revisao posterior.

INSERT INTO "ProdutoDireito"
    ("id", "produtoId", "tipo", "nivel", "updatedAt")
VALUES

-- Curso Garimpo Urbano com Mentoria
('pdir_garimpo_mentoria_conteudo',
 'prod_garimpo_mentoria',
 'CONTEUDO_PRODUTO',
 NULL,
 CURRENT_TIMESTAMP),

('pdir_garimpo_mentoria_area_aluno',
 'prod_garimpo_mentoria',
 'AREA_ALUNO',
 NULL,
 CURRENT_TIMESTAMP),

('pdir_garimpo_mentoria_comunidade',
 'prod_garimpo_mentoria',
 'COMUNIDADE',
 NULL,
 CURRENT_TIMESTAMP),

('pdir_garimpo_mentoria_mentoria',
 'prod_garimpo_mentoria',
 'MENTORIA',
 NULL,
 CURRENT_TIMESTAMP),

('pdir_garimpo_mentoria_ecossistema',
 'prod_garimpo_mentoria',
 'ECOSSISTEMA',
 'PREMIUM',
 CURRENT_TIMESTAMP),

-- Curso Garimpo Urbano sem Mentoria
('pdir_garimpo_sem_mentoria_conteudo',
 'prod_garimpo_sem_mentoria',
 'CONTEUDO_PRODUTO',
 NULL,
 CURRENT_TIMESTAMP),

('pdir_garimpo_sem_mentoria_area_aluno',
 'prod_garimpo_sem_mentoria',
 'AREA_ALUNO',
 NULL,
 CURRENT_TIMESTAMP),

('pdir_garimpo_sem_mentoria_comunidade',
 'prod_garimpo_sem_mentoria',
 'COMUNIDADE',
 NULL,
 CURRENT_TIMESTAMP),

('pdir_garimpo_sem_mentoria_ecossistema',
 'prod_garimpo_sem_mentoria',
 'ECOSSISTEMA',
 'COMPLETO',
 CURRENT_TIMESTAMP),

-- Curso de Eletrodeposicao
('pdir_curso_eletrodeposicao_conteudo',
 'prod_curso_eletrodeposicao',
 'CONTEUDO_PRODUTO',
 NULL,
 CURRENT_TIMESTAMP),

('pdir_curso_eletrodeposicao_area_aluno',
 'prod_curso_eletrodeposicao',
 'AREA_ALUNO',
 NULL,
 CURRENT_TIMESTAMP),

('pdir_curso_eletrodeposicao_comunidade',
 'prod_curso_eletrodeposicao',
 'COMUNIDADE',
 NULL,
 CURRENT_TIMESTAMP),

('pdir_curso_eletrodeposicao_ecossistema',
 'prod_curso_eletrodeposicao',
 'ECOSSISTEMA',
 'COMPLETO',
 CURRENT_TIMESTAMP),

-- Guia Definitivo do Garimpo Urbano
('pdir_guia_definitivo_conteudo',
 'prod_guia_definitivo',
 'CONTEUDO_PRODUTO',
 NULL,
 CURRENT_TIMESTAMP),

('pdir_guia_definitivo_comunidade',
 'prod_guia_definitivo',
 'COMUNIDADE',
 NULL,
 CURRENT_TIMESTAMP),

('pdir_guia_definitivo_ecossistema',
 'prod_guia_definitivo',
 'ECOSSISTEMA',
 'BASICO',
 CURRENT_TIMESTAMP),

-- Recuperacao de Metais Preciosos
('pdir_recuperacao_metais_conteudo',
 'prod_recuperacao_metais',
 'CONTEUDO_PRODUTO',
 NULL,
 CURRENT_TIMESTAMP),

('pdir_recuperacao_metais_comunidade',
 'prod_recuperacao_metais',
 'COMUNIDADE',
 NULL,
 CURRENT_TIMESTAMP),

('pdir_recuperacao_metais_ecossistema',
 'prod_recuperacao_metais',
 'ECOSSISTEMA',
 'BASICO',
 CURRENT_TIMESTAMP),

-- Tesouros Escondidos
('pdir_tesouros_escondidos_conteudo',
 'prod_tesouros_escondidos',
 'CONTEUDO_PRODUTO',
 NULL,
 CURRENT_TIMESTAMP),

('pdir_tesouros_escondidos_comunidade',
 'prod_tesouros_escondidos',
 'COMUNIDADE',
 NULL,
 CURRENT_TIMESTAMP),

('pdir_tesouros_escondidos_ecossistema',
 'prod_tesouros_escondidos',
 'ECOSSISTEMA',
 'BASICO',
 CURRENT_TIMESTAMP),

-- E-book Eletrodeposicao
('pdir_ebook_eletrodeposicao_conteudo',
 'prod_ebook_eletrodeposicao',
 'CONTEUDO_PRODUTO',
 NULL,
 CURRENT_TIMESTAMP),

('pdir_ebook_eletrodeposicao_comunidade',
 'prod_ebook_eletrodeposicao',
 'COMUNIDADE',
 NULL,
 CURRENT_TIMESTAMP),

('pdir_ebook_eletrodeposicao_ecossistema',
 'prod_ebook_eletrodeposicao',
 'ECOSSISTEMA',
 'BASICO',
 CURRENT_TIMESTAMP);
