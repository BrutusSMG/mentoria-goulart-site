-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PARCEIRO', 'FORNECEDOR');

-- CreateTable
CREATE TABLE "CotacaoHistorico" (
    "id" TEXT NOT NULL,
    "dolar" DOUBLE PRECISION NOT NULL,
    "ouro" DOUBLE PRECISION NOT NULL,
    "prata" DOUBLE PRECISION NOT NULL,
    "platina" DOUBLE PRECISION NOT NULL,
    "paladio" DOUBLE PRECISION NOT NULL,
    "rodio" DOUBLE PRECISION,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CotacaoHistorico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "whatsapp" TEXT,
    "baixouEbook" BOOLEAN NOT NULL DEFAULT false,
    "comprouMentoria" BOOLEAN NOT NULL DEFAULT false,
    "comprouMentoriaEm" TIMESTAMP(3),
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmContent" TEXT,
    "utmTerm" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PARCEIRO',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "podeGerenciarSucatas" BOOLEAN NOT NULL DEFAULT false,
    "podeGerenciarDepoimentos" BOOLEAN NOT NULL DEFAULT false,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "passwordChangedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SucataItem" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "valorKg" DOUBLE PRECISION NOT NULL,
    "metais" TEXT NOT NULL,
    "imagemUrl" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ultimaAtualizacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoPor" TEXT,

    CONSTRAINT "SucataItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Depoimento" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "videoUrl" TEXT,
    "imagemUrl" TEXT,
    "aprovado" BOOLEAN NOT NULL DEFAULT false,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Depoimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HotmartWebhookEvent" (
    "id" TEXT NOT NULL,
    "hotmartEventId" TEXT NOT NULL,
    "evento" TEXT NOT NULL,
    "versao" TEXT,
    "transacaoCodigo" TEXT,
    "produtoId" TEXT,
    "criadoNaHotmartEm" TIMESTAMP(3),
    "recebidoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processadoEm" TIMESTAMP(3),
    "erroProcessamento" TEXT,

    CONSTRAINT "HotmartWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HotmartTransaction" (
    "id" TEXT NOT NULL,
    "transacaoCodigo" TEXT NOT NULL,
    "leadId" TEXT,
    "emailComprador" TEXT,
    "produtoId" TEXT NOT NULL,
    "produtoUcode" TEXT,
    "produtoNome" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "valorBruto" DECIMAL(12,2) NOT NULL,
    "moeda" TEXT NOT NULL DEFAULT 'BRL',
    "formaPagamento" TEXT,
    "parcelas" INTEGER,
    "origemSrc" TEXT,
    "origemSck" TEXT,
    "origemXcod" TEXT,
    "aprovadoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HotmartTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_email_key" ON "Lead"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "HotmartWebhookEvent_hotmartEventId_key" ON "HotmartWebhookEvent"("hotmartEventId");

-- CreateIndex
CREATE INDEX "HotmartWebhookEvent_transacaoCodigo_idx" ON "HotmartWebhookEvent"("transacaoCodigo");

-- CreateIndex
CREATE INDEX "HotmartWebhookEvent_produtoId_idx" ON "HotmartWebhookEvent"("produtoId");

-- CreateIndex
CREATE INDEX "HotmartWebhookEvent_evento_idx" ON "HotmartWebhookEvent"("evento");

-- CreateIndex
CREATE UNIQUE INDEX "HotmartTransaction_transacaoCodigo_key" ON "HotmartTransaction"("transacaoCodigo");

-- CreateIndex
CREATE INDEX "HotmartTransaction_leadId_idx" ON "HotmartTransaction"("leadId");

-- CreateIndex
CREATE INDEX "HotmartTransaction_emailComprador_idx" ON "HotmartTransaction"("emailComprador");

-- CreateIndex
CREATE INDEX "HotmartTransaction_produtoId_idx" ON "HotmartTransaction"("produtoId");

-- CreateIndex
CREATE INDEX "HotmartTransaction_status_idx" ON "HotmartTransaction"("status");

-- CreateIndex
CREATE INDEX "HotmartTransaction_criadoEm_idx" ON "HotmartTransaction"("criadoEm");

-- AddForeignKey
ALTER TABLE "HotmartTransaction" ADD CONSTRAINT "HotmartTransaction_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
