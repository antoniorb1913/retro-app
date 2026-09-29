import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AccessoryService } from '../accessory.service';
import { ProtectiveLabels } from '../../../models/protective.enum';
import { StoreLabels } from '../../../models/store.enum';
import type { Accessory } from '../../../models/accessory.interface';

@Component({
  selector: 'app-accessory-detail',
  imports: [RouterLink, DatePipe, DecimalPipe],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class AccessoryDetailComponent implements OnInit {
  private route = inject(ActivatedRoute); private router = inject(Router); private service = inject(AccessoryService);
  protected item = signal<Accessory | null>(null); protected loading = signal(true); protected error = signal('');
  protected currentIndex = signal(0); protected lightboxOpen = signal(false);

  protected readonly storeLabels = StoreLabels;
  protected readonly protectiveLabels = ProtectiveLabels;

  /**
   * Devuelve la tienda lista para mostrar.
   * El backend guarda '-' (o cadena vacía) cuando el artículo no tiene tienda asignada, así que
   * en ese caso se muestra un guion en lugar del valor crudo.
   */
  protected storeLabel(store: string | null): string {
    const valor = (store ?? '').trim();
    if (!valor || valor === '-') return '—';
    return this.storeLabels[valor] ?? valor;
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.error.set('ID no válido'); this.loading.set(false); return; }
    this.service.getById(id).subscribe({ next: (data) => { this.item.set(data); this.loading.set(false); }, error: () => { this.loading.set(false); this.error.set('Error al cargar'); } });
  }
  protected prevImage(): void { const imgs = this.item()?.images; if (imgs && this.currentIndex() > 0) this.currentIndex.set(this.currentIndex() - 1); }
  protected nextImage(): void { const imgs = this.item()?.images; if (imgs && this.currentIndex() < imgs.length - 1) this.currentIndex.set(this.currentIndex() + 1); }
  protected openLightbox(): void { this.lightboxOpen.set(true); }
  protected closeLightbox(): void { this.lightboxOpen.set(false); }
  protected deleteItem(id: number): void { if (!confirm('¿Eliminar este accesorio?')) return; this.service.delete(id).subscribe({ next: () => this.router.navigate(['/accessories']), error: () => this.error.set('Error al eliminar') }); }
}
