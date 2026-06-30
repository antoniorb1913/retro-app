import { ItemBase, ItemBaseWrite } from './item-base.interface';

export interface Console extends ItemBase {
  edition: string;
}

export interface ConsoleWrite extends ItemBaseWrite {
  edition?: string;
}
