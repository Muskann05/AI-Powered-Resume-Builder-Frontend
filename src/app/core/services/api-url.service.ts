import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiUrlService {
  readonly baseUrl = (localStorage.getItem('resumeai.apiBaseUrl') || 'http://localhost:8080').replace(/\/$/, '');

  url(path: string): string {
    return `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }
}
