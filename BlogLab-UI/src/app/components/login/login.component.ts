import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly accountService = inject(AccountService);
  private readonly router = inject(Router);

  readonly saving = signal(false);

  readonly loginForm = inject(FormBuilder).nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]],
    password: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(50)]]
  });

  constructor() {
    if (this.accountService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  invalid(field: 'username' | 'password'): boolean {
    const control = this.loginForm.controls[field];
    return control.touched && control.invalid;
  }

  valid(field: 'username' | 'password'): boolean {
    const control = this.loginForm.controls[field];
    return control.touched && control.valid;
  }

  hasError(field: 'username' | 'password', error: string): boolean {
    return this.loginForm.controls[field].hasError(error);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.saving.set(true);
    this.accountService.login(this.loginForm.getRawValue()).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => this.saving.set(false)
    });
  }
}
