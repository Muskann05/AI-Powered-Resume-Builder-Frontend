import { TestBed } from '@angular/core/testing';
import { ApiUrlService } from './api-url.service';

describe('ApiUrlService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should use localhost gateway as default base url', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(ApiUrlService);

    expect(service.baseUrl).toBe('http://localhost:8080');
  });

  it('should build url with leading slash', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(ApiUrlService);

    expect(service.url('/auth/login')).toBe('http://localhost:8080/auth/login');
  });

  it('should build url without leading slash', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(ApiUrlService);

    expect(service.url('resumes')).toBe('http://localhost:8080/resumes');
  });

  it('should use custom base url from localStorage', () => {
    localStorage.setItem('resumeai.apiBaseUrl', 'http://localhost:9000');

    TestBed.configureTestingModule({});
    const service = TestBed.inject(ApiUrlService);

    expect(service.url('/auth/login')).toBe('http://localhost:9000/auth/login');
  });
});
