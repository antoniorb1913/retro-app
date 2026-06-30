import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConsoleService } from '../console.service';
import type { Console } from '../../../models/console.interface';

@Component({
  selector: 'app-console-detail',
  imports: [RouterLink, DatePipe, DecimalPipe],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class ConsoleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private consoleService = inject(ConsoleService);

  protected console = signal<Console | null>(null);
  protected loading = signal(true);
  protected error = signal('');
  protected currentIndex = signal(0);
  protected lightboxOpen = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error.set('ID de consola no válido');
      this.loading.set(false);
      return;
    }

    this.consoleService.getById(id).subscribe({
      next: (data) => {
        this.console.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Error al cargar la consola');
      },
    });
  }

  protected prevImage(): void {
    const imgs = this.console()?.images;
    if (imgs && this.currentIndex() > 0) {
      this.currentIndex.set(this.currentIndex() - 1);
    }
  }

  protected nextImage(): void {
    const imgs = this.console()?.images;
    if (imgs && this.currentIndex() < imgs.length - 1) {
      this.currentIndex.set(this.currentIndex() + 1);
    }
  }

  protected openLightbox(): void {
    this.lightboxOpen.set(true);
  }

  protected closeLightbox(): void {
    this.lightboxOpen.set(false);
  }

  protected deleteConsole(id: number): void {
    if (!confirm('¿Eliminar esta consola? Esta acción no se puede deshacer.')) return;
    this.consoleService.delete(id).subscribe({
      next: () => this.router.navigate(['/consoles']),
      error: () => this.error.set('Error al eliminar la consola'),
    });
  }
}
