-- CreateEnum
CREATE TYPE "StatusAluno" AS ENUM ('PENDENTE_ACESSO', 'ATIVO', 'SUSPENSO', 'INATIVO');

-- CreateEnum
CREATE TYPE "OrigemAluno" AS ENUM ('HOTMART', 'LEGADO', 'MANUAL');

-- CreateEnum
CREATE TYPE "OrigemMatricula" AS ENUM ('HOTMART', 'LEGADO', 'MANUAL');

-- CreateEnum
CREATE TYPE "StatusMatricula" AS ENUM ('PENDENTE', 'ATIVA', 'SUSPENSA', 'CANCELADA', 'ENCERRADA');

-- CreateEnum
CREATE TYPE "VisibilidadePerfil" AS ENUM ('PRIVADO', 'ALUNOS');

-- AlterTable
ALTER TABLE "HotmartTransaction" ADD COLUMN     "alunoId" TEXT,
ADD COLUMN     "matriculaId" TEXT;

-- CreateTable
CREATE TABLE "Aluno" (
    "id" TEXT NOT NULL,
    "leadId" TEXT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "whatsapp" TEXT,
    "senhaHash" TEXT,
    "status" "StatusAluno" NOT NULL DEFAULT 'PENDENTE_ACESSO',
    "origem" "OrigemAluno" NOT NULL DEFAULT 'HOTMART',
    "emailVerificadoEm" TIMESTAMP(3),
    "ultimoLoginEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Aluno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Matricula" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "produtoUcode" TEXT,
    "produtoNome" TEXT NOT NULL,
    "origem" "OrigemMatricula" NOT NULL DEFAULT 'HOTMART',
    "status" "StatusMatricula" NOT NULL DEFAULT 'PENDENTE',
    "concedidaEm" TIMESTAMP(3),
    "suspensaEm" TIMESTAMP(3),
    "encerradaEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Matricula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlunoAccessToken" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "usadoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlunoAccessToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerfilAluno" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "nomeExibicao" TEXT,
    "fotoUrl" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "bio" TEXT,
    "experiencia" TEXT,
    "objetivos" TEXT,
    "mostrarFoto" BOOLEAN NOT NULL DEFAULT false,
    "mostrarLocalizacao" BOOLEAN NOT NULL DEFAULT false,
    "mostrarBio" BOOLEAN NOT NULL DEFAULT false,
    "mostrarExperiencia" BOOLEAN NOT NULL DEFAULT false,
    "mostrarObjetivos" BOOLEAN NOT NULL DEFAULT false,
    "mostrarWhatsapp" BOOLEAN NOT NULL DEFAULT false,
    "visibilidade" "VisibilidadePerfil" NOT NULL DEFAULT 'PRIVADO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerfilAluno_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Aluno_leadId_key" ON "Aluno"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "Aluno_email_key" ON "Aluno"("email");

-- CreateIndex
CREATE INDEX "Aluno_status_idx" ON "Aluno"("status");

-- CreateIndex
CREATE INDEX "Aluno_origem_idx" ON "Aluno"("origem");

-- CreateIndex
CREATE INDEX "Aluno_createdAt_idx" ON "Aluno"("createdAt");

-- CreateIndex
CREATE INDEX "Matricula_alunoId_idx" ON "Matricula"("alunoId");

-- CreateIndex
CREATE INDEX "Matricula_produtoId_idx" ON "Matricula"("produtoId");

-- CreateIndex
CREATE INDEX "Matricula_status_idx" ON "Matricula"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Matricula_alunoId_produtoId_key" ON "Matricula"("alunoId", "produtoId");

-- CreateIndex
CREATE UNIQUE INDEX "AlunoAccessToken_tokenHash_key" ON "AlunoAccessToken"("tokenHash");

-- CreateIndex
CREATE INDEX "AlunoAccessToken_alunoId_idx" ON "AlunoAccessToken"("alunoId");

-- CreateIndex
CREATE INDEX "AlunoAccessToken_expiraEm_idx" ON "AlunoAccessToken"("expiraEm");

-- CreateIndex
CREATE UNIQUE INDEX "PerfilAluno_alunoId_key" ON "PerfilAluno"("alunoId");

-- CreateIndex
CREATE INDEX "HotmartTransaction_alunoId_idx" ON "HotmartTransaction"("alunoId");

-- CreateIndex
CREATE INDEX "HotmartTransaction_matriculaId_idx" ON "HotmartTransaction"("matriculaId");

-- AddForeignKey
ALTER TABLE "Aluno" ADD CONSTRAINT "Aluno_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matricula" ADD CONSTRAINT "Matricula_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlunoAccessToken" ADD CONSTRAINT "AlunoAccessToken_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerfilAluno" ADD CONSTRAINT "PerfilAluno_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotmartTransaction" ADD CONSTRAINT "HotmartTransaction_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotmartTransaction" ADD CONSTRAINT "HotmartTransaction_matriculaId_fkey" FOREIGN KEY ("matriculaId") REFERENCES "Matricula"("id") ON DELETE SET NULL ON UPDATE CASCADE;

