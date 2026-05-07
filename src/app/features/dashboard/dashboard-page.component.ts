import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService, ResumeService } from '../../core/services/domain.services';
import { NotificationResponse, ResumeResponse } from '../../shared/models/api.models';
import { EmptyStateComponent } from '../../shared/components/ui.components';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, EmptyStateComponent],
  template: `
    <section class="grid gap-6">
      <div class="grid gap-4 md:grid-cols-4">
        @for (stat of stats(); track stat.label) {
          <article class="rounded-lg border border-indigo-100 bg-white p-5"><p class="text-sm font-bold text-slate-500">{{ stat.label }}</p><p class="mt-2 text-3xl font-black">{{ stat.value }}</p></article>
        }
      </div>
      <div class="grid gap-6 xl:grid-cols-[1.4fr_.8fr]">
        <section class="rounded-lg border border-indigo-100 bg-white p-5">
          <div class="flex items-center justify-between"><h2 class="text-xl font-black">Recent resumes</h2><a routerLink="/resumes" class="text-sm font-bold text-indigo-700">View all</a></div>
          @if (!resumes().length) { <app-empty-state class="mt-5 block" title="No resumes yet" message="Create a resume to unlock the builder, AI tools, and exports." action="Create resume" link="/resumes" /> }
          @else {
            <div class="mt-5 grid gap-3">
              @for (resume of resumes().slice(0, 5); track resume.resumeId) {
                <a [routerLink]="['/builder', resume.resumeId]" class="flex items-center justify-between rounded-lg border p-4 hover:bg-indigo-50">
                  <span><strong>{{ resume.title }}</strong><span class="block text-sm text-slate-500">{{ resume.targetJobTitle || 'No target role' }}</span></span>
                  <span class="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">{{ resume.atsScore || 0 }} ATS</span>
                </a>
              }
            </div>
          }
        </section>
        <section class="rounded-lg border border-indigo-100 bg-white p-5">
          <h2 class="text-xl font-black">Notifications</h2>
          <div class="mt-5 grid gap-3">
            @for (notification of notifications().slice(0, 6); track notification.notificationId) {
              <article class="rounded-lg bg-slate-50 p-3"><p class="font-bold">{{ notification.title }}</p><p class="text-sm text-slate-600">{{ notification.message }}</p></article>
            } @empty {
              <p class="text-sm text-slate-500">No notifications yet.</p>
            }
          </div>
        </section>
      </div>
    </section>
  `
})
export class DashboardPageComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly resumesApi = inject(ResumeService);
  private readonly notificationsApi = inject(NotificationService);
  readonly resumes = signal<ResumeResponse[]>([]);
  readonly notifications = signal<NotificationResponse[]>([]);
  readonly stats = signal([{ label: 'Resumes', value: 0 }, { label: 'Published', value: 0 }, { label: 'Avg ATS', value: 0 }, { label: 'Unread', value: 0 }]);

  ngOnInit(): void {
    const userId = this.auth.currentUser()?.userId;
    if (!userId) return;
    forkJoin({
      resumes: this.resumesApi.byUser(userId).pipe(catchError(() => of([]))),
      notifications: this.notificationsApi.byRecipient(userId).pipe(catchError(() => of([]))),
      unread: this.notificationsApi.unreadCount(userId).pipe(catchError(() => of({ recipientId: userId, unreadCount: 0 })))
    }).subscribe(({ resumes, notifications, unread }) => {
      this.resumes.set(resumes);
      this.notifications.set(notifications);
      const avg = resumes.length ? Math.round(resumes.reduce((sum, resume) => sum + (resume.atsScore || 0), 0) / resumes.length) : 0;
      this.stats.set([{ label: 'Resumes', value: resumes.length }, { label: 'Published', value: resumes.filter((resume) => resume.isPublic).length }, { label: 'Avg ATS', value: avg }, { label: 'Unread', value: unread.unreadCount }]);
    });
  }
}
