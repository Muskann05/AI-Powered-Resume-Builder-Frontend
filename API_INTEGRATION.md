# ResumeAI Frontend API Integration

The Angular services map to the Spring Boot controllers discovered in the supplied backend ZIP:

- Auth and admin users: `/auth`, `/auth/admin/users/*`
- Payments: `/auth/payments/*`
- Resumes and public gallery: `/resumes/*`
- Builder sections: `/sections/*`
- Templates and HTML previews: `/templates/*`
- AI tools, quota, and history: `/ai/*`
- Job matching: `/job-matches/*`
- Export jobs and downloads: `/exports/*`
- Notifications and broadcasts: `/notifications/*`

The default gateway URL is `http://localhost:8080`. To point the frontend at another gateway, set `localStorage['resumeai.apiBaseUrl']` in the browser before loading the app.

Public routes are available without authentication: landing, templates, template preview, public gallery, pricing, FAQ, login, register, and forgot password. Dashboard, builder, AI tools, job matching, exports, notifications, profile, and subscription are guarded by `AuthGuard`. The admin panel is additionally guarded by `RoleGuard`.
