import { Injectable, signal } from '@angular/core';

export type ToastKind = 'info' | 'success' | 'error';

export interface Toast {
  id: number;
  kind: ToastKind;
  title?: string;
  message: string;
}

/** Small replacement for ngx-toastr: Bootstrap toasts in the bottom-right corner. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  readonly toasts = signal<Toast[]>([]);

  info(message: string, title?: string): void {
    this.show('info', message, title);
  }

  success(message: string, title?: string): void {
    this.show('success', message, title);
  }

  error(message: string, title?: string): void {
    this.show('error', message, title, 7000);
  }

  dismiss(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  private show(kind: ToastKind, message: string, title?: string, timeout = 4000): void {
    const toast: Toast = { id: this.nextId++, kind, title, message };
    this.toasts.update(list => [...list, toast]);
    setTimeout(() => this.dismiss(toast.id), timeout);
  }
}
