# Evolução do MGU

Este documento apresenta uma visão pública e resumida da evolução da plataforma Mentoria Garimpo Urbano.

O objetivo é registrar as principais entregas e a direção do projeto sem expor detalhes internos de arquitetura, infraestrutura, operação ou decisões ainda em validação.

---

## Visão geral

O MGU está evoluindo de uma estrutura inicialmente voltada à apresentação e comercialização da Mentoria Garimpo Urbano para uma plataforma mais ampla de conteúdo, produtos, relacionamento e acompanhamento de alunos.

A evolução é realizada por etapas, permitindo que cada conjunto de funcionalidades seja desenvolvido, validado e consolidado antes da próxima expansão.

---

## Etapa 1 — Base de alunos e acesso

**Status: concluída.**

A primeira etapa estruturou a base necessária para que o MGU pudesse reconhecer alunos e controlar o acesso aos recursos adquiridos.

Entre as principais evoluções estão:

- estruturação da área do aluno;
- organização das matrículas;
- controle do período de acesso;
- fluxo de primeiro acesso;
- autenticação e acesso às áreas protegidas;
- evolução das ferramentas administrativas relacionadas aos alunos.

Essa etapa criou a fundação para que novos produtos e experiências possam utilizar uma estrutura comum de usuários e acesso.

---

## Etapa 2 — Integração de vendas e ciclo de acesso

**Status: concluída.**

A segunda etapa integrou o fluxo comercial ao controle de acesso da plataforma.

Com isso, o MGU passou a tratar de forma estruturada os principais eventos relacionados às compras e ao ciclo de acesso do aluno.

As principais entregas incluem:

- integração entre vendas e concessão de acesso;
- tratamento seguro dos diferentes estados de uma transação;
- prevenção de duplicidades;
- preservação do histórico das operações;
- maior segurança na criação e atualização dos acessos;
- integração dos fluxos de comunicação relacionados ao primeiro acesso;
- homologação dos principais cenários antes da publicação em produção.

Essa etapa tornou o processo de entrada do aluno mais consistente e preparou a plataforma para ampliar seu catálogo de produtos.

---

## Etapa 3 — Produtos, acessos, preços, cotações e administração

**Status: em desenvolvimento.**

A terceira etapa amplia a capacidade comercial e administrativa do MGU e
prepara a plataforma para diferentes tipos de produtos e formas de acesso.

### Catálogo interno de produtos — concluído em homologação

A primeira entrega da Etapa 3 estruturou um catálogo interno de produtos,
separando a identidade dos produtos do MGU das integrações utilizadas pelas
plataformas externas de venda.

Essa evolução permite:

- organizar os produtos em uma estrutura única;
- relacionar um produto a uma ou mais integrações externas;
- reconhecer com segurança qual produto foi adquirido;
- preservar o histórico das transações já existentes;
- tratar cursos e outros tipos de produtos de forma independente;
- preparar a plataforma para novas regras de acesso sem depender
  diretamente da matrícula do aluno.

A implementação foi homologada antes da continuidade da etapa.

### E3.2 — Direitos e acessos concluída em homologação

A separação entre produto adquirido, matrícula educacional e direitos de uso
foi implementada e homologada.

A plataforma agora possui políticas de direitos por produto, concessões
vinculadas à transação de origem, direitos binários independentes e níveis
cumulativos do Ecossistema MGU.

Direitos oriundos de várias compras podem coexistir. Quando uma compra é
reembolsada ou sofre chargeback, somente os direitos daquela origem são
revogados, preservando direitos válidos provenientes de outros produtos.

A Área do Aluno continua vinculada à matrícula e à vigência educacional.
Produtos como e-books pagos podem criar uma conta no Portal MGU e conceder
acesso à Comunidade e ao Ecossistema sem criar matrícula.

Também foi criada a base de autorização para módulos e recursos do
Ecossistema de acordo com o nível mínimo exigido.

Durante a homologação foi corrigida uma regressão de estado financeiro:
uma aprovação recebida depois de REFUNDED ou CHARGEBACK continua auditada,
mas não reabre o estado terminal nem recria direitos ou vigências.

A E3.2 foi encerrada em homologação com 188 testes automatizados aprovados,
schema Prisma válido e build de produção concluído com 58/58 páginas.
O fechamento técnico está registrado no commit `cc3d00a`.

### E3.3 — Administração e preços concluída em homologação

O catálogo interno passou a ser utilizado como fonte dos preços correntes
exibidos pelo MGU nas áreas definidas para esta etapa.

A evolução incluiu:

- centralização dos preços públicos dos produtos no catálogo;
- administração controlada do preço corrente pelo painel administrativo;
- separação entre preços atuais e valores históricos das vendas;
- utilização do preço do catálogo na oferta da mentoria e no downsell;
- alinhamento dos eventos de acompanhamento comercial ao valor corrente do produto;
- remoção dos principais preços comerciais fixos dessas telas.

As condições de parcelamento continuam sendo informadas pelo checkout,
evitando que a plataforma apresente valores de parcela não modelados no catálogo.

A E3.3 foi validada funcionalmente em homologação e no Preview antes da
continuidade da etapa.

### Próximo foco — consolidação das cotações

A próxima evolução será a E3.4, dedicada à consolidação das
cotações utilizadas pelo projeto, com preservação de origem e unidade dos
dados, tratamento explícito de falhas de coleta e remoção de valores inventados
em situações de indisponibilidade.

Depois disso, a Etapa 3 seguirá para integração visual, regressão e
homologação final.

---

## Próximas evoluções

A plataforma continuará sendo desenvolvida de forma incremental.

Entre as direções previstas estão:

- expansão do Ecossistema MGU;
- evolução da experiência dos alunos;
- ampliação dos recursos administrativos;
- novos conteúdos, produtos e serviços;
- evolução dos recursos de comunidade;
- novas ferramentas de apoio ao público do Garimpo Urbano.

As funcionalidades são incorporadas gradualmente, após desenvolvimento, homologação e validação.

---

## Sobre esta documentação

Este arquivo representa apenas a visão pública da evolução do MGU.

Documentação técnica detalhada, arquitetura interna, procedimentos de operação, migrações, testes, decisões em estudo e planejamento de implementação são mantidos separadamente.

Dessa forma, o repositório público permanece útil para acompanhar a evolução do projeto sem expor informações internas que não são necessárias para o uso ou entendimento público da plataforma.
