import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { ApiService } from './api.service';
import { CartResponse, Order } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly api = inject(ApiService);
  readonly cart = signal<CartResponse>({ items: [], subtotal: 0 });
  readonly lastOrder = signal<Order | null>(this.readLastOrder());

  refresh() {
    return this.api.getCart().pipe(tap((cart) => this.cart.set(cart)));
  }

  add(productId: number, quantity: number) {
    return this.api.addToCart(productId, quantity).pipe(tap((cart) => this.cart.set(cart)));
  }

  update(cartItemId: number, quantity: number) {
    return this.api.updateCart(cartItemId, quantity).pipe(tap((cart) => this.cart.set(cart)));
  }

  remove(id: number) {
    return this.api.removeCartItem(id).pipe(tap((cart) => this.cart.set(cart)));
  }

  clear() {
    return this.api.clearCart().pipe(tap(() => this.cart.set({ items: [], subtotal: 0 })));
  }

  storeLastOrder(order: Order): void {
    localStorage.setItem('retail_last_order', JSON.stringify(order));
    this.lastOrder.set(order);
    this.cart.set({ items: [], subtotal: 0 });
  }

  private readLastOrder(): Order | null {
    const raw = localStorage.getItem('retail_last_order');
    return raw ? JSON.parse(raw) as Order : null;
  }
}
