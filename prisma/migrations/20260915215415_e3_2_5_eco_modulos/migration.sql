-- CreateTable
CREATE TABLE "EcoModulo" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "nivelMinimo" "NivelEcossistema" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EcoModulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EcoModuloRecurso" (
    "id" TEXT NOT NULL,
    "moduloId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nivelMinimo" "NivelEcossistema" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EcoModuloRecurso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EcoModulo_slug_key" ON "EcoModulo"("slug");

-- CreateIndex
CREATE INDEX "EcoModulo_ativo_idx" ON "EcoModulo"("ativo");

-- CreateIndex
CREATE INDEX "EcoModulo_nivelMinimo_idx" ON "EcoModulo"("nivelMinimo");

-- CreateIndex
CREATE INDEX "EcoModuloRecurso_moduloId_idx" ON "EcoModuloRecurso"("moduloId");

-- CreateIndex
CREATE INDEX "EcoModuloRecurso_ativo_idx" ON "EcoModuloRecurso"("ativo");

-- CreateIndex
CREATE INDEX "EcoModuloRecurso_nivelMinimo_idx" ON "EcoModuloRecurso"("nivelMinimo");

-- CreateIndex
CREATE UNIQUE INDEX "EcoModuloRecurso_moduloId_codigo_key" ON "EcoModuloRecurso"("moduloId", "codigo");

-- AddForeignKey
ALTER TABLE "EcoModuloRecurso" ADD CONSTRAINT "EcoModuloRecurso_moduloId_fkey" FOREIGN KEY ("moduloId") REFERENCES "EcoModulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
