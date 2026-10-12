-- AlterTable
ALTER TABLE "Matricula" ADD COLUMN     "produtoCatalogoId" TEXT;

-- CreateIndex
CREATE INDEX "Matricula_produtoCatalogoId_idx" ON "Matricula"("produtoCatalogoId");

-- AddForeignKey
ALTER TABLE "Matricula" ADD CONSTRAINT "Matricula_produtoCatalogoId_fkey" FOREIGN KEY ("produtoCatalogoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
