import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  it('should allow authenticated user', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: () => true
          }
        },
        {
          provide: Router,
          useValue: {
            createUrlTree: jest.fn()
          }
        }
      ]
    });

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    expect(result).toBe(true);
  });

  it('should redirect unauthenticated user to login', () => {
    const urlTree = { redirectTo: '/login' };
    const router = {
      createUrlTree: jest.fn().mockReturnValue(urlTree)
    };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: () => false
          }
        },
        {
          provide: Router,
          useValue: router
        }
      ]
    });

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toBe(urlTree);
  });
});
