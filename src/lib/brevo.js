// src/lib/brevo.js
const BREVO_API_URL = 'https://api.brevo.com/v3';

async function requisicaoBrevo(path, body ) {
  const resposta = await fetch(`${BREVO_API_URL}${path}`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!resposta.ok) {
    const detalhe = await resposta.text();
    throw new Error(`Brevo ${resposta.status}: ${detalhe}`);
  }
}

export async function moverCompradorParaPosVenda(email, { ehMentoria = true } = {}) {
  const emailNormalizado = String(email || '').trim().toLowerCase();

  if (!emailNormalizado) {
    throw new Error('E-mail do comprador ausente para sincronização com Brevo.');
  }

  const listaEbook = Number(process.env.BREVO_LIST_ID_EBOOK);
  const listaClientes = Number(ehMentoria
    ? process.env.BREVO_LIST_ID_CLIENTES_MENTORIA
    : process.env.BREVO_LIST_ID_CLIENTES_AVULSOS);

  if (!listaEbook || !listaClientes) {
    throw new Error('IDs das listas Brevo não configurados.');
  }

  // Cria o contato quando a compra acontece fora do funil do e-book.
  // updateEnabled torna o processo seguro também para contatos existentes.
  // A associação à lista de clientes é feita na própria criação/atualização.
  await requisicaoBrevo('/contacts', {
    email: emailNormalizado,
    listIds: [listaClientes],
    updateEnabled: true,
  });

  // Apenas quem comprou Mentoria sai da nutrição específica para Mentoria.
  // Compradores avulsos continuam elegíveis a ofertas da Mentoria.
  if (ehMentoria) await requisicaoBrevo(`/contacts/lists/${listaEbook}/contacts/remove`, {
    emails: [emailNormalizado],
  });
}