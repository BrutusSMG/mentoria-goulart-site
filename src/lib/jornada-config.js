// src/lib/jornada-config.js
function flagAtiva(nome) {
  return String(process.env[nome] || '').trim().toLowerCase() === 'true';
}

export const JORNADA_FLAGS = Object.freeze({
  externalNotifications: flagAtiva('JORNADA_EXTERNAL_NOTIFICATIONS'),
  brevo: flagAtiva('JORNADA_BREVO_ENABLED'),
  trello: flagAtiva('JORNADA_TRELLO_ENABLED'),
});