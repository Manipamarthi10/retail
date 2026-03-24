import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service'; // ✅ FIXED IMPORT

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="checkout">
      <div class="panel">
        <h1>Checkout</h1>

        <div class="coupon-box">
          <input [(ngModel)]="couponCode" placeholder="Enter coupon code">
          <button type="button" (click)="applyCoupon()">Apply coupon</button>
        </div>

        <p *ngIf="couponMessage()" class="message">{{ couponMessage() }}</p>

        <ul>
          <li *ngFor="let item of cart.items">
            {{ item.productName }} x {{ item.quantity }}
          </li>
        </ul>
      </div>

      <aside class="panel summary">
        <div class="line">
          <span>Subtotal</span>
          <strong>{{ cart.subtotal | currency:'INR':'symbol':'1.0-0' }}</strong>
        </div>

        <div class="line">
          <span>Discount</span>
          <strong>-{{ discountAmount() | currency:'INR':'symbol':'1.0-0' }}</strong>
        </div>

        <div class="line total">
          <span>Total</span>
          <strong>{{ finalAmount() | currency:'INR':'symbol':'1.0-0' }}</strong>
        </div>

        <!-- ✅ hide for admin -->
        <button 
          type="button"
          [disabled]="!cart.items.length || loading() || isAdmin"
          (click)="placeOrder()"
          *ngIf="!isAdmin">
          {{ loading() ? 'Placing order...' : 'Place order' }}
        </button>

        <p *ngIf="error()" class="error">{{ error() }}</p>
      </aside>
    </section>
  `,
  styles: [`
    .checkout { display: grid; grid-template-columns: 1.3fr 0.9fr; gap: 1rem; }
    .panel { background: var(--surface); box-shadow: var(--shadow); border-radius: var(--radius); padding: 1.5rem; }
    .coupon-box { display: flex; gap: 0.75rem; margin: 1rem 0; }
    input { flex: 1; padding: 0.9rem 1rem; border-radius: 14px; border: 1px solid var(--line); }
    button { border: 0; border-radius: 14px; padding: 0.9rem 1rem; background: var(--primary); color: white; cursor: pointer; font-weight: 700; }
    .line { display: flex; justify-content: space-between; padding: 0.8rem 0; }
    .total { font-size: 1.2rem; }
    .message { color: var(--success); }
    .error { color: var(--primary-dark); }
    @media (max-width: 900px) { 
      .checkout { grid-template-columns: 1fr; } 
      .coupon-box { flex-direction: column; } 
    }
  `]
})
export class CheckoutComponent implements OnInit {

  private readonly api = inject(ApiService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  // ✅ FIXED TYPE (removes "unknown" error)
  private readonly auth: AuthService = inject(AuthService);

  // ✅ cleaner (computed once)
  readonly isAdmin = this.auth.isAdmin();

  couponCode = '';
  readonly discountAmount = signal(0);
  readonly finalAmount = signal(0);
  readonly couponMessage = signal('');
  readonly error = signal('');
  readonly loading = signal(false);

  get cart() {
    return this.cartService.cart();
  }

  ngOnInit(): void {
    this.cartService.refresh().subscribe((cart) => {
      this.finalAmount.set(cart.subtotal);
    });
  }

  applyCoupon(): void {
    this.couponMessage.set('');

    if (!this.couponCode.trim()) {
      this.discountAmount.set(0);
      this.finalAmount.set(this.cart.subtotal);
      return;
    }

    this.api.validateCoupon(this.couponCode.trim(), this.cart.subtotal)
      .subscribe((response) => {
        this.discountAmount.set(response.discountAmount || 0);
        this.finalAmount.set(response.finalAmount);
        this.couponMessage.set(response.message);
      });
  }

  placeOrder(): void {
    if (this.isAdmin) return;

    this.loading.set(true);
    this.error.set('');

    this.api.placeOrder(this.couponCode.trim() || undefined).subscribe({
      next: (order) => {
        this.cartService.storeLastOrder(order);
        this.loading.set(false);
        this.toast.success('Order placed successfully!');
        void this.router.navigate(['/order-confirmation']);
      },
      error: (err) => {
        this.loading.set(false);
        const errorMsg = err.error?.message ?? 'Could not place order.';
        this.error.set(errorMsg);
        this.toast.error(errorMsg);
      }
    });
  }
}