import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

export const authLogGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isAuth().pipe(
    map((isAuthenticated: boolean) => {
      if (isAuthenticated) {
        router.navigate(['/chat']); 
        return false;
      }
      return true; 
    })
  );
};
