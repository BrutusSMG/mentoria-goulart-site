INSERT INTO "Permissao" (
  "id",
  "codigo",
  "modulo",
  "descricao",
  "ativo",
  "createdAt",
  "updatedAt"
)
VALUES
  (
    'perm_sucatas_gerenciar',
    'SUCATAS_GERENCIAR',
    'SUCATAS',
    'Permite gerenciar o módulo de sucatas.',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'perm_depoimentos_gerenciar',
    'DEPOIMENTOS_GERENCIAR',
    'DEPOIMENTOS',
    'Permite gerenciar o módulo de depoimentos.',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'perm_jornada_gerenciar',
    'JORNADA_GERENCIAR',
    'JORNADA',
    'Permite gerenciar o módulo de jornada.',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("codigo") DO NOTHING;
