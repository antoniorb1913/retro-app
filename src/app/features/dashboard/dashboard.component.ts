import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ConsoleService } from '../consoles/console.service';
import { GameService } from '../games/game.service';
import { AccessoryService } from '../accessories/accessory.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private consoleService = inject(ConsoleService);
  private gameService = inject(GameService);
  private accessoryService = inject(AccessoryService);

  protected loading = signal(true);
  protected stats = signal({ consoles: 0, games: 0, accessories: 0 });
  protected totals = signal({ consoles: 0, games: 0, accessories: 0 });

  ngOnInit(): void {
    forkJoin({
      consoles: this.consoleService.getList(),
      games: this.gameService.getList(),
      accessories: this.accessoryService.getList(),
    }).subscribe({
      next: (data) => {
        this.stats.set({
          consoles: data.consoles.length,
          games: data.games.length,
          accessories: data.accessories.length,
        });
        this.totals.set({
          consoles: data.consoles.reduce((s, c) => s + (Number(c.price) || 0), 0),
          games: data.games.reduce((s, g) => s + (Number(g.price) || 0), 0),
          accessories: data.accessories.reduce((s, a) => s + (Number(a.price) || 0), 0),
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
