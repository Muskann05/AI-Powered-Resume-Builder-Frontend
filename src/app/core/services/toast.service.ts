import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  tone: 'success' | 'error' | 'info';
  text: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  readonly messages = signal<ToastMessage[]>([]);

  show(text: string, tone: ToastMessage['tone'] = 'info'): void {
    const toast = { id: this.nextId++, tone, text };
    this.messages.update((messages) => [...messages, toast]);
    setTimeout(() => this.dismiss(toast.id), 4000);
  }

  dismiss(id: number): void {
    this.messages.update((messages) => messages.filter((message) => message.id !== id));
  }
}
