import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service'; // ✅ FIXED IMPORT
import { Order } from '../../models/api.models';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="history-head">
      <div>
        <h1>Order History</h1>
        <p>Review previous purchases and reorder in one click.</p>
      </div>
    </section>

    <section class="history-list">
      <article *ngFor="let order of orders()" class="order-card">
        <div class="top">
          <div>
            <h3>Order #{{ order.id }}</h3>
            <small>{{ order.placedAt | date:'medium' }}</small>
          </div>
          <div class="status">{{ order.status }}</div>
        </div>

        <div class="items">
          <div *ngFor="let item of order.items" class="line">
            <span>{{ item.productName }} x {{ item.quantity }}</span>
            <strong>{{ item.lineTotal | currency:'INR':'symbol':'1.0-0' }}</strong>
          </div>
        </div>

        <div class="footer">
          <strong>{{ order.totalAmount | currency:'INR':'symbol':'1.0-0' }}</strong>

          <!-- ✅ Only show for non-admin -->
          <button 
            type="button" 
            (click)="reorder(order)" 
            *ngIf="!isAdmin">
            Quick reorder
          </button>
        </div>
      </article>
    </section>
  `,
  styles: [`
    .history-list { display: grid; gap: 1rem; }
    .order-card { background: var(--surface); border-radius: var(--radius); box-shadow: var(--shadow); padding: 1.5rem; }
    .top, .footer, .line { display: flex; justify-content: space-between; gap: 1rem; }
    .status { padding: 0.35rem 0.8rem; border-radius: 999px; background: #fff0e0; color: #b06508; height: fit-content; }
    .items { display: grid; gap: 0.7rem; margin: 1rem 0; }
    button { border: 0; border-radius: 14px; padding: 0.8rem 1rem; background: var(--primary); color: white; cursor: pointer; font-weight: 700; }
  `]
})
export class OrderHistoryComponent implements OnInit {

  private readonly api = inject(ApiService);
  private readonly cart = inject(CartService);
  private readonly auth: AuthService = inject(AuthService); // ✅ FIXED TYPE

  // ✅ cleaner: computed once
  readonly isAdmin = this.auth.isAdmin();

  readonly orders = signal<Order[]>([]);

  ngOnInit(): void {
    this.api.getOrders().subscribe((orders) => this.orders.set(orders));
  }

  reorder(order: Order): void {
    if (this.isAdmin) return;

    order.items.forEach((item) => {
      this.cart.add(item.productId, item.quantity).subscribe();
    });
  }
}