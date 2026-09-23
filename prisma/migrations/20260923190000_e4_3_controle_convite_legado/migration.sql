CREATE TYPE "StatusConviteLegado" AS ENUM (
  'PENDENTE',
  'EM_ANDAMENTO',
  'ENVIADO',
  'FALHA',
  'INDETERMINADO'
);

CREATE TABLE "ControleConviteLegado" (
  "id" TEXT NOT NULL,
  "alunoId" TEXT NOT NULL,
  "status" "StatusConviteLegado" NOT NULL DEFAULT 'PENDENTE',
  "tentativas" INTEGER NOT NULL DEFAULT 0,
  "tentativaIniciadaEm" TIMESTAMP(3),
  "tentativaEncerradaEm" TIMESTAMP(3),
  "ultimoErro" TEXT,
  "mensagemProvedorId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ControleConviteLegado_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ControleConviteLegado_alunoId_key"
ON "ControleConviteLegado"("alunoId");

ALTER TABLE "ControleConviteLegado"
ADD CONSTRAINT "ControleConviteLegado_alunoId_fkey"
FOREIGN KEY ("alunoId")
REFERENCES "Aluno"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;