import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, switchMap, of, catchError } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ResumeService, TemplateService } from '../../core/services/domain.services';
import { ResumeResponse, TemplateCategory, TemplateResponse } from '../../shared/models/api.models';
import { EmptyStateComponent, SkeletonComponent } from '../../shared/components/ui.components';

const categories: TemplateCategory[] = ['PROFESSIONAL', 'CREATIVE', 'MODERN', 'MINIMALIST', 'ATS_OPTIMISED'];

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
      <div class="self-center">
        <p class="font-bold uppercase tracking-[0.18em] text-indigo-700">AI-powered resume builder</p>
        <h1 class="mt-5 text-5xl font-black leading-tight text-slate-950 md:text-7xl">ResumeAI</h1>
        <p class="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Create polished resumes, tailor them to jobs, check ATS readiness, and export production-ready files from one responsive SaaS workspace.</p>
        <div class="mt-8 flex flex-wrap gap-3">
          <a routerLink="/register" class="btn-primary px-6 py-3">Build my resume</a>
          <a routerLink="/templates" class="rounded-lg border border-indigo-100 bg-white px-6 py-3 font-bold text-slate-800 hover:bg-indigo-50">Browse templates</a>
        </div>
      </div>
      <div class="glass rounded-2xl p-5">
        <div class="rounded-xl bg-white p-8 shadow-xl">
          <div class="border-b pb-5">
            <p class="text-3xl font-black">Maya Patel</p>
            <p class="mt-1 text-indigo-700">Senior Product Designer</p>
          </div>
          <div class="mt-6 grid gap-5">
            @for (section of ['AI Summary', 'Experience', 'Skills', 'ATS Score']; track section) {
              <div>
                <div class="mb-2 flex items-center justify-between">
                  <p class="text-sm font-black">{{ section }}</p>
                  <span class="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">Optimized</span>
                </div>
                <div class="space-y-2">
                  <div class="h-2 rounded bg-slate-200"></div>
                  <div class="h-2 w-4/5 rounded bg-slate-200"></div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </section>

    <section class="border-y border-indigo-100 bg-white py-14">
      <div class="mx-auto grid max-w-7xl gap-4 px-4 md:grid-cols-4">
        @for (metric of metrics; track metric.label) {
          <div class="rounded-lg border border-indigo-100 p-5">
            <p class="text-3xl font-black text-indigo-700">{{ metric.value }}</p>
            <p class="mt-1 text-sm font-semibold text-slate-600">{{ metric.label }}</p>
          </div>
        }
      </div>
    </section>
  `
})
export class LandingPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly metrics = [
    { value: '3-panel', label: 'Live builder workspace' },
    { value: '8+', label: 'AI career tools' },
    { value: 'PDF/DOCX', label: 'Export formats' },
    { value: 'Public', label: 'Template and resume galleries' }
  ];

  ngOnInit(): void {
    const accessToken = this.route.snapshot.queryParamMap.get('accessToken');
    const refreshToken = this.route.snapshot.queryParamMap.get('refreshToken');

    if (!accessToken || !refreshToken) return;

    this.auth.completeOAuthLogin(accessToken, refreshToken)
      .pipe(catchError(() => of(null)))
      .subscribe((user) => {
        if (user) {
          this.router.navigate(['/dashboard'], { replaceUrl: true });
        }
      });
  }
}

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, SkeletonComponent, EmptyStateComponent],
  template: `
    <section class="mx-auto max-w-7xl px-4 py-10">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="text-sm font-bold uppercase text-indigo-700">Template Gallery</p>
          <h1 class="text-4xl font-black">Choose a resume system</h1>
        </div>

        <div class="flex flex-wrap gap-2">
          @for (cat of cats; track cat) {
            <button
              class="rounded-full border px-3 py-2 text-xs font-bold"
              [class.bg-indigo-600]="cat === active()"
              [class.text-white]="cat === active()"
              (click)="load(cat)">
              {{ cat.replace('_', ' ') }}
            </button>
          }
        </div>
      </div>

      @if (loading()) {
        <div class="mt-8 rounded-lg bg-white p-6">
          <app-skeleton [rows]="8" />
        </div>
      } @else if (!templates().length) {
        <app-empty-state
          class="mt-8 block"
          title="No templates returned"
          message="The backend did not return active templates for this view." />
      } @else {
        <div class="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          @for (template of templates(); track template.templateId) {
            <article class="overflow-hidden rounded-lg border border-indigo-100 bg-white shadow-sm">
              <div class="grid h-56 place-items-center bg-gradient-to-br from-indigo-50 to-violet-50">
                <div class="h-44 w-32 rounded bg-white p-4 shadow-lg">
                  <div class="h-3 w-20 rounded bg-slate-900"></div>
                  <div class="mt-4 space-y-2">
                    <div class="h-2 rounded bg-slate-200"></div>
                    <div class="h-2 w-2/3 rounded bg-slate-200"></div>
                    <div class="h-2 w-4/5 rounded bg-indigo-200"></div>
                  </div>
                </div>
              </div>

              <div class="p-5">
                <div class="flex items-center justify-between gap-2">
                  <h2 class="font-black">{{ template.name }}</h2>
                  <span
                    class="rounded-full px-2 py-1 text-xs font-bold"
                    [class.bg-amber-50]="template.isPremium"
                    [class.text-amber-700]="template.isPremium"
                    [class.bg-emerald-50]="!template.isPremium"
                    [class.text-emerald-700]="!template.isPremium">
                    {{ template.isPremium ? 'Premium' : 'Free' }}
                  </span>
                </div>

                <p class="mt-2 line-clamp-2 text-sm text-slate-600">
                  {{ template.description || 'A clean, ATS-ready ResumeAI template.' }}
                </p>

                <a class="mt-4 inline-flex font-bold text-indigo-700" [routerLink]="['/templates', template.templateId]">
                  Preview
                </a>
              </div>
            </article>
          }
        </div>
      }
    </section>
  `
})
export class TemplateGalleryPageComponent implements OnInit {
  private readonly templatesApi = inject(TemplateService);

  readonly templates = signal<TemplateResponse[]>([]);
  readonly loading = signal(true);
  readonly active = signal<TemplateCategory | 'ALL'>('ALL');
  readonly cats = ['ALL', ...categories] as const;

  ngOnInit(): void {
    this.load('ALL');
  }

  load(category: TemplateCategory | 'ALL'): void {
    this.active.set(category);
    this.loading.set(true);

    const request = category === 'ALL'
      ? this.templatesApi.all()
      : this.templatesApi.byCategory(category);

    request
      .pipe(catchError(() => of([])))
      .subscribe((templates) => {
        this.templates.set(templates);
        this.loading.set(false);
      });
  }
}

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="mx-auto max-w-6xl px-4 py-10">
      <a routerLink="/templates" class="font-bold text-indigo-700">Back to templates</a>

      @if (template(); as template) {
        <div class="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
          <iframe class="h-[720px] w-full rounded-lg border bg-white shadow-xl" [srcdoc]="html()"></iframe>

          <aside class="glass h-fit rounded-lg p-6">
            <p class="text-sm font-bold uppercase text-indigo-700">{{ template.category }}</p>
            <h1 class="mt-2 text-3xl font-black">{{ template.name }}</h1>
            <p class="mt-3 text-slate-600">{{ template.description }}</p>
            <a routerLink="/register" class="btn-primary mt-6 inline-flex px-5 py-3">Use this template</a>
          </aside>
        </div>
      } @else {
        <div class="mt-10 rounded-lg bg-white p-8">Loading preview...</div>
      }
    </section>
  `
})
export class TemplatePreviewPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly templatesApi = inject(TemplateService);

  readonly template = signal<TemplateResponse | null>(null);
  readonly html = signal('<main style="font-family:Inter;padding:48px"><h1>Template preview</h1></main>');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || '';

    this.templatesApi.get(id)
      .pipe(catchError(() => of(null)))
      .subscribe((template) => {
        this.template.set(template);
      });

    this.templatesApi.previewHtml(id)
      .pipe(catchError(() => of('')))
      .subscribe((html) => {
        this.html.set(html || '<main style="font-family:Inter;padding:48px"><h1>Preview unavailable</h1></main>');
      });
  }
}

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, EmptyStateComponent],
  template: `
    <section class="mx-auto max-w-7xl px-4 py-10">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="text-sm font-bold uppercase text-indigo-700">Public Gallery</p>
          <h1 class="text-4xl font-black">Published resumes</h1>
        </div>

        <input
          class="field max-w-xs"
          placeholder="Search public resumes"
          (input)="search$.next($any($event.target).value)" />
      </div>

      @if (!resumes().length) {
        <app-empty-state
          class="mt-8 block"
          title="No public resumes found"
          message="Published resumes will appear here as users share them." />
      } @else {
        <div class="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          @for (resume of resumes(); track resume.resumeId) {
            <article class="rounded-lg border border-indigo-100 bg-white p-5">
              <p class="text-xs font-bold uppercase text-slate-500">
                {{ resume.language || 'EN' }} · {{ resume.viewCount }} views
              </p>
              <h2 class="mt-2 text-xl font-black">{{ resume.title }}</h2>
              <p class="text-slate-600">{{ resume.targetJobTitle || 'General resume' }}</p>
              <a class="mt-4 inline-flex font-bold text-indigo-700" [routerLink]="['/gallery', resume.resumeId]">
                Open public resume
              </a>
            </article>
          }
        </div>
      }
    </section>
  `
})
export class PublicGalleryPageComponent implements OnInit {
  private readonly resumesApi = inject(ResumeService);

