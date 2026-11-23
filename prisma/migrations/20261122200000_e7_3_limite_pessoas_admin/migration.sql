-- E7.3: rate limiting distribuido por Usuario ADMIN e operacao (GET/POST).
-- Uma linha por identidade e operacao, reutilizada a cada janela de 60 segundos.
-- Nenhum IP, e-mail ou dado pessoal fica armazenado neste controle.
CREATE TABLE "LimitePessoasAdmin" (
    "chave" VARCHAR(160) NOT NULL,
    "janelaInicio" TIMESTAMPTZ(3) NOT NULL,
    "contador" INTEGER NOT NULL,
    CONSTRAINT "LimitePessoasAdmin_pkey" PRIMARY KEY ("chave")
);
