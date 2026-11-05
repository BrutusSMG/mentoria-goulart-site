-- CreateEnum
CREATE TYPE "MetalCotacao" AS ENUM ('OURO', 'PRATA', 'PLATINA', 'PALADIO', 'RODIO');

-- CreateEnum
CREATE TYPE "StatusCotacaoMetal" AS ENUM ('SUCESSO', 'PARCIAL', 'INDISPONIVEL', 'ERRO');

-- CreateEnum
CREATE TYPE "StatusAluno" AS ENUM ('PENDENTE_ACESSO', 'ATIVO', 'SUSPENSO', 'INATIVO');

-- CreateEnum
CREATE TYPE "OrigemAluno" AS ENUM ('HOTMART', 'LEGADO', 'MANUAL');

-- CreateEnum
CREATE TYPE "OrigemMatricula" AS ENUM ('HOTMART', 'LEGADO', 'MANUAL');

-- CreateEnum
CREATE TYPE "OrigemVigencia" AS ENUM ('HOTMART', 'LEGADO', 'MANUAL');

-- CreateEnum
CREATE TYPE "TipoDuracaoVigencia" AS ENUM ('DEFINIDA', 'INDEFINIDA', 'VITALICIA');

-- CreateEnum
CREATE TYPE "StatusVigenciaMatricula" AS ENUM ('AGENDADA', 'ATIVA', 'SUSPENSA', 'CANCELADA', 'ENCERRADA');

-- CreateEnum
CREATE TYPE "StatusMatricula" AS ENUM ('PENDENTE', 'ATIVA', 'SUSPENSA', 'CANCELADA', 'ENCERRADA');

-- CreateEnum
CREATE TYPE "VisibilidadePerfil" AS ENUM ('PRIVADO', 'ALUNOS');

-- CreateEnum
CREATE TYPE "TipoProduto" AS ENUM ('CURSO', 'EBOOK');

-- CreateEnum
CREATE TYPE "ProvedorProduto" AS ENUM ('HOTMART');

-- CreateEnum
CREATE TYPE "TipoDireitoProduto" AS ENUM ('AREA_ALUNO', 'COMUNIDADE', 'MENTORIA', 'CONTEUDO_PRODUTO', 'ECOSSISTEMA');

-- CreateEnum
CREATE TYPE "NivelEcossistema" AS ENUM ('NENHUM', 'BASICO', 'COMPLETO', 'PREMIUM');

-- CreateEnum
CREATE TYPE "OrigemDireitoConcedido" AS ENUM ('HOTMART', 'LEGADO', 'MANUAL');

-- CreateEnum
CREATE TYPE "StatusDireitoConcedido" AS ENUM ('ATIVO', 'REVOGADO', 'EXPIRADO');

-- CreateEnum
CREATE TYPE "StatusConviteLegado" AS ENUM ('PENDENTE', 'EM_ANDAMENTO', 'ENVIADO', 'FALHA', 'INDETERMINADO');

-- CreateEnum
CREATE TYPE "StatusUsuario" AS ENUM ('PENDENTE_ATIVACAO', 'ATIVO', 'BLOQUEADO');

-- CreateEnum
CREATE TYPE "PapelAdministrativo" AS ENUM ('ADMIN', 'PARCEIRO');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PARCEIRO', 'FORNECEDOR');

