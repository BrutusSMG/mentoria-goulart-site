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

export async function moverCompradorParaPosVenda(email) {
  const emailNormalizado = String(email || '').trim().toLowerCase();

  if (!emailNormalizado) {
    throw new Error('E-mail do comprador ausente para sincronização com Brevo.');
  }

  const listaEbook = Number(process.env.BREVO_LIST_ID_EBOOK);
  const listaClientes = Number(process.env.BREVO_LIST_ID_CLIENTES_MENTORIA);

  if (!listaEbook || !listaClientes) {
    throw new Error('IDs das listas Brevo não configurados.');
  }

  // Primeiro, incluir na lista que dispara a saída da automação.
  await requisicaoBrevo(`/contacts/lists/${listaClientes}/contacts/add`, {
    emails: [emailNormalizado],
  });

  // Depois, remover a associação com a lista de nutrição.
  await requisicaoBrevo(`/contacts/lists/${listaEbook}/contacts/remove`, {
    emails: [emailNormalizado],
  });
}