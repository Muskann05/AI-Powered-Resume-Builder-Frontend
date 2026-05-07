import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/domain.services';
import { NotificationResponse } from '../../shared/models/api.models';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="rounded-lg border border-indigo-100 bg-white p-5">
      <div class="flex items-center justify-between"><h1 class="text-2xl font-black">Notification center</h1><button class="rounded-lg border px-4 py-2 font-bold" type="button" (click)="markAll()">Mark all read</button></div>
      <div class="mt-5 grid gap-3">
        @for (item of notifications(); track item.notificationId) {
          <article class="rounded-lg border p-4" [class.bg-indigo-50]="!item.isRead">
            <div class="flex items-start justify-between gap-3"><div><p class="font-black">{{ item.title }}</p><p class="text-sm text-slate-600">{{ item.message }}</p></div><button class="text-sm font-bold text-indigo-700" type="button" (click)="toggle(item)">{{ item.isRead ? 'Unread' : 'Read' }}</button></div>
          </article>
        } @empty { <p class="text-sm text-slate-500">No notifications.</p> }
      </div>
    </section>
  `
})
export class NotificationsPageComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly api = inject(NotificationService);
  readonly notifications = signal<NotificationResponse[]>([]);
  ngOnInit(): void { this.load(); }
  load(): void {
    const userId = this.auth.currentUser()?.userId;
    if (!userId) return;
    this.api.byRecipient(userId).pipe(catchError(() => of([]))).subscribe((items) => this.notifications.set(items));
  }
  toggle(item: NotificationResponse): void { this.api.markRead(item.notificationId, !item.isRead).subscribe((updated) => this.notifications.update((items) => items.map((value) => value.notificationId === updated.notificationId ? updated : value))); }
  markAll(): void { const userId = this.auth.currentUser()?.userId; if (userId) this.api.markAllRead(userId).subscribe(() => this.load()); }
}
