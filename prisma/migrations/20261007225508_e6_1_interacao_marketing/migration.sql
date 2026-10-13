-- CreateTable
CREATE TABLE "InteracaoMarketing" (
    "id" TEXT NOT NULL,
    "pessoaId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "origem" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "pagina" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InteracaoMarketing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InteracaoMarketing_pessoaId_createdAt_idx" ON "InteracaoMarketing"("pessoaId", "createdAt");

-- CreateIndex
CREATE INDEX "InteracaoMarketing_tipo_createdAt_idx" ON "InteracaoMarketing"("tipo", "createdAt");

-- CreateIndex
CREATE INDEX "InteracaoMarketing_createdAt_idx" ON "InteracaoMarketing"("createdAt");

-- AddForeignKey
ALTER TABLE "InteracaoMarketing" ADD CONSTRAINT "InteracaoMarketing_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
