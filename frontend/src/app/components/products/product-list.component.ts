import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Product } from '../../models/api.models';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="filters">
      <div>
        <h1>Browse Products</h1>
        <p>Filter by category, brand, or search by name/description.</p>
      </div>
      <div class="filter-controls">
        <input
          type="text"
          [(ngModel)]="search"
          (ngModelChange)="applyFilters()"
          placeholder="Search products..."
          class="search-box"
        />
        <label class="search-toggle">
          <input type="checkbox" [(ngModel)]="globalSearch" (change)="applyFilters()" />
          Search in all categories/brands
        </label>
        <select [(ngModel)]="category" (ngModelChange)="applyFilters()" [disabled]="globalSearch">
          <option value="">All categories</option>
          <option *ngFor="let item of categories" [value]="item">{{ item }}</option>
        </select>
        <select [(ngModel)]="brand" (ngModelChange)="applyFilters()" [disabled]="globalSearch">
          <option value="">All brands</option>
          <option *ngFor="let item of brands()" [value]="item">{{ item }}</option>
        </select>
      </div>
    </section>

    <section class="grid">
      <article *ngFor="let product of products()" class="card">
        <div class="card-top">
          <span class="badge">{{ product.category }}</span>
          <span class="stock" [class.out]="product.stockQty === 0">{{ product.stockQty }} left</span>
        </div>
        <h3>{{ product.name }}</h3>
        <p>{{ product.description }}</p>
        <div class="meta">{{ product.brand }} • {{ product.packaging }}</div>
        <div class="bottom">
          <strong>{{ product.price | currency:'INR':'symbol':'1.0-0' }}</strong>
          <button type="button" [disabled]="product.stockQty === 0 || isAdmin" (click)="add(product)" *ngIf="!isAdmin">Add to cart</button>
        </div>
      </article>
    </section>
  `,
  styles: [`
    .filters, .card { background: var(--surface); border-radius: var(--radius); box-shadow: var(--shadow); }
    .filters { display: flex; justify-content: space-between; gap: 1rem; align-items: end; padding: 1.5rem; margin-bottom: 1.5rem; }
    .filter-controls { display: flex; gap: 0.8rem; align-items: center; }
    .search-toggle {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.98rem;
      color: var(--muted);
      user-select: none;
    }
    .search-box {
      min-width: 220px;
      padding: 0.9rem 1rem;
      border-radius: 14px;
      border: 1px solid var(--line);
      background: white;
    }
    select {
      min-width: 190px; padding: 0.9rem 1rem; border-radius: 14px; border: 1px solid var(--line); background: white;
    }
    .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
    .card { padding: 1.3rem; display: grid; gap: 0.8rem; border: 1px solid rgba(226,55,68,0.08); }
    .card-top, .bottom { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
    .badge, .stock { padding: 0.35rem 0.7rem; border-radius: 999px; font-size: 0.85rem; }
    .badge { background: #ffe5e0; color: var(--primary); }
    .stock { background: #eefaf3; color: var(--success); }
    .stock.out { background: #ffe8e8; color: var(--primary-dark); }
    .meta { color: var(--muted); }
    button {
      border: 0; padding: 0.75rem 1rem; border-radius: 14px; background: var(--primary); color: white; cursor: pointer; font-weight: 600;
    }
    button:disabled { opacity: 0.45; cursor: not-allowed; }
    @media (max-width: 1000px) {
      .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 700px) {
      .filters { flex-direction: column; align-items: stretch; }
      .filter-controls, .grid { grid-template-columns: 1fr; display: grid; }
    }
  `]
})
export class ProductListComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly cart = inject(CartService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly allProducts = signal<Product[]>([]);
  readonly products = signal<Product[]>([]);
  readonly brands = computed(() => Array.from(new Set(this.allProducts().map(item => item.brand))).sort());
  readonly categories = ['Pizza', 'Cold Drinks', 'Breads'];
  category = '';
  brand = '';
  search = '';
  globalSearch = false;
  get isAdmin() { return this.auth.isAdmin(); }

  ngOnInit(): void {
    this.api.getProducts().subscribe((products) => {
      this.allProducts.set(products.filter(item => item.isActive));
      this.applyFilters();
    });

    if (this.auth.isLoggedIn()) {
      this.cart.refresh().subscribe();
    }
  }

  applyFilters(): void {
    const searchLower = this.search.trim().toLowerCase();
    this.products.set(this.allProducts().filter((product) => {
      const matchesSearch = !searchLower ||
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower);
      if (this.globalSearch) {
        return matchesSearch;
      }
      const matchesCategory = !this.category || product.category === this.category;
      const matchesBrand = !this.brand || product.brand === this.brand;
      // Only show if matches search AND matches filters
      return matchesSearch && matchesCategory && matchesBrand;
    }));
  }

  add(product: Product): void {
    if (!this.auth.isLoggedIn()) {
      void this.router.navigate(['/login']);
      return;
    }

    this.cart.add(product.id, 1).subscribe();
  }
}
