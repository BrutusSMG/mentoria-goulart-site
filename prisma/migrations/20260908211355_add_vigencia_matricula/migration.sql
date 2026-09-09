-- CreateEnum
CREATE TYPE "OrigemVigencia" AS ENUM ('HOTMART', 'LEGADO', 'MANUAL');

-- CreateEnum
CREATE TYPE "TipoDuracaoVigencia" AS ENUM ('DEFINIDA', 'INDEFINIDA', 'VITALICIA');

-- CreateEnum
CREATE TYPE "StatusVigenciaMatricula" AS ENUM ('AGENDADA', 'ATIVA', 'SUSPENSA', 'CANCELADA', 'ENCERRADA');

-- CreateTable
CREATE TABLE "VigenciaMatricula" (
    "id" TEXT NOT NULL,
    "matriculaId" TEXT NOT NULL,
    "transacaoOrigemId" TEXT,
    "origem" "OrigemVigencia" NOT NULL,
    "tipoDuracao" "TipoDuracaoVigencia" NOT NULL,
    "status" "StatusVigenciaMatricula" NOT NULL,
    "concedidaEm" TIMESTAMP(3),
    "iniciaEm" TIMESTAMP(3) NOT NULL,
    "garantiaAte" TIMESTAMP(3),
    "expiraEm" TIMESTAMP(3),
    "statusAlteradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "canceladaEm" TIMESTAMP(3),
    "encerradaEm" TIMESTAMP(3),
    "avisoExpiracaoEnviadoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VigenciaMatricula_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VigenciaMatricula_transacaoOrigemId_key"
ON "VigenciaMatricula"("transacaoOrigemId");

-- CreateIndex
CREATE INDEX "VigenciaMatricula_matriculaId_idx"
ON "VigenciaMatricula"("matriculaId");

-- CreateIndex
CREATE INDEX "VigenciaMatricula_matriculaId_status_idx"
ON "VigenciaMatricula"("matriculaId","status");

-- CreateIndex
CREATE INDEX "VigenciaMatricula_status_idx"
ON "VigenciaMatricula"("status");

-- CreateIndex
CREATE INDEX "VigenciaMatricula_iniciaEm_idx"
ON "VigenciaMatricula"("iniciaEm");

-- CreateIndex
CREATE INDEX "VigenciaMatricula_expiraEm_idx"
ON "VigenciaMatricula"("expiraEm");

-- AddForeignKey
ALTER TABLE "VigenciaMatricula"
ADD CONSTRAINT "VigenciaMatricula_matriculaId_fkey"
FOREIGN KEY ("matriculaId")
REFERENCES "Matricula"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VigenciaMatricula"
ADD CONSTRAINT "VigenciaMatricula_transacaoOrigemId_fkey"
FOREIGN KEY ("transacaoOrigemId")
REFERENCES "HotmartTransaction"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;
