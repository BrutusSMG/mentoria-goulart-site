// Utilidades de apresentação do módulo ADMIN. Regras de domínio continuam no servidor.
export const CAMPOS_ORGANIZACAO_UI = [
  ["nomeFantasia", "Nome fantasia", 200],
  ["razaoSocial", "Razão social", 200],
  ["cnpj", "CNPJ", 18],
  ["email", "E-mail empresarial", 254],
  ["telefone", "Telefone empresarial", 32],
  ["site", "Site (https://)", 2048],
];

export const ROTULOS_VALIDACAO = {
  PRELIMINAR: "Preliminar",
  VALIDADA: "Validada",
  REJEITADA: "Rejeitada",
};
export const ROTULOS_OPERACAO = { ATIVA: "Ativa", INATIVA: "Inativa" };
export const ROTULOS_VINCULO = {
  PENDENTE: "Pendente",
  ATIVO: "Ativo",
  ENCERRADO: "Encerrado",
};

const MENSAGENS = {
  CNPJ_INVALIDO: "CNPJ inválido. Confira os dígitos verificadores.",
  CNPJ_EM_USO: "Já existe outra organização com esse CNPJ.",
  EMAIL_EM_USO: "Este e-mail já está cadastrado. Pesquise e confirme a Pessoa existente.",
  LIMITE_EXCEDIDO: "Muitas consultas ou cadastros em sequência. Aguarde um minuto e tente novamente.",
  LIMITE_INDISPONIVEL: "A proteção de consultas está temporariamente indisponível. Tente novamente em instantes.",
  PESSOA_INATIVA: "Pessoa inativa. Solicite revisão administrativa antes de vincular ou ativar.",
  NOME_OBRIGATORIO: "Informe pelo menos o nome fantasia ou a razão social.",
  ENTRADA_INVALIDA: "Os dados enviados são inválidos. Confira os campos e seus formatos.",
  RECONFIRMACAO_OBRIGATORIA: "Confirme a alteração cadastral de uma organização já validada.",
  CONFIRMACAO_INAPLICAVEL: "A reconfirmação não é necessária para essa alteração.",
  TRANSICAO_INVALIDA: "A alteração não é permitida no estado atual. Atualize a página.",
  ORGANIZACAO_INATIVA: "Reative a organização antes de criar ou ativar vínculos.",
  NAO_ENCONTRADO: "O registro não foi encontrado.",
  VINCULO_ABERTO_EXISTENTE: "Essa pessoa já possui um vínculo aberto com a organização.",
  PRINCIPAL_INVALIDO: "Somente um vínculo ativo pode ser contato principal.",
  CONFLITO_CONCORRENCIA: "Outro operador alterou o cadastro. Atualize e tente novamente.",
  ORIGEM_NAO_AUTORIZADA: "A escrita foi bloqueada pela configuração de origem deste ambiente. Solicite a conferência da configuração do Preview.",
  ERRO_INTERNO: "O servidor não conseguiu concluir a operação. Nenhuma conclusão sobre a gravação deve ser presumida.",
  ACESSO_NEGADO: "Acesso restrito ao administrador.",
};

export function nomeOrganizacao(item) {
  return item?.nomeFantasia || item?.razaoSocial || "Organização sem nome";
}

export function formatarDataOrganizacao(data) {
  if (!data) return "Não informado";
  const valor = new Date(data);
  if (Number.isNaN(valor.getTime())) return "Data inválida";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(valor);
}

export function camposIniciaisOrganizacao(item = {}) {
  return Object.fromEntries(
    CAMPOS_ORGANIZACAO_UI.map(([campo]) => [campo, item[campo] || ""]),
  );
}

export async function apiOrganizacoes(caminho, { method = "GET", body } = {}) {
  const resposta = await fetch(caminho, {
    method,
    cache: "no-store",
    credentials: "same-origin",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    const codigo = dados.code || "";
    throw new Error(MENSAGENS[codigo] || dados.error || "Não foi possível concluir a operação.");
  }
  return dados;
}
