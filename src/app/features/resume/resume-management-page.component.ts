import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ResumeService, TemplateService } from '../../core/services/domain.services';
import { ToastService } from '../../core/services/toast.service';
import { ResumeResponse, TemplateResponse } from '../../shared/models/api.models';
import { EmptyStateComponent } from '../../shared/components/ui.components';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, EmptyStateComponent],
  template: `
    <section class="grid gap-6 xl:grid-cols-[380px_1fr]">
      <form class="rounded-lg border border-indigo-100 bg-white p-5" [formGroup]="form" (ngSubmit)="create()">
        <h1 class="text-2xl font-black">Create resume</h1>
        <div class="mt-5 grid gap-4">
          <input class="field" formControlName="title" placeholder="Resume title" />
          <input class="field" formControlName="targetJobTitle" placeholder="Target job title" />
          <select class="field" formControlName="templateId">
            <option value="">Select template</option>
            @for (template of templates(); track template.templateId) { <option [value]="template.templateId">{{ template.name }}</option> }
          </select>
          <input class="field" formControlName="language" placeholder="Language" />
        </div>
        <button class="btn-primary mt-5 w-full px-5 py-3" [disabled]="form.invalid">Create</button>
      </form>
      <section class="rounded-lg border border-indigo-100 bg-white p-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-2xl font-black">Resume management</h2>
          <input class="field max-w-xs" placeholder="Search/filter/sort" [value]="query()" (input)="query.set($any($event.target).value)" />
        </div>
        @if (!filtered().length) { <app-empty-state class="mt-5 block" title="No matching resumes" message="Create or adjust search to see resumes." /> }
        @else {
          <div class="mt-5 grid gap-3">
            @for (resume of filtered(); track resume.resumeId) {
              <article class="rounded-lg border p-4">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div><h3 class="font-black">{{ resume.title }}</h3><p class="text-sm text-slate-600">{{ resume.targetJobTitle || 'General' }} · {{ resume.status }} · {{ resume.isPublic ? 'Public' : 'Private' }}</p></div>
                  <div class="flex flex-wrap gap-2">
                    <a class="rounded-lg border px-3 py-2 text-sm font-bold" [routerLink]="['/builder', resume.resumeId]">Edit</a>
                    <button class="rounded-lg border px-3 py-2 text-sm font-bold" type="button" (click)="duplicate(resume.resumeId)">Duplicate</button>
                    <button class="rounded-lg border px-3 py-2 text-sm font-bold" type="button" (click)="togglePublish(resume)">{{ resume.isPublic ? 'Unpublish' : 'Publish' }}</button>
                    <button class="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700" type="button" (click)="remove(resume.resumeId)">Delete</button>
                  </div>
                </div>
              </article>
            }
          </div>
        }
      </section>
    </section>
  `
})
export class ResumeManagementPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly resumesApi = inject(ResumeService);
  private readonly templatesApi = inject(TemplateService);
  private readonly toast = inject(ToastService);
  readonly resumes = signal<ResumeResponse[]>([]);
  readonly templates = signal<TemplateResponse[]>([]);
  readonly query = signal('');
  readonly filtered = computed(() => {
    const term = this.query().toLowerCase();
    return this.resumes().filter((resume) => `${resume.title} ${resume.targetJobTitle} ${resume.status}`.toLowerCase().includes(term)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  });
  readonly form = this.fb.nonNullable.group({ title: ['', Validators.required], targetJobTitle: [''], templateId: ['', Validators.required], language: ['en'] });

  ngOnInit(): void { this.reload(); }
  reload(): void {
    const userId = this.auth.currentUser()?.userId;
    if (!userId) return;
    forkJoin({ resumes: this.resumesApi.byUser(userId).pipe(catchError(() => of([]))), templates: this.templatesApi.all().pipe(catchError(() => of([]))) }).subscribe(({ resumes, templates }) => {
      this.resumes.set(resumes);
      this.templates.set(templates);
    });
  }
  create(): void {
    const userId = this.auth.currentUser()?.userId;
    if (!userId || this.form.invalid) return;
    this.resumesApi.create({ ...this.form.getRawValue(), userId }).subscribe((resume) => { this.resumes.update((items) => [resume, ...items]); this.toast.show('Resume created.', 'success'); });
  }
  duplicate(resumeId: string): void { this.resumesApi.duplicate(resumeId).subscribe((resume) => this.resumes.update((items) => [resume, ...items])); }
  togglePublish(resume: ResumeResponse): void { (resume.isPublic ? this.resumesApi.unpublish(resume.resumeId) : this.resumesApi.publish(resume.resumeId)).subscribe((updated) => this.resumes.update((items) => items.map((item) => item.resumeId === updated.resumeId ? updated : item))); }
  remove(resumeId: string): void { if (confirm('Delete this resume?')) this.resumesApi.delete(resumeId).subscribe(() => this.resumes.update((items) => items.filter((item) => item.resumeId !== resumeId))); }
}
