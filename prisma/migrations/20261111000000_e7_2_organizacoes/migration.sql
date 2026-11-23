-- CreateEnum
CREATE TYPE "StatusValidacaoOrganizacao" AS ENUM ('PRELIMINAR', 'VALIDADA', 'REJEITADA');

-- CreateEnum
CREATE TYPE "StatusOperacionalOrganizacao" AS ENUM ('ATIVA', 'INATIVA');

-- CreateEnum
CREATE TYPE "StatusVinculoOrganizacao" AS ENUM ('PENDENTE', 'ATIVO', 'ENCERRADO');

-- CreateTable
CREATE TABLE "Organizacao" (
    "id" TEXT NOT NULL,
    "pais" VARCHAR(2) NOT NULL DEFAULT 'BR',
    "nomeFantasia" TEXT,
    "razaoSocial" TEXT,
    "cnpj" VARCHAR(14),
    "email" TEXT,
    "telefone" TEXT,
    "site" TEXT,
    "statusValidacao" "StatusValidacaoOrganizacao" NOT NULL DEFAULT 'PRELIMINAR',
    "statusOperacional" "StatusOperacionalOrganizacao" NOT NULL DEFAULT 'ATIVA',
    "motivoUltimaRejeicao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "criadoPorUsuarioId" TEXT NOT NULL,
    "alteradoPorUsuarioId" TEXT,
    "validacaoDecididaPorUsuarioId" TEXT,
    "validacaoDecididaEm" TIMESTAMP(3),

    CONSTRAINT "Organizacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PessoaOrganizacao" (
    "id" TEXT NOT NULL,
    "pessoaId" TEXT NOT NULL,
    "organizacaoId" TEXT NOT NULL,
    "funcao" TEXT,
    "status" "StatusVinculoOrganizacao" NOT NULL DEFAULT 'PENDENTE',
    "principal" BOOLEAN NOT NULL DEFAULT false,
    "inicioEm" TIMESTAMP(3),
    "fimEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "criadoPorUsuarioId" TEXT NOT NULL,
    "alteradoPorUsuarioId" TEXT,
    "encerradoPorUsuarioId" TEXT,

    CONSTRAINT "PessoaOrganizacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organizacao_cnpj_key" ON "Organizacao"("cnpj");

-- CreateIndex
CREATE INDEX "Organizacao_pais_statusOperacional_idx" ON "Organizacao"("pais", "statusOperacional");

-- CreateIndex
CREATE INDEX "Organizacao_statusValidacao_idx" ON "Organizacao"("statusValidacao");

-- CreateIndex
CREATE INDEX "Organizacao_criadoPorUsuarioId_idx" ON "Organizacao"("criadoPorUsuarioId");

-- CreateIndex
CREATE INDEX "Organizacao_alteradoPorUsuarioId_idx" ON "Organizacao"("alteradoPorUsuarioId");

-- CreateIndex
CREATE INDEX "Organizacao_validacaoDecididaPorUsuarioId_idx" ON "Organizacao"("validacaoDecididaPorUsuarioId");

-- CreateIndex
CREATE INDEX "PessoaOrganizacao_pessoaId_status_idx" ON "PessoaOrganizacao"("pessoaId", "status");

-- CreateIndex
CREATE INDEX "PessoaOrganizacao_organizacaoId_status_idx" ON "PessoaOrganizacao"("organizacaoId", "status");

-- CreateIndex
CREATE INDEX "PessoaOrganizacao_pessoaId_organizacaoId_idx" ON "PessoaOrganizacao"("pessoaId", "organizacaoId");

-- CreateIndex
CREATE INDEX "PessoaOrganizacao_criadoPorUsuarioId_idx" ON "PessoaOrganizacao"("criadoPorUsuarioId");

-- CreateIndex
CREATE INDEX "PessoaOrganizacao_alteradoPorUsuarioId_idx" ON "PessoaOrganizacao"("alteradoPorUsuarioId");

-- CreateIndex
CREATE INDEX "PessoaOrganizacao_encerradoPorUsuarioId_idx" ON "PessoaOrganizacao"("encerradoPorUsuarioId");

-- AddForeignKey
ALTER TABLE "Organizacao" ADD CONSTRAINT "Organizacao_criadoPorUsuarioId_fkey" FOREIGN KEY ("criadoPorUsuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organizacao" ADD CONSTRAINT "Organizacao_alteradoPorUsuarioId_fkey" FOREIGN KEY ("alteradoPorUsuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organizacao" ADD CONSTRAINT "Organizacao_validacaoDecididaPorUsuarioId_fkey" FOREIGN KEY ("validacaoDecididaPorUsuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PessoaOrganizacao" ADD CONSTRAINT "PessoaOrganizacao_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PessoaOrganizacao" ADD CONSTRAINT "PessoaOrganizacao_organizacaoId_fkey" FOREIGN KEY ("organizacaoId") REFERENCES "Organizacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PessoaOrganizacao" ADD CONSTRAINT "PessoaOrganizacao_criadoPorUsuarioId_fkey" FOREIGN KEY ("criadoPorUsuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PessoaOrganizacao" ADD CONSTRAINT "PessoaOrganizacao_alteradoPorUsuarioId_fkey" FOREIGN KEY ("alteradoPorUsuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PessoaOrganizacao" ADD CONSTRAINT "PessoaOrganizacao_encerradoPorUsuarioId_fkey" FOREIGN KEY ("encerradoPorUsuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- E7.2 - constraints manuais aprovadas

ALTER TABLE "Organizacao"
  ADD CONSTRAINT "Organizacao_nome_chk"
  CHECK (
    NULLIF(BTRIM("nomeFantasia"), '') IS NOT NULL
    OR NULLIF(BTRIM("razaoSocial"), '') IS NOT NULL
  );

ALTER TABLE "Organizacao"
  ADD CONSTRAINT "Organizacao_pais_br_chk"
  CHECK ("pais" = 'BR');

ALTER TABLE "Organizacao"
  ADD CONSTRAINT "Organizacao_cnpj_formato_chk"
  CHECK (
    "cnpj" IS NULL
    OR "cnpj" ~ '^[0-9A-Z]{12}[0-9]{2}$'
  );

ALTER TABLE "Organizacao"
  ADD CONSTRAINT "Organizacao_rejeicao_motivo_chk"
  CHECK (
    "statusValidacao" <> 'REJEITADA'::"StatusValidacaoOrganizacao"
    OR NULLIF(BTRIM("motivoUltimaRejeicao"), '') IS NOT NULL
  );

ALTER TABLE "Organizacao"
  ADD CONSTRAINT "Organizacao_validacao_autoria_chk"
  CHECK (
    "statusValidacao" = 'PRELIMINAR'::"StatusValidacaoOrganizacao"
    OR (
      "validacaoDecididaPorUsuarioId" IS NOT NULL
      AND "validacaoDecididaEm" IS NOT NULL
    )
  );

CREATE UNIQUE INDEX "PessoaOrganizacao_par_aberto_uidx"
  ON "PessoaOrganizacao" ("pessoaId", "organizacaoId")
  WHERE "status" IN (
    'PENDENTE'::"StatusVinculoOrganizacao",
    'ATIVO'::"StatusVinculoOrganizacao"
  );

CREATE UNIQUE INDEX "PessoaOrganizacao_principal_ativo_uidx"
  ON "PessoaOrganizacao" ("organizacaoId")
  WHERE
    "principal" = TRUE
    AND "status" = 'ATIVO'::"StatusVinculoOrganizacao";

ALTER TABLE "PessoaOrganizacao"
  ADD CONSTRAINT "PessoaOrganizacao_principal_chk"
  CHECK (
    NOT "principal"
    OR "status" = 'ATIVO'::"StatusVinculoOrganizacao"
  );

ALTER TABLE "PessoaOrganizacao"
  ADD CONSTRAINT "PessoaOrganizacao_periodo_chk"
  CHECK (
    (
      "status" = 'PENDENTE'::"StatusVinculoOrganizacao"
      AND "inicioEm" IS NULL
      AND "fimEm" IS NULL
    )
    OR
    (
      "status" = 'ATIVO'::"StatusVinculoOrganizacao"
      AND "inicioEm" IS NOT NULL
      AND "fimEm" IS NULL
    )
    OR
    (
      "status" = 'ENCERRADO'::"StatusVinculoOrganizacao"
      AND "fimEm" IS NOT NULL
      AND (
        "inicioEm" IS NULL
        OR "fimEm" >= "inicioEm"
      )
    )
  );
