import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="shell">
      <header class="topbar">
        <a class="brand" routerLink="/">
          <span class="brand-badge">R</span>
          <div>
            <strong>RetailRush</strong>
            <small>Single-store ordering</small>
          </div>
        </a>

        <nav class="nav">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
          <a routerLink="/products" routerLinkActive="active">Products</a>
          <a *ngIf="auth.isLoggedIn()" routerLink="/cart" routerLinkActive="active">Cart ({{ cartCount() }})</a>
          <a *ngIf="auth.isLoggedIn()" routerLink="/orders" routerLinkActive="active">Orders</a>
          <a *ngIf="auth.isLoggedIn()" routerLink="/profile" routerLinkActive="active">Profile</a>
          <a *ngIf="auth.isAdmin()" routerLink="/admin" routerLinkActive="active">Admin</a>
          <a *ngIf="!auth.isLoggedIn()" routerLink="/login" routerLinkActive="active">Login</a>
          <a *ngIf="!auth.isLoggedIn()" routerLink="/register" routerLinkActive="active">Register</a>
          <button *ngIf="auth.isLoggedIn()" class="ghost-btn" type="button" (click)="auth.logout()">Logout</button>
        </nav>
      </header>

      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .shell { min-height: 100vh; }
    .topbar {
      position: sticky; top: 0; z-index: 10; display: flex; gap: 1rem; justify-content: space-between; align-items: center;
      padding: 1rem 2rem; backdrop-filter: blur(16px); background: rgba(255,255,255,0.82); border-bottom: 1px solid var(--line);
    }
    .brand { display: flex; align-items: center; gap: 0.8rem; }
    .brand strong { display: block; font-size: 1.1rem; }
    .brand small { color: var(--muted); }
    .brand-badge {
      width: 44px; height: 44px; border-radius: 14px; display: grid; place-items: center; color: white; font-weight: 700;
      background: linear-gradient(135deg, var(--primary), #ff6b5f);
      box-shadow: var(--shadow);
    }
    .nav { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; }
    .nav a, .ghost-btn {
      border: 0; background: transparent; padding: 0.65rem 0.95rem; border-radius: 999px; cursor: pointer; color: var(--muted);
    }
    .nav a.active, .nav a:hover, .ghost-btn:hover { background: var(--surface-soft); color: var(--primary); }
    .content { padding: 2rem; max-width: 1280px; margin: 0 auto; }
    @media (max-width: 900px) {
      .topbar { padding: 1rem; align-items: flex-start; flex-direction: column; }
      .content { padding: 1rem; }
    }
  `]
})
export class AppShellComponent {
  protected readonly auth = inject(AuthService);
  private readonly cartService = inject(CartService);
  protected readonly cartCount = computed(() => this.cartService.cart().items.reduce((sum, item) => sum + item.quantity, 0));
}
