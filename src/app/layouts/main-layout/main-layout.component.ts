import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ToastHostComponent } from '../../shared/components/ui.components';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastHostComponent],
  template: `
    <app-toast-host />

    <div class="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[280px_1fr]">
      <aside class="border-r border-indigo-100 bg-white p-5">
        <div class="flex items-center justify-between">
          <a routerLink="/dashboard" class="text-xl font-black">ResumeAI</a>
          <span class="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
            {{ auth.currentUser()?.subscriptionPlan || 'FREE' }}
          </span>
        </div>

        <nav class="mt-8 grid gap-1 text-sm font-bold text-slate-600">
          @for (item of nav; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-indigo-50 text-indigo-700"
              class="rounded-lg px-3 py-2 hover:bg-indigo-50">
              {{ item.label }}
            </a>
          }

          @if (auth.isAdmin()) {
            <a
              routerLink="/admin"
              routerLinkActive="bg-indigo-50 text-indigo-700"
              class="rounded-lg px-3 py-2 hover:bg-indigo-50">
              Admin
            </a>
          }
        </nav>
      </aside>

      <section class="min-w-0">
        <header class="sticky top-0 z-20 flex items-center justify-between border-b border-indigo-100 bg-white/80 px-5 py-4 backdrop-blur-xl">
          <div>
            <p class="text-xs font-bold uppercase text-slate-500">Workspace</p>
            <h1 class="text-lg font-black">{{ auth.currentUser()?.fullName || 'ResumeAI User' }}</h1>
          </div>

          <button
            class="rounded-lg border px-4 py-2 text-sm font-bold hover:bg-slate-100"
            type="button"
            (click)="logout()">
            Log out
          </button>
        </header>

        <main class="p-4 md:p-6">
          <router-outlet />
        </main>
      </section>
    </div>
  `
})
export class MainLayoutComponent {
  readonly auth = inject(AuthService);

  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly nav = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Resumes', path: '/resumes' },
    { label: 'Builder', path: '/builder' },
    { label: 'AI Tools', path: '/ai-tools' },
    { label: 'Job Match', path: '/job-match' },
    { label: 'Exports', path: '/exports' },
    { label: 'Notifications', path: '/notifications' },
    { label: 'Profile', path: '/profile' },
    { label: 'Subscription', path: '/subscription' }
  ];

  logout(): void {
    this.auth.logoutFromServer().subscribe({
      next: () => {
        this.toast.show('Logged out on server. Token is now blacklisted in Redis.', 'success');
        this.router.navigate(['/']);
      },
      error: () => {
        this.toast.show('Local logout completed. Server logout could not be verified.', 'error');
        this.router.navigate(['/']);
      }
    });
  }
}
