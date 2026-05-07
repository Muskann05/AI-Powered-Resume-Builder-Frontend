import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { AiService, ExportService, ResumeService, SectionService, TemplateService } from '../../core/services/domain.services';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { SectionResponse, SectionType, TemplateResponse, ResumeResponse } from '../../shared/models/api.models';

const sectionTypes: SectionType[] = ['SUMMARY', 'EXPERIENCE', 'EDUCATION', 'SKILLS', 'CERTIFICATIONS', 'PROJECTS', 'LANGUAGES', 'VOLUNTEER', 'CUSTOM'];

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="grid h-[calc(100vh-112px)] gap-4 xl:grid-cols-[280px_minmax(360px,1fr)_420px]">
      <aside class="overflow-auto rounded-lg border border-indigo-100 bg-white p-4">
        <h1 class="text-xl font-black">Sections</h1>
        <select class="field mt-4" (change)="addSection($any($event.target).value)">
          <option value="">Add section</option>
          @for (type of sectionTypes; track type) { <option [value]="type">{{ type }}</option> }
        </select>
        <div class="mt-4 grid gap-2">
          @for (section of sections(); track section.sectionId) {
            <button class="rounded-lg border p-3 text-left hover:bg-indigo-50" draggable="true" (dragstart)="dragged.set(section.sectionId)" (dragover)="$event.preventDefault()" (drop)="dropOn(section.sectionId)" [class.border-indigo-500]="activeSection().sectionId === section.sectionId" (click)="select(section)">
              <div class="flex items-center justify-between gap-2">
                <span class="text-sm font-black">{{ section.title }}</span>
                <span class="text-xs">{{ section.isVisible ? 'Visible' : 'Hidden' }}</span>
              </div>
              <p class="mt-1 text-xs text-slate-500">{{ section.sectionType }}</p>
            </button>
          }
        </div>
      </aside>
      <main class="overflow-auto rounded-lg border border-indigo-100 bg-white p-5">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <div><p class="text-xs font-bold uppercase text-indigo-700">Auto-save {{ saving() ? 'saving' : 'ready' }}</p><h2 class="text-2xl font-black">{{ resume()?.title || 'Resume builder' }}</h2></div>
          <div class="flex flex-wrap gap-2">
            <select class="field w-48" [value]="resume()?.templateId || ''" (change)="switchTemplate($any($event.target).value)">
              @for (template of templates(); track template.templateId) { <option [value]="template.templateId">{{ template.name }}</option> }
            </select>
            <button class="rounded-lg border px-3 py-2 text-sm font-bold" type="button" (click)="togglePublish()">{{ resume()?.isPublic ? 'Unpublish' : 'Publish' }}</button>
            <button class="btn-primary px-3 py-2 text-sm" type="button" (click)="export('PDF')">PDF</button>
            <button class="btn-primary px-3 py-2 text-sm" type="button" (click)="export('DOCX')">DOCX</button>
          </div>
        </div>
        @if (activeSection(); as section) {
          <form class="mt-5 grid gap-4" [formGroup]="editor" (ngSubmit)="saveSection()">
            <select class="field" formControlName="sectionType">@for (type of sectionTypes; track type) { <option [value]="type">{{ type }}</option> }</select>
            <input class="field" formControlName="title" placeholder="Section title" />
            <textarea class="field min-h-72" formControlName="content" placeholder="Section content"></textarea>
            <label class="flex items-center gap-2 text-sm font-bold"><input type="checkbox" formControlName="isVisible" /> Visible</label>
            <div class="flex flex-wrap gap-2">
              <button class="btn-primary px-5 py-3" [disabled]="editor.invalid">Save section</button>
              <button class="rounded-lg border px-5 py-3 font-bold" type="button" (click)="improve()">Improve with AI</button>
              <button class="rounded-lg border border-red-200 px-5 py-3 font-bold text-red-700" type="button" (click)="deleteSection(section.sectionId)">Delete</button>
            </div>
          </form>
        } @else {
          <div class="mt-8 rounded-lg bg-slate-50 p-8 text-center text-slate-600">Choose or add a section to start editing.</div>
        }
      </main>
      <aside class="overflow-auto rounded-lg border border-indigo-100 bg-slate-100 p-4">
        <div class="mb-4 grid grid-cols-3 gap-2">
          <div class="rounded-lg bg-white p-3 text-center"><p class="text-xs font-bold text-slate-500">ATS</p><p class="text-2xl font-black text-indigo-700">{{ resume()?.atsScore || 0 }}</p></div>
          <div class="rounded-lg bg-white p-3 text-center"><p class="text-xs font-bold text-slate-500">Sections</p><p class="text-2xl font-black">{{ sections().length }}</p></div>
          <div class="rounded-lg bg-white p-3 text-center"><p class="text-xs font-bold text-slate-500">AI</p><p class="text-2xl font-black">{{ aiCount() }}</p></div>
        </div>
        <article class="min-h-[760px] bg-white p-8 shadow-xl" [style.color]="previewColor()" [style.fontFamily]="previewFont()">
          <h1 class="text-3xl font-black">{{ resume()?.title || 'Untitled Resume' }}</h1>
          <p class="mt-1 text-indigo-700">{{ resume()?.targetJobTitle }}</p>
          <div class="mt-8 grid gap-6">
            @for (section of visibleSections(); track section.sectionId) {
              <section><h2 class="border-b pb-1 text-sm font-black uppercase">{{ section.title }}</h2><p class="mt-3 whitespace-pre-line text-sm leading-6">{{ section.content }}</p></section>
            }
          </div>
        </article>
        <div class="mt-4 grid grid-cols-2 gap-2">
          <select class="field" [value]="previewFont()" (change)="previewFont.set($any($event.target).value)"><option>Inter</option><option>Georgia</option><option>Arial</option></select>
          <input class="field" type="color" [value]="previewColor()" (input)="previewColor.set($any($event.target).value)" />
        </div>
      </aside>
    </section>
  `
})
export class BuilderPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly resumesApi = inject(ResumeService);
  private readonly sectionsApi = inject(SectionService);
  private readonly templatesApi = inject(TemplateService);
  private readonly aiApi = inject(AiService);
  private readonly exportApi = inject(ExportService);
  private readonly toast = inject(ToastService);
  readonly sectionTypes = sectionTypes;
  readonly resume = signal<ResumeResponse | null>(null);
  readonly sections = signal<SectionResponse[]>([]);
  readonly templates = signal<TemplateResponse[]>([]);
  readonly selectedId = signal<string | null>(null);
  readonly dragged = signal<string | null>(null);
  readonly saving = signal(false);
  readonly previewFont = signal('Inter');
  readonly previewColor = signal('#0b1c30');
  readonly activeSection = computed(() => this.sections().find((section) => section.sectionId === this.selectedId()) || this.sections()[0] || null);
  readonly visibleSections = computed(() => this.sections().filter((section) => section.isVisible).sort((a, b) => a.displayOrder - b.displayOrder));
  readonly aiCount = computed(() => this.sections().filter((section) => section.aiGenerated).length);
  readonly editor = this.fb.nonNullable.group({ sectionType: ['SUMMARY' as SectionType, Validators.required], title: ['', Validators.required], content: ['', Validators.required], displayOrder: [0], isVisible: [true], aiGenerated: [false] });

  ngOnInit(): void {
    const resumeId = this.route.snapshot.paramMap.get('id');
    const userId = this.auth.currentUser()?.userId;
    if (!resumeId && userId) {
      this.resumesApi.byUser(userId).pipe(catchError(() => of([]))).subscribe((resumes) => {
        if (resumes[0]) this.load(resumes[0].resumeId);
      });
    } else if (resumeId) {
      this.load(resumeId);
    }
  }
  load(resumeId: string): void {
    forkJoin({ resume: this.resumesApi.get(resumeId).pipe(catchError(() => of(null))), sections: this.sectionsApi.byResume(resumeId).pipe(catchError(() => of([]))), templates: this.templatesApi.all().pipe(catchError(() => of([]))) }).subscribe(({ resume, sections, templates }) => {
      this.resume.set(resume);
      this.sections.set(sections.sort((a, b) => a.displayOrder - b.displayOrder));
      this.templates.set(templates);
      if (sections[0]) this.select(sections[0]);
    });
  }
  select(section: SectionResponse): void {
    this.selectedId.set(section.sectionId);
    this.editor.patchValue(section);
  }
  addSection(sectionType: SectionType | ''): void {
    const resumeId = this.resume()?.resumeId;
    if (!resumeId || !sectionType) return;
    this.sectionsApi.create({ resumeId, sectionType, title: sectionType.replace('_', ' '), content: '', displayOrder: this.sections().length + 1, isVisible: true, aiGenerated: false }).subscribe((section) => { this.sections.update((items) => [...items, section]); this.select(section); });
  }
  saveSection(): void {
    const active = this.activeSection();
    if (!active || this.editor.invalid) return;
    this.saving.set(true);
    this.sectionsApi.update(active.sectionId, this.editor.getRawValue()).subscribe((updated) => {
      this.sections.update((items) => items.map((item) => item.sectionId === updated.sectionId ? updated : item));
      this.saving.set(false);
      this.toast.show('Section saved.', 'success');
    });
  }
  deleteSection(sectionId: string): void { this.sectionsApi.delete(sectionId).subscribe(() => this.sections.update((items) => items.filter((item) => item.sectionId !== sectionId))); }
  dropOn(targetId: string): void {
    const sourceId = this.dragged();
    const resumeId = this.resume()?.resumeId;
    if (!sourceId || !resumeId || sourceId === targetId) return;
    const items = [...this.sections()];
    const source = items.findIndex((item) => item.sectionId === sourceId);
    const target = items.findIndex((item) => item.sectionId === targetId);
    const [moved] = items.splice(source, 1);
    items.splice(target, 0, moved);
    const request = items.map((item, index) => ({ sectionId: item.sectionId, displayOrder: index + 1 }));
    this.sectionsApi.reorder(resumeId, request).subscribe((sections) => this.sections.set(sections));
  }
  improve(): void {
    const userId = this.auth.currentUser()?.userId;
    const section = this.activeSection();
    if (!userId || !section) return;
    this.aiApi.improveSection({ userId, resumeId: section.resumeId, sectionName: section.title, currentContent: section.content }).subscribe((response) => this.editor.patchValue({ content: response.aiResponse, aiGenerated: true }));
  }
  switchTemplate(templateId: string): void {
    const resume = this.resume();
    if (!resume) return;
    this.resumesApi.update(resume.resumeId, { title: resume.title, targetJobTitle: resume.targetJobTitle || '', templateId, language: resume.language || 'en', status: resume.status }).subscribe((updated) => this.resume.set(updated));
  }
  togglePublish(): void {
    const resume = this.resume();
    if (!resume) return;
    (resume.isPublic ? this.resumesApi.unpublish(resume.resumeId) : this.resumesApi.publish(resume.resumeId)).subscribe((updated) => this.resume.set(updated));
  }
  export(format: 'PDF' | 'DOCX' | 'JSON'): void {
    const resume = this.resume();
    const userId = this.auth.currentUser()?.userId;
    if (!resume || !userId) return;
    this.exportApi.submit({ resumeId: resume.resumeId, userId, format, templateId: resume.templateId, customizations: JSON.stringify({ font: this.previewFont(), color: this.previewColor() }), resumeDataJson: JSON.stringify({ resume, sections: this.sections() }) }).subscribe(() => this.toast.show(`${format} export queued.`, 'success'));
  }
}
