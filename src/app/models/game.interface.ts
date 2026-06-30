import { ItemBase, ItemBaseWrite } from './item-base.interface';

export interface Game extends ItemBase {
  edition: string;
}

export interface GameWrite extends ItemBaseWrite {
  edition?: string;
}
