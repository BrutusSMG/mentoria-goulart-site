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
      from: 'Prof. José Goulart <contato@mentoriagarimpourbano.com.br>',
      to: email,
      subject: 'Seu E-book Chegou: O Mapa do Tesouro 🗺️',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #16a34a;">Olá, ${nome}!</h2>
          <p>Que bom ter você com a gente. Como prometido, aqui está o seu acesso ao e-book <strong>"O Mapa do Tesouro"</strong>.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${linkExclusivo}" style="background-color: #eab308; color: #000; padding: 15px 25px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">
              BAIXAR MEU E-BOOK AGORA
            </a>
          </div>
          
          <p>Neste material, você vai descobrir como transformar lixo eletrônico em uma fonte lucrativa de Ouro, Prata e Platina.</p>
          <p>Boa leitura e bons estudos!</p>
            

          <p>Um abraço, <strong>Prof. José Goulart</strong></p>
        </div>
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
