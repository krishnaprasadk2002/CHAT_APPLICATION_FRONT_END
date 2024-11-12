import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { authLogGuard } from './auth-log.guard';

describe('authLogGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => authLogGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
