# E7.3 — Cadastro ADMIN de Pessoas e representantes

**Status:** implementação candidata em PR contra `homologacao`. **Não aplicar migration automaticamente.** Sem autorização de escrita em Neon HML/PRD ou promoção para `main`.

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
