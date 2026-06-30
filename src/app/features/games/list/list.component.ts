import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Subject, debounceTime, switchMap, takeUntil, tap } from 'rxjs';
import { GameService } from '../game.service';
import { Platform, PlatformLabels } from '../../../models/platform.enum';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import type { Game } from '../../../models/game.interface';

@Component({
  selector: 'app-game-list',
  imports: [RouterLink, CurrencyPipe, DecimalPipe, PaginationComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class GameListComponent implements OnInit, OnDestroy {
  private gameService = inject(GameService);
  protected games = signal<Game[]>([]);
  protected loading = signal(true);
  protected error = signal('');
  protected platformFilter = signal('');
  protected readonly platforms = Object.values(Platform);
  protected readonly platformLabels = PlatformLabels;
  protected totalPrice = computed(() => this.games().reduce((s, g) => s + (Number(g.price) || 0), 0));
  protected pageSize = 10;
  protected currentPage = signal(1);
  protected totalItems = computed(() => this.games().length);
  protected paginatedGames = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.games().slice(start, start + this.pageSize);
  });
  private search = '';
  private ordering = 'name';
  private trigger$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.trigger$.pipe(debounceTime(300), tap(() => this.loading.set(true)), switchMap(() => this.fetch()), takeUntil(this.destroy$)).subscribe();
    this.fetch().subscribe();
  }

  private fetch() {
    const platform = this.platformFilter();
    const searchTerms = [this.search];
    if (platform) searchTerms.push(platform);

    return this.gameService.getList({ search: searchTerms.filter(Boolean).join(' ') || undefined, ordering: this.ordering || undefined }).pipe(tap({ next: (data) => { this.games.set(data); this.currentPage.set(1); this.loading.set(false); this.error.set(''); }, error: () => { this.loading.set(false); this.error.set('Error al cargar los juegos'); } }));
  }

  protected onSearch(value: string): void { this.search = value; this.trigger$.next(); }
  protected onPlatformChange(value: string): void { this.platformFilter.set(value); this.trigger$.next(); }
  protected toggleOrder(field: string): void { this.ordering = this.ordering === field ? `-${field}` : field; this.trigger$.next(); }
  protected deleteGame(id: number): void { if (!confirm('¿Eliminar este juego?')) return; this.gameService.delete(id).subscribe({ next: () => this.games.set(this.games().filter((g) => g.id !== id)), error: () => this.error.set('Error al eliminar') }); }
  ngOnDestroy(): void { this.trigger$.complete(); this.destroy$.next(); this.destroy$.complete(); }
}
