export enum Store {
  WALLAPOP = 'Wallapop',
  VINTED = 'Vinted',
  EBAY = 'Ebay',
  MILANUNCIOS = 'Milanuncios',
  CASH_CONVERTERS = 'Cash Converters',
  GAME = 'Game',
  CEX = 'Cex',
  AMAZON = 'Amazon',
  FNAC = 'Fnac',
  CARREFOUR = 'Carrefour',
  MEDIA_MARKT = 'Media Markt',
  EL_CORTE_INGLES = 'El Corte Inglés',
  PCCOMPONENTES = 'PcComponentes',
}

/**
 * Etiquetas para mostrar cada tienda.
 *
 * La clave `'-'` no es una tienda real: es el valor por defecto que usa el backend en el campo
 * `store` y que no forma parte de su lista de opciones. Se mapea a un guion para que un artículo
 * sin tienda registrada se muestre como "—" en lugar de un guion suelto o un hueco en blanco.
 */
export const StoreLabels: Record<string, string> = {
  [Store.WALLAPOP]: 'Wallapop',
  [Store.VINTED]: 'Vinted',
  [Store.EBAY]: 'Ebay',
  [Store.MILANUNCIOS]: 'Milanuncios',
  [Store.CASH_CONVERTERS]: 'Cash Converters',
  [Store.GAME]: 'Game',
  [Store.CEX]: 'Cex',
  [Store.AMAZON]: 'Amazon',
  [Store.FNAC]: 'Fnac',
  [Store.CARREFOUR]: 'Carrefour',
  [Store.MEDIA_MARKT]: 'Media Markt',
  [Store.EL_CORTE_INGLES]: 'El Corte Inglés',
  [Store.PCCOMPONENTES]: 'PcComponentes',
  '-': '—',
};
