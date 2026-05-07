import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { AiService, PaymentService } from '../../core/services/domain.services';
import { ToastService } from '../../core/services/toast.service';
import { CreatePaymentOrderResponse, QuotaResponse } from '../../shared/models/api.models';

type RazorpayConstructor = new (options: Record<string, unknown>) => {
  open: () => void;
};

type RazorpayWindow = Window & {
  Razorpay?: RazorpayConstructor;
};

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="grid gap-6 xl:grid-cols-2">
      <form class="rounded-lg border border-indigo-100 bg-white p-5" [formGroup]="profileForm" (ngSubmit)="saveProfile()">
        <h1 class="text-2xl font-black">Profile</h1>

        <div class="mt-5 grid gap-3">
          <input class="field" formControlName="fullName" placeholder="Full name" />
          <input class="field" formControlName="phone" placeholder="Phone" />
        </div>

        <button class="btn-primary mt-5 px-5 py-3" [disabled]="profileForm.invalid">
          Save profile
        </button>
      </form>

      <form class="rounded-lg border border-indigo-100 bg-white p-5" [formGroup]="passwordForm" (ngSubmit)="changePassword()">
        <h2 class="text-2xl font-black">Change password</h2>

        <div class="mt-5 grid gap-3">
          <input class="field" type="password" formControlName="currentPassword" placeholder="Current password" />
          <input class="field" type="password" formControlName="newPassword" placeholder="New password" />
        </div>

        <button class="btn-primary mt-5 px-5 py-3" [disabled]="passwordForm.invalid">
          Update password
        </button>
      </form>
    </section>
  `
})
export class ProfilePageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly profileForm = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    phone: ['']
  });

  readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  ngOnInit(): void {
    const user = this.auth.currentUser();

    if (user) {
      this.profileForm.patchValue({
        fullName: user.fullName,
        phone: user.phone || ''
      });
    }
  }

  saveProfile(): void {
    this.auth.updateProfile(this.profileForm.getRawValue()).subscribe(() => {
      this.toast.show('Profile updated.', 'success');
    });
  }

  changePassword(): void {
    this.auth.changePassword(this.passwordForm.getRawValue()).subscribe(() => {
      this.toast.show('Password changed.', 'success');
    });
  }
}

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="grid gap-6 xl:grid-cols-[1fr_420px]">
      <div class="rounded-lg border border-indigo-100 bg-white p-6">
        <h1 class="text-2xl font-black">Subscription</h1>

        <p class="mt-2 text-slate-600">
          Current plan:
          <strong>{{ auth.currentUser()?.subscriptionPlan }}</strong>
        </p>

        <div class="mt-6 grid gap-4 md:grid-cols-2">
          <article class="rounded-lg border p-5">
            <h2 class="font-black">FREE</h2>
            <p class="mt-2 text-sm text-slate-600">Limited AI calls and public templates.</p>

            <button
              class="mt-4 rounded-lg border px-4 py-2 font-bold"
              type="button"
              (click)="switchPlan('FREE')">
              Use free
            </button>
          </article>

          <article class="rounded-lg border border-indigo-300 p-5">
            <h2 class="font-black">PREMIUM</h2>
            <p class="mt-2 text-sm text-slate-600">Premium templates, higher AI quota, and export workflows.</p>

            <p class="mt-4 text-3xl font-black">₹499</p>
            <p class="mt-1 text-xs font-bold uppercase text-slate-500">Razorpay test checkout</p>

            <button
              class="btn-primary mt-4 px-4 py-2"
              type="button"
              [disabled]="paymentLoading()"
              (click)="startPremiumCheckout()">
              {{ paymentLoading() ? 'Opening...' : 'Upgrade with Razorpay' }}
            </button>
          </article>
        </div>
      </div>

      <aside class="rounded-lg border border-indigo-100 bg-white p-6">
        <h2 class="text-xl font-black">Quota usage</h2>

        <div class="mt-5 grid gap-3">
          <p>Content calls: <strong>{{ quota()?.remainingContentCalls ?? 0 }}</strong></p>
          <p>ATS checks: <strong>{{ quota()?.remainingAtsChecks ?? 0 }}</strong></p>
        </div>
      </aside>
    </section>
  `
})
export class SubscriptionPageComponent implements OnInit {
  readonly auth = inject(AuthService);

  private readonly ai = inject(AiService);
  private readonly payments = inject(PaymentService);
  private readonly toast = inject(ToastService);

  readonly quota = signal<QuotaResponse | null>(null);
  readonly paymentLoading = signal(false);

  ngOnInit(): void {
    const user = this.auth.currentUser();

    if (user) {
      this.ai.quota(user.userId, user.subscriptionPlan === 'PREMIUM').subscribe((quota) => {
        this.quota.set(quota);
      });
    }
  }

  switchPlan(plan: 'FREE' | 'PREMIUM'): void {
    if (plan === 'PREMIUM') {
      this.startPremiumCheckout();
      return;
    }

    this.auth.updateSubscription(plan).subscribe(() => {
      this.toast.show(`Plan updated to ${plan}.`, 'success');
      this.auth.profile().subscribe();
    });
  }

  startPremiumCheckout(): void {
    const user = this.auth.currentUser();

    if (!user) return;

    if (user.subscriptionPlan === 'PREMIUM') {
      this.toast.show('You are already on the PREMIUM plan.', 'info');
      return;
    }

    this.paymentLoading.set(true);

    this.payments.createOrder('PREMIUM').subscribe({
      next: (order) => this.openRazorpay(order),
      error: () => this.paymentLoading.set(false)
    });
  }

  private openRazorpay(order: CreatePaymentOrderResponse): void {
    const user = this.auth.currentUser();

    if (!user) {
      this.paymentLoading.set(false);
      return;
    }

    this.loadRazorpayScript()
      .then(() => {
        const Razorpay = (window as RazorpayWindow).Razorpay;

        if (!Razorpay) {
          this.paymentLoading.set(false);
          this.toast.show('Razorpay checkout could not be loaded.', 'error');
          return;
        }

        const checkout = new Razorpay({
          key: order.key,
          amount: order.amount,
          currency: order.currency,
          name: 'ResumeAI',
          description: 'Premium subscription',
          order_id: order.orderId,
          prefill: {
            name: user.fullName,
            email: user.email,
            contact: user.phone || ''
          },
          theme: {
            color: '#4648d4'
          },
          modal: {
            ondismiss: () => {
              this.paymentLoading.set(false);
              this.toast.show('Payment cancelled.', 'info');
            }
          },
          handler: (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            this.verifyPayment(order, response);
          }
        });

        checkout.open();
      })
      .catch(() => {
        this.paymentLoading.set(false);
        this.toast.show('Unable to load Razorpay checkout script.', 'error');
      });
  }

  private verifyPayment(
    order: CreatePaymentOrderResponse,
    response: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }
  ): void {
    this.payments.verify({
      plan: order.plan,
      razorpayOrderId: response.razorpay_order_id,
      razorpayPaymentId: response.razorpay_payment_id,
      razorpaySignature: response.razorpay_signature
    }).subscribe({
      next: (result) => {
        this.paymentLoading.set(false);

        if (result.verified) {
          this.auth.profile().subscribe();
          this.toast.show(result.message || 'Payment verified. Premium activated.', 'success');
        }
      },
      error: () => this.paymentLoading.set(false)
    });
  }

  private loadRazorpayScript(): Promise<void> {
    if ((window as RazorpayWindow).Razorpay) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');

      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject();

      document.body.appendChild(script);
    });
  }
}
