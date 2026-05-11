import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { ApiUrlService } from './api-url.service';
import { AuthResponse, UserResponse } from '../../shared/models/api.models';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  const user: UserResponse = {
    userId: 'user-101',
    fullName: 'Muskan Gupta',
    email: 'muskan@example.com',
    phone: '9999999999',
    role: 'USER',
    provider: 'LOCAL',
    isActive: true,
    subscriptionPlan: 'FREE',
    createdAt: '2026-05-08T10:00:00'
  };

  const authResponse: AuthResponse = {
    accessToken: 'access-token-101',
    refreshToken: 'refresh-token-101',
    user
  };

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        ApiUrlService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('should login and persist tokens plus user', () => {
    service.login({ email: 'muskan@example.com', password: 'Password@123' }).subscribe((response) => {
      expect(response.accessToken).toBe('access-token-101');
      expect(service.isAuthenticated()).toBe(true);
      expect(service.currentUser()?.email).toBe('muskan@example.com');
    });

    const req = http.expectOne('http://localhost:8080/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'muskan@example.com',
      password: 'Password@123'
    });

    req.flush(authResponse);

    expect(localStorage.getItem('resumeai.accessToken')).toBe('access-token-101');
    expect(localStorage.getItem('resumeai.refreshToken')).toBe('refresh-token-101');
    expect(localStorage.getItem('resumeai.user')).toContain('muskan@example.com');
  });

  it('should register user', () => {
    service.register({
      fullName: 'Muskan Gupta',
      email: 'muskan@example.com',
      password: 'Password@123',
      phone: '9999999999'
    }).subscribe((response) => {
      expect(response.userId).toBe('user-101');
      expect(response.email).toBe('muskan@example.com');
    });

    const req = http.expectOne('http://localhost:8080/auth/register');
    expect(req.request.method).toBe('POST');

    req.flush(user);
  });

  it('should refresh token and persist new auth response', () => {
    localStorage.setItem('resumeai.refreshToken', 'old-refresh-token');

    service.refresh().subscribe((response) => {
      expect(response.accessToken).toBe('access-token-101');
      expect(service.currentUser()?.userId).toBe('user-101');
    });

    const req = http.expectOne('http://localhost:8080/auth/refresh');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      refreshToken: 'old-refresh-token'
    });

    req.flush(authResponse);

    expect(localStorage.getItem('resumeai.accessToken')).toBe('access-token-101');
    expect(localStorage.getItem('resumeai.refreshToken')).toBe('refresh-token-101');
  });

  it('should complete oauth login by storing tokens and loading profile', () => {
    service.completeOAuthLogin('oauth-access-token', 'oauth-refresh-token').subscribe((response) => {
      expect(response.userId).toBe('user-101');
      expect(service.currentUser()?.email).toBe('muskan@example.com');
    });

    expect(localStorage.getItem('resumeai.accessToken')).toBe('oauth-access-token');
    expect(localStorage.getItem('resumeai.refreshToken')).toBe('oauth-refresh-token');

    const req = http.expectOne('http://localhost:8080/auth/profile');
    expect(req.request.method).toBe('GET');

    req.flush(user);
  });

  it('should logout locally and clear auth state', () => {
    localStorage.setItem('resumeai.accessToken', 'access-token-101');
    localStorage.setItem('resumeai.refreshToken', 'refresh-token-101');
    localStorage.setItem('resumeai.user', JSON.stringify(user));

    service.logout();

    expect(localStorage.getItem('resumeai.accessToken')).toBeNull();
    expect(localStorage.getItem('resumeai.refreshToken')).toBeNull();
    expect(localStorage.getItem('resumeai.user')).toBeNull();
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should logout from server and clear local auth state', () => {
    localStorage.setItem('resumeai.accessToken', 'access-token-101');
    localStorage.setItem('resumeai.refreshToken', 'refresh-token-101');
    localStorage.setItem('resumeai.user', JSON.stringify(user));

    service.logoutFromServer().subscribe();

    const req = http.expectOne('http://localhost:8080/auth/logout');
    expect(req.request.method).toBe('POST');

    req.flush({ message: 'Logged out' });

    expect(localStorage.getItem('resumeai.accessToken')).toBeNull();
    expect(localStorage.getItem('resumeai.refreshToken')).toBeNull();
    expect(localStorage.getItem('resumeai.user')).toBeNull();
  });

  it('should validate current token', () => {
    service.validateCurrentToken().subscribe((response) => {
      expect(response.valid).toBe(true);
    });

    const req = http.expectOne('http://localhost:8080/auth/validate');
    expect(req.request.method).toBe('POST');

    req.flush({ valid: true });
  });

  it('should send forgot password request', () => {
    service.forgotPassword('muskan@example.com').subscribe((response) => {
      expect(response).toEqual({ message: 'Reset link sent' });
    });

    const req = http.expectOne('http://localhost:8080/auth/forgot-password');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'muskan@example.com'
    });

    req.flush({ message: 'Reset link sent' });
  });

  it('should send reset password request', () => {
    service.resetPassword('token-101', 'NewPassword@123', 'NewPassword@123').subscribe((response) => {
      expect(response).toEqual({ message: 'Password reset successful' });
    });

    const req = http.expectOne('http://localhost:8080/auth/reset-password');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      token: 'token-101',
      newPassword: 'NewPassword@123',
      confirmPassword: 'NewPassword@123'
    });

    req.flush({ message: 'Password reset successful' });
  });

  it('should load profile and store current user', () => {
    service.profile().subscribe((response) => {
      expect(response.userId).toBe('user-101');
      expect(service.currentUser()?.fullName).toBe('Muskan Gupta');
    });

    const req = http.expectOne('http://localhost:8080/auth/profile');
    expect(req.request.method).toBe('GET');

    req.flush(user);

    expect(localStorage.getItem('resumeai.user')).toContain('Muskan Gupta');
  });

  it('should update profile and store updated user', () => {
    const updatedUser: UserResponse = {
      ...user,
      fullName: 'Muskan G'
    };

    service.updateProfile({
      fullName: 'Muskan G',
      phone: '8888888888'
    }).subscribe((response) => {
      expect(response.fullName).toBe('Muskan G');
      expect(service.currentUser()?.fullName).toBe('Muskan G');
    });

    const req = http.expectOne('http://localhost:8080/auth/profile');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({
      fullName: 'Muskan G',
      phone: '8888888888'
    });

    req.flush(updatedUser);
  });

  it('should change password', () => {
    service.changePassword({
      currentPassword: 'OldPassword@123',
      newPassword: 'NewPassword@123'
    }).subscribe((response) => {
      expect(response).toEqual({ message: 'Password changed' });
    });

    const req = http.expectOne('http://localhost:8080/auth/password');
    expect(req.request.method).toBe('PUT');

    req.flush({ message: 'Password changed' });
  });

  it('should update subscription', () => {
    service.updateSubscription('PREMIUM').subscribe((response) => {
      expect(response).toEqual({ message: 'Subscription updated' });
    });

    const req = http.expectOne('http://localhost:8080/auth/subscription');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({
      subscriptionPlan: 'PREMIUM'
    });

    req.flush({ message: 'Subscription updated' });
  });

  it('should fetch users for admin', () => {
    service.users().subscribe((response) => {
      expect(response.length).toBe(1);
      expect(response[0].userId).toBe('user-101');
    });

    const req = http.expectOne('http://localhost:8080/auth/users');
    expect(req.request.method).toBe('GET');

    req.flush([user]);
  });

  it('should suspend user', () => {
    service.suspendUser('user-101').subscribe((response) => {
      expect(response).toEqual({ message: 'User suspended' });
    });

    const req = http.expectOne('http://localhost:8080/auth/admin/users/user-101/suspend');
    expect(req.request.method).toBe('PUT');

    req.flush({ message: 'User suspended' });
  });

  it('should reactivate user', () => {
    service.reactivateUser('user-101').subscribe((response) => {
      expect(response).toEqual({ message: 'User reactivated' });
    });

    const req = http.expectOne('http://localhost:8080/auth/admin/users/user-101/reactivate');
    expect(req.request.method).toBe('PUT');

    req.flush({ message: 'User reactivated' });
  });

  it('should delete user', () => {
    service.deleteUser('user-101').subscribe((response) => {
      expect(response).toEqual({ message: 'User deleted' });
    });

    const req = http.expectOne('http://localhost:8080/auth/admin/users/user-101');
    expect(req.request.method).toBe('DELETE');

    req.flush({ message: 'User deleted' });
  });

  it('should update user subscription as admin', () => {
    service.adminUpdateSubscription('user-101', 'PREMIUM').subscribe((response) => {
      expect(response).toEqual({ message: 'Subscription updated' });
    });

    const req = http.expectOne('http://localhost:8080/auth/admin/users/user-101/subscription');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({
      subscriptionPlan: 'PREMIUM'
    });

    req.flush({ message: 'Subscription updated' });
  });

  it('should fetch audit logs', () => {
    service.auditLogs().subscribe((response) => {
      expect(response.length).toBe(1);
      expect(response[0].action).toBe('LOGIN');
    });

    const req = http.expectOne('http://localhost:8080/auth/admin/audit-logs');
    expect(req.request.method).toBe('GET');

    req.flush([
      {
        auditId: 'audit-101',
        userId: 'user-101',
        action: 'LOGIN',
        description: 'User logged in',
        createdAt: '2026-05-08T10:00:00'
      }
    ]);
  });

  it('should return oauth urls', () => {
    expect(service.googleOAuthUrl()).toBe('http://localhost:8080/oauth2/authorization/google');
    expect(service.linkedInOAuthUrl()).toBe('http://localhost:8080/oauth2/authorization/linkedin');
  });

  it('should restore user from localStorage on creation', () => {
    localStorage.setItem('resumeai.accessToken', 'access-token-101');
    localStorage.setItem('resumeai.user', JSON.stringify(user));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        ApiUrlService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    const restoredService = TestBed.inject(AuthService);

    expect(restoredService.currentUser()?.email).toBe('muskan@example.com');
    expect(restoredService.isAuthenticated()).toBe(true);
  });
});
