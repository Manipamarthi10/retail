import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Product, Promotion } from '../../models/api.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="hero">
      <div class="hero-copy">
        <h1>Your Store</h1>
        <p>Order now.</p>
        <div class="hero-actions">
          <a class="cta" routerLink="/products">Browse Menu</a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <h2>Active promotions</h2>
        <a routerLink="/products">Shop all</a>
      </div>
      <div class="banner-grid">
        <article *ngFor="let promo of promotions()" class="banner">
          <span>Live now</span>
          <h3>{{ promo.title }}</h3>
          <p>{{ promo.description }}</p>
          <small>{{ promo.startDate | date:'mediumDate' }} to {{ promo.endDate | date:'mediumDate' }}</small>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <h2>Popular picks</h2>
      </div>
      <div class="product-grid">
        <article *ngFor="let product of featured()" class="mini-card">
          <span class="tag">{{ product.category }}</span>
          <h3>{{ product.name }}</h3>
          <p>{{ product.description }}</p>
          <strong>{{ product.price | currency:'INR':'symbol':'1.0-0' }}</strong>
        </article>
      </div>
    </section>
  `,
  styles: [`
    .hero {
      display: grid; margin-bottom: 2rem;
    }
    .hero-copy {
      background: linear-gradient(135deg, rgba(226,55,68,0.98), rgba(255,125,97,0.94));
      color: white;
      padding: 3rem 2.5rem;
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    }
    .hero-copy h1 { margin: 0; font-size: clamp(2.4rem, 6vw, 4rem); line-height: 1.1; }
    .hero-copy p { margin: 0.5rem 0 1.5rem; font-size: 1.1rem; opacity: 0.95; }
    .hero-actions { display: flex; gap: 1rem; }
    .cta {
      padding: 0.9rem 1.5rem; border-radius: 14px; font-weight: 600; background: white; color: var(--primary); text-decoration: none;
    }
    .section { margin-top: 2rem; }
    .section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .banner-grid, .product-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
    .banner, .mini-card {
      background: var(--surface); border-radius: var(--radius); box-shadow: var(--shadow); border: 1px solid rgba(226,55,68,0.08);
      padding: 1.4rem;
    }
    .banner span { display: inline-flex; width: fit-content; padding: 0.35rem 0.75rem; border-radius: 999px; background: var(--surface-soft); color: var(--primary); font-size: 0.85rem; }
    .banner h3, .mini-card h3 { margin: 0.8rem 0 0.45rem; }
    .banner p, .mini-card p { color: var(--muted); margin: 0; }
    .tag { display: inline-flex; width: fit-content; padding: 0.35rem 0.75rem; border-radius: 999px; background: #ffe3dd; color: var(--primary); font-size: 0.85rem; }
    .mini-card strong { display: block; margin-top: 0.5rem; font-size: 1.1rem; }
    @media (max-width: 900px) {
      .banner-grid, .product-grid { grid-template-columns: 1fr; }
      .hero-copy { padding: 2rem; }
    }
  `]
})
export class HomeComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly promotions = signal<Promotion[]>([]);
  readonly featured = signal<Product[]>([]);

  ngOnInit(): void {
    this.api.getPromotions().subscribe((promotions) => this.promotions.set(promotions));
    this.api.getProducts().subscribe((products) => this.featured.set(products.slice(0, 4)));
  }
}
