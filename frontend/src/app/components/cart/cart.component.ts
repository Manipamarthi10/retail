import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="cart-layout">
      <div class="cart-panel">
        <h1>Your Cart</h1>
        <article *ngFor="let item of cart.items" class="row">
          <div>
            <h3>{{ item.productName }}</h3>
            <p>{{ item.brand }} • {{ item.packaging }}</p>
            <small>{{ item.price | currency:'INR':'symbol':'1.0-0' }} each</small>
          </div>
          <div class="actions" *ngIf="!isAdmin">
            <button type="button" (click)="changeQty(item.id, item.quantity - 1)">-</button>
            <span>{{ item.quantity }}</span>
            <button type="button" (click)="changeQty(item.id, item.quantity + 1)">+</button>
            <button type="button" class="danger" (click)="remove(item.id)">Remove</button>
          </div>
        </article>

        <div *ngIf="!cart.items.length" class="empty">
          <p>Your cart is empty.</p>
          <a routerLink="/products">Start shopping</a>
        </div>
      </div>

      <aside class="summary">
        <h2>Summary</h2>
        <div class="summary-line"><span>Items</span><strong>{{ itemCount() }}</strong></div>
        <div class="summary-line"><span>Subtotal</span><strong>{{ cart.subtotal | currency:'INR':'symbol':'1.0-0' }}</strong></div>
        <button type="button" [disabled]="!cart.items.length || isAdmin" (click)="checkout()" *ngIf="!isAdmin">Proceed to checkout</button>
        <button type="button" class="ghost" [disabled]="!cart.items.length || isAdmin" (click)="clear()" *ngIf="!isAdmin">Clear cart</button>
      </aside>
    </section>
  `,
  styles: [`
    .cart-layout { display: grid; grid-template-columns: 1.7fr 0.9fr; gap: 1rem; }
    .cart-panel, .summary { background: var(--surface); box-shadow: var(--shadow); border-radius: var(--radius); padding: 1.5rem; }
    .row {
      display: flex; justify-content: space-between; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid var(--line);
    }
    .row:last-child { border-bottom: 0; }
    .row p, .row small { color: var(--muted); }
    .actions { display: flex; align-items: center; gap: 0.7rem; flex-wrap: wrap; }
    .actions button, .summary button {
      border: 0; border-radius: 12px; padding: 0.7rem 0.9rem; cursor: pointer; background: var(--surface-soft);
    }
    .actions .danger { background: #ffe7e4; color: var(--primary); }
    .summary-line { display: flex; justify-content: space-between; padding: 0.8rem 0; }
    .summary button { width: 100%; margin-top: 0.75rem; background: var(--primary); color: white; font-weight: 700; }
    .summary .ghost { background: #ffe8e5; color: var(--primary); }
    .empty { padding: 2rem 0; color: var(--muted); }
    @media (max-width: 900px) { .cart-layout { grid-template-columns: 1fr; } }
  `]
})
export class CartComponent implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  readonly itemCount = computed(() => this.cartService.cart().items.reduce((sum, item) => sum + item.quantity, 0));

  get cart() {
    return this.cartService.cart();
  }

  get isAdmin() { return this.auth.isAdmin(); }

  ngOnInit(): void {
    this.cartService.refresh().subscribe();
  }

  changeQty(cartItemId: number, quantity: number): void {
    if (this.isAdmin) return;
    this.cartService.update(cartItemId, quantity).subscribe();
  }

  remove(id: number): void {
    if (this.isAdmin) return;
    this.cartService.remove(id).subscribe();
  }

  clear(): void {
    if (this.isAdmin) return;
    this.cartService.clear().subscribe();
  }

  checkout(): void {
    if (this.isAdmin) return;
    void this.router.navigate(['/checkout']);
  }
}
