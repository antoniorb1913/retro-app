import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/api.service';
import type { Accessory, AccessoryWrite } from '../../models/accessory.interface';

@Injectable({ providedIn: 'root' })
export class AccessoryService {
  private api = inject(ApiService);
  private readonly endpoint = 'accessories';

  getList(params?: { search?: string; ordering?: string; platform?: string }): Observable<Accessory[]> {
    return this.api.getList<Accessory>(this.endpoint, params);
  }

  getById(id: number): Observable<Accessory> {
    return this.api.getById<Accessory>(this.endpoint, id);
  }

  create(data: AccessoryWrite): Observable<Accessory> {
    return this.api.create<Accessory>(this.endpoint, data);
  }

  update(id: number, data: AccessoryWrite): Observable<Accessory> {
    return this.api.update<Accessory>(this.endpoint, id, data);
  }

  delete(id: number): Observable<void> {
    return this.api.delete(this.endpoint, id);
  }
}
