import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GameService } from '../game.service';
import type { Game } from '../../../models/game.interface';

@Component({
  selector: 'app-game-detail',
  imports: [RouterLink, DatePipe, DecimalPipe],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class GameDetailComponent implements OnInit {
  private route = inject(ActivatedRoute); private router = inject(Router); private gameService = inject(GameService);
  protected game = signal<Game | null>(null); protected loading = signal(true); protected error = signal('');
  protected currentIndex = signal(0); protected lightboxOpen = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.error.set('ID no válido'); this.loading.set(false); return; }
    this.gameService.getById(id).subscribe({ next: (data) => { this.game.set(data); this.loading.set(false); }, error: () => { this.loading.set(false); this.error.set('Error al cargar el juego'); } });
  }

  protected prevImage(): void { const imgs = this.game()?.images; if (imgs && this.currentIndex() > 0) this.currentIndex.set(this.currentIndex() - 1); }
  protected nextImage(): void { const imgs = this.game()?.images; if (imgs && this.currentIndex() < imgs.length - 1) this.currentIndex.set(this.currentIndex() + 1); }
  protected openLightbox(): void { this.lightboxOpen.set(true); }
  protected closeLightbox(): void { this.lightboxOpen.set(false); }
  protected deleteGame(id: number): void { if (!confirm('¿Eliminar este juego?')) return; this.gameService.delete(id).subscribe({ next: () => this.router.navigate(['/games']), error: () => this.error.set('Error al eliminar') }); }
}
