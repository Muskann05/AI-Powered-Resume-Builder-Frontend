import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { roleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';

describe('roleGuard', () => {
  it('should allow admin user', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            isAdmin: () => true
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

    const result = TestBed.runInInjectionContext(() => roleGuard({} as never, {} as never));

    expect(result).toBe(true);
  });

  it('should redirect non-admin user to dashboard', () => {
    const urlTree = { redirectTo: '/dashboard' };
    const router = {
      createUrlTree: jest.fn().mockReturnValue(urlTree)
    };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            isAdmin: () => false
          }
        },
        {
          provide: Router,
          useValue: router
        }
      ]
    });

    const result = TestBed.runInInjectionContext(() => roleGuard({} as never, {} as never));

    expect(router.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
    expect(result).toBe(urlTree);
  });
});
