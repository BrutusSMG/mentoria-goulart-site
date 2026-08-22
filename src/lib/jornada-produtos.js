// src/lib/jornada-produtos.js
export const PRODUTOS_JORNADA = [
  {
    slug: 'curso-garimpo-urbano-com-mentoria',
    nome: 'Curso Garimpo Urbano com Mentoria',
    tipo: 'Curso Premium',
  },
  {
    slug: 'curso-garimpo-urbano-sem-mentoria',
    nome: 'Curso Garimpo Urbano (Sem Mentoria)',
    tipo: 'Curso Online',
  },
  {
    slug: 'curso-eletrodeposicao-joias-semi-joias',
    nome: 'Curso de Eletrodeposição em Joias e Semi-Joias',
    tipo: 'Curso Online',
  },
  {
    slug: 'guia-definitivo-garimpo-urbano',
    nome: 'Guia Definitivo do Garimpo Urbano',
    tipo: 'E-book',
  },
  {
    slug: 'recuperacao-metais-residuos-oficinas',
    nome: 'Recuperação de Metais Preciosos de Resíduos de Oficinas',
    tipo: 'E-book',
  },
  {
    slug: 'tesouros-escondidos-ouro-prata',
    nome: 'TESOUROS ESCONDIDOS — Extração e Refino de Ouro e Prata',
    tipo: 'E-book',
  },
  {
    slug: 'eletrodeposicao-galvanoplastia-joias',
    nome: 'ELETRODEPOSIÇÃO — Galvanoplastia para a Indústria de Joias',
    tipo: 'E-book',
  },
  {
    slug: 'outro',
    nome: 'Outro produto',
    tipo: 'Outro',
  },
  {
    slug: 'nao-tenho-certeza',
    nome: 'Não tenho certeza',
    tipo: 'Outro',
  },
  {
    slug: 'nenhum-produto',
    nome: 'Não adquiri nenhum produto',
    tipo: 'Outro',
  },
];

export const PRODUTO_SLUGS = new Set(
  PRODUTOS_JORNADA.map((produto) => produto.slug),
);

export function nomeProduto(slug) {
  return (
    PRODUTOS_JORNADA.find((produto) => produto.slug === slug)?.nome ||
    'Produto não informado'
  );
}