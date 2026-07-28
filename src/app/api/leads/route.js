// src/app/api/leads/route.js
import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Importando a conexão com o banco

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { nome, email, whatsapp } = body;

    if (!nome || !email || !whatsapp) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    // 1. Salva ou Atualiza o Lead no Banco de Dados
    // Usamos upsert para não dar erro se o mesmo e-mail tentar baixar de novo
    const lead = await prisma.lead.upsert({
      where: { email: email },
      update: { 
        nome: nome, 
        whatsapp: whatsapp,
        // Se ele se cadastrou de novo, resetamos o status para false
        baixouEbook: false 
      },
      create: { 
        nome, 
        email, 
        whatsapp,
        baixouEbook: false
      }
    });

    // 2. Cria o link exclusivo com o ID do lead
    // Em produção, isso será o seu domínio oficial
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
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

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (error) {
    console.error('Erro ao processar lead:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
