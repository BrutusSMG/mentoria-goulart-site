// src/lib/brevo.js
const BREVO_API_URL = 'https://api.brevo.com/v3';

async function requisicaoBrevo(path, body) {
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

  if (!Number.isInteger(listaEbook) || listaEbook <= 0
    || !Number.isInteger(listaClientes) || listaClientes <= 0) {
    throw new Error('IDs das listas Brevo não configurados.');
  }

  if (!process.env.BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY não configurada.');
  }

  // Cria o contato quando ele nunca foi lead e atualiza os existentes.
  // A lista #14 deve ser associada antes da remoção da lista #6, para
  // disparar a saída da nutrição mesmo em compras durante a automação.
  await requisicaoBrevo('/contacts', {
    email: emailNormalizado,
    listIds: [listaClientes],
    updateEnabled: true,
  });

  // Um comprador direto pode nunca ter pertencido à lista do e-book.
  // A remoção deve ser idempotente para contatos sem essa associação.
  await requisicaoBrevo(`/contacts/lists/${listaEbook}/contacts/remove`, {
    emails: [emailNormalizado],
  });
}
