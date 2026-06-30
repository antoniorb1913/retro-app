import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/api.service';
import type { Console, ConsoleWrite } from '../../models/console.interface';

@Injectable({ providedIn: 'root' })
export class ConsoleService {
  private api = inject(ApiService);
  private readonly endpoint = 'consoles';

  getList(params?: {
    search?: string;
    ordering?: string;
    platform?: string;
  }): Observable<Console[]> {
    return this.api.getList<Console>(this.endpoint, params);
  }

  getById(id: number): Observable<Console> {
    return this.api.getById<Console>(this.endpoint, id);
  }

  create(data: ConsoleWrite): Observable<Console> {
    return this.api.create<Console>(this.endpoint, data);
  }

  update(id: number, data: ConsoleWrite): Observable<Console> {
    return this.api.update<Console>(this.endpoint, id, data);
  }

  delete(id: number): Observable<void> {
    return this.api.delete(this.endpoint, id);
  }
}
