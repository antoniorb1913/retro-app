import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Subject, debounceTime, switchMap, takeUntil, tap } from 'rxjs';
import { ConsoleService } from '../console.service';
import { ItemStatusLabels } from '../../../models/item-status.enum';
import { Platform, PlatformLabels } from '../../../models/platform.enum';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import type { Console } from '../../../models/console.interface';

@Component({
  selector: 'app-console-list',
  imports: [RouterLink, CurrencyPipe, DecimalPipe, PaginationComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ConsoleListComponent implements OnInit, OnDestroy {
  private consoleService = inject(ConsoleService);

  protected consoles = signal<Console[]>([]);
  protected loading = signal(true);
  protected error = signal('');
  protected ordering = 'name';
  protected search = '';
  protected platformFilter = signal('');
  protected readonly platforms = Object.values(Platform);
  protected readonly platformLabels = PlatformLabels;
  protected totalPrice = computed(() => this.consoles().reduce((s, c) => s + (Number(c.price) || 0), 0));

  protected pageSize = 10;
  protected currentPage = signal(1);
  protected totalItems = computed(() => this.consoles().length);
  protected paginatedConsoles = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.consoles().slice(start, start + this.pageSize);
  });

  private trigger$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.trigger$
      .pipe(
        debounceTime(300),
        tap(() => this.loading.set(true)),
        switchMap(() => this.fetchConsoles()),
        takeUntil(this.destroy$),
      )
      .subscribe();

    this.fetchConsoles().subscribe();
  }

  private fetchConsoles() {
    const platform = this.platformFilter();
    const searchTerms = [this.search];
    if (platform) searchTerms.push(platform);

    return this.consoleService
      .getList({
        search: searchTerms.filter(Boolean).join(' ') || undefined,
        ordering: this.ordering || undefined,
      })
      .pipe(
        tap({
          next: (data) => {
            this.consoles.set(data);
            this.currentPage.set(1);
            this.loading.set(false);
            this.error.set('');
          },
          error: () => {
            this.loading.set(false);
            this.error.set('Error al cargar las consolas');
          },
        }),
      );
  }

  protected onSearch(value: string): void {
    this.search = value;
    this.trigger$.next();
  }

  protected onPlatformChange(value: string): void {
    this.platformFilter.set(value);
    this.trigger$.next();
  }

  protected toggleOrder(field: string): void {
    this.ordering = this.ordering === field ? `-${field}` : field;
    this.trigger$.next();
  }

  protected deleteConsole(id: number): void {
    if (!confirm('¿Eliminar esta consola? Esta acción no se puede deshacer.')) return;
    this.consoleService.delete(id).subscribe({
      next: () => this.consoles.set(this.consoles().filter((c) => c.id !== id)),
      error: () => this.error.set('Error al eliminar la consola'),
    });
  }

  ngOnDestroy(): void {
    this.trigger$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
