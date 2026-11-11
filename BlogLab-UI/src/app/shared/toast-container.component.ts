import { Component, inject } from '@angular/core';
import { IconComponent } from './icon.component';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  imports: [IconComponent],
  template: `
    <div class="pointer-events-none fixed right-4 bottom-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3" aria-live="polite">
      @for (toast of toastService.toasts(); track toast.id) {
        <div role="status"
             class="pointer-events-auto flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-xl shadow-ink/10"
             [class]="toast.kind === 'error' ? 'border-red-200' : toast.kind === 'success' ? 'border-emerald-200' : 'border-line'">
          <span class="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full"
                [class]="toast.kind === 'error' ? 'bg-red-100 text-red-600' : toast.kind === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-accent-soft text-accent'">
            <app-icon [name]="toast.kind === 'error' ? 'close' : 'check'" [size]="15" />
          </span>
          <div class="min-w-0 flex-1 text-sm">
            @if (toast.title) {
              <p class="font-semibold">{{ toast.title }}</p>
            }
            <p class="whitespace-pre-line text-muted">{{ toast.message }}</p>
          </div>
          <button type="button" aria-label="Close" (click)="toastService.dismiss(toast.id)"
                  class="cursor-pointer rounded-full p-1 text-muted transition hover:bg-ink/5 hover:text-ink">
            <app-icon name="close" [size]="14" />
          </button>
        </div>
      }
    </div>
  `
})
export class ToastContainerComponent {
  protected readonly toastService = inject(ToastService);
}
