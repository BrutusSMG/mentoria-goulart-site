-- CreateEnum
CREATE TYPE "StatusUsuario" AS ENUM ('PENDENTE_ATIVACAO', 'ATIVO', 'BLOQUEADO');

-- CreateEnum
CREATE TYPE "PapelAdministrativo" AS ENUM ('ADMIN', 'PARCEIRO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "pessoaId" TEXT NOT NULL,
    "senhaHash" TEXT,
    "status" "StatusUsuario" NOT NULL DEFAULT 'PENDENTE_ATIVACAO',
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "passwordChangedAt" TIMESTAMP(3),
    "ultimoLoginEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcessoAdministrativo" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "papel" "PapelAdministrativo" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcessoAdministrativo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permissao" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "modulo" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permissao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioPermissao" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "permissaoId" TEXT NOT NULL,
    "concedidaPorUsuarioId" TEXT,
    "concedidaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsuarioPermissao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_pessoaId_key" ON "Usuario"("pessoaId");

-- CreateIndex
CREATE INDEX "Usuario_status_idx" ON "Usuario"("status");

-- CreateIndex
CREATE INDEX "Usuario_createdAt_idx" ON "Usuario"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AcessoAdministrativo_usuarioId_key" ON "AcessoAdministrativo"("usuarioId");

-- CreateIndex
CREATE INDEX "AcessoAdministrativo_papel_idx" ON "AcessoAdministrativo"("papel");

-- CreateIndex
CREATE INDEX "AcessoAdministrativo_ativo_idx" ON "AcessoAdministrativo"("ativo");

-- CreateIndex
CREATE UNIQUE INDEX "Permissao_codigo_key" ON "Permissao"("codigo");

-- CreateIndex
CREATE INDEX "Permissao_modulo_idx" ON "Permissao"("modulo");

-- CreateIndex
CREATE INDEX "Permissao_ativo_idx" ON "Permissao"("ativo");

-- CreateIndex
CREATE INDEX "UsuarioPermissao_usuarioId_idx" ON "UsuarioPermissao"("usuarioId");

-- CreateIndex
CREATE INDEX "UsuarioPermissao_permissaoId_idx" ON "UsuarioPermissao"("permissaoId");

-- CreateIndex
CREATE INDEX "UsuarioPermissao_concedidaPorUsuarioId_idx" ON "UsuarioPermissao"("concedidaPorUsuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioPermissao_usuarioId_permissaoId_key" ON "UsuarioPermissao"("usuarioId", "permissaoId");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcessoAdministrativo" ADD CONSTRAINT "AcessoAdministrativo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioPermissao" ADD CONSTRAINT "UsuarioPermissao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioPermissao" ADD CONSTRAINT "UsuarioPermissao_permissaoId_fkey" FOREIGN KEY ("permissaoId") REFERENCES "Permissao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioPermissao" ADD CONSTRAINT "UsuarioPermissao_concedidaPorUsuarioId_fkey" FOREIGN KEY ("concedidaPorUsuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
