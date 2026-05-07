import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  const token = auth.accessToken;

  const request = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const message = extractErrorMessage(error);
      const isLoginRequest = req.url.includes('/auth/login');

      if (error.status === 401) {
        toast.show(message || 'Invalid email or password.', 'error');

        if (isLoginRequest) {
          return throwError(() => error);
        }

        auth.logout();
        router.navigate(['/login']);
      } else if (error.status === 403) {
        toast.show(message || 'You do not have access to that action.', 'error');
      } else if (error.status === 400 || error.status === 404 || error.status === 409) {
        toast.show(message || 'Please check the details and try again.', 'error');
      } else if (error.status >= 500 || error.status === 0) {
        toast.show(message || 'ResumeAI services are unavailable right now.', 'error');
      }

      return throwError(() => error);
    })
  );
};

function extractErrorMessage(error: HttpErrorResponse): string {
  const body = error.error;

  if (!body) {
    return error.message;
  }

  if (typeof body === 'string') {
    return body;
  }

  if (typeof body.message === 'string' && body.message.trim()) {
    return body.message;
  }

  if (body.errors && typeof body.errors === 'object') {
    return Object.entries(body.errors)
      .map(([field, message]) => `${humanize(field)}: ${String(message)}`)
      .join(', ');
  }

  if (typeof body.error === 'string' && body.error.trim()) {
    return body.error;
  }

  return error.statusText || 'Something went wrong.';
}

function humanize(field: string): string {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase());
}
