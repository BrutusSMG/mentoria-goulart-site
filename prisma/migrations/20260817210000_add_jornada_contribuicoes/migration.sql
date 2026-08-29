-- CreateTable
CREATE TABLE "JornadaContribuicao" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "idempotencyKey" TEXT,
    "formVersion" TEXT NOT NULL DEFAULT '1.0',
    "caminho" TEXT NOT NULL,
    "respostas" JSONB NOT NULL,
    "produtosDeclarados" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "nomeInformado" TEXT NOT NULL,
    "emailInformado" TEXT NOT NULL,
    "whatsappInformado" TEXT,
    "cidadeEstado" TEXT,
    "tempoMentoria" TEXT,
    "dataCompraAproximada" TEXT,
    "statusVinculo" TEXT NOT NULL DEFAULT 'PENDENTE_VERIFICACAO',
    "statusOperacional" TEXT NOT NULL DEFAULT 'NOVA_RESPOSTA',
    "interesseEntrevista" TEXT,
    "consentimentoEntrevista" BOOLEAN NOT NULL DEFAULT false,
    "consentimentoConteudo" BOOLEAN NOT NULL DEFAULT false,
    "melhorCanal" TEXT,
    "contatoPreferencial" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmContent" TEXT,
    "utmTerm" TEXT,
    "observacoesInternas" TEXT,
    "verificadoEm" TIMESTAMP(3),
    "verificadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JornadaContribuicao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JornadaContribuicao_idempotencyKey_key" ON "JornadaContribuicao"("idempotencyKey");

-- CreateIndex
CREATE INDEX "JornadaContribuicao_leadId_createdAt_idx" ON "JornadaContribuicao"("leadId", "createdAt");

-- CreateIndex
CREATE INDEX "JornadaContribuicao_statusVinculo_idx" ON "JornadaContribuicao"("statusVinculo");

-- CreateIndex
CREATE INDEX "JornadaContribuicao_statusOperacional_idx" ON "JornadaContribuicao"("statusOperacional");

-- CreateIndex
CREATE INDEX "JornadaContribuicao_caminho_idx" ON "JornadaContribuicao"("caminho");

-- AddForeignKey
ALTER TABLE "JornadaContribuicao" ADD CONSTRAINT "JornadaContribuicao_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
