import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent {
  readonly totalItems = input<number>(0);
  readonly pageSize = input<number>(10);
  readonly currentPage = input<number>(1);
  readonly pageChange = output<number>();

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems() / this.pageSize()));
  }

  get pages(): number[] {
    const tp = this.totalPages;
    const cp = this.currentPage();
    const result: number[] = [];
    const start = Math.max(1, cp - 2);
    const end = Math.min(tp, cp + 2);
    for (let i = start; i <= end; i++) {
      result.push(i);
    }
    return result;
  }

  goTo(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage()) return;
    this.pageChange.emit(page);
  }
}
