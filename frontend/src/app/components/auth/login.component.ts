import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-wrap">
      <form class="auth-card" [formGroup]="form" (ngSubmit)="submit()">
        <span class="pill">Welcome back</span>
        <h1>Login to continue your order</h1>
        <label>
          Email
          <input type="email" formControlName="email">
          <span class="validation-error" *ngIf="form.get('email')?.invalid && form.get('email')?.touched">
            <span *ngIf="form.get('email')?.errors?.['required']">Email is required</span>
            <span *ngIf="form.get('email')?.errors?.['email']">Please enter a valid email address</span>
          </span>
        </label>
        <label>
          Password
          <input type="password" formControlName="password">
          <span class="validation-error" *ngIf="form.get('password')?.invalid && form.get('password')?.touched">
            <span *ngIf="form.get('password')?.errors?.['required']">Password is required</span>
            <span *ngIf="form.get('password')?.errors?.['minlength']">Password must be at least 8 characters</span>
          </span>
        </label>
        <button type="submit" [disabled]="form.invalid">Login</button>
        <p class="error" *ngIf="error">{{ error }}</p>
        <p>New here? <a routerLink="/register">Create an account</a></p>
      </form>
    </section>
  `,
  styles: [`
    .auth-wrap { display: grid; place-items: center; min-height: 72vh; }
    .auth-card {
      width: min(440px, 100%); display: grid; gap: 1rem; padding: 2rem; border-radius: var(--radius);
      background: var(--surface); box-shadow: var(--shadow);
    }
    label { display: grid; gap: 0.45rem; font-weight: 600; }
    input {
      padding: 0.95rem 1rem; border-radius: 14px; border: 1px solid var(--line); background: #fffdfd;
    }
    input.ng-invalid.ng-touched {
      border-color: #ef4444;
      background: #fef2f2;
    }
    button {
      padding: 1rem; border: 0; border-radius: 14px; background: var(--primary); color: white; font-weight: 700; cursor: pointer;
      transition: opacity 0.2s;
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .pill { width: fit-content; padding: 0.3rem 0.7rem; border-radius: 999px; background: #ffe7e4; color: var(--primary); }
    .error { color: var(--primary-dark); margin: 0; }
    .validation-error { color: #ef4444; font-size: 0.85rem; font-weight: 500; display: block; margin-top: 0.3rem; }
  `]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly cart = inject(CartService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  error = '';

  readonly form = this.fb.nonNullable.group({
    email: ['admin@retail.com', [Validators.required, Validators.email]],
    password: ['Admin@1234', [Validators.required, Validators.minLength(8)]]
  });

  submit(): void {
    if (this.form.invalid) {
      this.toast.error('Please fix validation errors');
      return;
    }
    this.error = '';
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.cart.refresh().subscribe({ next: () => void this.router.navigate(['/products']) });
      },
      error: (err) => {
        this.error = err.error?.message ?? 'Login failed.';
        this.toast.error(this.error);
      }
    });
  }
}
