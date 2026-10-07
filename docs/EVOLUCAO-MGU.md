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

### E3.4 — Consolidação das cotações concluída em homologação

A plataforma passou a utilizar um modelo consolidado de cotações, com
registro individual por metal e preservação da origem, unidade, moeda
e data de referência dos valores coletados.

A evolução incluiu:

- coleta independente das cotações, permitindo registrar os resultados
  disponíveis mesmo quando um dos ativos apresenta falha;
- tratamento explícito de cotações parciais, indisponíveis ou com erro;
- cálculo dos valores em reais por grama no backend;
- disponibilização dos dados consolidados pela API de cotações;
- renovação do ticker da página inicial, com painel de detalhes
  responsivo e informações sobre fonte e atualização;
- remoção da apresentação de valores fixos como substitutos de
  cotações indisponíveis.

O ródio permanece indicado como indisponível até que seja integrada
uma fonte de dados adequada.

A E3.4 foi validada funcionalmente em homologação. A publicação em
produção será realizada posteriormente, mediante preparação e
validação da migração do banco de dados.

---

## Etapa 4 — Identidade, alunos legados e primeiro acesso

**Status: concluída e publicada em produção.**

A quarta etapa introduz uma nova base de identidade para permitir que a
plataforma evolua sem depender da duplicação de dados entre diferentes
tipos de cadastro.

A entidade Pessoa passa a representar gradualmente a identidade central
do usuário, enquanto aluno, lead e outros papéis continuam representando
os diferentes relacionamentos dessa pessoa com o MGU.

A implementação foi realizada de forma incremental e não destrutiva,
preservando as estruturas existentes durante a transição.

### Cadastro e integração de alunos legados

Também foi estruturado um fluxo específico para alunos que já possuíam
relacionamento com o MGU antes da automação atual da plataforma.

Esse fluxo permite:

- registrar o aluno dentro da nova estrutura de identidade;
- associar os produtos já adquiridos;
- preservar regras de matrícula, vigência e direitos de acesso;
- diferenciar cadastros históricos das compras originadas pelas integrações
  atuais;
- interromper automaticamente situações que apresentem conflito ou
  ambiguidade de identidade.

A plataforma evita realizar associações automáticas quando os dados não
permitem confirmar com segurança que os registros pertencem à mesma pessoa.

### Primeiro acesso e segurança do convite

O primeiro acesso dos alunos legados também passou a possuir um fluxo
controlado.

A evolução inclui:

- geração de convites individuais de primeiro acesso;
- links temporários e de uso único;
- proteção contra tentativas duplicadas;
- registro do andamento e do resultado das tentativas;
- bloqueio de novas ações quando o resultado anterior não puder ser
  determinado com segurança;
- conclusão transacional da criação da senha;
- separação entre credenciais, situação do aluno e direitos adquiridos.

Os estados do convite também passaram a ser apresentados no painel
administrativo, permitindo identificar situações que exigem conferência
antes de uma nova ação.

O fluxo completo também foi validado em ambiente de homologação,
incluindo envio controlado do convite, criação da senha, consumo único
do link, login posterior e reconhecimento dos acessos adquiridos pelo
aluno.

A reutilização de um convite já consumido é recusada pela plataforma.

Também foi definido um procedimento específico para situações em que o
resultado de uma tentativa não pode ser determinado com segurança.

Nesses casos, a plataforma preserva as evidências existentes e impede que
a incerteza resulte automaticamente em uma nova tentativa de envio.

### Auditoria administrativa

A listagem e o detalhe administrativo do aluno foram ampliados para permitir
acompanhar o processo de primeiro acesso dos cadastros históricos.

O painel apresenta somente as informações necessárias à operação,
preservando dados internos e credenciais que não devem ser expostos
à interface administrativa.

A consulta, a auditoria e o fluxo controlado de primeiro acesso já foram
validados em homologação.

O envio permanece protegido por barreiras operacionais e não é habilitado
automaticamente em produção.

### Portal do Aluno

A estrutura do Portal do Aluno também foi preparada para utilizar um
subdomínio próprio, mantendo compatibilidade com as rotas já existentes
da aplicação.

Essa evolução permite oferecer ao aluno uma navegação mais simples e
independente da estrutura interna de URLs da plataforma.

### Situação atual

A Etapa 4 foi concluída e publicada em produção.

A evolução incorporou:

- base inicial para a identidade centralizada;
- vínculo entre identidade e aluno;
- cadastro controlado de alunos legados;
- preservação de produtos, matrículas, vigências e direitos;
- primeiro acesso seguro;
- controle e auditoria dos convites;
- procedimento definido para situações que exigem conferência manual;
- proteção contra duplicidade e reutilização do convite;
- visualização administrativa do estado do processo;
- validação do fluxo completo de primeiro acesso;
- Portal do Aluno preparado para seu endereço próprio;
- publicação controlada das novas estruturas e funcionalidades.

A atualização de produção foi concluída preservando os dados existentes e
com validação das principais áreas públicas e administrativas.

As capacidades operacionais mais sensíveis relacionadas ao cadastro e ao
envio de convites legados permanecem desabilitadas por decisão operacional
e só deverão ser habilitadas futuramente mediante nova validação explícita.

---


## Etapa 5 — Usuários, acessos e permissões

**Status: concluída e publicada em produção em 06/10/2026.**

A quinta etapa consolidou a separação entre identidade, autenticação
e autorização dentro do MGU.

A plataforma passou a utilizar uma identidade de acesso comum associada
à pessoa, permitindo que diferentes relacionamentos com o MGU coexistam
sem que um único tipo de conta determine toda a experiência.

Entre as principais evoluções estão:

- consolidação da autenticação em uma estrutura comum de usuário;
- separação entre identidade e os diferentes contextos de acesso;
- generalização das permissões administrativas;
- diferenciação entre administrador e parceiro com acesso limitado;
- preservação do acesso do aluno por meio de seu relacionamento
  educacional;
- suporte a uma mesma pessoa possuir mais de um contexto dentro da
  plataforma;
- navegação entre os contextos disponíveis para a mesma identidade;
- autorização dos módulos administrativos de acordo com as permissões
  efetivamente concedidas.

O ADMIN continua possuindo acesso completo ao ambiente administrativo.

O PARCEIRO utiliza o mesmo ambiente administrativo, mas visualiza e acessa
somente os módulos para os quais recebeu autorização.

O acesso do aluno permanece independente das permissões administrativas
e continua associado ao relacionamento educacional existente na
plataforma.

A publicação em produção foi realizada de forma controlada, com
preservação dos dados existentes e validação dos principais cenários
administrativos e de permissão.

As capacidades operacionais mais sensíveis permanecem sob controle e
não foram habilitadas automaticamente pela conclusão desta etapa.

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
