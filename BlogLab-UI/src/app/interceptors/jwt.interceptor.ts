import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { AccountService } from '../services/account.service';

export const jwtInterceptor: HttpInterceptorFn = (request, next) => {
  const user = inject(AccountService).currentUserValue;

  if (user?.token && request.url.startsWith(environment.webApi)) {
    request = request.clone({ setHeaders: { Authorization: `Bearer ${user.token}` } });
  }

  return next(request);
};
