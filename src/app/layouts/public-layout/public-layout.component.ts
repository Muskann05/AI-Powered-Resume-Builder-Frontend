import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ToastHostComponent } from '../../shared/components/ui.components';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastHostComponent],
  template: `
    <app-toast-host />
    <header class="sticky top-0 z-30 border-b border-indigo-100 bg-white/80 backdrop-blur-xl">
      <nav class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <a routerLink="/" class="text-xl font-black text-slate-950">ResumeAI</a>
        <div class="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
          <a routerLink="/templates" routerLinkActive="text-indigo-700">Templates</a>
          <a routerLink="/gallery" routerLinkActive="text-indigo-700">Gallery</a>
          <a routerLink="/pricing" routerLinkActive="text-indigo-700">Pricing</a>
          <a routerLink="/faq" routerLinkActive="text-indigo-700">FAQ</a>
        </div>
        <div class="flex gap-2">
          <a routerLink="/login" class="rounded-lg px-4 py-2 text-sm font-bold text-slate-700 hover:bg-indigo-50">Log in</a>
          <a routerLink="/register" class="btn-primary px-4 py-2 text-sm">Start free</a>
        </div>
      </nav>
    </header>
    <main><router-outlet /></main>
  `
})
export class PublicLayoutComponent {}
