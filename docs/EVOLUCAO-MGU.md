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

**Status: concluída e publicada em produção em 20/09/2026.**

A terceira etapa ampliou a capacidade comercial e administrativa do MGU e preparou a plataforma para diferentes tipos de produtos, direitos de acesso e serviços.

O desenvolvimento foi realizado de forma incremental, com validação das entregas em homologação antes de sua integração e publicação em produção.

### E3.1 — Catálogo interno de produtos

A primeira entrega da Etapa 3 estruturou um catálogo interno de produtos, separando a identidade dos produtos do MGU das integrações utilizadas pelas plataformas externas de venda.

Essa evolução permite:

* organizar os produtos em uma estrutura única;
* relacionar um produto a uma ou mais integrações externas;
* reconhecer com segurança qual produto foi adquirido;
* preservar o histórico das transações já existentes;
* tratar cursos e outros tipos de produtos de forma independente;
* preparar a plataforma para diferentes regras de acesso sem depender diretamente da matrícula do aluno.

O catálogo interno foi homologado e integrado à plataforma publicada em produção.

### E3.2 — Direitos e acessos

A separação entre produto adquirido, matrícula educacional e direitos de uso foi implementada, homologada e publicada.

A plataforma passou a contar com políticas de direitos por produto, permitindo que diferentes compras concedam combinações específicas de acesso à Comunidade, ao Ecossistema MGU e a outros benefícios.

Direitos provenientes de várias compras podem coexistir. Quando uma compra é reembolsada ou sofre chargeback, os direitos relacionados àquela aquisição podem ser revogados, preservando os benefícios válidos provenientes de outros produtos.

A Área do Aluno permanece vinculada à matrícula e ao período de acesso educacional. Produtos como e-books pagos podem conceder acesso à Comunidade e ao Ecossistema MGU sem exigir matrícula em curso.

Também foi estabelecida a base para organizar os módulos e recursos do Ecossistema MGU por níveis de acesso:

* **Básico:** acesso aos recursos classificados para esse nível;
* **Completo:** acesso aos recursos Básico e Completo;
* **Premium:** acesso aos recursos dos três níveis.

Essa estrutura permite que novos produtos, serviços e funcionalidades sejam adicionados à plataforma com regras de acesso próprias.

### E3.3 — Administração e preços

O catálogo interno passou a ser utilizado como fonte dos preços correntes exibidos pelo MGU nas áreas definidas para esta etapa.

A evolução incluiu:

* centralização dos preços públicos dos produtos no catálogo;
* administração controlada do preço corrente pelo painel administrativo;
* separação entre preços atuais e valores históricos das vendas;
* utilização do preço do catálogo na oferta da mentoria e no downsell;
* alinhamento dos eventos de acompanhamento comercial ao valor corrente do produto;
* remoção dos principais preços comerciais fixos dessas telas.

As condições de parcelamento continuam sendo informadas pelo checkout, evitando que a plataforma apresente valores de parcela não modelados no catálogo.

Os recursos foram validados em homologação e integrados à versão publicada em produção.

### E3.4 — Consolidação das cotações

A plataforma passou a utilizar um modelo consolidado de cotações, com registro individual por metal e preservação da origem, unidade, moeda e data de referência dos valores coletados.

A evolução incluiu:

* coleta independente das cotações, permitindo registrar os resultados disponíveis mesmo quando um dos ativos apresenta falha;
* tratamento explícito de cotações parciais, indisponíveis ou com erro;
* cálculo dos valores em reais por grama no sistema;
* disponibilização dos dados consolidados pela API de cotações;
* renovação do ticker da página inicial, com painel de detalhes responsivo e informações sobre fonte e atualização;
* remoção da apresentação de valores fixos como substitutos de cotações indisponíveis.

A nova estrutura foi homologada e publicada em produção. A primeira coleta consolidada foi realizada com sucesso para ouro, prata, platina e paládio, com gravação e exibição dos dados no site.

O ródio foi registrado como indisponível, sem atribuição de preço artificial. Sua disponibilização permanece condicionada à integração de uma fonte de dados adequada.

### E3.5 — Integração, homologação e publicação em produção

A etapa final reuniu as entregas desenvolvidas, realizou verificações integradas e preparou a publicação controlada da nova versão da plataforma.

Foram realizadas:

* validação conjunta dos recursos desenvolvidos nas etapas anteriores;
* verificações funcionais das principais páginas e áreas da plataforma;
* preparação e validação das atualizações necessárias para a publicação;
* publicação da nova versão em produção;
* conferência dos recursos comerciais, administrativos e educacionais;
* validação da disponibilização das cotações no site público;
* encerramento dos recursos temporários utilizados durante a preparação.

A publicação em produção foi concluída em **20/09/2026**, preservando os dados existentes e integrando as evoluções de produtos, direitos de acesso, administração, preços e cotações.

A rotina automática de atualização das cotações permanece em acompanhamento operacional após a publicação.

Com a conclusão da Etapa 3, o MGU dispõe de uma base ampliada para comercializar diferentes produtos, administrar suas informações, organizar direitos de acesso e desenvolver novos recursos para o Portal, a Comunidade e o Ecossistema MGU.

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
