import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, tap } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isAuth().pipe(
    map((isAuthenticated: boolean) => {
      console.log('Auth Guard:', isAuthenticated);
      if (!isAuthenticated) {
        router.navigate(['/']); 
        return false;
      }
      return true;
    })
  );
};

