// src/app/api/contato/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json();
    const { origem, email, nome, assunto, mensagem } = data;

    // Validação básica
    if (!email) {
      return NextResponse.json({ sucesso: false, erro: "E-mail é obrigatório." }, { status: 400 });
    }

    // 1. Lógica de Roteamento de Listas (Qual lista o lead vai entrar?)
    // Pega os IDs do arquivo .env.local (ou usa um padrão se não achar)
    const listIdEbook = parseInt(process.env.BREVO_LIST_ID_EBOOK || '9');
    const listIdGeral = parseInt(process.env.BREVO_LIST_ID_FORMS_HP || '9');
    const listIdVip = parseInt(process.env.BREVO_LIST_ID_VIP_LANCAMENTO || '9');

    let listasParaAdicionar = [listIdGeral]; // Padrão

    // Se a origem for a Isca Digital, joga na lista específica do E-book
    if (origem === 'Isca Digital - Ebook') {
      listasParaAdicionar = [listIdEbook];
    }
    // Se vier da página Em Breve, joga na lista VIP
    else if (origem === 'Lista de Espera - Em Breve') {
      listasParaAdicionar = [listIdVip];
    }

    // 2. Montando o corpo da requisição para o Brevo
    const brevoPayload = {
      email: email,
      listIds: listasParaAdicionar,
      updateEnabled: true, // ESSENCIAL: Atualiza o lead se ele já existir!
      attributes: {
        // O Brevo exige que os atributos padrão sejam em MAIÚSCULO
        NOME: nome || "",
        ORIGEM_LEAD: origem || "Site Garimpo Urbano",
      }
    };

    // Se for uma mensagem do Footer, podemos salvar a mensagem em um atributo customizado no Brevo
    if (mensagem) {
      brevoPayload.attributes.ULTIMA_MENSAGEM = mensagem;
      brevoPayload.attributes.ASSUNTO = assunto || "";
    }

    // 3. Disparando para a API do Brevo
    const brevoResponse = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify(brevoPayload )
    });

    const brevoData = await brevoResponse.json();

    // Verifica se o Brevo retornou algum erro (ex: e-mail inválido)
    if (!brevoResponse.ok) {
      console.error("Erro no Brevo:", brevoData);
      return NextResponse.json(
        { sucesso: false, erro: "Falha ao cadastrar no sistema de e-mails." },
        { status: 400 }
      );
    }

    console.log(`[LEAD CAPTURADO] ${email} adicionado à lista ${listasParaAdicionar}`);

    // Retorna sucesso para o seu site (que vai mostrar a mensagem verde pro usuário)
    return NextResponse.json(
      { sucesso: true, mensagem: "Lead cadastrado com sucesso!" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Erro interno da API:", error);
    return NextResponse.json(
      { sucesso: false, erro: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
