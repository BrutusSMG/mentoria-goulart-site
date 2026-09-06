// src/app/api/jornada/contribuicoes/route.js
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { PRODUTO_SLUGS, nomeProduto } from '@/lib/jornada-produtos';
import { JORNADA_FLAGS } from '@/lib/jornada-config';
import { emailFormatoValido } from '@/lib/validacoes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CAMINHOS_VALIDOS = new Set([
  'HISTORIA',
  'CASE',
  'MELHORIA',
  'NOVO_CONTEUDO',
  'PARCERIA',
  'OUTRO',
]);

function texto(valor, limite = 500) {
  return String(valor ?? '').trim().slice(0, limite);
}

function emailNormalizado(valor) {
  return texto(valor, 320).toLowerCase();
}

function telefoneNormalizado(valor) {
  return texto(valor, 40).replace(/\D/g, '');
}

function escaparHtml(valor = '') {
  const caracteres = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return String(valor).replace(/[&<>"']/g, (caractere) => caracteres[caractere]);
}

function listaDeStrings(valor, limite = 10) {
  if (!Array.isArray(valor)) return [];

  return [
    ...new Set(
      valor
        .map((item) => texto(item, 120))
        .filter(Boolean),
    ),
  ].slice(0, limite);
}

function objetoRespostas(valor) {
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) {
    return {};
  }

  const serializado = JSON.stringify(valor);

  if (serializado.length > 50000) {
    throw new Error('Respostas acima do limite permitido.');
  }

  return valor;
}

function resumoObrigatorio(respostas) {
  return texto(respostas?.resumo, 5000);
}

function resposta(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

function notificacoesExternasAtivas() {
  return JORNADA_FLAGS.externalNotifications;
}

async function enviarAlertaInterno({ contribuicao, produtos }) {
  if (!notificacoesExternasAtivas()) return;

  const apiKey = process.env.RESEND_API_KEY;
  const destinatario = process.env.JORNADA_ALERT_EMAIL;

  if (!apiKey || !destinatario) return;

  const resend = new Resend(apiKey);
  const nome = escaparHtml(contribuicao.nomeInformado);
  const email = escaparHtml(contribuicao.emailInformado);
  const caminho = escaparHtml(contribuicao.caminho);
  const produtosHtml = produtos
    .map((slug) => escaparHtml(nomeProduto(slug)))
    .join(', ') || 'Não informado';

  await resend.emails.send({
    from: 'Garimpo Urbano <contato@mentoriagarimpourbano.com.br>',
    to: destinatario,
    subject: `Nova contribuição da Jornada — ${contribuicao.nomeInformado}`,
    html: `
      <h2>Nova contribuição recebida</h2>
      <p><strong>Nome:</strong> ${nome}</p>
      <p><strong>E-mail:</strong> ${email}</p>
      <p><strong>Caminho:</strong> ${caminho}</p>
      <p><strong>Produto(s) declarado(s):</strong> ${produtosHtml}</p>
      <p><strong>Status inicial:</strong> ${contribuicao.statusVinculo}</p>
      <p>Acesse o painel para analisar a contribuição completa.</p>
    `,
  });
}

async function sincronizarBrevo({ email, nome, produtos, caminho }) {
  const brevoAtivo = JORNADA_FLAGS.brevo;

  if (!notificacoesExternasAtivas() || !brevoAtivo) return;

  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey || !email) {
    return;
  }

  const respostaBrevo = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      email,
      updateEnabled: true,
      attributes: {
        NOME: nome,
        ORIGEM_LEAD: 'Jornada do Aluno',
        JORNADA_CAMINHO: caminho,
        JORNADA_PRODUTOS: produtos.join(', ' ),
      },
    }),
  });

  if (!respostaBrevo.ok) {
    const detalhe = await respostaBrevo.text();
    throw new Error(`Brevo respondeu ${respostaBrevo.status}: ${detalhe}`);
  }
}

