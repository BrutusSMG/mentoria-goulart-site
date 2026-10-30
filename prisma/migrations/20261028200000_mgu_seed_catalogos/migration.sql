INSERT INTO "Produto" (
    "id",
    "nome",
    "slug",
    "descricao",
    "tipo",
    "ativo",
    "preco",
    "precoPromocional",
    "moeda",
    "createdAt",
    "updatedAt"
)
VALUES
(
    'prod_garimpo_mentoria',
    'Curso Garimpo Urbano com Mentoria',
    'curso-garimpo-urbano-com-mentoria',
    NULL,
    'CURSO',
    true,
    2497.00,
    NULL,
    'BRL',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'prod_garimpo_sem_mentoria',
    'Curso Garimpo Urbano (Sem Mentoria)',
    'curso-garimpo-urbano-sem-mentoria',
    NULL,
    'CURSO',
    true,
    997.00,
    NULL,
    'BRL',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'prod_curso_eletrodeposicao',
    'Curso de Eletrodeposição em Joias e Semi-Joias',
    'curso-eletrodeposicao-joias-semi-joias',
    NULL,
    'CURSO',
    true,
    147.00,
    NULL,
    'BRL',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'prod_guia_definitivo',
    'Guia Definitivo do Garimpo Urbano',
    'guia-definitivo-garimpo-urbano',
    NULL,
    'EBOOK',
    true,
    198.00,
    NULL,
    'BRL',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'prod_recuperacao_metais',
    'Recuperação de Metais Preciosos de Resíduos de Oficinas',
    'recuperacao-metais-preciosos-residuos-oficinas',
    NULL,
    'EBOOK',
    true,
    198.00,
    NULL,
    'BRL',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'prod_tesouros_escondidos',
    'TESOUROS ESCONDIDOS — Extração e Refino de Ouro e Prata',
    'tesouros-escondidos-extracao-refino-ouro-prata',
    NULL,
    'EBOOK',
    true,
    49.70,
    NULL,
    'BRL',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'prod_ebook_eletrodeposicao',
    'ELETRODEPOSIÇÃO — Galvanoplastia para a Indústria de Joias',
    'eletrodeposicao-galvanoplastia-industria-joias',
    NULL,
    'EBOOK',
    true,
    47.00,
    NULL,
    'BRL',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT DO NOTHING;

INSERT INTO "ProdutoIntegracao" (
    "id",
    "produtoId",
    "provedor",
    "externalId",
    "ativo",
    "createdAt",
    "updatedAt"
)
VALUES
(
    'int_hotmart_962959',
    'prod_garimpo_mentoria',
    'HOTMART',
    '962959',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'int_hotmart_8343505',
    'prod_garimpo_sem_mentoria',
    'HOTMART',
    '8343505',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'int_hotmart_1280432',
    'prod_curso_eletrodeposicao',
    'HOTMART',
    '1280432',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'int_hotmart_7445377',
    'prod_guia_definitivo',
    'HOTMART',
    '7445377',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'int_hotmart_1357907',
    'prod_guia_definitivo',
    'HOTMART',
    '1357907',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'int_hotmart_2454217',
    'prod_recuperacao_metais',
    'HOTMART',
    '2454217',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'int_hotmart_3019817',
    'prod_tesouros_escondidos',
    'HOTMART',
    '3019817',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'int_hotmart_1641689',
    'prod_ebook_eletrodeposicao',
    'HOTMART',
    '1641689',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT DO NOTHING;

INSERT INTO "ProdutoDireito"
    ("id", "produtoId", "tipo", "nivel", "updatedAt")
VALUES

-- Curso Garimpo Urbano com Mentoria
('pdir_garimpo_mentoria_conteudo',
 'prod_garimpo_mentoria',
 'CONTEUDO_PRODUTO',
 NULL,
 CURRENT_TIMESTAMP),

('pdir_garimpo_mentoria_area_aluno',
 'prod_garimpo_mentoria',
 'AREA_ALUNO',
 NULL,
 CURRENT_TIMESTAMP),

('pdir_garimpo_mentoria_comunidade',
 'prod_garimpo_mentoria',
 'COMUNIDADE',
 NULL,
 CURRENT_TIMESTAMP),

('pdir_garimpo_mentoria_mentoria',
 'prod_garimpo_mentoria',
 'MENTORIA',
 NULL,
 CURRENT_TIMESTAMP),

('pdir_garimpo_mentoria_ecossistema',
 'prod_garimpo_mentoria',
 'ECOSSISTEMA',
 'PREMIUM',
 CURRENT_TIMESTAMP),

-- Curso Garimpo Urbano sem Mentoria
('pdir_garimpo_sem_mentoria_conteudo',
 'prod_garimpo_sem_mentoria',
 'CONTEUDO_PRODUTO',
 NULL,
 CURRENT_TIMESTAMP),

('pdir_garimpo_sem_mentoria_area_aluno',
 'prod_garimpo_sem_mentoria',
 'AREA_ALUNO',
 NULL,
 CURRENT_TIMESTAMP),

('pdir_garimpo_sem_mentoria_comunidade',
 'prod_garimpo_sem_mentoria',
 'COMUNIDADE',
 NULL,
 CURRENT_TIMESTAMP),

('pdir_garimpo_sem_mentoria_ecossistema',
 'prod_garimpo_sem_mentoria',
 'ECOSSISTEMA',
 'COMPLETO',
 CURRENT_TIMESTAMP),

-- Curso de Eletrodeposicao
('pdir_curso_eletrodeposicao_conteudo',
 'prod_curso_eletrodeposicao',
 'CONTEUDO_PRODUTO',
 NULL,
 CURRENT_TIMESTAMP),

('pdir_curso_eletrodeposicao_area_aluno',
 'prod_curso_eletrodeposicao',
 'AREA_ALUNO',
 NULL,
 CURRENT_TIMESTAMP),

('pdir_curso_eletrodeposicao_comunidade',
 'prod_curso_eletrodeposicao',
 'COMUNIDADE',
 NULL,
 CURRENT_TIMESTAMP),

('pdir_curso_eletrodeposicao_ecossistema',
 'prod_curso_eletrodeposicao',
 'ECOSSISTEMA',
 'COMPLETO',
 CURRENT_TIMESTAMP),

-- Guia Definitivo do Garimpo Urbano
('pdir_guia_definitivo_conteudo',
 'prod_guia_definitivo',
 'CONTEUDO_PRODUTO',
 NULL,
 CURRENT_TIMESTAMP),

('pdir_guia_definitivo_comunidade',
 'prod_guia_definitivo',
 'COMUNIDADE',
 NULL,
 CURRENT_TIMESTAMP),

('pdir_guia_definitivo_ecossistema',
 'prod_guia_definitivo',
 'ECOSSISTEMA',
 'BASICO',
 CURRENT_TIMESTAMP),

-- Recuperacao de Metais Preciosos
('pdir_recuperacao_metais_conteudo',
 'prod_recuperacao_metais',
 'CONTEUDO_PRODUTO',
 NULL,
 CURRENT_TIMESTAMP),

('pdir_recuperacao_metais_comunidade',
 'prod_recuperacao_metais',
 'COMUNIDADE',
 NULL,
 CURRENT_TIMESTAMP),

('pdir_recuperacao_metais_ecossistema',
 'prod_recuperacao_metais',
 'ECOSSISTEMA',
 'BASICO',
 CURRENT_TIMESTAMP),

-- Tesouros Escondidos
('pdir_tesouros_escondidos_conteudo',
 'prod_tesouros_escondidos',
 'CONTEUDO_PRODUTO',
 NULL,
 CURRENT_TIMESTAMP),

('pdir_tesouros_escondidos_comunidade',
 'prod_tesouros_escondidos',
 'COMUNIDADE',
 NULL,
 CURRENT_TIMESTAMP),

('pdir_tesouros_escondidos_ecossistema',
 'prod_tesouros_escondidos',
 'ECOSSISTEMA',
 'BASICO',
 CURRENT_TIMESTAMP),

-- E-book Eletrodeposicao
('pdir_ebook_eletrodeposicao_conteudo',
 'prod_ebook_eletrodeposicao',
 'CONTEUDO_PRODUTO',
 NULL,
 CURRENT_TIMESTAMP),

('pdir_ebook_eletrodeposicao_comunidade',
 'prod_ebook_eletrodeposicao',
 'COMUNIDADE',
 NULL,
 CURRENT_TIMESTAMP),

('pdir_ebook_eletrodeposicao_ecossistema',
 'prod_ebook_eletrodeposicao',
 'ECOSSISTEMA',
 'BASICO',
 CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING;

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
