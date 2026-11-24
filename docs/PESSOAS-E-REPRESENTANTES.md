# Pessoas e representantes de organizações no MGU

**Atualização:** 23/11/2026  
**Situação:** E7.2 e E7.3 implementadas e publicadas em produção. A validação funcional completa em PRD permanece em acompanhamento.

## Uma identidade, diferentes relacionamentos

O MGU usa `Pessoa` como entidade central de identidade individual. A mesma Pessoa pode estar relacionada a um Lead, Aluno, Usuário ou Organização, de acordo com os fatos e permissões registrados. Esses relacionamentos não exigem a duplicação automática de uma identidade.

O representante de uma empresa não precisa ser Lead nem Aluno. Criar uma Pessoa não cria automaticamente acesso ao sistema, matrícula, direitos, relacionamento de Lead ou papel administrativo.

## Funcionalidade disponível para o ADMIN

A API administrativa de Pessoas permite:

- **Pesquisar por nome ou e-mail**, com consulta paginada, para selecionar um cadastro existente antes de considerar um novo registro;
- **Cadastrar uma Pessoa**, informando nome e e-mail principal, com telefone opcional, sem criar outros relacionamentos automaticamente;
- **Proteger contra e-mails já cadastrados**, inclusive variações de espaços e letras maiúsculas/minúsculas;
- **Registrar a autoria** de cadastros realizados pela operação administrativa.

A pesquisa e o cadastro de Pessoas integram o fluxo de representantes de Organizações. No painel ADMIN, o seletor de Pessoas está disponível durante a gestão de vínculos no detalhe de uma Organização. **Não existe uma página independente de Pessoas no menu ADMIN nesta entrega.**

## Organizações e vínculos

A E7.2 permite cadastrar Organizações, acompanhar estados de validação e operação, localizar Pessoas, estabelecer vínculos e gerenciar o representante de contato principal conforme as regras do sistema.

O cadastro de uma Organização **não a habilita automaticamente como fornecedora**. A existência de um vínculo também não comprova poderes legais de representação.

## Segurança e integridade

As operações administrativas exigem autenticação e autorização de ADMIN. As consultas são limitadas e paginadas; cadastros aplicam validação de entrada, proteção contra duplicidade e controles de frequência de requisições. A consulta não deve ser usada para divulgação de dados pessoais.

O fluxo preserva identidades existentes. Similaridade de nome não basta para fundir registros de Pessoas ou concluir que duas identidades são a mesma pessoa.

## Estado da validação

A implementação foi homologada e publicada em produção em 23/11/2026. Foram verificados o deploy, as migrations, a preservação dos registros de Pessoas e a recusa de acesso anônimo às APIs de Pessoas e Organizações. Também foi validada a interface de Organizações com ausência de registros e a validação básica do formulário.

Em 23/11/2026, a consulta autenticada de Pessoas e a paginação entre as páginas 1 e 2 foram verificadas em PRD, sem alterar registros ou divulgar dados pessoais nas evidências. Uma busca com apenas um caractere retornou `ENTRADA_INVALIDA`, e uma requisição sem autenticação retornou HTTP 401. O status HTTP da busca inválida na sessão autenticada não foi aferido independentemente.

Ainda faltam evidências em PRD de cadastro administrativo de Pessoas reais, persistência, autoria e vínculos com Organizações reais. Essas verificações deverão ocorrer quando houver necessidade operacional legítima, sem criar registros fictícios. Acompanhar a [issue #30](https://github.com/BrutusSMG/mentoria-goulart-site/issues/30).

Este documento descreve as funcionalidades administrativas efetivamente incorporadas e distingue sua disponibilidade da validação operacional pendente.
