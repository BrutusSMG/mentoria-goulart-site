-- AlterTable
ALTER TABLE "JornadaContribuicao" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
