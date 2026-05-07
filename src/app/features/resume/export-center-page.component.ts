import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ExportService } from '../../core/services/domain.services';
import { ExportJobResponse } from '../../shared/models/api.models';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="rounded-lg border border-indigo-100 bg-white p-5">
      <h1 class="text-2xl font-black">Export center</h1>
      <div class="mt-5 grid gap-3">
        @for (job of exports(); track job.jobId) {
          <article class="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
            <div><p class="font-black">{{ job.format }} · {{ job.status }}</p><p class="text-sm text-slate-600">{{ job.requestedAt }} · {{ job.fileSizeKb || 0 }} KB</p></div>
            <button class="btn-primary px-4 py-2 text-sm" type="button" [disabled]="job.status !== 'COMPLETED'" (click)="download(job)">Download</button>
          </article>
        } @empty { <p class="text-sm text-slate-500">Exports submitted from the builder will appear here.</p> }
      </div>
    </section>
  `
})
export class ExportCenterPageComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly api = inject(ExportService);
  readonly exports = signal<ExportJobResponse[]>([]);
  ngOnInit(): void {
    const userId = this.auth.currentUser()?.userId;
    if (!userId) return;
    this.api.byUser(userId).pipe(catchError(() => of([]))).subscribe((exports) => this.exports.set(exports));
  }
  download(job: ExportJobResponse): void {
    const userId = this.auth.currentUser()?.userId;
    if (!userId) return;
    this.api.downloadLink(job.jobId, userId).subscribe((link) => window.open(link.downloadUrl, '_blank'));
  }
}
