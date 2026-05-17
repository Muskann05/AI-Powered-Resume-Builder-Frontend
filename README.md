# ResumeAI - AI Powered Resume Builder Frontend

ResumeAI is an AI powered resume builder web application that helps job seekers create professional, ATS-friendly resumes using templates, dynamic sections, AI content improvement, job matching, and export features.

This repository contains the Angular frontend for the ResumeAI platform. It connects with the Spring Boot microservice backend through the API Gateway.

## Project Overview

The frontend provides a clean user interface where users can:

1. Register or log in.
2. Browse resume templates.
3. Create a resume.
4. Add and update resume sections.
5. Improve resume content using AI.
6. Check resume/job match feedback.
7. Export the final resume.
8. View profile, subscription, and notifications.

## Key Features

- Responsive Angular UI
- Landing page for ResumeAI
- User registration and login pages
- JWT based authenticated frontend flow
- API Gateway based backend integration
- Resume template browsing
- Resume builder workflow
- Resume section management
- Public gallery / template preview support
- Pricing and subscription UI
- AI-powered resume content flow
- Job match and ATS-related frontend flow
- Static site deployment on Render
- Jest test setup
- SonarCloud frontend code quality scan

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Angular 21 |
| Language | TypeScript |
| Styling | CSS / Tailwind CSS setup |
| Routing | Angular Router |
| Forms | Angular Forms |
| API Communication | Angular Services / HttpClient |
| Testing | Jest, jest-preset-angular |
| Build Tool | Angular CLI |
| Deployment | Render Static Site |
| Code Quality | SonarCloud |

## Backend Integration

The frontend communicates with the backend through the deployed API Gateway.

```text
Angular Frontend
      |
      v
API Gateway
      |
      +--> Auth Service
      +--> Resume Service
      +--> Section Service
      +--> Template Service
      +--> AI Service
      +--> Export Service
      +--> Job Match Service
```

The API base URL is handled through the frontend API URL service.

Example:

```ts
readonly baseUrl =
  localStorage.getItem('resumeai.apiBaseUrl') || 'http://localhost:8080';
```

For deployed frontend, the API base URL should point to the Render API Gateway URL:

```text
https://resumeai-api-gateway.onrender.com
```

## Repository Structure

```text
AI-Powered-Resume-Builder-Frontend/
├── public/
├── src/
│   ├── app/
│   ├── main.ts
│   └── styles.css
├── angular.json
├── package.json
├── package-lock.json
├── jest.config.cjs
├── setup-jest.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
└── README.md
```

## Prerequisites

Install the following:

- Node.js 20 or higher
- npm
- Angular CLI

Check versions:

```bash
node -v
npm -v
```

## Local Setup

1. Clone the repository.

```bash
git clone https://github.com/Muskann05/AI-Powered-Resume-Builder-Frontend.git
cd AI-Powered-Resume-Builder-Frontend
```

2. Install dependencies.

If normal install gives peer dependency conflict, use legacy peer deps:

```bash
npm install --legacy-peer-deps
```

3. Start the development server.

```bash
npm start
```

4. Open the app in browser.

```text
http://localhost:4200
```

## Build

Create a production build:

```bash
npm run build
```

The build output is generated inside:

```text
dist/resumeai-frontend
```

## Testing

Run unit tests:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

Coverage output is generated in:

```text
coverage/
```

## Render Deployment

The frontend is deployed as a Render Static Site.

Recommended Render settings:

| Setting | Value |
| --- | --- |
| Service Type | Static Site |
| Branch | `main` |
| Build Command | `npm install --legacy-peer-deps && npm run build` |
| Publish Directory | `dist/resumeai-frontend` |
| Node Version | `20` |

If Render publish directory shows only `dist`, check the actual generated folder inside `dist`. For this project, the Angular build output is expected under:

```text
dist/resumeai-frontend
```

## Important Deployment Notes

- Frontend must call the deployed API Gateway URL.
- Backend API Gateway must allow the frontend domain in CORS.
- If routes like `/login` or `/register` show `Not Found` after refresh, configure Render rewrite rule:

```text
Source: /*
Destination: /index.html
Action: Rewrite
```

## SonarCloud

SonarCloud is used for frontend code quality analysis.

It can show:

- Security
- Reliability
- Maintainability
- Duplications
- Coverage, if coverage reports are generated

To show coverage, run:

```bash
npm run test:coverage
```

and configure SonarCloud to read the generated coverage report.

## Main Frontend Workflow

```text
User opens ResumeAI
      |
      v
Landing Page
      |
      v
Register / Login
      |
      v
JWT stored on frontend
      |
      v
Browse Templates
      |
      v
Create Resume
      |
      v
Add / Edit Sections
      |
      v
AI Improvement / Job Match
      |
      v
Export Resume
```

## Evaluation Explanation

ResumeAI frontend is the user-facing part of the platform. It provides the complete resume-building experience through a responsive Angular application. The frontend does not directly communicate with each backend service. Instead, it sends requests to the API Gateway, which forwards them to the correct microservice. This keeps the frontend simple and makes the backend architecture flexible and scalable.

## Related Repositories

- Backend: `AI-Powered-Resume-Builder`
- Frontend: `AI-Powered-Resume-Builder-Frontend`

## Author

Developed by Muskan Gupta.

