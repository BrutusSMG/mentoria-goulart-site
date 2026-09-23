import crypto from 'node:crypto';
import { Resend } from 'resend';

export const TIPO_PRIMEIRO_ACESSO = 'PRIMEIRO_ACESSO';
export const VALIDADE_CONVITE_PRIMEIRO_ACESSO_MS =
  72 * 60 * 60 * 1000;

export function hashTokenAcesso(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function gerarTokenPrimeiroAcesso() {
  return crypto.randomBytes(32).toString('hex');
}

export function calcularExpiracaoConvitePrimeiroAcesso(
  agora = new Date(),
) {
  return new Date(
    agora.getTime() + VALIDADE_CONVITE_PRIMEIRO_ACESSO_MS,
  );
}

function escaparHtml(valor = '') {
  const caracteres = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return String(valor).replace(
    /[&<>"']/g,
    (caractere) => caracteres[caractere],
  );
}

export async function enviarConvitePrimeiroAcesso({
  email,
  nome,
  token,
  detalharResultado = false,
}) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn(
      '[RESEND] RESEND_API_KEY ausente; convite não enviado.',
    );

    return detalharResultado
      ? { ok: false, resultado: 'FALHA' }
      : { ok: false };
  }

  const baseAlunoConfigurado =
    process.env.NEXT_PUBLIC_ALUNO_URL?.replace(/\/$/, '');

  const baseFallback = (
    process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  ).replace(/\/$/, '');

  const link = baseAlunoConfigurado
    ? `${baseAlunoConfigurado}/primeiro-acesso?token=${encodeURIComponent(token)}`
    : `${baseFallback}/aluno/primeiro-acesso?token=${encodeURIComponent(token)}`;

  const saudacao = nome
    ? `Olá, ${escaparHtml(nome)}.`
    : 'Olá.';

  try {
    const respostaProvedor = await new Resend(apiKey).emails.send({
      from: 'Prof. Goulart <contato@mentoriagarimpourbano.com.br>',
      to: email,
      subject: 'Seu acesso ao Portal Garimpo Urbano',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:32px;border-radius:16px">
          <p style="color:#d89900;font-weight:bold;letter-spacing:2px">GARIMPO URBANO</p>
          <h1>${saudacao}</h1>
          <p>Seu acesso foi liberado. Agora você pode criar a senha do Portal Garimpo Urbano.</p>
          <p><a href="${link}" style="display:inline-block;background:#d89900;color:#000;padding:14px 20px;border-radius:8px;text-decoration:none;font-weight:bold">CRIAR MEU ACESSO</a></p>
          <p style="color:#a3a3a3;font-size:13px">Este link expira em 72 horas e pode ser usado uma única vez. Depois de criar sua senha, você verá os recursos liberados para sua conta.</p>
        </div>
      `,
    });

    if (respostaProvedor?.error) {
      console.error(
        'Erro ao enviar convite de primeiro acesso:',
        respostaProvedor.error,
      );

      // A rota de convite legado deverá exigir conferência
      // antes de permitir qualquer nova tentativa.
      return detalharResultado
        ? { ok: false, resultado: 'INDETERMINADO' }
        : { ok: false };
    }

    if (detalharResultado) {
      const mensagemProvedorId = respostaProvedor?.data?.id;

      if (
        typeof mensagemProvedorId !== 'string' ||
        !mensagemProvedorId.trim()
      ) {
        console.error(
          'O provedor não retornou confirmação identificável do convite.',
        );

        return {
          ok: false,
          resultado: 'INDETERMINADO',
        };
      }

      console.info(
        'Convite de primeiro acesso aceito pelo provedor.',
      );

      return {
        ok: true,
        resultado: 'ENVIADO',
        mensagemProvedorId: mensagemProvedorId.trim(),
      };
    }

    // Preserva o formato de resposta dos fluxos existentes.
    console.info('Convite de primeiro acesso enviado', { email });
    return { ok: true };
  } catch (error) {
    console.error(
      'Erro ao enviar convite de primeiro acesso:',
      error?.message,
    );

    return detalharResultado
      ? { ok: false, resultado: 'INDETERMINADO' }
      : { ok: false };
  }
}
