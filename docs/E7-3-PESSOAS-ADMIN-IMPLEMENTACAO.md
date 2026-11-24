# E7.3 — Cadastro ADMIN de Pessoas e representantes

**Status atual em 23/11/2026:** E7.2/E7.3 implementadas, homologadas e publicadas em PRD. A implantação técnica está concluída; a validação funcional completa em produção permanece aberta na [issue #30](https://github.com/BrutusSMG/mentoria-goulart-site/issues/30).

## Implementação e evidências atuais

- **Recursos:** `GET /api/admin/pessoas` permite busca autenticada ADMIN por nome ou e-mail (`q` de 2 a 120 caracteres), com `page` e `pageSize` de até 50; `POST /api/admin/pessoas` cria Pessoa com nome e e-mail obrigatório, telefone opcional, normalização de e-mail, verificação de duplicidade e autoria de criação em `Pessoa.criadoPorUsuarioId`. O cadastro não cria automaticamente Lead, Aluno, Usuário ou acesso.
- **Interface:** seleção e criação de Pessoas estão disponíveis na gestão de representantes dentro do detalhe de Organizações. Não há tela independente de Pessoas no menu ADMIN nesta entrega.
- **Autorização e segurança:** ADMIN autenticado, proteção de origem em mutações, entrada JSON limitada, respostas privadas sem cache. Rate limiting distribuído via PostgreSQL, por ADMIN autenticado: **30 GET e 10 POST por janela de 60 segundos**, em cotas separadas. Falhas no limitador bloqueiam as requisições; isso não substitui proteção de borda contra ataques anônimos.
- **Migrations:** E7.2 `20261111000000_e7_2_organizacoes`; E7.3 `20261121231000_e7_3_pessoa_autoria_email_ci` e `20261122200000_e7_3_limite_pessoas_admin`. Aplicadas em PRD em 23/11/2026 após backup e auditoria. Conferência posterior: três migrations concluídas, nenhuma incompleta, tabelas, coluna, FK e índices esperados presentes; **717 Pessoas preservadas**. O histórico consolidado de migrations legadas exige atenção, não executar `prisma migrate reset`.
- **Testes e publicação:** release validada com **644 testes automatizados**, incluindo PostgreSQL descartável, concorrência e limitações, além de lint e build. PR de release #29 integrado em `main` (`703528d`), aplicação Vercel Production em estado Ready.
- **Testes funcionais em PRD:** acesso ADMIN a Organizações, formulário com validação de nome, restrição de página a não autenticados e HTTP 401 para APIs administrativas anônimas. Em 23/11/2026, busca autenticada `q=an` nas páginas 1 e 2 com `pageSize=5` retornou paginação consistente (`total=262`, `totalPages=53`), sem expor itens; busca com `q=a` retornou corpo `ENTRADA_INVALIDA` na sessão autenticada, sem medição independente do status HTTP; consulta anônima retornou HTTP 401.
- **Pendente:** operações de criação e persistência de Pessoas e Organizações reais, comprovação de autoria, vínculos, estados e representante principal em PRD; regressão funcional final e decisão de encerramento. **Não criar dados fictícios em produção.** O registro da [issue #30](https://github.com/BrutusSMG/mentoria-goulart-site/issues/30) permanece aberto.

**Limite de autorização:** esta atualização documental não concede permissão para novas migrations, alterações de registros, merges ou deploys.

---

## Histórico de implementação: registros anteriores à publicação

Os itens abaixo documentam decisões, riscos e verificações realizados em 21 e 22/11/2026. **Expressões como “proposta”, “não implementado”, “não aplicado”, “aguardando CI”, “gates abertos” e “PR #28 em draft” retratam o momento daquele registro, não o estado atual.** Em caso de divergência, prevalece a seção de status atual acima. Manter esse histórico ajuda a auditar os critérios aplicados antes da publicação.

## Fluxo

Equipe externa coleta dados e entrega ao ADMIN. ADMIN cria ou abre Organização, pesquisa Pessoa canônica por nome/e-mail, seleciona existente ou cria explicitamente nova Pessoa (nome/e-mail obrigatórios, telefone opcional), e cria vínculo `PENDENTE`. Após conferência, ativa e pode definir contato principal. Criar Pessoa não cria Lead/Aluno/Usuario nem acesso.

- `GET /api/admin/pessoas?q=...&page=1&pageSize=20`: ADMIN; consulta paginada mínima, busca obrigatória com pelo menos 2 caracteres.
- `POST /api/admin/pessoas`: ADMIN; nome e emailPrincipal obrigatórios, telefonePrincipal opcional; e-mail normalizado; `409 EMAIL_EM_USO` se existente; autoria `Usuario.id` no servidor.
- `GET /api/admin/organizacoes/[id]/vinculos`: resposta anterior preservada, com campo aditivo `pessoa` (id/nome/e-mail/ativo).
- `POST /api/admin/organizacoes/[id]/vinculos`: contrato preservado; agora rejeita Pessoa inativa, inclusive na ativação do vínculo.
- UI `/admin/organizacoes`: após cadastrar Organização, redireciona ao detalhe para selecionar/criar representante.

## Migration proposta

`prisma/migrations/20261121231000_e7_3_pessoa_autoria_email_ci/migration.sql`

1. Acrescenta `Pessoa.criadoPorUsuarioId` opcional com FK `Usuario.id` e índice. Registros legados permanecem `NULL`.
2. Cria índice único `lower(btrim("emailPrincipal"))`, protegendo novas escritas também de outros fluxos.

**Bloqueio obrigatório antes de qualquer aplicação:** auditar HML e PRD com SELECT somente leitura para colisões case-insensitive e valores não normalizados. O índice funcional falhará em caso de duplicidades; não mesclar nem excluir Pessoas automaticamente. Conferir divergências entre histórico de migrations dos ambientes, especialmente PRD, antes de qualquer comando Prisma. Revisar nomes reais de constraints, ordem de implantação e impacto de índices no tráfego. Aplicar apenas mediante autorização específica.

## Segurança e limites

- ADMIN autenticado e ativo; PARCEIRO/anon negados.
- Proteção de Origin/CSRF usa `MGU_E72_ADMIN_ORIGINS` e padrão E7.2; verificar allowlist por ambiente. Não liberar `POST` sem configuração.
- Cache privado sem armazenamento; JSON com limite de 16 KiB; campos de saída mínimos.
- E-mail único não comprova identidade civil; conflito exige seleção explícita.
- Pessoa inativa é exibida na busca, mas não selecionável para novo vínculo; não há reativação automática.
- O PR não implementa rate limiting distribuído. Antes de disponibilizar a API em ambiente público, configurar limitação na borda ou mecanismo compartilhado e testar contra enumeração.
- A trilha de autoria registra **criação administrativa**, não todas as futuras edições de Pessoa.
- Necessário teste real de concorrência em PostgreSQL descartável; mocks unitários não substituem constraint SQL.
- A migration altera schema de Pessoa utilizado por Lead/Aluno. Fazer regressão E6 e verificação de `prisma generate`, lint, tests e build em ambiente isolado antes do merge.

## Comandos de validação local (sem banco)

```bash
npm ci
npx prisma validate
npx prisma generate
npm test
npm run lint
npm run build
```

`npm run build` pode exigir variáveis de ambiente da aplicação. Nenhum comando acima deve usar `prisma migrate deploy`, `db push`, `migrate dev` ou conexão com PRD. Conferir a configuração do ambiente antes de executar scripts.

## Critérios de aceite pendentes

1. Testes unitários de validação, busca, duplicidade e autoria.
2. Revisão de segurança de API, incluindo limitação de consultas.
3. Revisão da migration e auditoria de colisões antes de qualquer aplicação.
4. Testes de integração com PostgreSQL descartável, segurança e concorrência.
5. Validação visual ADMIN em Preview/HML com ambiente correto, após autorização de schema.
6. Aprovação separada para merge em `homologacao`; promoção a `main` fora de escopo.

## Verificações de 22/11/2026

- Auditoria de e-mails em HML e PRD informada pelo operador: zero colisões, zero e-mails não normalizados e zero vazios. Essa auditoria é pontual; repetir imediatamente antes de aplicar a migration se houver intervalo significativo.
- Histórico Prisma informado: HML registra E7.2 aplicada; PRD não registra E7.2. Não tratar os históricos como idênticos nem promover a E7.3 isoladamente para PRD.
- Consulta estrutural de HML informada: tabelas `Organizacao` e `PessoaOrganizacao`, índice de par aberto e índice de principal ativo presentes; coluna de autoria e índice funcional de e-mail da E7.3 ausentes, como esperado.
- Criado `tests/admin-pessoas-http.test.js` com cobertura adicional de autorização, busca, CSRF, limites de corpo, falhas sanitizadas e conflito de e-mail. **Ainda não executado neste incremento**, por indisponibilidade de checkout local e runner de CI acessível nesta sessão.

### Gates que permanecem abertos

1. Executar os testes HTTP e toda a suíte, lint, Prisma validate e build em checkout confiável; não presumir aprovação dos testes recém-adicionados.
2. Testar a migration E7.3 e duas inserções concorrentes com o mesmo e-mail em PostgreSQL descartável, incluindo a forma real de `P2002.meta` do Prisma 5.22.
3. Implementar/verificar proteção distribuída de frequência e enumeração na borda (WAF/gateway) para `GET/POST /api/admin/pessoas`; não confiar em contador em memória de instâncias serverless.
4. Conferir a allowlist `MGU_E72_ADMIN_ORIGINS` no Preview/HML e realizar smoke de ponta a ponta com schema E7.3 somente após aprovação explícita de migration HML.
5. Manter PR #28 em draft. Sem escrita em Neon HML/PRD, sem merge e sem deploy automático.

## Proteção distribuída implementada em 22/11/2026

- `GET /api/admin/pessoas`: 30 solicitações por 60 segundos por `Usuario.id` ADMIN autenticado.
- `POST /api/admin/pessoas`: 10 solicitações por 60 segundos por `Usuario.id`, independente de GET.
- `LimitePessoasAdmin` armazena somente chave `GET:<usuarioId>` / `POST:<usuarioId>`, início da janela e contador. `INSERT ... ON CONFLICT DO UPDATE` usa relógio do PostgreSQL e incremento atômico; a janela reinicia na próxima solicitação após 60 segundos. Duas linhas por administrador ativo, sem IP ou e-mail persistidos.
- Excesso: HTTP 429 `LIMITE_EXCEDIDO` e `Retry-After`. Falha do armazenamento: HTTP 503 `LIMITE_INDISPONIVEL`, sem consulta/criação (fail-closed).
- Nova migration **`20261122200000_e7_3_limite_pessoas_admin`**, posterior à migration de autoria/índice. Ela cria uma tabela dedicada, não modifica dados de Pessoas.
- O controle é por administrador autenticado, **não substitui proteção de borda contra tráfego anônimo**, DoS ou ataques distribuídos. A autenticação existente continua obrigatória; revisar WAF e observabilidade do provedor antes de exposição pública.
- O banco é dependência operacional do limitador: qualquer falha de consulta bloqueia a rota. Monitorar 429/503 e carga do PostgreSQL. Limite e janela são constantes no código, não configuráveis por ambiente.
- Teste HTTP cobre 429/503; teste PostgreSQL descartável verifica 35 requisições GET concorrentes (30 permitidas), 12 POST (10 permitidas), separação de cotas e reinício da janela. **Aguardando resultado de CI para esta alteração.**
- A migration E7.3 permanece não aplicada no Neon HML/PRD; qualquer aplicação exige autorização explícita e nova auditoria somente leitura.
