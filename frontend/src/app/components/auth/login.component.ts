import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-wrap">
      <form class="auth-card" [formGroup]="form" (ngSubmit)="submit()">
        <span class="pill">Welcome back</span>
        <h1>Login to continue your order</h1>
        <label>Email<input type="email" formControlName="email"></label>
        <label>Password<input type="password" formControlName="password"></label>
        <button type="submit">Login</button>
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
    button {
      padding: 1rem; border: 0; border-radius: 14px; background: var(--primary); color: white; font-weight: 700; cursor: pointer;
    }
    .pill { width: fit-content; padding: 0.3rem 0.7rem; border-radius: 999px; background: #ffe7e4; color: var(--primary); }
    .error { color: var(--primary-dark); margin: 0; }
  `]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly cart = inject(CartService);
  private readonly router = inject(Router);
  error = '';

  readonly form = this.fb.nonNullable.group({
    email: ['customer@retail.com', [Validators.required, Validators.email]],
    password: ['Customer@123', [Validators.required]]
  });

  submit(): void {
    if (this.form.invalid) return;
    this.error = '';
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.cart.refresh().subscribe({ next: () => void this.router.navigate(['/products']) });
      },
      error: (err) => this.error = err.error?.message ?? 'Login failed.'
    });
  }
}
