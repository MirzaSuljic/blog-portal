import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AccountService } from '../../services/account.service';

type Field = 'fullname' | 'username' | 'email' | 'password' | 'confirmPassword';

const passwordsMatch = (group: AbstractControl): ValidationErrors | null =>
  group.get('password')?.value === group.get('confirmPassword')?.value ? null : { isMatching: true };

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private readonly accountService = inject(AccountService);
  private readonly router = inject(Router);

  readonly saving = signal(false);

  readonly registerForm = inject(FormBuilder).nonNullable.group(
    {
      fullname: ['', [Validators.minLength(10), Validators.maxLength(30)]],
      username: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(30)]],
      password: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(50)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: passwordsMatch }
  );

  formHasError(error: string): boolean {
    return this.registerForm.hasError(error);
  }

  invalid(field: Field): boolean {
    const control = this.registerForm.controls[field];
    const mismatch = field === 'confirmPassword' && this.formHasError('isMatching');
    return control.touched && (control.invalid || mismatch);
  }

  valid(field: Field): boolean {
    return this.registerForm.controls[field].touched && !this.invalid(field);
  }

  hasError(field: Field, error: string): boolean {
    return this.registerForm.controls[field].hasError(error);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    const { username, password, email, fullname } = this.registerForm.getRawValue();

    this.saving.set(true);
    this.accountService
      .register({ username, password, email, fullname: fullname || null })
      .subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: () => this.saving.set(false)
      });
  }
}
