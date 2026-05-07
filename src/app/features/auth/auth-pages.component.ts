import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  template: `
    <form class="w-full max-w-md rounded-lg bg-white p-8 shadow-xl" [formGroup]="form" (ngSubmit)="submit()">
      <h1 class="text-3xl font-black">Welcome back</h1>
      <p class="mt-2 text-slate-600">Sign in to continue building career-ready resumes.</p>

      <div class="mt-6 grid gap-4">
        <input class="field" formControlName="email" placeholder="Email" type="email" />
        <input class="field" formControlName="password" placeholder="Password" type="password" />
      </div>

      <button class="btn-primary mt-6 w-full px-5 py-3" [disabled]="loading()">
        {{ loading() ? 'Signing in...' : 'Log in' }}
      </button>

      <div class="mt-5 grid gap-2">
        <a class="rounded-lg border px-4 py-3 text-center font-bold" [href]="auth.googleOAuthUrl()">Continue with Google</a>
        <a class="rounded-lg border px-4 py-3 text-center font-bold" [href]="auth.linkedInOAuthUrl()">Continue with LinkedIn</a>
      </div>

      <p class="mt-5 text-center text-sm text-slate-600">
        <a routerLink="/forgot-password" class="font-bold text-indigo-700">Forgot password?</a>
        ·
        <a routerLink="/register" class="font-bold text-indigo-700">Create account</a>
      </p>
    </form>
  `
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  readonly loading = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.show('Please enter a valid email and password.', 'error');
      return;
    }

    this.loading.set(true);

    this.auth.login(this.form.getRawValue()).pipe(catchError(() => of(null))).subscribe((response) => {
      this.loading.set(false);

      if (response) {
        this.toast.show('Signed in successfully.', 'success');
        this.router.navigate(['/dashboard']);
      }
    });
  }
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <form class="w-full max-w-md rounded-lg bg-white p-8 shadow-xl" [formGroup]="form" (ngSubmit)="submit()">
      <h1 class="text-3xl font-black">Create your account</h1>
      <p class="mt-2 text-slate-600">Start with public templates and unlock the builder after sign-up.</p>

      <div class="mt-6 grid gap-4">
        <input class="field" formControlName="fullName" placeholder="Full name" />
        <input class="field" formControlName="email" placeholder="Email" type="email" />
        <input class="field" formControlName="phone" placeholder="Phone" />
        <input class="field" formControlName="password" placeholder="Password" type="password" />
      </div>

      <button class="btn-primary mt-6 w-full px-5 py-3" [disabled]="loading()">
        {{ loading() ? 'Creating...' : 'Register' }}
      </button>

      <p class="mt-5 text-center text-sm text-slate-600">
        Already have an account?
        <a routerLink="/login" class="font-bold text-indigo-700">Log in</a>
      </p>
    </form>
  `
})
export class RegisterPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  readonly loading = signal(false);

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.show('Please fill name, valid email, and password of at least 8 characters.', 'error');
      return;
    }

    this.loading.set(true);

    this.auth.register(this.form.getRawValue()).pipe(catchError(() => of(null))).subscribe((response) => {
      this.loading.set(false);

      if (response) {
        this.toast.show('Account created. Please sign in.', 'success');
        this.router.navigate(['/login']);
      }
    });
  }
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <form class="w-full max-w-md rounded-lg bg-white p-8 shadow-xl" [formGroup]="form" (ngSubmit)="submit()">
      <h1 class="text-3xl font-black">Reset password</h1>
      <p class="mt-2 text-slate-600">Enter your email and ResumeAI will send the backend reset flow.</p>

      <input class="field mt-6" formControlName="email" placeholder="Email" type="email" />

      <button class="btn-primary mt-6 w-full px-5 py-3" [disabled]="loading()">
        {{ loading() ? 'Sending...' : 'Send reset link' }}
      </button>

      <a routerLink="/login" class="mt-5 block text-center text-sm font-bold text-indigo-700">Back to login</a>
    </form>
  `
})
export class ForgotPasswordPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  readonly loading = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.show('Please enter a valid email address.', 'error');
      return;
    }

    this.loading.set(true);

    this.auth.forgotPassword(this.form.controls.email.value).pipe(catchError(() => of(null))).subscribe(() => {
      this.loading.set(false);
      this.toast.show('If the email exists, a reset link will be sent.', 'success');
    });
  }
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <form class="w-full max-w-md rounded-lg bg-white p-8 shadow-xl" [formGroup]="form" (ngSubmit)="submit()">
      <h1 class="text-3xl font-black">Create new password</h1>
      <p class="mt-2 text-slate-600">{{ message() }}</p>

      <div class="mt-6 grid gap-4">
        <input class="field" formControlName="newPassword" placeholder="New password" type="password" />
        <input class="field" formControlName="confirmPassword" placeholder="Confirm password" type="password" />
      </div>

      <button class="btn-primary mt-6 w-full px-5 py-3" [disabled]="loading()">
        {{ loading() ? 'Updating...' : 'Reset password' }}
      </button>

      <a routerLink="/login" class="mt-5 block text-center text-sm font-bold text-indigo-700">Back to login</a>
    </form>
  `
})
export class ResetPasswordPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);
  readonly token = signal('');
  readonly message = signal('Enter and confirm your new password.');

  readonly form = this.fb.nonNullable.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token') || '';
    this.token.set(token);

    if (!token) {
      this.message.set('Reset token is missing. Please request a new reset link.');
      this.form.disable();
    }
  }

  submit(): void {
    if (this.form.invalid || !this.token()) {
      this.form.markAllAsTouched();
      this.toast.show('Please enter a valid password in both fields.', 'error');
      return;
    }

    const value = this.form.getRawValue();

    if (value.newPassword !== value.confirmPassword) {
      this.toast.show('Passwords do not match.', 'error');
      return;
    }

    this.loading.set(true);

    this.auth.resetPassword(this.token(), value.newPassword, value.confirmPassword)
      .pipe(catchError(() => of(null)))
      .subscribe((response) => {
        this.loading.set(false);

        if (!response) return;

        this.toast.show('Password reset successfully. Please log in.', 'success');
        this.router.navigate(['/login']);
      });
  }
}

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-xl">
      <h1 class="text-3xl font-black">Completing sign in</h1>
      <p class="mt-2 text-slate-600">{{ message() }}</p>

      @if (failed()) {
        <a routerLink="/login" class="btn-primary mt-6 inline-flex px-5 py-3">Back to login</a>
      }
    </section>
  `
})
export class OAuthSuccessPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly failed = signal(false);
  readonly message = signal('Saving your secure session...');

  ngOnInit(): void {
    const accessToken = this.route.snapshot.queryParamMap.get('accessToken');
    const refreshToken = this.route.snapshot.queryParamMap.get('refreshToken');

    if (!accessToken || !refreshToken) {
      this.failed.set(true);
      this.message.set('OAuth login did not return tokens.');
      return;
    }

    this.auth.completeOAuthLogin(accessToken, refreshToken)
      .pipe(catchError(() => of(null)))
      .subscribe((user) => {
        if (!user) {
          this.failed.set(true);
          this.message.set('Could not load your profile after OAuth login.');
          return;
        }

        this.router.navigate(['/dashboard'], { replaceUrl: true });
      });
  }
}
