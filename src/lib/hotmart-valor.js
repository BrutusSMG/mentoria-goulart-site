// O campo de preço pode estar ausente em eventos posteriores da Hotmart.
// Ausência não equivale a preço zero; zero explícito é um valor legítimo.
export function extrairValorBrutoHotmart(compra) {
  const bruto = compra?.full_price?.value ?? compra?.price?.value;
  if (bruto === null || bruto === undefined || bruto === '') return null;

  if (typeof bruto !== 'string' && typeof bruto !== 'number') return null;
  const texto = String(bruto).trim();
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(texto)) return null;
  const numero = Number(texto);
  if (!Number.isFinite(numero)) return null;
  return texto;
}
