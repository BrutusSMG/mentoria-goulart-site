// src/utils/tracking.js
// Helper central de rastreamento. Toda chamada ao Meta Pixel passa por aqui,
// o que facilita adicionar GA4 ou Conversions API no futuro em um único lugar.

export const trackEvent = (eventName, params = {}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, params);
  }
};

// Eventos semânticos do funil Garimpo Urbano
export const trackLead = (origem) =>
  trackEvent('Lead', { content_name: origem });

export const trackContact = () =>
  trackEvent('Contact', { content_name: 'WhatsApp' });

export const trackViewContent = (
  nome,
  valor,
  moeda = 'BRL',
) =>
  trackEvent('ViewContent', {
    content_name: nome,
    content_category: 'pagina_vendas',
    value: valor,
    currency: moeda,
  });

export const trackInitiateCheckout = (
  oferta,
  valor,
  moeda = 'BRL',
) =>
  trackEvent('InitiateCheckout', {
    content_name: oferta,
    value: valor,
    currency: moeda,
  });

export const trackCompleteRegistration = () =>
  trackEvent('CompleteRegistration', { content_name: 'download_ebook' });