-- CreateTable
CREATE TABLE "CotacaoHistorico" (
    "id" TEXT NOT NULL,
    "dolar" DOUBLE PRECISION NOT NULL,
    "ouro" DOUBLE PRECISION NOT NULL,
    "prata" DOUBLE PRECISION NOT NULL,
    "platina" DOUBLE PRECISION NOT NULL,
    "paladio" DOUBLE PRECISION NOT NULL,
    "rodio" DOUBLE PRECISION,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CotacaoHistorico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CotacaoMetal" (
    "id" TEXT NOT NULL,
    "coletaId" TEXT NOT NULL,
    "metal" "MetalCotacao" NOT NULL,
    "valorOriginal" DECIMAL(18,6),
    "unidadeOriginal" TEXT,
    "moedaOriginal" TEXT,
    "dolarBrl" DECIMAL(12,6),
    "valorBrlGrama" DECIMAL(18,6),
    "fonte" TEXT NOT NULL,
    "fonteDolar" TEXT,
    "referenciaEm" TIMESTAMP(3),
    "coletadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "StatusCotacaoMetal" NOT NULL,
    "erro" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CotacaoMetal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "whatsapp" TEXT,
    "baixouEbook" BOOLEAN NOT NULL DEFAULT false,
    "comprouMentoria" BOOLEAN NOT NULL DEFAULT false,
    "comprouMentoriaEm" TIMESTAMP(3),
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmContent" TEXT,
    "utmTerm" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pessoaId" TEXT,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JornadaContribuicao" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "idempotencyKey" TEXT,
    "formVersion" TEXT NOT NULL DEFAULT '1.0',
    "caminho" TEXT NOT NULL,
    "respostas" JSONB NOT NULL,
    "produtosDeclarados" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "nomeInformado" TEXT NOT NULL,
    "emailInformado" TEXT NOT NULL,
    "whatsappInformado" TEXT,
    "cidadeEstado" TEXT,
    "tempoMentoria" TEXT,
    "dataCompraAproximada" TEXT,
    "statusVinculo" TEXT NOT NULL DEFAULT 'PENDENTE_VERIFICACAO',
    "statusOperacional" TEXT NOT NULL DEFAULT 'NOVA_RESPOSTA',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "interesseEntrevista" TEXT,
    "consentimentoEntrevista" BOOLEAN NOT NULL DEFAULT false,
    "consentimentoConteudo" BOOLEAN NOT NULL DEFAULT false,
    "melhorCanal" TEXT,
    "contatoPreferencial" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmContent" TEXT,
    "utmTerm" TEXT,
    "observacoesInternas" TEXT,
    "verificadoEm" TIMESTAMP(3),
    "verificadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JornadaContribuicao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aluno" (
    "id" TEXT NOT NULL,
    "leadId" TEXT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "whatsapp" TEXT,
    "senhaHash" TEXT,
    "status" "StatusAluno" NOT NULL DEFAULT 'PENDENTE_ACESSO',
    "origem" "OrigemAluno" NOT NULL DEFAULT 'HOTMART',
    "emailVerificadoEm" TIMESTAMP(3),
    "conviteLegadoEnviadoEm" TIMESTAMP(3),
    "ultimoLoginEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pessoaId" TEXT,

    CONSTRAINT "Aluno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ControleConviteLegado" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "status" "StatusConviteLegado" NOT NULL DEFAULT 'PENDENTE',
    "tentativas" INTEGER NOT NULL DEFAULT 0,
    "tentativaIniciadaEm" TIMESTAMP(3),
    "tentativaEncerradaEm" TIMESTAMP(3),
    "ultimoErro" TEXT,
    "mensagemProvedorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ControleConviteLegado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Matricula" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "produtoCatalogoId" TEXT,
    "produtoUcode" TEXT,
    "produtoNome" TEXT NOT NULL,
    "origem" "OrigemMatricula" NOT NULL DEFAULT 'HOTMART',
    "status" "StatusMatricula" NOT NULL DEFAULT 'PENDENTE',
    "concedidaEm" TIMESTAMP(3),
    "suspensaEm" TIMESTAMP(3),
    "encerradaEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Matricula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VigenciaMatricula" (
    "id" TEXT NOT NULL,
    "matriculaId" TEXT NOT NULL,
    "transacaoOrigemId" TEXT,
    "origem" "OrigemVigencia" NOT NULL,
    "tipoDuracao" "TipoDuracaoVigencia" NOT NULL,
    "status" "StatusVigenciaMatricula" NOT NULL,
    "concedidaEm" TIMESTAMP(3),
    "iniciaEm" TIMESTAMP(3) NOT NULL,
    "garantiaAte" TIMESTAMP(3),
    "expiraEm" TIMESTAMP(3),
    "statusAlteradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "canceladaEm" TIMESTAMP(3),
    "encerradaEm" TIMESTAMP(3),
    "avisoExpiracaoEnviadoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VigenciaMatricula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlunoAccessToken" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "usadoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlunoAccessToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerfilAluno" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "nomeExibicao" TEXT,
    "fotoUrl" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "bio" TEXT,
    "experiencia" TEXT,
    "objetivos" TEXT,
    "mostrarFoto" BOOLEAN NOT NULL DEFAULT false,
    "mostrarLocalizacao" BOOLEAN NOT NULL DEFAULT false,
    "mostrarBio" BOOLEAN NOT NULL DEFAULT false,
    "mostrarExperiencia" BOOLEAN NOT NULL DEFAULT false,
    "mostrarObjetivos" BOOLEAN NOT NULL DEFAULT false,
    "mostrarWhatsapp" BOOLEAN NOT NULL DEFAULT false,
    "visibilidade" "VisibilidadePerfil" NOT NULL DEFAULT 'PRIVADO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerfilAluno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "pessoaId" TEXT NOT NULL,
    "senhaHash" TEXT,
    "status" "StatusUsuario" NOT NULL DEFAULT 'PENDENTE_ATIVACAO',
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "passwordChangedAt" TIMESTAMP(3),
    "ultimoLoginEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcessoAdministrativo" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "papel" "PapelAdministrativo" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcessoAdministrativo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permissao" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "modulo" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permissao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioPermissao" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "permissaoId" TEXT NOT NULL,
    "concedidaPorUsuarioId" TEXT,
    "concedidaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsuarioPermissao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PARCEIRO',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "podeGerenciarSucatas" BOOLEAN NOT NULL DEFAULT false,
    "podeGerenciarDepoimentos" BOOLEAN NOT NULL DEFAULT false,
    "podeGerenciarJornada" BOOLEAN NOT NULL DEFAULT false,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "passwordChangedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pessoaId" TEXT,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SucataItem" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "valorKg" DOUBLE PRECISION NOT NULL,
    "metais" TEXT NOT NULL,
    "imagemUrl" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ultimaAtualizacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoPor" TEXT,

    CONSTRAINT "SucataItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Depoimento" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "videoUrl" TEXT,
    "imagemUrl" TEXT,
    "aprovado" BOOLEAN NOT NULL DEFAULT false,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Depoimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produto" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" "TipoProduto" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "preco" DECIMAL(12,2),
    "precoPromocional" DECIMAL(12,2),
    "moeda" TEXT NOT NULL DEFAULT 'BRL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProdutoIntegracao" (
    "id" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "provedor" "ProvedorProduto" NOT NULL,
    "externalId" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProdutoIntegracao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProdutoDireito" (
    "id" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "tipo" "TipoDireitoProduto" NOT NULL,
    "nivel" "NivelEcossistema",
    "configuracao" JSONB,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProdutoDireito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DireitoConcedido" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "produtoDireitoId" TEXT NOT NULL,
    "transacaoOrigemId" TEXT,
    "origem" "OrigemDireitoConcedido" NOT NULL,
    "status" "StatusDireitoConcedido" NOT NULL DEFAULT 'ATIVO',
    "concedidoEm" TIMESTAMP(3) NOT NULL,
    "iniciaEm" TIMESTAMP(3) NOT NULL,
    "expiraEm" TIMESTAMP(3),
    "revogadoEm" TIMESTAMP(3),
    "statusAlteradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DireitoConcedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EcoModulo" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "nivelMinimo" "NivelEcossistema" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EcoModulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EcoModuloRecurso" (
    "id" TEXT NOT NULL,
    "moduloId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nivelMinimo" "NivelEcossistema" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EcoModuloRecurso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HotmartWebhookEvent" (
    "id" TEXT NOT NULL,
    "hotmartEventId" TEXT NOT NULL,
    "evento" TEXT NOT NULL,
    "versao" TEXT,
    "transacaoCodigo" TEXT,
    "produtoId" TEXT,
    "criadoNaHotmartEm" TIMESTAMP(3),
    "recebidoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processadoEm" TIMESTAMP(3),
    "erroProcessamento" TEXT,

    CONSTRAINT "HotmartWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HotmartTransaction" (
    "id" TEXT NOT NULL,
    "transacaoCodigo" TEXT NOT NULL,
    "leadId" TEXT,
    "alunoId" TEXT,
    "matriculaId" TEXT,
    "emailComprador" TEXT,
    "produtoId" TEXT NOT NULL,
    "produtoCatalogoId" TEXT,
    "produtoUcode" TEXT,
    "produtoNome" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "valorBruto" DECIMAL(12,2) NOT NULL,
    "moeda" TEXT NOT NULL DEFAULT 'BRL',
    "formaPagamento" TEXT,
    "parcelas" INTEGER,
    "origemSrc" TEXT,
    "origemSck" TEXT,
    "origemXcod" TEXT,
    "aprovadoEm" TIMESTAMP(3),
    "ultimoEventoHotmartEm" TIMESTAMP(3),
    "ultimoEventoHotmartId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HotmartTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pessoa" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "emailPrincipal" TEXT NOT NULL,
    "telefonePrincipal" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pessoa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InteracaoMarketing" (
    "id" TEXT NOT NULL,
    "pessoaId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "origem" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "pagina" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InteracaoMarketing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CotacaoMetal_coletaId_idx" ON "CotacaoMetal"("coletaId");

-- CreateIndex
CREATE INDEX "CotacaoMetal_metal_coletadoEm_idx" ON "CotacaoMetal"("metal", "coletadoEm");

-- CreateIndex
CREATE INDEX "CotacaoMetal_status_idx" ON "CotacaoMetal"("status");

-- CreateIndex
CREATE INDEX "CotacaoMetal_coletadoEm_idx" ON "CotacaoMetal"("coletadoEm");

-- CreateIndex
CREATE UNIQUE INDEX "CotacaoMetal_coletaId_metal_key" ON "CotacaoMetal"("coletaId", "metal");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_email_key" ON "Lead"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_pessoaId_key" ON "Lead"("pessoaId");

-- CreateIndex
CREATE UNIQUE INDEX "JornadaContribuicao_idempotencyKey_key" ON "JornadaContribuicao"("idempotencyKey");

-- CreateIndex
CREATE INDEX "JornadaContribuicao_leadId_createdAt_idx" ON "JornadaContribuicao"("leadId", "createdAt");

-- CreateIndex
CREATE INDEX "JornadaContribuicao_statusVinculo_idx" ON "JornadaContribuicao"("statusVinculo");

-- CreateIndex
CREATE INDEX "JornadaContribuicao_statusOperacional_idx" ON "JornadaContribuicao"("statusOperacional");

-- CreateIndex
CREATE INDEX "JornadaContribuicao_caminho_idx" ON "JornadaContribuicao"("caminho");

-- CreateIndex
CREATE UNIQUE INDEX "Aluno_leadId_key" ON "Aluno"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "Aluno_email_key" ON "Aluno"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Aluno_pessoaId_key" ON "Aluno"("pessoaId");

-- CreateIndex
CREATE INDEX "Aluno_status_idx" ON "Aluno"("status");

-- CreateIndex
CREATE INDEX "Aluno_origem_idx" ON "Aluno"("origem");

-- CreateIndex
CREATE INDEX "Aluno_createdAt_idx" ON "Aluno"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ControleConviteLegado_alunoId_key" ON "ControleConviteLegado"("alunoId");

-- CreateIndex
CREATE INDEX "Matricula_alunoId_idx" ON "Matricula"("alunoId");

-- CreateIndex
CREATE INDEX "Matricula_produtoId_idx" ON "Matricula"("produtoId");

-- CreateIndex
CREATE INDEX "Matricula_produtoCatalogoId_idx" ON "Matricula"("produtoCatalogoId");

-- CreateIndex
CREATE INDEX "Matricula_status_idx" ON "Matricula"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Matricula_alunoId_produtoId_key" ON "Matricula"("alunoId", "produtoId");

-- CreateIndex
CREATE UNIQUE INDEX "VigenciaMatricula_transacaoOrigemId_key" ON "VigenciaMatricula"("transacaoOrigemId");

-- CreateIndex
CREATE INDEX "VigenciaMatricula_matriculaId_idx" ON "VigenciaMatricula"("matriculaId");

-- CreateIndex
CREATE INDEX "VigenciaMatricula_matriculaId_status_idx" ON "VigenciaMatricula"("matriculaId", "status");

-- CreateIndex
CREATE INDEX "VigenciaMatricula_status_idx" ON "VigenciaMatricula"("status");

-- CreateIndex
CREATE INDEX "VigenciaMatricula_iniciaEm_idx" ON "VigenciaMatricula"("iniciaEm");

-- CreateIndex
CREATE INDEX "VigenciaMatricula_expiraEm_idx" ON "VigenciaMatricula"("expiraEm");

-- CreateIndex
CREATE UNIQUE INDEX "AlunoAccessToken_tokenHash_key" ON "AlunoAccessToken"("tokenHash");

-- CreateIndex
CREATE INDEX "AlunoAccessToken_alunoId_idx" ON "AlunoAccessToken"("alunoId");

-- CreateIndex
CREATE INDEX "AlunoAccessToken_expiraEm_idx" ON "AlunoAccessToken"("expiraEm");

-- CreateIndex
CREATE UNIQUE INDEX "PerfilAluno_alunoId_key" ON "PerfilAluno"("alunoId");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_pessoaId_key" ON "Usuario"("pessoaId");

-- CreateIndex
CREATE INDEX "Usuario_status_idx" ON "Usuario"("status");

-- CreateIndex
CREATE INDEX "Usuario_createdAt_idx" ON "Usuario"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AcessoAdministrativo_usuarioId_key" ON "AcessoAdministrativo"("usuarioId");

-- CreateIndex
CREATE INDEX "AcessoAdministrativo_papel_idx" ON "AcessoAdministrativo"("papel");

-- CreateIndex
CREATE INDEX "AcessoAdministrativo_ativo_idx" ON "AcessoAdministrativo"("ativo");

-- CreateIndex
CREATE UNIQUE INDEX "Permissao_codigo_key" ON "Permissao"("codigo");

-- CreateIndex
CREATE INDEX "Permissao_modulo_idx" ON "Permissao"("modulo");

-- CreateIndex
CREATE INDEX "Permissao_ativo_idx" ON "Permissao"("ativo");

-- CreateIndex
CREATE INDEX "UsuarioPermissao_usuarioId_idx" ON "UsuarioPermissao"("usuarioId");

-- CreateIndex
CREATE INDEX "UsuarioPermissao_permissaoId_idx" ON "UsuarioPermissao"("permissaoId");

-- CreateIndex
CREATE INDEX "UsuarioPermissao_concedidaPorUsuarioId_idx" ON "UsuarioPermissao"("concedidaPorUsuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioPermissao_usuarioId_permissaoId_key" ON "UsuarioPermissao"("usuarioId", "permissaoId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_pessoaId_key" ON "AdminUser"("pessoaId");

-- CreateIndex
CREATE UNIQUE INDEX "Produto_slug_key" ON "Produto"("slug");

-- CreateIndex
CREATE INDEX "Produto_tipo_idx" ON "Produto"("tipo");

-- CreateIndex
CREATE INDEX "Produto_ativo_idx" ON "Produto"("ativo");

-- CreateIndex
CREATE INDEX "ProdutoIntegracao_produtoId_idx" ON "ProdutoIntegracao"("produtoId");

-- CreateIndex
CREATE INDEX "ProdutoIntegracao_ativo_idx" ON "ProdutoIntegracao"("ativo");

-- CreateIndex
CREATE UNIQUE INDEX "ProdutoIntegracao_provedor_externalId_key" ON "ProdutoIntegracao"("provedor", "externalId");

-- CreateIndex
CREATE INDEX "ProdutoDireito_tipo_idx" ON "ProdutoDireito"("tipo");

-- CreateIndex
CREATE INDEX "ProdutoDireito_ativo_idx" ON "ProdutoDireito"("ativo");

-- CreateIndex
CREATE UNIQUE INDEX "ProdutoDireito_produtoId_tipo_key" ON "ProdutoDireito"("produtoId", "tipo");

-- CreateIndex
CREATE INDEX "DireitoConcedido_alunoId_idx" ON "DireitoConcedido"("alunoId");

-- CreateIndex
CREATE INDEX "DireitoConcedido_produtoDireitoId_idx" ON "DireitoConcedido"("produtoDireitoId");

-- CreateIndex
CREATE INDEX "DireitoConcedido_transacaoOrigemId_idx" ON "DireitoConcedido"("transacaoOrigemId");

-- CreateIndex
CREATE INDEX "DireitoConcedido_status_idx" ON "DireitoConcedido"("status");

-- CreateIndex
CREATE INDEX "DireitoConcedido_alunoId_status_idx" ON "DireitoConcedido"("alunoId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "DireitoConcedido_produtoDireitoId_transacaoOrigemId_key" ON "DireitoConcedido"("produtoDireitoId", "transacaoOrigemId");

-- CreateIndex
CREATE UNIQUE INDEX "EcoModulo_slug_key" ON "EcoModulo"("slug");

-- CreateIndex
CREATE INDEX "EcoModulo_ativo_idx" ON "EcoModulo"("ativo");

-- CreateIndex
CREATE INDEX "EcoModulo_nivelMinimo_idx" ON "EcoModulo"("nivelMinimo");

-- CreateIndex
CREATE INDEX "EcoModuloRecurso_moduloId_idx" ON "EcoModuloRecurso"("moduloId");

-- CreateIndex
CREATE INDEX "EcoModuloRecurso_ativo_idx" ON "EcoModuloRecurso"("ativo");

-- CreateIndex
CREATE INDEX "EcoModuloRecurso_nivelMinimo_idx" ON "EcoModuloRecurso"("nivelMinimo");

-- CreateIndex
CREATE UNIQUE INDEX "EcoModuloRecurso_moduloId_codigo_key" ON "EcoModuloRecurso"("moduloId", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "HotmartWebhookEvent_hotmartEventId_key" ON "HotmartWebhookEvent"("hotmartEventId");

-- CreateIndex
CREATE INDEX "HotmartWebhookEvent_transacaoCodigo_idx" ON "HotmartWebhookEvent"("transacaoCodigo");

-- CreateIndex
CREATE INDEX "HotmartWebhookEvent_produtoId_idx" ON "HotmartWebhookEvent"("produtoId");

-- CreateIndex
CREATE INDEX "HotmartWebhookEvent_evento_idx" ON "HotmartWebhookEvent"("evento");

-- CreateIndex
CREATE UNIQUE INDEX "HotmartTransaction_transacaoCodigo_key" ON "HotmartTransaction"("transacaoCodigo");

-- CreateIndex
CREATE INDEX "HotmartTransaction_leadId_idx" ON "HotmartTransaction"("leadId");

-- CreateIndex
CREATE INDEX "HotmartTransaction_alunoId_idx" ON "HotmartTransaction"("alunoId");

-- CreateIndex
CREATE INDEX "HotmartTransaction_matriculaId_idx" ON "HotmartTransaction"("matriculaId");

-- CreateIndex
CREATE INDEX "HotmartTransaction_emailComprador_idx" ON "HotmartTransaction"("emailComprador");

-- CreateIndex
CREATE INDEX "HotmartTransaction_produtoId_idx" ON "HotmartTransaction"("produtoId");

-- CreateIndex
CREATE INDEX "HotmartTransaction_produtoCatalogoId_idx" ON "HotmartTransaction"("produtoCatalogoId");

-- CreateIndex
CREATE INDEX "HotmartTransaction_status_idx" ON "HotmartTransaction"("status");

-- CreateIndex
CREATE INDEX "HotmartTransaction_criadoEm_idx" ON "HotmartTransaction"("criadoEm");

-- CreateIndex
CREATE UNIQUE INDEX "Pessoa_emailPrincipal_key" ON "Pessoa"("emailPrincipal");

-- CreateIndex
CREATE INDEX "InteracaoMarketing_pessoaId_createdAt_idx" ON "InteracaoMarketing"("pessoaId", "createdAt");

-- CreateIndex
CREATE INDEX "InteracaoMarketing_tipo_createdAt_idx" ON "InteracaoMarketing"("tipo", "createdAt");

-- CreateIndex
CREATE INDEX "InteracaoMarketing_createdAt_idx" ON "InteracaoMarketing"("createdAt");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JornadaContribuicao" ADD CONSTRAINT "JornadaContribuicao_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aluno" ADD CONSTRAINT "Aluno_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aluno" ADD CONSTRAINT "Aluno_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControleConviteLegado" ADD CONSTRAINT "ControleConviteLegado_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matricula" ADD CONSTRAINT "Matricula_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matricula" ADD CONSTRAINT "Matricula_produtoCatalogoId_fkey" FOREIGN KEY ("produtoCatalogoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VigenciaMatricula" ADD CONSTRAINT "VigenciaMatricula_matriculaId_fkey" FOREIGN KEY ("matriculaId") REFERENCES "Matricula"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VigenciaMatricula" ADD CONSTRAINT "VigenciaMatricula_transacaoOrigemId_fkey" FOREIGN KEY ("transacaoOrigemId") REFERENCES "HotmartTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlunoAccessToken" ADD CONSTRAINT "AlunoAccessToken_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerfilAluno" ADD CONSTRAINT "PerfilAluno_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcessoAdministrativo" ADD CONSTRAINT "AcessoAdministrativo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioPermissao" ADD CONSTRAINT "UsuarioPermissao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioPermissao" ADD CONSTRAINT "UsuarioPermissao_permissaoId_fkey" FOREIGN KEY ("permissaoId") REFERENCES "Permissao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioPermissao" ADD CONSTRAINT "UsuarioPermissao_concedidaPorUsuarioId_fkey" FOREIGN KEY ("concedidaPorUsuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminUser" ADD CONSTRAINT "AdminUser_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdutoIntegracao" ADD CONSTRAINT "ProdutoIntegracao_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdutoDireito" ADD CONSTRAINT "ProdutoDireito_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DireitoConcedido" ADD CONSTRAINT "DireitoConcedido_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DireitoConcedido" ADD CONSTRAINT "DireitoConcedido_produtoDireitoId_fkey" FOREIGN KEY ("produtoDireitoId") REFERENCES "ProdutoDireito"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DireitoConcedido" ADD CONSTRAINT "DireitoConcedido_transacaoOrigemId_fkey" FOREIGN KEY ("transacaoOrigemId") REFERENCES "HotmartTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EcoModuloRecurso" ADD CONSTRAINT "EcoModuloRecurso_moduloId_fkey" FOREIGN KEY ("moduloId") REFERENCES "EcoModulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotmartTransaction" ADD CONSTRAINT "HotmartTransaction_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotmartTransaction" ADD CONSTRAINT "HotmartTransaction_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotmartTransaction" ADD CONSTRAINT "HotmartTransaction_matriculaId_fkey" FOREIGN KEY ("matriculaId") REFERENCES "Matricula"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotmartTransaction" ADD CONSTRAINT "HotmartTransaction_produtoCatalogoId_fkey" FOREIGN KEY ("produtoCatalogoId") REFERENCES "Produto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InteracaoMarketing" ADD CONSTRAINT "InteracaoMarketing_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
