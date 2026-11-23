-- E7.3: migration proposta. NÃO executar antes de auditar colisões em HML/PRD.
-- Auditoria somente leitura (executar separadamente, antes da migration):
-- SELECT lower(btrim("emailPrincipal")) AS email_normalizado, count(*) AS quantidade,
--        array_agg("id") AS pessoas
-- FROM "Pessoa" GROUP BY 1 HAVING count(*) > 1;
--
-- Índice funcional protege também os outros caminhos de criação de Pessoa.
-- Se houver colisões históricas, a criação do índice falhará sem mesclar identidades.
ALTER TABLE "Pessoa" ADD COLUMN "criadoPorUsuarioId" TEXT;

ALTER TABLE "Pessoa"
  ADD CONSTRAINT "Pessoa_criadoPorUsuarioId_fkey"
  FOREIGN KEY ("criadoPorUsuarioId") REFERENCES "Usuario"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "Pessoa_criadoPorUsuarioId_idx" ON "Pessoa"("criadoPorUsuarioId");

CREATE UNIQUE INDEX "Pessoa_emailPrincipal_normalizado_uidx"
  ON "Pessoa" (lower(btrim("emailPrincipal")));
