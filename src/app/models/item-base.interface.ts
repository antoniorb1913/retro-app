import { ItemStatus } from './item-status.enum';
import { Platform } from './platform.enum';
import { MissingComponent } from './missing-component.interface';
import { ItemImage } from './item-image.interface';

export interface ItemBase {
  id: number;
  name: string;
  model: string | null;
  acquisition_date: string | null;
  price: string | null;
  status: ItemStatus;
  status_display: string;
  description: string | null;
  region: string;
  platform: Platform | null;
  platform_display: string | null;
  complete: boolean;
  missing_components: MissingComponent[];
  images: ItemImage[];
  created_at: string;
  updated_at: string;
}

export interface ItemBaseWrite {
  name: string;
  model?: string | null;
  acquisition_date?: string | null;
  price?: number | null;
  status?: ItemStatus;
  description?: string | null;
  region?: string;
  platform?: Platform | null;
  complete?: boolean;
  missing_component_ids?: number[];
}
