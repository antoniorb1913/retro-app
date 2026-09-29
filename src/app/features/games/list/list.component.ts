import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Subject, debounceTime, switchMap, takeUntil, tap } from 'rxjs';
import { GameService } from '../game.service';
import { ListFilterStateService } from '../../../core/list-filter-state.service';
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
  private filterState = inject(ListFilterStateService);
  protected games = signal<Game[]>([]);
  protected loading = signal(true);
  protected error = signal('');
  protected platformFilter = signal('');
  protected readonly platforms = Object.values(Platform);
  protected readonly platformLabels = PlatformLabels;
  protected totalPrice = computed(() => this.games().reduce((s, g) => s + (Number(g.total_price ?? g.price) || 0), 0));
  protected pageSize = 10;
  protected currentPage = signal(1);
  protected totalItems = computed(() => this.games().length);
  protected paginatedGames = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.games().slice(start, start + this.pageSize);
  });
  protected search = '';
  protected ordering = 'name';
  private trigger$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Al volver desde un detalle se recuperan los filtros que el usuario tenía puestos.
    this.restoreFilters();

    this.trigger$.pipe(debounceTime(300), tap(() => this.loading.set(true)), switchMap(() => this.fetch()), takeUntil(this.destroy$)).subscribe();
    this.fetch().subscribe();
  }

  /**
   * Recupera los filtros de la visita anterior a esta lista.
   *
   * La primera vez que se entra en la sesión no hay nada guardado, así que la lista se muestra
   * completa (mismo comportamiento de siempre). A partir de ahí, entrar en un juego y volver
   * mantiene el filtro. No se usa la URL: los filtros viven en memoria.
   */
  private restoreFilters(): void {
    const guardados = this.filterState.get('games');
    const volviendo = this.filterState.isReturning('games');
    this.filterState.markVisited('games');

    if (!guardados || !volviendo) return;

    this.search = guardados.search;
    this.ordering = guardados.ordering;
    this.platformFilter.set(guardados.platform);
  }

  /** Guarda los filtros aplicados para poder recuperarlos al volver de un detalle. */
  private saveFilters(): void {
    this.filterState.save('games', {
      search: this.search,
      platform: this.platformFilter(),
      ordering: this.ordering,
    });
  }

  /** Indica si hay algún filtro puesto, para decidir si se muestra el botón de borrarlos. */
  protected hasActiveFilters = computed(() => {
    return !!this.search || !!this.platformFilter() || this.ordering !== 'name';
  });

  /**
   * Quita todos los filtros y recarga la lista completa.
   *
   * El buscador se limpia a través de su referencia en la plantilla: así el cuadro de texto no
   * necesita estar enlazado al componente (que es lo que provocaba problemas al escribir).
   */
  protected clearFilters(searchInput: HTMLInputElement | undefined): void {
    this.search = '';
    this.ordering = 'name';
    this.platformFilter.set('');
    if (searchInput) searchInput.value = '';
    this.saveFilters();
    this.trigger$.next();
  }

  private fetch() {
    const platform = this.platformFilter();
    const searchTerms = [this.search];
    if (platform) searchTerms.push(platform);

    return this.gameService.getList({ search: searchTerms.filter(Boolean).join(' ') || undefined, ordering: this.ordering || undefined }).pipe(tap({ next: (data) => { this.games.set(data); this.currentPage.set(1); this.loading.set(false); this.error.set(''); }, error: () => { this.loading.set(false); this.error.set('Error al cargar los juegos'); } }));
  }

  protected onSearch(value: string): void { this.search = value; this.saveFilters(); this.trigger$.next(); }
  protected onPlatformChange(value: string): void { this.platformFilter.set(value); this.saveFilters(); this.trigger$.next(); }
  protected toggleOrder(field: string): void { this.ordering = this.ordering === field ? `-${field}` : field; this.saveFilters(); this.trigger$.next(); }
  protected deleteGame(id: number): void { if (!confirm('¿Eliminar este juego?')) return; this.gameService.delete(id).subscribe({ next: () => this.games.set(this.games().filter((g) => g.id !== id)), error: () => this.error.set('Error al eliminar') }); }
  ngOnDestroy(): void { this.trigger$.complete(); this.destroy$.next(); this.destroy$.complete(); }
}
