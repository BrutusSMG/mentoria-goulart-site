// src/app/api/leads/route.js

export const dynamic = 'force-dynamic';

import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Importando a conexão com o banco

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { nome, email, whatsapp, utms={}, telefone_secundario, origem } = body;

    // --- PROTEÇÃO CONTRA BOTS (HONEYPOT) ---
    // Mesmo padrão da /api/contato: se o campo invisível veio preenchido, é robô.
    // Respondemos sucesso para enganá-lo, mas não fazemos nada.
    if (telefone_secundario) {
      console.log('[BOT BLOQUEADO] Tentativa de spam em /api/leads.');
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // --- VALIDAÇÃO ---
    // Nome e e-mail são obrigatórios; WhatsApp agora é opcional
    // (o formulário da home só pede nome e e-mail).
    if (!nome || !email) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.endsWith('.con') || email.endsWith('.com.brr')) {
      return NextResponse.json({ error: 'E-mail inválido' }, { status: 400 });
    }

    // 1. Salva ou Atualiza o Lead no Banco de Dados
    const lead = await prisma.lead.upsert({
      where: { email: email },
      update: { 
        nome: nome, 
        // Só sobrescreve o WhatsApp se um novo valor foi informado
        ...(whatsapp ? { whatsapp } : {}),
        // Se ele se cadastrou de novo, resetamos o status para false
        baixouEbook: false,
        utmSource: utms.utm_source || null,
        utmMedium: utms.utm_medium || null,
        utmCampaign: utms.utm_campaign || null,
        utmTerm: utms.utm_term || null,
        utmContent: utms.utm_content || null
      },
      create: { 
        nome, 
        email, 
        whatsapp: whatsapp || '',   // campo é obrigatório no schema; vazio quando não informado
        baixouEbook: false,
        utmSource: utms.utm_source || null,
        utmMedium: utms.utm_medium || null,
        utmCampaign: utms.utm_campaign || null,
        utmTerm: utms.utm_term || null,
        utmContent: utms.utm_content || null
      }
    });

    // 2. Cria o link exclusivo com o ID do lead
    // Em produção, isso será o seu domínio oficial
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mentoriagarimpourbano.com.br';
    const linkExclusivo = `${baseUrl}/download?leadId=${lead.id}`;

    // 3. Dispara o e-mail com o link exclusivo
    const data = await resend.emails.send({
      from: 'Prof. Goulart <contato@mentoriagarimpourbano.com.br>',
      to: email,
      subject: 'Seu E-book Chegou: O Maior Garimpo do Século XXI 🗺️',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0; padding:0; background-color:#0a0a0a; font-family:Arial, Helvetica, sans-serif;">
          <!-- Preheader oculto -->
          <div style="display:none; max-height:0; overflow:hidden; color:#0a0a0a;">
            ${nome}, seu e-book está pronto para download. Clique para acessar agora.
          </div>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a; padding:40px 20px;">
            <tr>
              <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">
                  
                  <!-- Logo -->
                  <tr>
                    <td align="center" style="padding-bottom:30px;">
                      <img src="https://mentoriagarimpourbano.com.br/logo_fundoTransparentered.png" alt="Garimpo Urbano" width="150" style="display:block;">
                    </td>
                  </tr>

                  <!-- Card principal -->
                  <tr>
                    <td style="background-color:#171717; border-radius:16px; border:1px solid #2a2a2a; padding:40px 35px;">
                      
                      <!-- Saudação -->
                      <h2 style="color:#ffffff; font-size:24px; margin:0 0 20px 0;">
                        Olá, ${nome}! 👋
                      </h2>
                      
                      <p style="color:#d4d4d4; font-size:16px; line-height:1.6; margin:0 0 15px 0;">
                        Que bom ter você com a gente. Como prometido, aqui está o seu acesso exclusivo ao e-book <strong style="color:#ffffff;">"O Maior Garimpo do Século XXI"</strong>.
                      </p>

                      <p style="color:#d4d4d4; font-size:16px; line-height:1.6; margin:0 0 30px 0;">
                        Neste material, você vai descobrir como equipamentos eletrônicos descartados todos os dias escondem <strong style="color:#d89900;">ouro, prata, paládio e platina</strong> — e como transformar isso em oportunidade real.
                      </p>

                      <!-- Botão CTA -->
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding:10px 0 30px 0;">
                            <a href="${linkExclusivo}" target="_blank" style="background-color:#d89900; color:#000000; padding:16px 32px; text-decoration:none; font-weight:bold; font-size:16px; border-radius:8px; display:inline-block; box-shadow:0 0 20px rgba(216,153,0,0.3 );">
                              📥 BAIXAR MEU E-BOOK AGORA
                            </a>
                          </td>
                        </tr>
                      </table>

                      <!-- Separador -->
                      <hr style="border:none; border-top:1px solid #2a2a2a; margin:20px 0;">

                      <!-- Próximos passos -->
                      <p style="color:#a3a3a3; font-size:14px; line-height:1.6; margin:0 0 10px 0;">
                        <strong style="color:#d89900;">⚡ Próximos passos:</strong> Nos próximos dias, vou te enviar um <strong style="color:#ffffff;">Capítulo Extra exclusivo</strong> direto no seu e-mail com informações que não estão no e-book. Fique de olho!
                      </p>

                      <p style="color:#d4d4d4; font-size:16px; line-height:1.6; margin:20px 0 0 0;">
                        Boa leitura e bons estudos!
                      </p>

                      <p style="color:#d4d4d4; font-size:16px; margin:15px 0 0 0;">
                        Um abraço,  

                        <strong style="color:#ffffff;">Prof. José Goulart</strong>
                      </p>

                    </td>
                  </tr>

                  <!-- Rodapé -->
                  <tr>
                    <td align="center" style="padding-top:30px;">
                      <p style="color:#525252; font-size:12px; margin:0;">
                        © ${new Date().getFullYear()} Mentoria Garimpo Urbano. Todos os direitos reservados.
                      </p>
                      <p style="color:#525252; font-size:12px; margin:5px 0 0 0;">
                        Você recebeu este e-mail porque se cadastrou para receber o e-book gratuito.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `

    } );

    // 4. Registra o contato na lista do Brevo (e-mail marketing)
    // Não bloqueante: se o Brevo falhar, o lead JÁ recebeu o e-book pelo Resend,
    // então apenas registramos o erro em log — o usuário não é penalizado.
    try {
      const listIdEbook = parseInt(process.env.BREVO_LIST_ID_EBOOK || '6');
      const brevoResponse = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
        },
        body: JSON.stringify({
          email: email,
          listIds: [listIdEbook],
          updateEnabled: true,
          attributes: {
            NOME: nome || '',
            ORIGEM_LEAD: origem || 'Isca Digital - Ebook',
            UTM_SOURCE: utms.utm_source || '',
            UTM_MEDIUM: utms.utm_medium || '',
            UTM_CAMPAIGN: utms.utm_campaign || '',
          },
        } ),
      });
      if (!brevoResponse.ok) {
        const brevoData = await brevoResponse.json();
        console.error('[BREVO] Falha ao registrar lead (não bloqueante):', brevoData);
      }
    } catch (brevoError) {
      console.error('[BREVO] Erro na chamada (não bloqueante):', brevoError);
    }

    return NextResponse.json({ success: true, leadId: lead.id });

  } catch (error) {
    console.error('Erro ao processar lead:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
