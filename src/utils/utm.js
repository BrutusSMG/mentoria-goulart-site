// src/utils/utm.js
const UTM_KEY = 'gu_utm_params';
const UTM_FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

// Chame no carregamento do site: salva as UTMs da URL na sessão (se existirem)
export const captureUtms = () => {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  const found = {};
  UTM_FIELDS.forEach((f) => {
    const v = params.get(f);
    if (v) found[f] = v;
  });
  // Só sobrescreve se a URL atual trouxer UTMs (preserva a origem do 1º acesso)
  if (Object.keys(found).length > 0) {
    try { sessionStorage.setItem(UTM_KEY, JSON.stringify(found)); } catch (e) {}
  }
};

// Chame na hora de enviar um formulário: devolve as UTMs salvas
export const getUtms = () => {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(sessionStorage.getItem(UTM_KEY)) || {}; } catch (e) { return {}; }
};