export async function POST(request) {
  try {
    let body;

    try {
      body = await request.json();
    } catch {
      return resposta({ error: 'JSON inválido.' }, 400);
    }

    const nome = texto(body.nome, 160);
    const email = emailNormalizado(body.email);
    const whatsapp = telefoneNormalizado(body.whatsapp);
    const caminho = texto(body.caminho, 80);
    const idempotencyKey = texto(body.idempotencyKey, 120) || null;
    const produtos = listaDeStrings(body.produtosDeclarados);
    const utms = body.utms && typeof body.utms === 'object'
      ? body.utms
      : {};
    const respostas = objetoRespostas(body.respostas);
    const resumo = resumoObrigatorio(respostas);
    const honeypot = texto(body.telefone_secundario, 80);

    if (honeypot) {
      return resposta({ success: true }, 200);
    }

    if (!nome || !email || !whatsapp || !caminho) {
      return resposta({
        error: 'Nome, e-mail, WhatsApp e caminho são obrigatórios.',
      }, 400);
    }

    if (!emailFormatoValido(email)) {
      return resposta({ error: 'E-mail inválido.' }, 400);
    }

    if (!CAMINHOS_VALIDOS.has(caminho)) {
      return resposta({ error: 'Caminho de contribuição inválido.' }, 400);
    }

    if (produtos.length === 0) {
      return resposta({ error: 'Selecione pelo menos um produto.' }, 400);
    }

    const produtosInvalidos = produtos.filter(
      (slug) => !PRODUTO_SLUGS.has(slug),
    );

    if (produtosInvalidos.length > 0) {
      return resposta({ error: 'Produto inválido.' }, 400);
    }

    if (!resumo) {
      return resposta({
        error: 'A resposta principal é obrigatória.',
      }, 400);
    }

    if (idempotencyKey) {
      const existente = await prisma.jornadaContribuicao.findUnique({
        where: { idempotencyKey },
        select: { id: true, leadId: true },
      });

      if (existente) {
        return resposta({
          success: true,
          duplicate: true,
          contributionId: existente.id,
          leadId: existente.leadId,
        }, 200);
      }
    }

    const lead = await prisma.lead.upsert({
      where: { email },
      update: {
        nome,
        whatsapp,
      },
      create: {
        nome,
        email,
        whatsapp,
        utmSource: texto(utms.utm_source, 160) || null,
        utmMedium: texto(utms.utm_medium, 160) || null,
        utmCampaign: texto(utms.utm_campaign, 160) || null,
        utmContent: texto(utms.utm_content, 160) || null,
        utmTerm: texto(utms.utm_term, 160) || null,
      },
    });

    const contribuicao = await prisma.jornadaContribuicao.create({
      data: {
        leadId: lead.id,
        idempotencyKey,
        formVersion: texto(body.formVersion, 20) || '1.0',
        caminho,
        respostas: {
          ...respostas,
          resumo,
        },
        produtosDeclarados: produtos,
        nomeInformado: nome,
        emailInformado: email,
        whatsappInformado: whatsapp,
        cidadeEstado: texto(body.cidadeEstado, 160) || null,
        tempoMentoria: texto(body.tempoMentoria, 80) || null,
        dataCompraAproximada: texto(body.dataCompraAproximada, 80) || null,
        interesseEntrevista: texto(body.interesseEntrevista, 80) || null,
        consentimentoEntrevista: body.consentimentoEntrevista === true,
        consentimentoConteudo: body.consentimentoConteudo === true,
        melhorCanal: texto(body.melhorCanal, 40) || null,
        contatoPreferencial: texto(body.contatoPreferencial, 160) || null,
        utmSource: texto(utms.utm_source, 160) || null,
        utmMedium: texto(utms.utm_medium, 160) || null,
        utmCampaign: texto(utms.utm_campaign, 160) || null,
        utmContent: texto(utms.utm_content, 160) || null,
        utmTerm: texto(utms.utm_term, 160) || null,
      },
    });

    const integracoes = await Promise.allSettled([
      enviarAlertaInterno({ contribuicao, produtos }),
      sincronizarBrevo({ email, nome, produtos, caminho }),
    ]);

    integracoes
      .filter((resultado) => resultado.status === 'rejected')
      .forEach((resultado) => {
        console.error(
          '[JORNADA] Integração não bloqueante falhou:',
          resultado.reason?.message || resultado.reason,
        );
      });

    return resposta({
      success: true,
      leadId: lead.id,
      contributionId: contribuicao.id,
    }, 201);
  } catch (error) {
    console.error(
      '[JORNADA] Erro ao salvar contribuição:',
      error?.message || error,
    );

    return resposta({
      error: 'Não foi possível salvar sua contribuição.',
    }, 500);
  }
}