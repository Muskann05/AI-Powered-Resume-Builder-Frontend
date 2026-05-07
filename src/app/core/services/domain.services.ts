import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  AiAdminUsageResponse,
  AiResponseDto,
  AnalyzeJobFitRequest,
  AtsCheckResponse,
  BulkNotificationRequest,
  BulkUpdateSectionsRequest,
  CreateNotificationRequest,
  CreatePaymentOrderResponse,
  CreateResumeRequest,
  CreateSectionRequest,
  CreateTemplateRequest,
  DownloadLinkResponse,
  ExportJobResponse,
  ExportRequest,
  JobFitResponse,
  JobMatchResponse,
  JobSearchRequest,
  NotificationResponse,
  PaymentVerifyResponse,
  QuotaResponse,
  ReorderSectionsRequest,
  ResumeAdminStatsResponse,
  ResumeResponse,
  SectionResponse,
  SubscriptionPlan,
  TailoringRecommendationsResponse,
  TemplateCategory,
  TemplateResponse,
  UnreadCountResponse,
  UpdateResumeRequest,
  UpdateSectionRequest,
  UpdateTemplateRequest,
  VerifyPaymentRequest
} from '../../shared/models/api.models';
import { ApiUrlService } from './api-url.service';

@Injectable({ providedIn: 'root' })
export class ResumeService {
  constructor(private http: HttpClient, private api: ApiUrlService) {}

  create(request: CreateResumeRequest) {
    return this.http.post<ResumeResponse>(this.api.url('/resumes'), request);
  }

  duplicate(resumeId: string) {
    return this.http.post<ResumeResponse>(this.api.url(`/resumes/${resumeId}/duplicate`), {});
  }

  get(resumeId: string) {
    return this.http.get<ResumeResponse>(this.api.url(`/resumes/${resumeId}`));
  }

  byUser(userId: string) {
    return this.http.get<ResumeResponse[]>(this.api.url(`/resumes/user/${userId}`));
  }

  adminAll() {
    return this.http.get<ResumeResponse[]>(this.api.url('/resumes/admin/all'));
  }

  adminStats() {
    return this.http.get<ResumeAdminStatsResponse>(this.api.url('/resumes/admin/stats'));
  }

  adminDelete(resumeId: string) {
    return this.http.delete(this.api.url(`/resumes/admin/${resumeId}`));
  }

  publicResumes() {
    return this.http.get<ResumeResponse[]>(this.api.url('/resumes/public'));
  }

  searchPublic(keyword: string) {
    return this.http.get<ResumeResponse[]>(this.api.url('/resumes/public/search'), {
      params: { keyword }
    });
  }

  publicResume(resumeId: string) {
    return this.http.get<ResumeResponse>(this.api.url(`/resumes/public/${resumeId}`));
  }

  update(resumeId: string, request: UpdateResumeRequest) {
    return this.http.put<ResumeResponse>(this.api.url(`/resumes/${resumeId}`), request);
  }

  publish(resumeId: string) {
    return this.http.put<ResumeResponse>(this.api.url(`/resumes/${resumeId}/publish`), {});
  }

  unpublish(resumeId: string) {
    return this.http.put<ResumeResponse>(this.api.url(`/resumes/${resumeId}/unpublish`), {});
  }

  updateAtsScore(resumeId: string, atsScore: number) {
    return this.http.put<ResumeResponse>(this.api.url(`/resumes/${resumeId}/ats-score`), { atsScore });
  }

  incrementView(resumeId: string) {
    return this.http.put<ResumeResponse>(this.api.url(`/resumes/${resumeId}/view`), {});
  }

  delete(resumeId: string) {
    return this.http.delete(this.api.url(`/resumes/${resumeId}`));
  }
}

@Injectable({ providedIn: 'root' })
export class SectionService {
  constructor(private http: HttpClient, private api: ApiUrlService) {}

  create(request: CreateSectionRequest) {
    return this.http.post<SectionResponse>(this.api.url('/sections'), request);
  }

  clone(sourceResumeId: string, targetResumeId: string) {
    return this.http.post(this.api.url(`/sections/resume/${sourceResumeId}/clone/${targetResumeId}`), {});
  }

  byResume(resumeId: string) {
    return this.http.get<SectionResponse[]>(this.api.url(`/sections/resume/${resumeId}`));
  }

  byType(resumeId: string, sectionType: string) {
    return this.http.get<SectionResponse[]>(this.api.url(`/sections/resume/${resumeId}/type/${sectionType}`));
  }

  get(sectionId: string) {
    return this.http.get<SectionResponse>(this.api.url(`/sections/${sectionId}`));
  }

  update(sectionId: string, request: UpdateSectionRequest) {
    return this.http.put<SectionResponse>(this.api.url(`/sections/${sectionId}`), request);
  }

