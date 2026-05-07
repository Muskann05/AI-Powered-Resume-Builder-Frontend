import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', loadComponent: () => import('./features/public/public-pages.component').then((m) => m.LandingPageComponent) },
      { path: 'templates', loadComponent: () => import('./features/public/public-pages.component').then((m) => m.TemplateGalleryPageComponent) },
      { path: 'templates/:id', loadComponent: () => import('./features/public/public-pages.component').then((m) => m.TemplatePreviewPageComponent) },
      { path: 'gallery', loadComponent: () => import('./features/public/public-pages.component').then((m) => m.PublicGalleryPageComponent) },
      { path: 'gallery/:id', loadComponent: () => import('./features/public/public-pages.component').then((m) => m.PublicGalleryPageComponent) },
      { path: 'pricing', loadComponent: () => import('./features/public/public-pages.component').then((m) => m.PricingPageComponent) },
      { path: 'faq', loadComponent: () => import('./features/public/public-pages.component').then((m) => m.FaqPageComponent) }
    ]
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/auth-pages.component').then((m) => m.LoginPageComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/auth-pages.component').then((m) => m.RegisterPageComponent) },
      { path: 'forgot-password', loadComponent: () => import('./features/auth/auth-pages.component').then((m) => m.ForgotPasswordPageComponent) },
      { path: 'reset-password', loadComponent: () => import('./features/auth/auth-pages.component').then((m) => m.ResetPasswordPageComponent) },
      { path: 'oauth-success', loadComponent: () => import('./features/auth/auth-pages.component').then((m) => m.OAuthSuccessPageComponent) }
    ]
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard-page.component').then((m) => m.DashboardPageComponent) },
      { path: 'resumes', loadComponent: () => import('./features/resume/resume-management-page.component').then((m) => m.ResumeManagementPageComponent) },
      { path: 'builder', loadComponent: () => import('./features/builder/builder-page.component').then((m) => m.BuilderPageComponent) },
      { path: 'builder/:id', loadComponent: () => import('./features/builder/builder-page.component').then((m) => m.BuilderPageComponent) },
      { path: 'ai-tools', loadComponent: () => import('./features/ai-tools/ai-tools-page.component').then((m) => m.AiToolsPageComponent) },
      { path: 'job-match', loadComponent: () => import('./features/job-match/job-match-page.component').then((m) => m.JobMatchPageComponent) },
      { path: 'exports', loadComponent: () => import('./features/resume/export-center-page.component').then((m) => m.ExportCenterPageComponent) },
      { path: 'notifications', loadComponent: () => import('./features/notifications/notifications-page.component').then((m) => m.NotificationsPageComponent) },
      { path: 'profile', loadComponent: () => import('./features/profile/profile-pages.component').then((m) => m.ProfilePageComponent) },
      { path: 'subscription', loadComponent: () => import('./features/profile/profile-pages.component').then((m) => m.SubscriptionPageComponent) },
      { path: 'admin', canActivate: [roleGuard], loadComponent: () => import('./features/admin/admin-page.component').then((m) => m.AdminPageComponent) }
    ]
  },
  { path: '**', redirectTo: '' }
];
