export enum Protective {
  NONE = 'Sin funda',
  PLASTIC_BAG = 'Bolsa plástica',
  PET_COVER = 'Funda PET',
}

export const ProtectiveLabels: Record<Protective, string> = {
  [Protective.NONE]: 'Sin funda',
  [Protective.PLASTIC_BAG]: 'Bolsa plástica',
  [Protective.PET_COVER]: 'Funda PET',
};
