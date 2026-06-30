import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { MissingComponent } from '../models/missing-component.interface';

@Injectable({ providedIn: 'root' })
export class MissingComponentService {
  private api = inject(ApiService);

  getList(): Observable<MissingComponent[]> {
    return this.api.getList<MissingComponent>('components');
  }
}