  reorder(resumeId: string, request: ReorderSectionsRequest[]) {
    return this.http.put<SectionResponse[]>(this.api.url(`/sections/resume/${resumeId}/reorder`), request);
  }

  visibility(sectionId: string, isVisible: boolean) {
    return this.http.put<SectionResponse>(this.api.url(`/sections/${sectionId}/visibility`), { isVisible });
  }

  bulk(request: BulkUpdateSectionsRequest) {
    return this.http.put<SectionResponse[]>(this.api.url('/sections/bulk'), request);
  }

  delete(sectionId: string) {
    return this.http.delete(this.api.url(`/sections/${sectionId}`));
  }
}

@Injectable({ providedIn: 'root' })
export class TemplateService {
  constructor(private http: HttpClient, private api: ApiUrlService) {}

  create(adminUserId: string, request: CreateTemplateRequest) {
    return this.http.post<TemplateResponse>(this.api.url('/templates'), request, {
      params: { adminUserId }
    });
  }

  all() {
    return this.http.get<TemplateResponse[]>(this.api.url('/templates'));
  }

  adminAll() {
    return this.http.get<TemplateResponse[]>(this.api.url('/templates/admin/all'));
  }

  free() {
    return this.http.get<TemplateResponse[]>(this.api.url('/templates/free'));
  }

  premium() {
    return this.http.get<TemplateResponse[]>(this.api.url('/templates/premium'));
  }

  popular() {
    return this.http.get<TemplateResponse[]>(this.api.url('/templates/popular'));
  }

  byCategory(category: TemplateCategory) {
    return this.http.get<TemplateResponse[]>(this.api.url(`/templates/category/${category}`));
  }

  get(templateId: string) {
    return this.http.get<TemplateResponse>(this.api.url(`/templates/${templateId}`));
  }

  preview(templateId: string) {
    return this.http.get<TemplateResponse>(this.api.url(`/templates/${templateId}/preview`));
  }

  previewHtml(templateId: string) {
    return this.http.get(this.api.url(`/templates/${templateId}/preview/html`), {
      responseType: 'text'
    });
  }

  update(adminUserId: string, templateId: string, request: UpdateTemplateRequest) {
    return this.http.put<TemplateResponse>(this.api.url(`/templates/${templateId}`), request, {
      params: { adminUserId }
    });
  }

  activate(adminUserId: string, templateId: string) {
    return this.http.put<TemplateResponse>(this.api.url(`/templates/${templateId}/activate`), {}, {
      params: { adminUserId }
    });
  }

  deactivate(adminUserId: string, templateId: string) {
    return this.http.put<TemplateResponse>(this.api.url(`/templates/${templateId}/deactivate`), {}, {
      params: { adminUserId }
    });
  }
}

@Injectable({ providedIn: 'root' })
export class AiService {
  constructor(private http: HttpClient, private api: ApiUrlService) {}

  generateSummary(request: { userId: string; resumeId?: string; jobTitle: string; yearsOfExperience: string; keySkills: string }) {
    return this.http.post<AiResponseDto>(this.api.url('/ai/generate-summary'), request);
  }

  generateBullets(request: { userId: string; resumeId?: string; jobRole: string; companyName: string; responsibilities: string }) {
    return this.http.post<AiResponseDto>(this.api.url('/ai/generate-bullets'), request);
  }

  coverLetter(request: { userId: string; resumeId?: string; jobDescription: string; applicantName: string }) {
    return this.http.post<AiResponseDto>(this.api.url('/ai/generate-cover-letter'), request);
  }

  improveSection(request: { userId: string; resumeId?: string; sectionName: string; currentContent: string }) {
    return this.http.post<AiResponseDto>(this.api.url('/ai/improve-section'), request);
  }

  checkAts(request: { userId: string; resumeId?: string; resumeText: string; jobDescription: string }) {
    return this.http.post<AtsCheckResponse>(this.api.url('/ai/check-ats'), request);
  }

  suggestSkills(request: { userId: string; targetJobTitle: string }) {
    return this.http.post<AiResponseDto>(this.api.url('/ai/suggest-skills'), request);
  }

  tailorResume(request: { userId: string; resumeId?: string; resumeJson: string; jobDescription: string }) {
    return this.http.post<AiResponseDto>(this.api.url('/ai/tailor-resume'), request);
  }

  translate(request: { userId: string; resumeId?: string; resumeText: string; targetLanguage: string }) {
    return this.http.post<AiResponseDto>(this.api.url('/ai/translate'), request);
  }

  jobFit(request: { userId: string; resumeId: string; resumeContent: string; jobTitle: string; jobDescription: string }) {
    return this.http.post<JobFitResponse>(this.api.url('/ai/job-fit'), request);
  }

