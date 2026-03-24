import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CartResponse, CouponValidation, InventoryItem, Order, Product, Promotion, User } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5000/api';

  getProducts(filters?: { category?: string; brand?: string }): Observable<Product[]> {
    let params = new HttpParams();
    if (filters?.category) params = params.set('category', filters.category);
    if (filters?.brand) params = params.set('brand', filters.brand);
    return this.http.get<Product[]>(`${this.baseUrl}/products`, { params });
  }

  getPromotions(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(`${this.baseUrl}/promotions`);
  }

  getCart(): Observable<CartResponse> {
    return this.http.get<CartResponse>(`${this.baseUrl}/cart`);
  }

  addToCart(productId: number, quantity: number): Observable<CartResponse> {
    return this.http.post<CartResponse>(`${this.baseUrl}/cart/add`, { productId, quantity });
  }

  updateCart(cartItemId: number, quantity: number): Observable<CartResponse> {
    return this.http.put<CartResponse>(`${this.baseUrl}/cart/update`, { cartItemId, quantity });
  }

  removeCartItem(id: number): Observable<CartResponse> {
    return this.http.delete<CartResponse>(`${this.baseUrl}/cart/remove/${id}`);
  }

  clearCart(): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/cart/clear`);
  }

  placeOrder(couponCode?: string): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/orders`, { couponCode });
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders`);
  }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders/all`);
  }

  validateCoupon(code: string, amount: number): Observable<CouponValidation> {
    return this.http.post<CouponValidation>(`${this.baseUrl}/coupons/validate`, { code, amount });
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/auth/profile`);
  }

  updateProfile(payload: { name: string; email: string }): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/auth/profile`, payload);
  }

  getLoyalty(): Observable<{ loyaltyPoints: number }> {
    return this.http.get<{ loyaltyPoints: number }>(`${this.baseUrl}/users/loyalty`);
  }

  getInventory(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.baseUrl}/inventory`);
  }

  updateInventory(productId: number, stockQty: number): Observable<InventoryItem> {
    return this.http.put<InventoryItem>(`${this.baseUrl}/inventory/${productId}`, { stockQty });
  }

  createPromotion(payload: { title: string; description: string; startDate: string; endDate: string }): Observable<Promotion> {
    return this.http.post<Promotion>(`${this.baseUrl}/promotions`, payload);
  }

  createProduct(payload: Record<string, unknown>): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/products`, payload);
  }

  updateProduct(id: number, payload: Record<string, unknown>): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/products/${id}`, payload);
  }

  deleteProduct(id: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/products/${id}`);
  }
}
