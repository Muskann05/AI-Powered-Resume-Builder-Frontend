import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { JobMatchService, ResumeService } from '../../core/services/domain.services';
import { JobMatchResponse, ResumeResponse } from '../../shared/models/api.models';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="grid gap-6 xl:grid-cols-[380px_1fr]">
      <form class="rounded-lg border border-indigo-100 bg-white p-5" [formGroup]="form">
        <h1 class="text-2xl font-black">Job match</h1>
        <div class="mt-5 grid gap-3">
          <select class="field" formControlName="resumeId">@for (resume of resumes(); track resume.resumeId) { <option [value]="resume.resumeId">{{ resume.title }}</option> }</select>
          <input class="field" formControlName="jobTitle" placeholder="Job title" />
          <input class="field" formControlName="location" placeholder="Location" />
          <textarea class="field min-h-40" formControlName="jobDescription" placeholder="Paste job description"></textarea>
        </div>
        <div class="mt-5 grid gap-2">
          <button class="btn-primary px-5 py-3" type="button" (click)="analyze()">Analyze manual job</button>
          <button class="rounded-lg border px-5 py-3 font-bold" type="button" (click)="fetch()">Fetch LinkedIn jobs</button>
        </div>
      </form>
      <section class="rounded-lg border border-indigo-100 bg-white p-5">
        <h2 class="text-2xl font-black">Matches</h2>
        <div class="mt-5 grid gap-4">
          @for (match of matches(); track match.matchId) {
            <article class="rounded-lg border p-4">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div><h3 class="text-lg font-black">{{ match.jobTitle }}</h3><p class="text-sm text-slate-600">{{ match.companyName || 'Manual job' }} · {{ match.location }} · {{ match.source }}</p></div>
                <span class="rounded-full bg-indigo-50 px-3 py-1 text-sm font-black text-indigo-700">{{ match.matchScore }}%</span>
              </div>
              <p class="mt-3 text-sm text-slate-600">{{ match.recommendations }}</p>
              <div class="mt-3 flex flex-wrap gap-2">
                @for (skill of split(match.missingSkills); track skill) { <span class="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">{{ skill }}</span> }
              </div>
              <button class="mt-4 rounded-lg border px-3 py-2 text-sm font-bold" type="button" (click)="bookmark(match)">{{ match.isBookmarked ? 'Unbookmark' : 'Bookmark' }}</button>
            </article>
          } @empty { <p class="text-sm text-slate-500">Run a match analysis or fetch jobs to populate this list.</p> }
        </div>
      </section>
    </section>
  `
})
export class JobMatchPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly resumesApi = inject(ResumeService);
  private readonly jobsApi = inject(JobMatchService);
  readonly resumes = signal<ResumeResponse[]>([]);
  readonly matches = signal<JobMatchResponse[]>([]);
  readonly form = this.fb.nonNullable.group({ resumeId: ['', Validators.required], jobTitle: ['', Validators.required], location: ['Remote'], jobDescription: ['', Validators.required] });
  ngOnInit(): void {
    const userId = this.auth.currentUser()?.userId;
    if (!userId) return;
    this.resumesApi.byUser(userId).pipe(catchError(() => of([]))).subscribe((resumes) => { this.resumes.set(resumes); if (resumes[0]) this.form.patchValue({ resumeId: resumes[0].resumeId }); });
    this.jobsApi.byUser(userId).pipe(catchError(() => of([]))).subscribe((matches) => this.matches.set(matches));
  }
  analyze(): void {
    const userId = this.auth.currentUser()?.userId;
    if (!userId || this.form.invalid) return;
    const v = this.form.getRawValue();
    this.jobsApi.analyze({ resumeId: v.resumeId, userId, jobTitle: v.jobTitle, jobDescription: v.jobDescription }).subscribe((match) => this.matches.update((items) => [match, ...items]));
  }
  fetch(): void {
    const userId = this.auth.currentUser()?.userId;
    if (!userId) return;
    const v = this.form.getRawValue();
    this.jobsApi.fetchLinkedIn({ resumeId: v.resumeId, userId, title: v.jobTitle, location: v.location, limit: 10 }).subscribe((matches) => this.matches.set(matches));
  }
  bookmark(match: JobMatchResponse): void { this.jobsApi.bookmark(match.matchId, !match.isBookmarked).subscribe((updated) => this.matches.update((items) => items.map((item) => item.matchId === updated.matchId ? updated : item))); }
  split(value?: string | null): string[] { return (value || '').split(',').map((item) => item.trim()).filter(Boolean); }
}
