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
      <div class="auth-hero" aria-hidden="true">
        <div class="hero-badge">RetailRush</div>
        <h2>Fast checkout. Fresh deals.</h2>
        <p>Track your orders, save favorite picks, and shop in a beautiful one-stop flow.</p>
        <div class="hero-art">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <form class="auth-card" [formGroup]="form" (ngSubmit)="submit()">
        <span class="pill">Welcome back</span>
        <h1>Login to continue your order</h1>
        <label>
          Email
          <input type="email" formControlName="email" placeholder="you@example.com">
          <span class="validation-error" *ngIf="form.get('email')?.invalid && form.get('email')?.touched">
            <span *ngIf="form.get('email')?.errors?.['required']">Email is required</span>
            <span *ngIf="form.get('email')?.errors?.['email']">Please enter a valid email address</span>
          </span>
        </label>
        <label>
          Password
          <input type="password" formControlName="password" placeholder="Enter password">
          <span class="validation-error" *ngIf="form.get('password')?.invalid && form.get('password')?.touched">
            <span *ngIf="form.get('password')?.errors?.['required']">Password is required</span>
            <span *ngIf="form.get('password')?.errors?.['minlength']">Password must be at least 8 characters</span>
          </span>
        </label>
        <button type="submit" [disabled]="form.invalid">Login</button>
        <p class="error" *ngIf="error">{{ error }}</p>
        <p class="switch">New here? <a routerLink="/register">Create an account</a></p>
      </form>
    </section>
  `,
  styles: [`
    .auth-wrap {
      display: grid;
      grid-template-columns: minmax(280px, 460px) minmax(320px, 480px);
      gap: 1.2rem;
      align-items: stretch;
      justify-content: center;
      min-height: 72vh;
    }
    .auth-hero,
    .auth-card {
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      backdrop-filter: blur(4px);
    }
    .auth-hero {
      position: relative;
      overflow: hidden;
      padding: 2rem;
      display: grid;
      gap: 0.8rem;
      color: #3b2023;
      background:
        radial-gradient(circle at 10% 12%, rgba(255, 229, 198, 0.8), transparent 33%),
        linear-gradient(145deg, #fff3e2 0%, #ffe8d8 45%, #ffd9ce 100%);
    }
    .hero-badge {
      width: fit-content;
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.75);
      font-weight: 700;
      font-size: 0.85rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--primary-dark);
    }
    .auth-hero h2 {
      margin: 0;
      font-size: clamp(1.5rem, 2.5vw, 2rem);
      line-height: 1.2;
    }
    .auth-hero p {
      margin: 0;
      color: #6a474a;
      max-width: 30ch;
    }
    .hero-art {
      position: absolute;
      inset: auto -20px -30px auto;
      width: 220px;
      height: 220px;
    }
    .hero-art span {
      position: absolute;
      border-radius: 50%;
      display: block;
      animation: pulse 5s ease-in-out infinite;
    }
    .hero-art span:nth-child(1) {
      width: 180px;
      height: 180px;
      background: rgba(226, 55, 68, 0.14);
      right: 0;
      bottom: 0;
    }
    .hero-art span:nth-child(2) {
      width: 120px;
      height: 120px;
      background: rgba(255, 180, 143, 0.32);
      right: 40px;
      bottom: 32px;
      animation-delay: 0.4s;
    }
    .hero-art span:nth-child(3) {
      width: 70px;
      height: 70px;
      background: rgba(255, 255, 255, 0.7);
      right: 70px;
      bottom: 64px;
      animation-delay: 0.8s;
    }
    .auth-card {
      width: min(480px, 100%);
      display: grid;
      gap: 1rem;
      padding: 2rem;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), #ffffff);
      border: 1px solid rgba(255, 209, 205, 0.65);
    }
    h1 { margin: 0.2rem 0 0.35rem; }
    label { display: grid; gap: 0.45rem; font-weight: 600; }
    input {
      padding: 0.95rem 1rem;
      border-radius: 14px;
      border: 1px solid var(--line);
      background: #fffdfd;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    input:focus {
      outline: none;
      border-color: rgba(226, 55, 68, 0.55);
      box-shadow: 0 0 0 3px rgba(226, 55, 68, 0.12);
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
    .switch { margin: 0; color: var(--muted); }
    .switch a { color: var(--primary-dark); font-weight: 700; }
    .validation-error { color: #ef4444; font-size: 0.85rem; font-weight: 500; display: block; margin-top: 0.3rem; }
    @keyframes pulse {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }
    @media (max-width: 980px) {
      .auth-wrap {
        grid-template-columns: 1fr;
        max-width: 560px;
        margin-inline: auto;
      }
      .auth-hero {
        min-height: 210px;
      }
      .hero-art {
        width: 180px;
        height: 180px;
      }
    }
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
