import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApplicationUserCreate } from '../models/account/application-user-create.model';
import { ApplicationUserLogin } from '../models/account/application-user-login.model';
import { ApplicationUser } from '../models/account/application-user.model';

const STORAGE_KEY = 'blogLab-currentUser';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly http = inject(HttpClient);

  private readonly currentUser = signal<ApplicationUser | null>(AccountService.readStoredUser());

  /** The signed-in user, or null. */
  readonly user = this.currentUser.asReadonly();
  readonly loggedIn = computed(() => !!this.currentUser()?.token);

  login(model: ApplicationUserLogin): Observable<ApplicationUser> {
    return this.http
      .post<ApplicationUser>(`${environment.webApi}/Account/login`, model)
      .pipe(tap(user => this.store(user)));
  }

  register(model: ApplicationUserCreate): Observable<ApplicationUser> {
    return this.http
      .post<ApplicationUser>(`${environment.webApi}/Account/register`, model)
      .pipe(tap(user => this.store(user)));
  }

  get currentUserValue(): ApplicationUser | null {
    return this.currentUser();
  }

  isLoggedIn(): boolean {
    return this.loggedIn();
  }

  givenUserIsLoggedIn(username: string): boolean {
    return this.isLoggedIn() && this.currentUser()?.username === username;
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.currentUser.set(null);
  }

  private store(user: ApplicationUser | null): void {
    if (!user) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  private static readStoredUser(): ApplicationUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as ApplicationUser) : null;
    } catch {
      return null;
    }
  }
}
