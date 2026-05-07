import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { AiService, ExportService, NotificationService, ResumeService, TemplateService } from '../../core/services/domain.services';
import {
  AiAdminUsageResponse,
  AuditLogResponse,
  ExportJobResponse,
  ResumeAdminStatsResponse,
  ResumeResponse,
  SubscriptionPlan,
  TemplateCategory,
  TemplateResponse,
  UserResponse
} from '../../shared/models/api.models';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="grid gap-6">
      <div class="grid gap-4 md:grid-cols-4">
        <article class="rounded-lg bg-white p-5">
          <p class="text-sm font-bold text-slate-500">Users</p>
          <p class="text-3xl font-black">{{ users().length }}</p>
        </article>
        <article class="rounded-lg bg-white p-5">
          <p class="text-sm font-bold text-slate-500">Templates</p>
          <p class="text-3xl font-black">{{ templates().length }}</p>
        </article>
        <article class="rounded-lg bg-white p-5">
          <p class="text-sm font-bold text-slate-500">Resumes</p>
          <p class="text-3xl font-black">{{ resumeStats()?.totalResumes ?? resumes().length }}</p>
        </article>
        <article class="rounded-lg bg-white p-5">
          <p class="text-sm font-bold text-slate-500">AI requests</p>
          <p class="text-3xl font-black">{{ aiUsage()?.totalRequests ?? 0 }}</p>
        </article>
      </div>

      <div class="grid gap-6 xl:grid-cols-2">
        <section class="rounded-lg border border-indigo-100 bg-white p-5">
          <h1 class="text-2xl font-black">User management</h1>

          <div class="mt-5 grid gap-3">
            @for (user of users(); track user.userId) {
              <article class="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                <span>
                  <strong>{{ user.fullName }}</strong>
                  <span class="block text-sm text-slate-500">
                    {{ user.email }} · {{ user.role }} · {{ user.subscriptionPlan }} · {{ user.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </span>

                <span class="flex flex-wrap gap-2">
                  <button class="rounded-lg border px-3 py-2 text-sm font-bold" type="button" (click)="plan(user)">
                    Toggle plan
                  </button>
                  <button class="rounded-lg border px-3 py-2 text-sm font-bold" type="button" (click)="toggleUser(user)">
                    {{ user.isActive ? 'Suspend' : 'Reactivate' }}
                  </button>
                  <button class="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-600" type="button" (click)="deleteUser(user)">
                    Delete
                  </button>
                </span>
              </article>
            }
          </div>
        </section>

        <section class="rounded-lg border border-indigo-100 bg-white p-5">
          <h2 class="text-2xl font-black">Broadcast notification</h2>

          <form class="mt-5 grid gap-3" [formGroup]="broadcast" (ngSubmit)="sendBroadcast()">
            <select class="field" formControlName="subscriptionPlan">
              <option value="">All plans</option>
              <option value="FREE">FREE</option>
              <option value="PREMIUM">PREMIUM</option>
            </select>

            <input class="field" formControlName="title" placeholder="Title" />
            <textarea class="field min-h-28" formControlName="message" placeholder="Message"></textarea>

            <button class="btn-primary px-5 py-3" [disabled]="broadcast.invalid">Broadcast</button>
          </form>
        </section>
      </div>

      <div class="grid gap-6 xl:grid-cols-[420px_1fr]">
        <section class="rounded-lg border border-indigo-100 bg-white p-5">
          <h2 class="text-2xl font-black">{{ editingTemplateId() ? 'Edit template' : 'Create template' }}</h2>

          <form class="mt-5 grid gap-3" [formGroup]="templateForm" (ngSubmit)="saveTemplate()">
            <input class="field" formControlName="name" placeholder="Template name" />
            <input class="field" formControlName="description" placeholder="Description" />
            <input class="field" formControlName="thumbnailUrl" placeholder="Thumbnail URL" />

            <select class="field" formControlName="category">
              <option value="PROFESSIONAL">PROFESSIONAL</option>
              <option value="CREATIVE">CREATIVE</option>
              <option value="MODERN">MODERN</option>
              <option value="MINIMALIST">MINIMALIST</option>
              <option value="ATS_OPTIMISED">ATS_OPTIMISED</option>
            </select>

            <textarea class="field min-h-28" formControlName="htmlLayout" placeholder="HTML layout"></textarea>
            <textarea class="field min-h-28" formControlName="cssStyles" placeholder="CSS styles"></textarea>

            <label class="flex items-center gap-2 text-sm font-bold">
              <input type="checkbox" formControlName="isPremium" />
              Premium template
            </label>

            <label class="flex items-center gap-2 text-sm font-bold">
              <input type="checkbox" formControlName="isActive" />
              Active
            </label>

            <button class="btn-primary px-5 py-3" [disabled]="templateForm.invalid">
              {{ editingTemplateId() ? 'Update template' : 'Create template' }}
            </button>

            @if (editingTemplateId()) {
              <button class="rounded-lg border px-5 py-3 font-bold" type="button" (click)="resetTemplateForm()">
                Cancel edit
              </button>
            }
          </form>
        </section>

        <section class="rounded-lg border border-indigo-100 bg-white p-5">
          <h2 class="text-2xl font-black">Template management</h2>

          <div class="mt-5 grid gap-3 md:grid-cols-2">
            @for (template of templates(); track template.templateId) {
              <article class="rounded-lg border p-4">
                <p class="font-black">{{ template.name }}</p>
                <p class="text-sm text-slate-500">
                  {{ template.category }} · {{ template.isPremium ? 'Premium' : 'Free' }} · {{ template.isActive ? 'Active' : 'Inactive' }} · {{ template.usageCount }} uses
                </p>

                <div class="mt-3 flex flex-wrap gap-2">
                  <button class="rounded-lg border px-3 py-2 text-sm font-bold" type="button" (click)="editTemplate(template)">
                    Edit
                  </button>

                  @if (template.isActive) {
                    <button class="rounded-lg border px-3 py-2 text-sm font-bold" type="button" (click)="deactivate(template)">
                      Deactivate
                    </button>
                  } @else {
                    <button class="rounded-lg border px-3 py-2 text-sm font-bold" type="button" (click)="activate(template)">
                      Activate
                    </button>
                  }
                </div>
              </article>
            }
          </div>
        </section>
      </div>

      <section class="rounded-lg border border-indigo-100 bg-white p-5">
        <h2 class="text-2xl font-black">Resume analytics</h2>

        <div class="mt-5 grid gap-4 md:grid-cols-5">
          <article class="rounded-lg border p-4"><p class="text-sm text-slate-500">Public</p><p class="text-2xl font-black">{{ resumeStats()?.publicResumes ?? 0 }}</p></article>
          <article class="rounded-lg border p-4"><p class="text-sm text-slate-500">Draft</p><p class="text-2xl font-black">{{ resumeStats()?.draftResumes ?? 0 }}</p></article>
          <article class="rounded-lg border p-4"><p class="text-sm text-slate-500">Complete</p><p class="text-2xl font-black">{{ resumeStats()?.completeResumes ?? 0 }}</p></article>
          <article class="rounded-lg border p-4"><p class="text-sm text-slate-500">Views</p><p class="text-2xl font-black">{{ resumeStats()?.totalViews ?? 0 }}</p></article>
          <article class="rounded-lg border p-4"><p class="text-sm text-slate-500">Exports</p><p class="text-2xl font-black">{{ exports().length }}</p></article>
        </div>

        <div class="mt-5 grid gap-3">
          @for (resume of resumes(); track resume.resumeId) {
            <article class="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
              <span>
                <strong>{{ resume.title }}</strong>
                <span class="block text-sm text-slate-500">
                  {{ resume.targetJobTitle || 'No target role' }} · {{ resume.status }} · Views {{ resume.viewCount }}
                </span>
              </span>

              <button class="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-600" type="button" (click)="deleteResume(resume)">
                Delete
              </button>
            </article>
          }
        </div>
      </section>

      <div class="grid gap-6 xl:grid-cols-2">
        <section class="rounded-lg border border-indigo-100 bg-white p-5">
          <h2 class="text-2xl font-black">AI usage</h2>

          <div class="mt-5 grid gap-3">
            <p>Total requests: <strong>{{ aiUsage()?.totalRequests ?? 0 }}</strong></p>
            <p>Completed: <strong>{{ aiUsage()?.completedRequests ?? 0 }}</strong></p>
            <p>Failed: <strong>{{ aiUsage()?.failedRequests ?? 0 }}</strong></p>
            <p>Tokens used: <strong>{{ aiUsage()?.totalTokensUsed ?? 0 }}</strong></p>
          </div>

          <div class="mt-5 grid gap-2">
            @for (model of aiUsage()?.byModel || []; track model.model) {
              <p class="rounded-lg border p-3 text-sm">
                <strong>{{ model.model }}</strong> · {{ model.requests }} requests · {{ model.tokensUsed }} tokens
              </p>
            }
          </div>
        </section>

        <section class="rounded-lg border border-indigo-100 bg-white p-5">
          <h2 class="text-2xl font-black">Audit logs</h2>

          <div class="mt-5 grid max-h-96 gap-2 overflow-auto">
            @for (log of auditLogs(); track log.auditId) {
              <article class="rounded-lg border p-3 text-sm">
                <p class="font-black">{{ log.action }}</p>
                <p class="text-slate-500">{{ log.actor }} · {{ log.targetType || '-' }} · {{ log.createdAt | date:'short' }}</p>
                <p class="mt-1">{{ log.details }}</p>
              </article>
            }
          </div>
        </section>
      </div>
    </section>
  `
})
export class AdminPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly templatesApi = inject(TemplateService);
  private readonly exportsApi = inject(ExportService);
  private readonly notificationsApi = inject(NotificationService);
  private readonly resumesApi = inject(ResumeService);
  private readonly aiApi = inject(AiService);

  readonly users = signal<UserResponse[]>([]);
  readonly templates = signal<TemplateResponse[]>([]);
  readonly exports = signal<ExportJobResponse[]>([]);
  readonly resumes = signal<ResumeResponse[]>([]);
  readonly resumeStats = signal<ResumeAdminStatsResponse | null>(null);
  readonly aiUsage = signal<AiAdminUsageResponse | null>(null);
  readonly auditLogs = signal<AuditLogResponse[]>([]);
  readonly editingTemplateId = signal<string | null>(null);

  readonly broadcast = this.fb.nonNullable.group({
    subscriptionPlan: [''],
    title: ['', Validators.required],
    message: ['', Validators.required]
  });

  readonly templateForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    thumbnailUrl: [''],
    htmlLayout: ['', Validators.required],
    cssStyles: ['', Validators.required],
    category: ['PROFESSIONAL', Validators.required],
    isPremium: [false],
    isActive: [true]
  });

  ngOnInit(): void {
    forkJoin({
      users: this.auth.users().pipe(catchError(() => of([] as UserResponse[]))),
      templates: this.templatesApi.adminAll().pipe(catchError(() => of([] as TemplateResponse[]))),
      exports: this.exportsApi.stats().pipe(catchError(() => of([] as ExportJobResponse[]))),
      resumes: this.resumesApi.adminAll().pipe(catchError(() => of([] as ResumeResponse[]))),
      resumeStats: this.resumesApi.adminStats().pipe(catchError(() => of(null))),
      aiUsage: this.aiApi.adminUsage().pipe(catchError(() => of(null))),
      auditLogs: this.auth.auditLogs().pipe(catchError(() => of([] as AuditLogResponse[])))
    }).subscribe((response) => {
      this.users.set(response.users);
      this.templates.set(response.templates);
      this.exports.set(response.exports);
      this.resumes.set(response.resumes);
      this.resumeStats.set(response.resumeStats);
      this.aiUsage.set(response.aiUsage);
      this.auditLogs.set(response.auditLogs);
    });
  }

  toggleUser(user: UserResponse): void {
    (user.isActive ? this.auth.suspendUser(user.userId) : this.auth.reactivateUser(user.userId))
      .subscribe(() => this.ngOnInit());
  }

  deleteUser(user: UserResponse): void {
    this.auth.deleteUser(user.userId).subscribe(() => this.ngOnInit());
  }

  plan(user: UserResponse): void {
    this.auth.adminUpdateSubscription(user.userId, user.subscriptionPlan === 'FREE' ? 'PREMIUM' : 'FREE')
      .subscribe(() => this.ngOnInit());
  }

  sendBroadcast(): void {
    const value = this.broadcast.getRawValue();
    const subscriptionPlan = value.subscriptionPlan as SubscriptionPlan | '';

    this.notificationsApi.bulk({
      ...(subscriptionPlan ? { subscriptionPlan } : {}),
      type: 'PLAN_CHANGE',
      title: value.title,
      message: value.message,
      channel: 'APP'
    }).subscribe(() => this.broadcast.reset());
  }

  saveTemplate(): void {
    const adminUserId = this.auth.currentUser()?.userId || '';
    const value = this.templateForm.getRawValue();
    const templateId = this.editingTemplateId();

    const createRequest = {
      name: value.name,
      description: value.description,
      thumbnailUrl: value.thumbnailUrl,
      htmlLayout: value.htmlLayout,
      cssStyles: value.cssStyles,
      category: value.category as TemplateCategory,
      isPremium: value.isPremium
    };

    const request = templateId
      ? this.templatesApi.update(adminUserId, templateId, { ...createRequest, isActive: value.isActive })
      : this.templatesApi.create(adminUserId, createRequest);

    request.subscribe(() => {
      this.resetTemplateForm();
      this.ngOnInit();
    });
  }

  editTemplate(template: TemplateResponse): void {
    this.editingTemplateId.set(template.templateId);
    this.templateForm.patchValue({
      name: template.name,
      description: template.description || '',
      thumbnailUrl: template.thumbnailUrl || '',
      htmlLayout: template.htmlLayout,
      cssStyles: template.cssStyles,
      category: template.category,
      isPremium: template.isPremium,
      isActive: template.isActive
    });
  }

  resetTemplateForm(): void {
    this.editingTemplateId.set(null);
    this.templateForm.reset({
      name: '',
      description: '',
      thumbnailUrl: '',
      htmlLayout: '',
      cssStyles: '',
      category: 'PROFESSIONAL',
      isPremium: false,
      isActive: true
    });
  }

  activate(template: TemplateResponse): void {
    const adminUserId = this.auth.currentUser()?.userId || '';
    this.templatesApi.activate(adminUserId, template.templateId).subscribe(() => this.ngOnInit());
  }

  deactivate(template: TemplateResponse): void {
    const adminUserId = this.auth.currentUser()?.userId || '';
    this.templatesApi.deactivate(adminUserId, template.templateId).subscribe(() => this.ngOnInit());
  }

  deleteResume(resume: ResumeResponse): void {
    this.resumesApi.adminDelete(resume.resumeId).subscribe(() => this.ngOnInit());
  }
}
