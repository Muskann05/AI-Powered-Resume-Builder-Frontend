import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed right-4 top-4 z-50 flex w-[min(92vw,360px)] flex-col gap-3">
      @for (toast of toastService.messages(); track toast.id) {
        <button type="button" class="rounded-lg border bg-white px-4 py-3 text-left shadow-lg"
          [class.border-emerald-200]="toast.tone === 'success'"
          [class.border-red-200]="toast.tone === 'error'"
          [class.border-indigo-200]="toast.tone === 'info'"
          (click)="toastService.dismiss(toast.id)">
          <p class="text-sm font-semibold" [class.text-emerald-700]="toast.tone === 'success'" [class.text-red-700]="toast.tone === 'error'" [class.text-indigo-700]="toast.tone === 'info'">{{ toast.text }}</p>
        </button>
      }
    </div>
  `
})
export class ToastHostComponent {
  readonly toastService = inject(ToastService);
}

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="rounded-lg border border-dashed border-indigo-200 bg-white p-8 text-center">
      <div class="mx-auto mb-4 grid size-12 place-items-center rounded-lg bg-indigo-50 text-xl text-indigo-600">{{ icon }}</div>
      <h3 class="text-lg font-bold text-slate-950">{{ title }}</h3>
      <p class="mx-auto mt-2 max-w-xl text-sm text-slate-600">{{ message }}</p>
      @if (link && action) {
        <a class="btn-primary mt-5 inline-flex px-5 py-3" [routerLink]="link">{{ action }}</a>
      }
    </div>
  `
})
export class EmptyStateComponent {
  @Input() icon = '+';
  @Input() title = 'Nothing here yet';
  @Input() message = 'Create your first item to get started.';
  @Input() action?: string;
  @Input() link?: string;
}

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `
    <div class="animate-pulse space-y-3">
      @for (row of rowsArray; track row) {
        <div class="h-4 rounded bg-slate-200" [style.width.%]="row"></div>
      }
    </div>
  `
})
export class SkeletonComponent {
  @Input() rows = 4;
  get rowsArray(): number[] {
    return Array.from({ length: this.rows }, (_, i) => 95 - i * 11);
  }
}

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (open) {
      <div class="fixed inset-0 z-40 grid place-items-center bg-slate-950/30 p-4">
        <section class="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
          <h2 class="text-xl font-bold">{{ title }}</h2>
          <p class="mt-2 text-sm text-slate-600">{{ message }}</p>
          <div class="mt-6 flex justify-end gap-3">
            <button class="rounded-lg border px-4 py-2 font-semibold" type="button" (click)="cancel.emit()">Cancel</button>
            <button class="btn-primary px-4 py-2" type="button" (click)="confirm.emit()">Confirm</button>
          </div>
        </section>
      </div>
    }
  `
})
export class ConfirmModalComponent {
  @Input() open = false;
  @Input() title = 'Confirm action';
  @Input() message = 'This action cannot be undone.';
  @Input() confirm = { emit: () => undefined };
  @Input() cancel = { emit: () => undefined };
}
