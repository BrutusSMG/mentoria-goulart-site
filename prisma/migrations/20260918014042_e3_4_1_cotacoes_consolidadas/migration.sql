-- CreateEnum
CREATE TYPE "MetalCotacao" AS ENUM ('OURO', 'PRATA', 'PLATINA', 'PALADIO', 'RODIO');

-- CreateEnum
CREATE TYPE "StatusCotacaoMetal" AS ENUM ('SUCESSO', 'PARCIAL', 'INDISPONIVEL', 'ERRO');

-- CreateTable
CREATE TABLE "CotacaoMetal" (
    "id" TEXT NOT NULL,
    "coletaId" TEXT NOT NULL,
    "metal" "MetalCotacao" NOT NULL,
    "valorOriginal" DECIMAL(18,6),
    "unidadeOriginal" TEXT,
    "moedaOriginal" TEXT,
    "dolarBrl" DECIMAL(12,6),
    "valorBrlGrama" DECIMAL(18,6),
    "fonte" TEXT NOT NULL,
    "fonteDolar" TEXT,
    "referenciaEm" TIMESTAMP(3),
    "coletadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "StatusCotacaoMetal" NOT NULL,
    "erro" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CotacaoMetal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CotacaoMetal_coletaId_idx" ON "CotacaoMetal"("coletaId");

-- CreateIndex
CREATE INDEX "CotacaoMetal_metal_coletadoEm_idx" ON "CotacaoMetal"("metal", "coletadoEm");

-- CreateIndex
CREATE INDEX "CotacaoMetal_status_idx" ON "CotacaoMetal"("status");

-- CreateIndex
CREATE INDEX "CotacaoMetal_coletadoEm_idx" ON "CotacaoMetal"("coletadoEm");

-- CreateIndex
CREATE UNIQUE INDEX "CotacaoMetal_coletaId_metal_key" ON "CotacaoMetal"("coletaId", "metal");
