import { Component, computed, input, output } from '@angular/core';
import { IconComponent } from './icon.component';

/** Small replacement for the ngx-bootstrap pagination. */
@Component({
  selector: 'app-pagination',
  imports: [IconComponent],
  template: `
    @if (pageCount() > 1) {
      <nav aria-label="Pages" class="flex items-center gap-1.5">
        <button type="button" (click)="go(page() - 1)" [disabled]="page() === 1" aria-label="Previous page"
                class="btn btn-outline !px-3">
          <app-icon name="left" [size]="16" />
        </button>
        @for (p of pages(); track p) {
          <button type="button" (click)="go(p)" [attr.aria-current]="p === page() ? 'page' : null"
                  class="btn size-10 !p-0"
                  [class]="p === page() ? 'btn-primary' : 'btn-ghost'">
            {{ p }}
          </button>
        }
        <button type="button" (click)="go(page() + 1)" [disabled]="page() === pageCount()" aria-label="Next page"
                class="btn btn-outline !px-3">
          <app-icon name="right" [size]="16" />
        </button>
      </nav>
    }
  `
})
export class PaginationComponent {
  readonly totalItems = input.required<number>();
  readonly itemsPerPage = input(6);
  readonly page = input(1);
  readonly maxSize = input(10);

  readonly pageChanged = output<number>();

  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.itemsPerPage())));

  readonly pages = computed(() => {
    const count = this.pageCount();
    const size = Math.min(this.maxSize(), count);
    let start = Math.max(1, this.page() - Math.floor(size / 2));
    start = Math.min(start, count - size + 1);
    return Array.from({ length: size }, (_, i) => start + i);
  });

  go(target: number): void {
    const next = Math.min(Math.max(1, target), this.pageCount());
    if (next !== this.page()) {
      this.pageChanged.emit(next);
    }
  }
}
