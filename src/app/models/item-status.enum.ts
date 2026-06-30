export enum ItemStatus {
  SEALED = 'SEALED',
  MINT = 'MINT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
}

export const ItemStatusLabels: Record<ItemStatus, string> = {
  [ItemStatus.SEALED]: 'Precintado',
  [ItemStatus.MINT]: 'Como nuevo',
  [ItemStatus.GOOD]: 'Buen estado',
  [ItemStatus.FAIR]: 'Desgastado',
};