  history(userId: string) {
    return this.http.get<AiResponseDto[]>(this.api.url(`/ai/history/${userId}`));
  }

  quota(userId: string, premium = false) {
    return this.http.get<QuotaResponse>(this.api.url(`/ai/quota/${userId}`), {
      params: { premium }
    });
  }

  adminUsage() {
    return this.http.get<AiAdminUsageResponse>(this.api.url('/ai/admin/usage'));
  }
}

@Injectable({ providedIn: 'root' })
export class JobMatchService {
  constructor(private http: HttpClient, private api: ApiUrlService) {}

  analyze(request: AnalyzeJobFitRequest) {
    return this.http.post<JobMatchResponse>(this.api.url('/job-matches/analyze'), request);
  }

  fetchLinkedIn(request: JobSearchRequest) {
    return this.http.post<JobMatchResponse[]>(this.api.url('/job-matches/fetch/linkedin'), request);
  }

  byResume(resumeId: string) {
    return this.http.get<JobMatchResponse[]>(this.api.url(`/job-matches/resume/${resumeId}`));
  }

  byUser(userId: string) {
    return this.http.get<JobMatchResponse[]>(this.api.url(`/job-matches/user/${userId}`));
  }

  top(userId: string) {
    return this.http.get<JobMatchResponse[]>(this.api.url(`/job-matches/user/${userId}/top`));
  }

  bookmark(matchId: string, bookmarked: boolean) {
    return this.http.put<JobMatchResponse>(this.api.url(`/job-matches/${matchId}/bookmark`), { bookmarked });
  }

  recommendations(matchId: string) {
    return this.http.get<TailoringRecommendationsResponse>(this.api.url(`/job-matches/${matchId}/recommendations`));
  }

  delete(matchId: string) {
    return this.http.delete(this.api.url(`/job-matches/${matchId}`));
  }
}

@Injectable({ providedIn: 'root' })
export class ExportService {
  constructor(private http: HttpClient, private api: ApiUrlService) {}

  submit(request: ExportRequest) {
    return this.http.post<ExportJobResponse>(this.api.url(`/exports/${request.format.toLowerCase()}`), request);
  }

  byUser(userId: string) {
    return this.http.get<ExportJobResponse[]>(this.api.url(`/exports/user/${userId}`));
  }

  status(jobId: string) {
    return this.http.get<ExportJobResponse>(this.api.url(`/exports/${jobId}`));
  }

  downloadLink(jobId: string, userId: string) {
    return this.http.get<DownloadLinkResponse>(this.api.url(`/exports/${jobId}/download-link`), {
      params: { userId }
    });
  }

  downloadUrl(token: string) {
    return this.api.url(`/exports/download/${token}`);
  }

  delete(jobId: string) {
    return this.http.delete(this.api.url(`/exports/${jobId}`));
  }

  stats() {
    return this.http.get<ExportJobResponse[]>(this.api.url('/exports/stats/all'));
  }
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private http: HttpClient, private api: ApiUrlService) {}

  create(request: CreateNotificationRequest) {
    return this.http.post<NotificationResponse>(this.api.url('/notifications'), request);
  }

  bulk(request: BulkNotificationRequest) {
    return this.http.post<NotificationResponse[]>(this.api.url('/notifications/bulk'), request);
  }

  byRecipient(recipientId: string) {
    return this.http.get<NotificationResponse[]>(this.api.url(`/notifications/recipient/${recipientId}`));
  }

  unread(recipientId: string) {
    return this.http.get<NotificationResponse[]>(this.api.url(`/notifications/recipient/${recipientId}/unread`));
  }

  unreadCount(recipientId: string) {
    return this.http.get<UnreadCountResponse>(this.api.url(`/notifications/recipient/${recipientId}/unread-count`));
  }

  markRead(notificationId: string, isRead: boolean) {
    return this.http.put<NotificationResponse>(this.api.url(`/notifications/${notificationId}/read`), { isRead });
  }

  markAllRead(recipientId: string) {
    return this.http.put(this.api.url(`/notifications/recipient/${recipientId}/read-all`), {});
  }

  delete(notificationId: string) {
    return this.http.delete(this.api.url(`/notifications/${notificationId}`));
  }

  all() {
    return this.http.get<NotificationResponse[]>(this.api.url('/notifications'));
  }
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  constructor(private http: HttpClient, private api: ApiUrlService) {}

  createOrder(plan: SubscriptionPlan) {
    return this.http.post<CreatePaymentOrderResponse>(
      this.api.url('/auth/payments/create-order'),
      { plan }
    );
  }

  verify(request: VerifyPaymentRequest) {
    return this.http.post<PaymentVerifyResponse>(
      this.api.url('/auth/payments/verify'),
      request
    );
  }
}
