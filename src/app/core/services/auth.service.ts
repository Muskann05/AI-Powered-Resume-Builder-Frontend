import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { finalize, tap } from 'rxjs';
import { ApiUrlService } from './api-url.service';
import {
  AuditLogResponse,
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  SubscriptionPlan,
  UpdateProfileRequest,
  UserResponse
} from '../../shared/models/api.models';

const ACCESS_TOKEN = 'resumeai.accessToken';
const REFRESH_TOKEN = 'resumeai.refreshToken';
const USER = 'resumeai.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserSignal = signal<UserResponse | null>(this.readUser());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => Boolean(this.accessToken && this.currentUserSignal()));
  readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'ADMIN');

  constructor(private http: HttpClient, private api: ApiUrlService) {}

  get accessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN);
  }

  login(request: LoginRequest) {
    return this.http
      .post<AuthResponse>(this.api.url('/auth/login'), request)
      .pipe(tap((response) => this.persist(response)));
  }

  register(request: RegisterRequest) {
    return this.http.post<UserResponse>(this.api.url('/auth/register'), request);
  }

  refresh() {
    return this.http
      .post<AuthResponse>(this.api.url('/auth/refresh'), {
        refreshToken: localStorage.getItem(REFRESH_TOKEN)
      })
      .pipe(tap((response) => this.persist(response)));
  }

  completeOAuthLogin(accessToken: string, refreshToken: string) {
    localStorage.setItem(ACCESS_TOKEN, accessToken);
    localStorage.setItem(REFRESH_TOKEN, refreshToken);
    return this.profile();
  }

  logoutFromServer() {
    return this.http
      .post(this.api.url('/auth/logout'), {})
      .pipe(finalize(() => this.logout()));
  }

  logout(): void {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    localStorage.removeItem(USER);
    this.currentUserSignal.set(null);
  }

  validateCurrentToken() {
    return this.http.post<{ valid: boolean }>(this.api.url('/auth/validate'), {});
  }

  forgotPassword(email: string) {
    return this.http.post(this.api.url('/auth/forgot-password'), { email });
  }

  resetPassword(token: string, newPassword: string, confirmPassword: string) {
    return this.http.post(this.api.url('/auth/reset-password'), {
      token,
      newPassword,
      confirmPassword
    });
  }

  profile() {
    return this.http
      .get<UserResponse>(this.api.url('/auth/profile'))
      .pipe(tap((user) => this.setUser(user)));
  }

  updateProfile(request: UpdateProfileRequest) {
    return this.http
      .put<UserResponse>(this.api.url('/auth/profile'), request)
      .pipe(tap((user) => this.setUser(user)));
  }

  changePassword(request: ChangePasswordRequest) {
    return this.http.put(this.api.url('/auth/password'), request);
  }

  updateSubscription(subscriptionPlan: SubscriptionPlan) {
    return this.http.put(this.api.url('/auth/subscription'), { subscriptionPlan });
  }

  users() {
    return this.http.get<UserResponse[]>(this.api.url('/auth/users'));
  }

  suspendUser(userId: string) {
    return this.http.put(this.api.url(`/auth/admin/users/${userId}/suspend`), {});
  }

  reactivateUser(userId: string) {
    return this.http.put(this.api.url(`/auth/admin/users/${userId}/reactivate`), {});
  }

  deleteUser(userId: string) {
    return this.http.delete(this.api.url(`/auth/admin/users/${userId}`));
  }

  adminUpdateSubscription(userId: string, subscriptionPlan: SubscriptionPlan) {
    return this.http.put(this.api.url(`/auth/admin/users/${userId}/subscription`), {
      subscriptionPlan
    });
  }

  auditLogs() {
    return this.http.get<AuditLogResponse[]>(this.api.url('/auth/admin/audit-logs'));
  }

  googleOAuthUrl(): string {
    return this.api.url('/oauth2/authorization/google');
  }

  linkedInOAuthUrl(): string {
    return this.api.url('/oauth2/authorization/linkedin');
  }

  private persist(response: AuthResponse): void {
    localStorage.setItem(ACCESS_TOKEN, response.accessToken);
    localStorage.setItem(REFRESH_TOKEN, response.refreshToken);
    this.setUser(response.user);
  }

  private setUser(user: UserResponse): void {
    localStorage.setItem(USER, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  private readUser(): UserResponse | null {
    const raw = localStorage.getItem(USER);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as UserResponse;
    } catch {
      return null;
    }
  }
}
