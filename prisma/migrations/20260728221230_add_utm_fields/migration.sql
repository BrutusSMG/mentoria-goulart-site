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
    "whatsapp" TEXT NOT NULL,
    "baixouEbook" BOOLEAN NOT NULL DEFAULT false,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmContent" TEXT,
    "utmTerm" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_email_key" ON "Lead"("email");
