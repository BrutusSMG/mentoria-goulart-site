-- E3.2.2 - Matriz inicial Produto x Direitos.
-- Fonte de verdade: ProdutoDireito.
-- Direitos binarios usam nivel NULL.
-- ECOSSISTEMA usa BASICO, COMPLETO ou PREMIUM.
-- NENHUM nao e concedido por Produto.

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
 CURRENT_TIMESTAMP);