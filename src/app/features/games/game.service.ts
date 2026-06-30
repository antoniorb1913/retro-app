import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/api.service';
import type { Game, GameWrite } from '../../models/game.interface';

@Injectable({ providedIn: 'root' })
export class GameService {
  private api = inject(ApiService);
  private readonly endpoint = 'games';

  getList(params?: { search?: string; ordering?: string; platform?: string }): Observable<Game[]> {
    return this.api.getList<Game>(this.endpoint, params);
  }

  getById(id: number): Observable<Game> {
    return this.api.getById<Game>(this.endpoint, id);
  }

  create(data: GameWrite): Observable<Game> {
    return this.api.create<Game>(this.endpoint, data);
  }

  update(id: number, data: GameWrite): Observable<Game> {
    return this.api.update<Game>(this.endpoint, id, data);
  }

  delete(id: number): Observable<void> {
    return this.api.delete(this.endpoint, id);
  }
}
