-- CreateEnum
CREATE TYPE "TipoDireitoProduto" AS ENUM ('AREA_ALUNO', 'COMUNIDADE', 'MENTORIA', 'CONTEUDO_PRODUTO', 'ECOSSISTEMA');

-- CreateEnum
CREATE TYPE "NivelEcossistema" AS ENUM ('NENHUM', 'BASICO', 'COMPLETO', 'PREMIUM');

-- CreateEnum
CREATE TYPE "OrigemDireitoConcedido" AS ENUM ('HOTMART', 'LEGADO', 'MANUAL');

-- CreateEnum
CREATE TYPE "StatusDireitoConcedido" AS ENUM ('ATIVO', 'REVOGADO', 'EXPIRADO');

-- CreateTable
CREATE TABLE "ProdutoDireito" (
    "id" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "tipo" "TipoDireitoProduto" NOT NULL,
    "nivel" "NivelEcossistema",
    "configuracao" JSONB,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProdutoDireito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DireitoConcedido" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "produtoDireitoId" TEXT NOT NULL,
    "transacaoOrigemId" TEXT,
    "origem" "OrigemDireitoConcedido" NOT NULL,
    "status" "StatusDireitoConcedido" NOT NULL DEFAULT 'ATIVO',
    "concedidoEm" TIMESTAMP(3) NOT NULL,
    "iniciaEm" TIMESTAMP(3) NOT NULL,
    "expiraEm" TIMESTAMP(3),
    "revogadoEm" TIMESTAMP(3),
    "statusAlteradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DireitoConcedido_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProdutoDireito_tipo_idx" ON "ProdutoDireito"("tipo");

-- CreateIndex
CREATE INDEX "ProdutoDireito_ativo_idx" ON "ProdutoDireito"("ativo");

-- CreateIndex
CREATE UNIQUE INDEX "ProdutoDireito_produtoId_tipo_key" ON "ProdutoDireito"("produtoId", "tipo");

-- CreateIndex
CREATE INDEX "DireitoConcedido_alunoId_idx" ON "DireitoConcedido"("alunoId");

-- CreateIndex
CREATE INDEX "DireitoConcedido_produtoDireitoId_idx" ON "DireitoConcedido"("produtoDireitoId");

-- CreateIndex
CREATE INDEX "DireitoConcedido_transacaoOrigemId_idx" ON "DireitoConcedido"("transacaoOrigemId");

-- CreateIndex
CREATE INDEX "DireitoConcedido_status_idx" ON "DireitoConcedido"("status");

-- CreateIndex
CREATE INDEX "DireitoConcedido_alunoId_status_idx" ON "DireitoConcedido"("alunoId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "DireitoConcedido_produtoDireitoId_transacaoOrigemId_key" ON "DireitoConcedido"("produtoDireitoId", "transacaoOrigemId");

-- AddForeignKey
ALTER TABLE "ProdutoDireito" ADD CONSTRAINT "ProdutoDireito_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DireitoConcedido" ADD CONSTRAINT "DireitoConcedido_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DireitoConcedido" ADD CONSTRAINT "DireitoConcedido_produtoDireitoId_fkey" FOREIGN KEY ("produtoDireitoId") REFERENCES "ProdutoDireito"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DireitoConcedido" ADD CONSTRAINT "DireitoConcedido_transacaoOrigemId_fkey" FOREIGN KEY ("transacaoOrigemId") REFERENCES "HotmartTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