  readonly resumes = signal<ResumeResponse[]>([]);
  readonly search$ = new Subject<string>();

  ngOnInit(): void {
    this.resumesApi.publicResumes()
      .pipe(catchError(() => of([])))
      .subscribe((resumes) => this.resumes.set(resumes));

    this.search$
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((term) => term ? this.resumesApi.searchPublic(term) : this.resumesApi.publicResumes()),
        catchError(() => of([]))
      )
      .subscribe((resumes) => this.resumes.set(resumes));
  }
}

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="mx-auto max-w-6xl px-4 py-14">
      <div class="text-center">
        <p class="font-bold uppercase text-indigo-700">Pricing</p>
        <h1 class="text-4xl font-black">Simple plans for serious job search</h1>
      </div>

      <div class="mt-10 grid gap-5 md:grid-cols-2">
        @for (plan of plans; track plan.name) {
          <article class="rounded-lg border border-indigo-100 bg-white p-7 shadow-sm">
            <h2 class="text-2xl font-black">{{ plan.name }}</h2>
            <p class="mt-2 text-slate-600">{{ plan.copy }}</p>
            <p class="mt-6 text-4xl font-black">{{ plan.price }}</p>

            <ul class="mt-6 space-y-3 text-sm text-slate-700">
              @for (feature of plan.features; track feature) {
                <li>✓ {{ feature }}</li>
              }
            </ul>

            <a routerLink="/register" class="btn-primary mt-7 inline-flex px-5 py-3">
              {{ plan.cta }}
            </a>
          </article>
        }
      </div>
    </section>
  `
})
export class PricingPageComponent {
  readonly plans = [
    {
      name: 'FREE',
      price: '$0',
      copy: 'Start with core resume management.',
      cta: 'Start free',
      features: ['Public templates', 'Resume management', 'Limited AI calls']
    },
    {
      name: 'PREMIUM',
      price: '$12/mo',
      copy: 'Unlock deeper AI and export workflows.',
      cta: 'Upgrade',
      features: ['Premium templates', 'ATS checks', 'Job tailoring', 'PDF/DOCX exports']
    }
  ];
}

@Component({
  standalone: true,
  template: `
    <section class="mx-auto max-w-4xl px-4 py-14">
      <p class="font-bold uppercase text-indigo-700">FAQ</p>
      <h1 class="mt-2 text-4xl font-black">ResumeAI questions</h1>

      <div class="mt-8 grid gap-4">
        @for (item of faqs; track item.q) {
          <article class="rounded-lg border border-indigo-100 bg-white p-5">
            <h2 class="font-black">{{ item.q }}</h2>
            <p class="mt-2 text-slate-600">{{ item.a }}</p>
          </article>
        }
      </div>
    </section>
  `
})
export class FaqPageComponent {
  readonly faqs = [
    {
      q: 'Can guests view templates?',
      a: 'Yes. Landing, template gallery, template previews, pricing, FAQ, and public resumes are available without authentication.'
    },
    {
      q: 'Which backend APIs are used?',
      a: 'The frontend maps to the Spring Boot microservice controllers found in the supplied backend ZIP.'
    },
    {
      q: 'Can I export resumes?',
      a: 'Authenticated users can submit PDF, DOCX, and JSON export jobs and track status through the export service.'
    }
  ];
}
