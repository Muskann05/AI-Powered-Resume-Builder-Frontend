import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { AiService } from '../../core/services/domain.services';
import { AiResponseDto, AtsCheckResponse, QuotaResponse } from '../../shared/models/api.models';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="grid gap-6 xl:grid-cols-[420px_1fr]">
      <form class="rounded-lg border border-indigo-100 bg-white p-5" [formGroup]="form">
        <h1 class="text-2xl font-black">AI tools</h1>
        <p class="mt-2 text-sm text-slate-600">Summary, bullets, section improvement, ATS, skills, tailoring, cover letters, and translation.</p>
        <div class="mt-5 grid gap-3">
          <input class="field" formControlName="resumeId" placeholder="Resume ID" />
          <input class="field" formControlName="jobTitle" placeholder="Job title" />
          <input class="field" formControlName="companyName" placeholder="Company name" />
          <input class="field" formControlName="yearsOfExperience" placeholder="Years of experience" />
          <textarea class="field min-h-32" formControlName="content" placeholder="Resume text, responsibilities, or section content"></textarea>
          <textarea class="field min-h-32" formControlName="jobDescription" placeholder="Job description"></textarea>
          <input class="field" formControlName="targetLanguage" placeholder="Target language" />
        </div>
        <div class="mt-5 grid grid-cols-2 gap-2">
          @for (action of actions; track action.key) { <button class="rounded-lg border px-3 py-2 text-sm font-bold hover:bg-indigo-50" type="button" (click)="run(action.key)">{{ action.label }}</button> }
        </div>
      </form>
      <section class="grid gap-6">
        <div class="rounded-lg border border-indigo-100 bg-white p-5">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-xl font-black">Quota</h2>
            <span class="rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-700">{{ quota()?.premium ? 'Premium' : 'Free' }}</span>
          </div>
          <div class="mt-4 grid gap-4 md:grid-cols-2">
            <div class="rounded-lg bg-slate-50 p-4"><p class="text-sm font-bold text-slate-500">Content calls</p><p class="text-3xl font-black">{{ quota()?.remainingContentCalls ?? 0 }}</p></div>
            <div class="rounded-lg bg-slate-50 p-4"><p class="text-sm font-bold text-slate-500">ATS checks</p><p class="text-3xl font-black">{{ quota()?.remainingAtsChecks ?? 0 }}</p></div>
          </div>
        </div>
        <div class="rounded-lg border border-indigo-100 bg-white p-5">
          <h2 class="text-xl font-black">Result</h2>
          <pre class="mt-4 min-h-48 whitespace-pre-wrap rounded-lg bg-slate-950 p-4 text-sm text-white">{{ result() }}</pre>
        </div>
        <div class="rounded-lg border border-indigo-100 bg-white p-5">
          <h2 class="text-xl font-black">AI history</h2>
          <div class="mt-4 grid gap-3">
            @for (item of history(); track item.requestId) {
              <article class="rounded-lg bg-slate-50 p-3"><p class="font-bold">{{ item.requestType }} · {{ item.status }}</p><p class="line-clamp-2 text-sm text-slate-600">{{ item.aiResponse }}</p></article>
            } @empty { <p class="text-sm text-slate-500">No AI requests yet.</p> }
          </div>
        </div>
      </section>
    </section>
  `
})
export class AiToolsPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly ai = inject(AiService);
  readonly result = signal('');
  readonly history = signal<AiResponseDto[]>([]);
  readonly quota = signal<QuotaResponse | null>(null);
  readonly actions = [
    { key: 'summary', label: 'Generate Summary' }, { key: 'bullets', label: 'Generate Bullets' }, { key: 'improve', label: 'Improve Section' }, { key: 'skills', label: 'Suggest Skills' },
    { key: 'ats', label: 'ATS Check' }, { key: 'tailor', label: 'Tailor Resume' }, { key: 'cover', label: 'Cover Letter' }, { key: 'translate', label: 'Translate' }
  ];
  readonly form = this.fb.nonNullable.group({
    resumeId: [''], jobTitle: ['', Validators.required], companyName: [''], yearsOfExperience: ['3'], content: ['', Validators.required], jobDescription: [''], targetLanguage: ['Spanish']
  });
  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (!user) return;
    forkJoin({ history: this.ai.history(user.userId).pipe(catchError(() => of([]))), quota: this.ai.quota(user.userId, user.subscriptionPlan === 'PREMIUM').pipe(catchError(() => of(null))) }).subscribe(({ history, quota }) => { this.history.set(history); this.quota.set(quota); });
  }
  run(key: string): void {
    const userId = this.auth.currentUser()?.userId;
    if (!userId) return;
    const v = this.form.getRawValue();
    const handle = (value: AiResponseDto | AtsCheckResponse) => this.result.set('aiResponse' in value ? value.aiResponse : JSON.stringify(value, null, 2));
    const reqs: Record<string, ReturnType<AiService['generateSummary']>> = {
      summary: this.ai.generateSummary({ userId, resumeId: v.resumeId, jobTitle: v.jobTitle, yearsOfExperience: v.yearsOfExperience, keySkills: v.content }),
      bullets: this.ai.generateBullets({ userId, resumeId: v.resumeId, jobRole: v.jobTitle, companyName: v.companyName || 'Company', responsibilities: v.content }),
      improve: this.ai.improveSection({ userId, resumeId: v.resumeId, sectionName: v.jobTitle, currentContent: v.content }),
      skills: this.ai.suggestSkills({ userId, targetJobTitle: v.jobTitle }),
      tailor: this.ai.tailorResume({ userId, resumeId: v.resumeId, resumeJson: v.content, jobDescription: v.jobDescription || v.content }),
      cover: this.ai.coverLetter({ userId, resumeId: v.resumeId, jobDescription: v.jobDescription || v.content, applicantName: this.auth.currentUser()?.fullName || 'Applicant' }),
      translate: this.ai.translate({ userId, resumeId: v.resumeId, resumeText: v.content, targetLanguage: v.targetLanguage }),
      ats: this.ai.checkAts({ userId, resumeId: v.resumeId, resumeText: v.content, jobDescription: v.jobDescription || v.content }) as never
    };
    reqs[key].pipe(catchError((error) => of({ aiResponse: error.message } as AiResponseDto))).subscribe(handle);
  }
}
