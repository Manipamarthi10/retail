import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { InventoryItem, Order, Product } from '../../models/api.models';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="admin-container">
      <div class="admin-header">
        <h1>Admin Dashboard</h1>
        <div class="tabs">
          <button
            *ngFor="let tab of tabs"
            [class.active]="activeTab() === tab"
            (click)="activeTab.set(tab)"
            type="button"
          >
            {{ tab }}
          </button>
        </div>
      </div>

      <!-- Products Tab -->
      <div *ngIf="activeTab() === 'Products'" class="tab-content">
        <div class="admin-grid">
          <div class="card">
            <h2>Create Product</h2>
            <form [formGroup]="productForm" (ngSubmit)="saveProduct()">
              <input type="text" placeholder="Name" formControlName="name">
              <input type="text" placeholder="Category" formControlName="category">
              <input type="text" placeholder="Brand" formControlName="brand">
              <input type="text" placeholder="Packaging" formControlName="packaging">
              <input type="number" placeholder="Price" formControlName="price">
              <input type="number" placeholder="Stock" formControlName="stockQty">
              <textarea rows="3" placeholder="Description" formControlName="description"></textarea>
              <button type="submit" [disabled]="loading()">{{ loading() ? 'Saving...' : 'Save product' }}</button>
            </form>
          </div>
        </div>

        <div class="card table-card">
          <h2>Product Catalog</h2>
          <div class="inventory-row" *ngFor="let product of products()">
            <div>
              <strong>{{ product.name }}</strong>
              <p>{{ product.category }} • {{ product.brand }} • {{ product.price | currency:'INR':'symbol':'1.0-0' }}</p>
            </div>
            <button type="button" class="danger" (click)="deleteProduct(product.id)">Delete</button>
          </div>
          <p *ngIf="message()" class="message">{{ message() }}</p>
        </div>
      </div>

      <!-- Inventory Tab -->
      <div *ngIf="activeTab() === 'Inventory'" class="tab-content">
        <div class="card table-card">
          <h2>Manage Inventory</h2>
          <div class="inventory-row" *ngFor="let item of inventory()">
            <div>
              <strong>{{ item.productName }}</strong>
              <p>{{ item.category }} • {{ item.brand }}</p>
            </div>
            <div class="stock-editor">
              <input type="number" [value]="item.stockQty" #stockBox>
              <button type="button" (click)="updateInventory(item.productId, stockBox.value)">Update</button>
              <button type="button" class="danger" (click)="deleteProduct(item.productId)">Delete</button>
            </div>
          </div>
          <p *ngIf="message()" class="message">{{ message() }}</p>
        </div>
      </div>

      <!-- Promotions Tab -->
      <div *ngIf="activeTab() === 'Promotions'" class="tab-content">
        <div class="admin-grid">
          <div class="card">
            <h2>Create Promotion Banner</h2>
            <form [formGroup]="promotionForm" (ngSubmit)="savePromotion()">
              <input type="text" placeholder="Title" formControlName="title">
              <textarea rows="3" placeholder="Description" formControlName="description"></textarea>
              <input type="datetime-local" formControlName="startDate">
              <input type="datetime-local" formControlName="endDate">
              <button type="submit" [disabled]="loading()">{{ loading() ? 'Publishing...' : 'Publish banner' }}</button>
            </form>
          </div>
        </div>
      </div>

      <!-- Orders Tab -->
      <div *ngIf="activeTab() === 'Orders'" class="tab-content">
        <div class="card table-card orders-table">
          <h2>All Customer Orders</h2>
          <div *ngIf="orders().length === 0" class="no-data">
            <p>No orders yet</p>
          </div>
          <div *ngFor="let order of orders()" class="order-card">
            <div class="order-header">
              <div>
                <strong>Order #{{ order.id }}</strong>
                <span class="status" [class]="'status-' + order.status.toLowerCase()">{{ order.status }}</span>
              </div>
              <div class="order-meta">
                <p>{{ order.placedAt | date:'short' }}</p>
                <p class="amount">{{ order.totalAmount | currency:'INR':'symbol':'1.0-0' }}</p>
              </div>
            </div>
            <div class="order-items">
              <div *ngFor="let item of order.items" class="order-item">
                <span>{{ item.productName }} x {{ item.quantity }}</span>
                <span>{{ (item.unitPrice * item.quantity) | currency:'INR':'symbol':'1.0-0' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p *ngIf="error()" class="error-message">{{ error() }}</p>
    </section>
  `,
  styles: [`
    .admin-container { padding: 1.5rem; max-width: 1400px; margin: 0 auto; }
    .admin-header { margin-bottom: 2rem; }
    .admin-header h1 { margin: 0 0 1rem 0; font-size: 2rem; }
    .tabs {
      display: flex;
      gap: 0.75rem;
      border-bottom: 2px solid var(--line);
      flex-wrap: wrap;
    }
    .tabs button {
      border: none;
      background: transparent;
      padding: 1rem;
      cursor: pointer;
      font-weight: 600;
      color: var(--muted);
      border-bottom: 3px solid transparent;
      transition: all 0.2s;
    }
    .tabs button.active {
      color: var(--primary);
      border-bottom-color: var(--primary);
    }
    .tabs button:hover:not(.active) {
      color: var(--text);
    }
    .tab-content { animation: fadeIn 0.3s ease-in; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .admin-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; margin-bottom: 1rem; }
    .card { background: var(--surface); border-radius: var(--radius); box-shadow: var(--shadow); padding: 1.5rem; }
    form { display: grid; gap: 0.75rem; }
    input, textarea {
      width: 100%; padding: 0.9rem 1rem; border-radius: 14px; border: 1px solid var(--line); font-family: inherit;
    }
    button {
      padding: 0.8rem 1rem; border: 0; border-radius: 14px; background: var(--primary); color: white; cursor: pointer; font-weight: 700; transition: opacity 0.2s;
    }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    button:not(:disabled):hover { opacity: 0.9; }
    .table-card { margin-top: 1rem; }
    .inventory-row {
      display: flex; justify-content: space-between; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid var(--line); align-items: center;
    }
    .inventory-row:last-child { border-bottom: 0; }
    .stock-editor { display: flex; gap: 0.75rem; align-items: center; }
    .stock-editor input { width: 100px; }
    .danger { background: #ffe7e4; color: var(--primary); }
    .message, .error-message { color: var(--success); padding: 1rem; margin-top: 1rem; border-radius: 8px; background: #f0fdf4; }
    .error-message { color: #dc2626; background: #fef2f2; }
    
    /* Orders Styling */
    .orders-table { }
    .no-data { text-align: center; padding: 2rem; color: var(--muted); }
    .order-card {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
      background: #fafafa;
    }
    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--line);
    }
    .order-header strong { font-size: 1.1rem; }
    .status {
      display: inline-block;
      padding: 0.3rem 0.7rem;
      border-radius: 999px;
      font-size: 0.85rem;
      font-weight: 600;
      margin-left: 0.5rem;
    }
    .status-placed { background: #dbeafe; color: #1e40af; }
    .status-processing { background: #fef3c7; color: #92400e; }
    .status-delivered { background: #dcfce7; color: #166534; }
    .order-meta { text-align: right; }
    .order-meta p { margin: 0.25rem 0; color: var(--muted); font-size: 0.9rem; }
    .order-meta .amount { font-weight: 700; color: var(--primary); font-size: 1.1rem; }
    .order-items { padding: 0.5rem 0; }
    .order-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      font-size: 0.95rem;
    }

    @media (max-width: 900px) {
      .admin-grid { grid-template-columns: 1fr; }
      .inventory-row { flex-direction: column; align-items: flex-start; }
      .stock-editor { width: 100%; }
      .stock-editor input { flex: 1; min-width: 0; }
      .order-header { flex-direction: column; }
      .order-meta { text-align: left; margin-top: 0.5rem; }
      .tabs { overflow-x: auto; }
    }
  `]
})
export class AdminPanelComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  
  readonly inventory = signal<InventoryItem[]>([]);
  readonly products = signal<Product[]>([]);
  readonly orders = signal<Order[]>([]);
  readonly message = signal('');
  readonly error = signal('');
  readonly loading = signal(false);
  readonly activeTab = signal('Products');
  readonly tabs = ['Products', 'Inventory', 'Promotions', 'Orders'];

  readonly productForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    category: ['Pizza', Validators.required],
    brand: ['', Validators.required],
    packaging: ['', Validators.required],
    price: [0, Validators.required],
    stockQty: [0, Validators.required],
    description: ['', Validators.required],
    isActive: [true, Validators.required]
  });

  readonly promotionForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required]
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.api.getInventory().subscribe({
      next: (inventory) => this.inventory.set(inventory),
      error: (err) => this.handleError('Failed to load inventory', err)
    });
    this.api.getProducts().subscribe({
      next: (products) => this.products.set(products),
      error: (err) => this.handleError('Failed to load products', err)
    });
    this.api.getAllOrders().subscribe({
      next: (orders) => this.orders.set(orders),
      error: (err) => this.handleError('Failed to load orders', err)
    });
  }

  saveProduct(): void {
    if (this.productForm.invalid) {
      this.toast.error('Please fill all required fields');
      return;
    }
    this.loading.set(true);
    this.api.createProduct(this.productForm.getRawValue()).subscribe({
      next: () => {
        this.message.set('✓ Product saved successfully.');
        this.toast.success('Product created!');
        this.productForm.reset({ name: '', category: 'Pizza', brand: '', packaging: '', price: 0, stockQty: 0, description: '', isActive: true });
        this.loading.set(false);
        this.loadData();
      },
      error: (err) => {
        this.loading.set(false);
        this.handleError('Failed to save product', err);
      }
    });
  }

  savePromotion(): void {
    if (this.promotionForm.invalid) {
      this.toast.error('Please fill all required fields');
      return;
    }
    this.loading.set(true);
    this.api.createPromotion(this.promotionForm.getRawValue()).subscribe({
      next: () => {
        this.message.set('✓ Promotion published.');
        this.toast.success('Promotion created!');
        this.promotionForm.reset({ title: '', description: '', startDate: '', endDate: '' });
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.handleError('Failed to save promotion', err);
      }
    });
  }

  updateInventory(productId: number, stockValue: string): void {
    this.api.updateInventory(productId, Number(stockValue)).subscribe({
      next: () => {
        this.message.set('✓ Inventory updated.');
        this.toast.success('Stock updated!');
        this.loadData();
      },
      error: (err) => this.handleError('Failed to update inventory', err)
    });
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.api.deleteProduct(id).subscribe({
        next: () => {
          this.message.set('✓ Product deleted.');
          this.toast.success('Product deleted!');
          this.loadData();
        },
        error: (err) => this.handleError('Failed to delete product', err)
      });
    }
  }

  private handleError(message: string, err: unknown): void {
    this.error.set(message);
    this.toast.error(message);
    console.error(message, err);
  }
}
