// src/app/api/webhooks/hotmart/route.js
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { timingSafeEqual } from "crypto";
import { moverCompradorParaPosVenda } from '@/lib/brevo';
import { Resend } from "resend";
import { provisionarAlunoHotmart } from '@/lib/provisionar-aluno';

export const runtime = "nodejs";



function resposta(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

function tokenValido(tokenRecebido, tokenEsperado) {
  if (!tokenRecebido || !tokenEsperado) return false;

  const recebido = Buffer.from(tokenRecebido);
  const esperado = Buffer.from(tokenEsperado);

  if (recebido.length !== esperado.length) return false;
  return timingSafeEqual(recebido, esperado);
}

function dataHotmart(timestamp) {
  if (!timestamp) return null;

  const data = new Date(Number(timestamp));
  return Number.isNaN(data.getTime()) ? null : data;
}

function emailNormalizado(email) {
  const valor = email?.trim().toLowerCase();
  return valor || null;
}

function produtoPermitido(produtoId) {
  const configurados = (process.env.HOTMART_ALLOWED_PRODUCT_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  // Lista vazia: aceita todos os produtos recebidos pela conta Hotmart.
  if (configurados.length === 0) return true;

  return configurados.includes(String(produtoId));
}

function escaparHtml(valor = "") {
  const caracteres = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  return String(valor).replace(/[&<>"']/g, (caractere) => caracteres[caractere]);
}

function nomeDoComprador(comprador) {
  const nome = String(comprador?.name || '').trim();
  if (nome) return nome;

  return [comprador?.first_name, comprador?.last_name]
    .filter((parte) => typeof parte === 'string' && parte.trim())
    .join(' ')
    .trim() || 'Aluno';
}

function whatsappDoComprador(comprador) {
  const telefone = comprador?.phone || comprador?.phone_number || comprador?.checkout_phone;
  return typeof telefone === 'string' && telefone.trim() ? telefone.trim() : null;
}

async function enviarConvitePrimeiroAcesso({ email, nome, token }) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn('[RESEND] RESEND_API_KEY ausente; convite não enviado.');
    return;
  }

  const baseUrl = (
    process.env.NEXT_PUBLIC_ALUNO_URL
    || process.env.NEXT_PUBLIC_BASE_URL
    || 'http://localhost:3000'
   ).replace(/\/$/, '');
  const link = `${baseUrl}/aluno/primeiro-acesso?token=${encodeURIComponent(token)}`;
  const nomeSeguro = escaparHtml(nome || 'Aluno');

  try {
    await new Resend(apiKey).emails.send({
      from: 'Prof. Goulart <contato@mentoriagarimpourbano.com.br>',
      to: email,
      subject: 'Seu acesso à Área do Aluno — Garimpo Urbano',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:32px;border-radius:16px">
          <p style="color:#d89900;font-weight:bold;letter-spacing:2px">GARIMPO URBANO</p>
          <h1>Olá, ${nomeSeguro}.</h1>
          <p>Sua compra foi confirmada. Agora você pode criar a senha do seu acesso à Área do Aluno.</p>
          <p><a href="${link}" style="display:inline-block;background:#d89900;color:#000;padding:14px 20px;border-radius:8px;text-decoration:none;font-weight:bold">CRIAR MEU ACESSO</a></p>
          <p style="color:#a3a3a3;font-size:13px">Este link expira em 72 horas e pode ser usado uma única vez. As aulas continuam disponíveis no ambiente da Hotmart.</p>
        </div>
      `,
    });

    console.info('Convite de primeiro acesso enviado', { email });
  } catch (error) {
    console.error('Erro ao enviar convite de primeiro acesso:', error?.message);
  }
}

export async function POST(req) {
  const hottokEsperado = process.env.HOTMART_HOTTOK;
  const hottokRecebido = req.headers.get("x-hotmart-hottok");

  if (!hottokEsperado) {
    console.error("Webhook Hotmart não configurado: HOTMART_HOTTOK ausente.");
    return resposta({ error: "Webhook não configurado" }, 503);
  }

  if (!tokenValido(hottokRecebido, hottokEsperado)) {
    return resposta({ error: "Não autorizado" }, 401);
  }

  let payload;

  try {
    payload = await req.json();
  } catch {
    return resposta({ error: "JSON inválido" }, 400);
  }

  // Diagnóstico seguro: não registra e-mail, documento, endereço ou token.
  console.info("Webhook Hotmart recebido", {
    versaoRota: "2026-08-11-v3",
    possuiIdEvento: Boolean(payload?.id),
    evento: payload?.event || null,
    possuiTransacao: Boolean(payload?.data?.purchase?.transaction),
    produtoId: payload?.data?.product?.id ?? null,
  });

  const hotmartEventId = String(payload?.id || "").trim();
  const evento = String(payload?.event || "").trim();
  const dados = payload?.data || {};
  const produto = dados.product || {};
  const compra = dados.purchase || {};
  const comprador = dados.buyer || {};

  const transacaoCodigo = String(compra.transaction || "").trim();

  // O teste oficial da Hotmart pode enviar product.id como 0.
  // Portanto, não use || aqui, pois 0 é um valor válido para fins de teste.
  const produtoId = produto.id === null || produto.id === undefined
    ? ""
    : String(produto.id).trim();

  const produtoNome = String(produto.name || "Produto não identificado").trim();
  const status = String(compra.status || evento || "STATUS_NAO_INFORMADO").trim();

  // Somente o ID único e o tipo de evento são indispensáveis para auditar a chamada.
  if (!hotmartEventId || !evento) {
    console.warn("Webhook Hotmart sem identificador ou evento", {
      versaoRota: "2026-08-11-v3",
      possuiIdEvento: Boolean(hotmartEventId),
      possuiEvento: Boolean(evento),
    });

    return resposta({ error: "Evento sem identificador ou tipo" }, 400);
  }

  const duplicado = await prisma.hotmartWebhookEvent.findUnique({
    where: { hotmartEventId },
    select: { id: true },
  });

  if (duplicado) {
    return resposta({ received: true, duplicate: true }, 200);
  }

  // Alguns eventos não carregam uma transação completa. Eles são auditados e
  // respondidos com 200 para evitar retentativas infinitas, mas não viram venda.
  if (!transacaoCodigo || !produtoId) {
    await prisma.hotmartWebhookEvent.create({
      data: {
        hotmartEventId,
        evento,
        versao: payload?.version ? String(payload.version) : null,
        transacaoCodigo: transacaoCodigo || null,
        produtoId: produtoId || null,
        criadoNaHotmartEm: dataHotmart(payload?.creation_date),
        processadoEm: new Date(),
      },
    });

    console.warn("Evento Hotmart recebido sem dados completos de transação", {
      versaoRota: "2026-08-11-v3",
      evento,
      possuiTransacao: Boolean(transacaoCodigo),
      possuiProduto: Boolean(produtoId),
    });

    return resposta({ received: true, ignored: true, reason: "Dados de transação ausentes" }, 200);
  }

  if (!produtoPermitido(produtoId)) {
    return resposta({ received: true, ignored: true }, 200);
  }

  const emailComprador = emailNormalizado(comprador.email);
  const valorRecebido = compra?.full_price?.value ?? compra?.price?.value ?? 0;
  const valorBruto = new Prisma.Decimal(String(valorRecebido));
  const nomeDoAluno = nomeDoComprador(comprador);
  const whatsappDoAluno = whatsappDoComprador(comprador);
  let conviteParaEnviar = null;


  try {
    await prisma.$transaction(async (tx) => {
      const lead = emailComprador
        ? await tx.lead.findUnique({
            where: { email: emailComprador },
            select: { id: true },
          })
        : null;

      await tx.hotmartWebhookEvent.create({
        data: {
          hotmartEventId,
          evento,
          versao: payload?.version ? String(payload.version) : null,
          transacaoCodigo,
          produtoId,
          criadoNaHotmartEm: dataHotmart(payload?.creation_date),
          processadoEm: new Date(),
        },
      });

      const transacao = await tx.hotmartTransaction.upsert({
        where: { transacaoCodigo },
        create: {
          transacaoCodigo,
          leadId: lead?.id || null,
          emailComprador,
          produtoId,
          produtoUcode: produto.ucode ? String(produto.ucode) : null,
          produtoNome,
          status,
          valorBruto,
          moeda: String(compra?.full_price?.currency_value || compra?.price?.currency_value || "BRL"),
          formaPagamento: compra?.payment?.type ? String(compra.payment.type) : null,
          parcelas: Number.isInteger(compra?.payment?.installments_number)
            ? compra.payment.installments_number
            : null,
          origemSrc: compra?.origin?.src ? String(compra.origin.src) : null,
          origemSck: compra?.origin?.sck ? String(compra.origin.sck) : null,
          origemXcod: compra?.origin?.xcod ? String(compra.origin.xcod) : null,
          aprovadoEm: dataHotmart(compra?.approved_date),
        },
        update: {
          leadId: lead?.id || null,
          emailComprador,
          produtoId,
          produtoUcode: produto.ucode ? String(produto.ucode) : null,
          produtoNome,
          status,
          valorBruto,
          moeda: String(compra?.full_price?.currency_value || compra?.price?.currency_value || "BRL"),
          formaPagamento: compra?.payment?.type ? String(compra.payment.type) : null,
          parcelas: Number.isInteger(compra?.payment?.installments_number)
            ? compra.payment.installments_number
            : null,
          origemSrc: compra?.origin?.src ? String(compra.origin.src) : null,
          origemSck: compra?.origin?.sck ? String(compra.origin.sck) : null,
          origemXcod: compra?.origin?.xcod ? String(compra.origin.xcod) : null,
          aprovadoEm: dataHotmart(compra?.approved_date),
        },
      });

      const compraConfirmada = [
        "PURCHASE_APPROVED",
        "PURCHASE_COMPLETE",
      ].includes(evento);

      if (lead && compraConfirmada) {
        await tx.lead.update({
          where: { id: lead.id },
          data: {
            comprouMentoria: true,
            comprouMentoriaEm: dataHotmart(compra?.approved_date) || new Date(),
          },
        });
      }

      if (compraConfirmada && emailComprador) {
        const provisionamento = await provisionarAlunoHotmart(tx, {
          leadId: lead?.id || null,
          email: emailComprador,
          nome: nomeDoAluno,
          whatsapp: whatsappDoAluno,
          produtoId,
          produtoUcode: produto.ucode ? String(produto.ucode) : null,
          produtoNome,
        });

        if (provisionamento) {
          await tx.hotmartTransaction.update({
            where: { id: transacao.id },
            data: {
              alunoId: provisionamento.alunoId,
              matriculaId: provisionamento.matriculaId,
            },
          });

          if (provisionamento.conviteNovo && provisionamento.conviteToken) {
            conviteParaEnviar = {
              email: emailComprador,
              nome: nomeDoAluno,
              token: provisionamento.conviteToken,
            };
          }
        }
      }

      if (
        compraConfirmada
        && emailComprador
        && process.env.HOTMART_SYNC_BREVO !== 'false'
      ) {
        await moverCompradorParaPosVenda(emailComprador);

        console.info('Comprador sincronizado no Brevo', {
          evento,
          transacaoCodigo,
        });
      }

    });

    if (conviteParaEnviar) {
      await enviarConvitePrimeiroAcesso(conviteParaEnviar);
    }

    return resposta({ received: true }, 200);
  } catch (error) {
    // O erro não inclui payload, e-mail, documento ou qualquer segredo no log.
    if (error?.code === "P2002") {
      return resposta({ received: true, duplicate: true }, 200);
    }

    console.error("Erro ao processar Webhook Hotmart:", error?.message);
    return resposta({ error: "Falha ao processar evento" }, 500);
  }
}