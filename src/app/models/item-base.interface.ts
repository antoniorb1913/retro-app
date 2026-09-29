import { ItemStatus } from './item-status.enum';
import { Platform } from './platform.enum';
import { Protective } from './protective.enum';
import { MissingComponent } from './missing-component.interface';
import { ItemImage } from './item-image.interface';

export interface ItemBase {
  id: number;
  name: string;
  model: string | null;
  acquisition_date: string | null;
  price: string | null;
  /** Lo que costó el artículo con todo (envío, comisiones...). Si está vacío, es igual a `price`. */
  total_price: string | null;
  /** Enlace público del anuncio donde se compró, para poder volver a abrirlo. */
  purchase_url: string | null;
  status: ItemStatus;
  status_display: string;
  description: string | null;
  region: string;
  platform: Platform | null;
  platform_display: string | null;
  /** Tienda donde se compró. El backend usa '-' cuando no se ha indicado ninguna. */
  store: string;
  protective: Protective;
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
  total_price?: number | null;
  purchase_url?: string | null;
  status?: ItemStatus;
  description?: string | null;
  region?: string;
  platform?: Platform | null;
  /** Cadena vacía significa "no especificado"; se envía '-' igual que hace el backend. */
  store?: string;
  protective?: Protective;
  complete?: boolean;
  missing_component_ids?: number[];
}
