import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ToastHostComponent } from '../../shared/components/ui.components';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, ToastHostComponent],
  template: `
    <app-toast-host />
    <main class="grid min-h-screen bg-slate-50 lg:grid-cols-[1fr_560px]">
      <section class="hidden bg-[linear-gradient(135deg,#4648d4,#8455ef)] p-12 text-white lg:block">
        <a routerLink="/" class="text-2xl font-black">ResumeAI</a>
        <div class="mt-32 max-w-xl">
          <p class="text-sm font-bold uppercase tracking-[0.18em] text-indigo-100">AI career workspace</p>
          <h1 class="mt-4 text-5xl font-black leading-tight">Build, score, tailor, and export resumes from one polished cockpit.</h1>
        </div>
      </section>
      <section class="grid place-items-center p-5">
        <router-outlet />
      </section>
    </main>
  `
})
export class AuthLayoutComponent {}
