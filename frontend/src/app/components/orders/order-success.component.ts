import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="success-card" *ngIf="order; else missing">
      <span class="badge">Order Confirmed</span>
      <h1>Order #{{ order.id }} is on the way.</h1>
      <p>Total paid: {{ order.totalAmount | currency:'INR':'symbol':'1.0-0' }}</p>
      <div class="items">
        <div *ngFor="let item of order.items" class="item">
          <span>{{ item.productName }} x {{ item.quantity }}</span>
          <strong>{{ item.lineTotal | currency:'INR':'symbol':'1.0-0' }}</strong>
        </div>
      </div>
      <div class="actions">
        <a routerLink="/orders">View order history</a>
        <a routerLink="/products">Order more</a>
      </div>
    </section>

    <ng-template #missing>
      <section class="success-card">
        <h1>No recent order found.</h1>
        <a routerLink="/products">Browse products</a>
      </section>
    </ng-template>
  `,
  styles: [`
    .success-card {
      background: var(--surface); border-radius: var(--radius); box-shadow: var(--shadow); padding: 2rem;
      max-width: 720px; margin: 2rem auto;
    }
    .badge { display: inline-flex; padding: 0.35rem 0.75rem; border-radius: 999px; background: #e7fff1; color: var(--success); }
    .items { margin: 1.5rem 0; display: grid; gap: 0.75rem; }
    .item { display: flex; justify-content: space-between; padding: 0.85rem 0; border-bottom: 1px solid var(--line); }
    .actions { display: flex; gap: 1rem; flex-wrap: wrap; }
    .actions a { padding: 0.85rem 1rem; border-radius: 14px; background: var(--surface-soft); color: var(--primary); }
  `]
})
export class OrderSuccessComponent {
  private readonly cartService = inject(CartService);
  protected readonly order = this.cartService.lastOrder();
}
