-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "pessoaId" TEXT;

-- AlterTable
ALTER TABLE "Aluno" ADD COLUMN     "pessoaId" TEXT;

-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN     "pessoaId" TEXT;

-- CreateTable
CREATE TABLE "Pessoa" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "emailPrincipal" TEXT NOT NULL,
    "telefonePrincipal" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pessoa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pessoa_emailPrincipal_key" ON "Pessoa"("emailPrincipal");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_pessoaId_key" ON "Lead"("pessoaId");

-- CreateIndex
CREATE UNIQUE INDEX "Aluno_pessoaId_key" ON "Aluno"("pessoaId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_pessoaId_key" ON "AdminUser"("pessoaId");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aluno" ADD CONSTRAINT "Aluno_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminUser" ADD CONSTRAINT "AdminUser_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
