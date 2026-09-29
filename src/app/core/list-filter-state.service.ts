import { Injectable, signal } from '@angular/core';

/**
 * Filtros que el usuario ha aplicado en una lista del inventario.
 *
 * Se guardan para poder devolver al usuario a la misma vista cuando entra en un artículo y
 * vuelve a la lista: sin esto, cada vuelta obligaba a filtrar otra vez desde cero.
 *
 * Ojo: es estado **solo de interfaz**, vive en memoria (se pierde al recargar la página) y no
 * se envía al backend.
 */
export interface ListFilterState {
  search: string;
  platform: string;
  ordering: string;
}

/** Listas que conservan sus filtros. */
export type ListSection = 'consoles' | 'games' | 'accessories';

@Injectable({ providedIn: 'root' })
export class ListFilterStateService {
  private readonly states = new Map<ListSection, ListFilterState>();

  /**
   * Marca de "ya se visitó esta lista al menos una vez en esta sesión".
   *
   * Es una señal (no un `Set` a secas) para que la plantilla pueda reaccionar si algún día hace
   * falta. Su función aquí es distinguir "primera visita" (lista limpia, como siempre) de
   * "vuelta desde un detalle" (se recupera el filtro anterior).
   */
  private readonly visited = signal<ReadonlySet<ListSection>>(new Set());

  /** Devuelve los filtros guardados de una lista, o `null` si no hay ninguno. */
  get(section: ListSection): ListFilterState | null {
    return this.states.get(section) ?? null;
  }

  /** Guarda los filtros que el usuario acaba de aplicar. */
  save(section: ListSection, state: ListFilterState): void {
    this.states.set(section, { ...state });
  }

  /** Se llama al entrar en la lista: indica si es la primera visita de la sesión. */
  markVisited(section: ListSection): void {
    if (this.visited().has(section)) return;
    const siguiente = new Set(this.visited());
    siguiente.add(section);
    this.visited.set(siguiente);
  }

  /** Indica si la lista ya se había visitado antes en esta sesión. */
  isReturning(section: ListSection): boolean {
    return this.visited().has(section);
  }
}
