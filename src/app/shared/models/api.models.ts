export type Role = 'USER' | 'ADMIN';
export type AuthProvider = 'LOCAL' | 'GOOGLE' | 'LINKEDIN';
export type SubscriptionPlan = 'FREE' | 'PREMIUM';
export type ResumeStatus = 'DRAFT' | 'COMPLETE';
export type SectionType = 'SUMMARY' | 'EXPERIENCE' | 'EDUCATION' | 'SKILLS' | 'CERTIFICATIONS' | 'PROJECTS' | 'LANGUAGES' | 'VOLUNTEER' | 'CUSTOM';
export type TemplateCategory = 'PROFESSIONAL' | 'CREATIVE' | 'MODERN' | 'MINIMALIST' | 'ATS_OPTIMISED';
export type ExportFormat = 'PDF' | 'DOCX' | 'JSON';
export type ExportStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type RequestType = 'SUMMARY' | 'BULLETS' | 'COVER_LETTER' | 'IMPROVE' | 'ATS' | 'SKILLS' | 'TAILOR' | 'TRANSLATE' | 'JOB_FIT';
export type RequestStatus = 'QUEUED' | 'COMPLETED' | 'FAILED';
export type AiModel = 'GEMINI' | 'FALLBACK';
export type JobSource = 'LINKEDIN' | 'MANUAL';
export type NotificationType = 'ATS_COMPLETE' | 'EXPORT_READY' | 'AI_DONE' | 'JOB_MATCH' | 'PLAN_CHANGE' | 'QUOTA_WARNING' | 'PASSWORD_RESET';
export type NotificationChannel = 'APP' | 'EMAIL';

export interface ApiMessageResponse {
  message: string;
}

export interface UserResponse {
  userId: string;
  fullName: string;
  email: string;
  phone?: string | null;
  role: Role;
  provider: AuthProvider;
  isActive: boolean;
  subscriptionPlan: SubscriptionPlan;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface CreatePaymentOrderRequest {
  plan: SubscriptionPlan;
}

export interface CreatePaymentOrderResponse {
  key: string;
  orderId: string;
  amount: number;
  currency: string;
  plan: SubscriptionPlan;
}

export interface VerifyPaymentRequest {
  plan: SubscriptionPlan;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface PaymentVerifyResponse {
  verified: boolean;
  message: string;
}

export interface ResumeResponse {
  resumeId: string;
  userId: string;
  title: string;
  targetJobTitle?: string | null;
  templateId: string;
  atsScore?: number | null;
  status: ResumeStatus;
  language?: string | null;
  isPublic: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeAdminStatsResponse {
  totalResumes: number;
  publicResumes: number;
  draftResumes: number;
  completeResumes: number;
  totalViews: number;
}

export interface CreateResumeRequest {
  userId: string;
  title: string;
  targetJobTitle?: string;
  templateId: string;
  language?: string;
}

export interface UpdateResumeRequest {
  title: string;
  targetJobTitle?: string;
  templateId: string;
  language?: string;
  status: ResumeStatus;
}

export interface SectionResponse {
  sectionId: string;
  resumeId: string;
  sectionType: SectionType;
  title: string;
  content: string;
  displayOrder: number;
  isVisible: boolean;
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSectionRequest {
  resumeId: string;
  sectionType: SectionType;
  title: string;
  content: string;
  displayOrder?: number;
  isVisible?: boolean;
  aiGenerated?: boolean;
}

export type UpdateSectionRequest = Omit<CreateSectionRequest, 'resumeId'>;

export interface ReorderSectionsRequest {
  sectionId: string;
  displayOrder: number;
}

export interface BulkUpdateSectionsRequest {
  sections: Array<Partial<SectionResponse> & { sectionId: string }>;
}

export interface TemplateResponse {
  templateId: string;
  name: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  htmlLayout: string;
  cssStyles: string;
  category: TemplateCategory;
  isPremium: boolean;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
}

export type CreateTemplateRequest = Pick<
  TemplateResponse,
  'name' | 'description' | 'thumbnailUrl' | 'htmlLayout' | 'cssStyles' | 'category' | 'isPremium'
>;

export type UpdateTemplateRequest = CreateTemplateRequest & {
  isActive: boolean;
};

export interface AiResponseDto {
  requestId: string;
  userId: string;
  resumeId?: string | null;
  requestType: RequestType;
  aiResponse: string;
  model: AiModel;
  tokensUsed: number;
  status: RequestStatus;
  createdAt: string;
  completedAt?: string | null;
}

export interface AiUsageByModelResponse {
  model: AiModel;
  requests: number;
  tokensUsed: number;
}

export interface AiUsageByUserResponse {
  userId: string;
  requests: number;
  tokensUsed: number;
}

export interface AiAdminUsageResponse {
  totalRequests: number;
  completedRequests: number;
  failedRequests: number;
  totalTokensUsed: number;
  byModel: AiUsageByModelResponse[];
  byUser: AiUsageByUserResponse[];
}

export interface AtsCheckResponse {
  requestId: string;
  atsScore: number;
  missingKeywords: string[];
  recommendation: string;
  model: string;
}

export interface QuotaResponse {
  remainingContentCalls: number;
  remainingAtsChecks: number;
  premium: boolean;
}

export interface JobFitResponse {
  matchScore: number;
  missingSkills: string[];
  recommendations: string;
}

export interface JobMatchResponse {
  matchId: string;
  resumeId: string;
  userId: string;
  jobTitle: string;
  companyName: string;
  location: string;
  externalJobId?: string | null;
  applyUrl?: string | null;
  jobDescription: string;
  matchScore: number;
  missingSkills?: string | null;
  recommendations?: string | null;
  source: JobSource;
  isBookmarked: boolean;
  matchedAt: string;
}

export interface AnalyzeJobFitRequest {
  resumeId: string;
  userId: string;
  jobTitle: string;
  jobDescription: string;
}

export interface JobSearchRequest {
  resumeId: string;
  userId: string;
  title: string;
  location: string;
  limit?: number;
}

export interface TailoringRecommendationsResponse {
  matchId: string;
  recommendations: string;
}

export interface ExportRequest {
  resumeId: string;
  userId: string;
  format: ExportFormat;
  templateId: string;
  customizations?: string;
  resumeDataJson?: string;
  htmlSnapshot?: string;
  cssSnapshot?: string;
}

export interface ExportJobResponse {
  jobId: string;
  resumeId: string;
  userId: string;
  format: ExportFormat;
  status: ExportStatus;
  fileUrl?: string | null;
  fileSizeKb?: number | null;
  requestedAt: string;
  completedAt?: string | null;
  expiresAt?: string | null;
  templateId: string;
  customizations?: string | null;
}

export interface DownloadLinkResponse {
  jobId: string;
  downloadUrl: string;
  expiresAt: string;
}

export interface NotificationResponse {
  notificationId: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  channel: NotificationChannel;
  relatedId?: string | null;
  relatedType?: string | null;
  actionUrl?: string | null;
  isRead: boolean;
  sentAt: string;
}

export interface CreateNotificationRequest {
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  channel: NotificationChannel;
  relatedId?: string;
  relatedType?: string;
  actionUrl?: string;
}

export interface BulkNotificationRequest extends Omit<CreateNotificationRequest, 'recipientId'> {
  subscriptionPlan?: SubscriptionPlan;
}

export interface UnreadCountResponse {
  recipientId: string;
  unreadCount: number;
}

export interface AuditLogResponse {
  auditId: string;
  actor: string;
  action: string;
  targetId?: string | null;
  targetType?: string | null;
  details?: string | null;
  createdAt: string;
}

export interface ApiState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}
