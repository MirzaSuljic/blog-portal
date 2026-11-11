import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../shared/toast.service';
import { AccountService } from '../services/account.service';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const toast = inject(ToastService);
  const router = inject(Router);
  const accountService = inject(AccountService);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 400:
          toast.error(describe400(error), 'Bad request');
          break;
        case 401:
          accountService.logout();
          toast.error('Please login to your account.', 'Unauthorized');
          router.navigate(['/login']);
          break;
        case 0:
          toast.error('The server cannot be reached. Is the API running?');
          break;
        case 500:
          toast.error(
            typeof error.error?.message === 'string' && error.error.message !== 'Internal Server Error'
              ? error.error.message
              : 'Please contact the administrator. An error happened in the server.',
            'Server error'
          );
          break;
        default:
          toast.error('Something unexpected happened.');
          break;
      }
      console.error(error);
      return throwError(() => error);
    })
  );
};

/** Turns the different 400 shapes the API sends (Identity errors, model validation, plain text) into one message. */
function describe400(error: HttpErrorResponse): string {
  const body = error.error;

  // Identity errors: [{ code, description }]
  if (Array.isArray(body)) {
    return body
      .filter(e => !!e)
      .map(e => (e.code ? `${e.code} - ${e.description}` : String(e.description ?? e)))
      .join('\n');
  }

  // Model validation: { errors: { Field: ["message"] } }
  if (body?.errors && typeof body.errors === 'object') {
    return Object.values(body.errors as Record<string, string[]>)
      .flat()
      .join('\n');
  }

  if (typeof body === 'string' && body.length > 0) {
    return body;
  }

  return 'There was a validation error.';
}
