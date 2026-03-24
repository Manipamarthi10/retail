import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { InventoryItem, Product } from '../../models/api.models';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="admin-grid">
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
          <button type="submit">Save product</button>
        </form>
      </div>

      <div class="card">
        <h2>Create Promotion</h2>
        <form [formGroup]="promotionForm" (ngSubmit)="savePromotion()">
          <input type="text" placeholder="Title" formControlName="title">
          <textarea rows="3" placeholder="Description" formControlName="description"></textarea>
          <input type="datetime-local" formControlName="startDate">
          <input type="datetime-local" formControlName="endDate">
          <button type="submit">Publish banner</button>
        </form>
      </div>
    </section>

    <section class="card table-card">
      <h2>Inventory</h2>
      <div class="inventory-row" *ngFor="let item of inventory()">
        <div>
          <strong>{{ item.productName }}</strong>
          <p>{{ item.category }} • {{ item.brand }}</p>
        </div>
        <div class="stock-editor">
          <input type="number" [value]="item.stockQty" #stockBox>
          <button type="button" (click)="updateInventory(item.productId, stockBox.value)">Update</button>
        </div>
      </div>
    </section>

    <section class="card table-card">
      <h2>Product Catalog</h2>
      <div class="inventory-row" *ngFor="let product of products()">
        <div>
          <strong>{{ product.name }}</strong>
          <p>{{ product.category }} • {{ product.brand }} • {{ product.price | currency:'INR':'symbol':'1.0-0' }}</p>
        </div>
        <button type="button" class="danger" (click)="deleteProduct(product.id)">Delete</button>
      </div>
      <p *ngIf="message()" class="message">{{ message() }}</p>
    </section>
  `,
  styles: [`
    .admin-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; margin-bottom: 1rem; }
    .card { background: var(--surface); border-radius: var(--radius); box-shadow: var(--shadow); padding: 1.5rem; }
    form { display: grid; gap: 0.75rem; }
    input, textarea {
      width: 100%; padding: 0.9rem 1rem; border-radius: 14px; border: 1px solid var(--line);
    }
    button {
      width: fit-content; border: 0; border-radius: 14px; padding: 0.8rem 1rem; background: var(--primary); color: white; cursor: pointer; font-weight: 700;
    }
    .table-card { margin-top: 1rem; }
    .inventory-row { display: flex; justify-content: space-between; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid var(--line); }
    .inventory-row:last-child { border-bottom: 0; }
    .stock-editor { display: flex; gap: 0.75rem; align-items: center; }
    .stock-editor input { width: 100px; }
    .danger { background: #ffe7e4; color: var(--primary); }
    .message { color: var(--success); }
    @media (max-width: 900px) { .admin-grid { grid-template-columns: 1fr; } .inventory-row { flex-direction: column; } }
  `]
})
export class AdminPanelComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  readonly inventory = signal<InventoryItem[]>([]);
  readonly products = signal<Product[]>([]);
  readonly message = signal('');

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
    this.api.getInventory().subscribe((inventory) => this.inventory.set(inventory));
    this.api.getProducts().subscribe((products) => this.products.set(products));
  }

  saveProduct(): void {
    if (this.productForm.invalid) return;
    this.api.createProduct(this.productForm.getRawValue()).subscribe(() => {
      this.message.set('Product saved successfully.');
      this.productForm.reset({ name: '', category: 'Pizza', brand: '', packaging: '', price: 0, stockQty: 0, description: '', isActive: true });
      this.loadData();
    });
  }

  savePromotion(): void {
    if (this.promotionForm.invalid) return;
    this.api.createPromotion(this.promotionForm.getRawValue()).subscribe(() => {
      this.message.set('Promotion published.');
      this.promotionForm.reset({ title: '', description: '', startDate: '', endDate: '' });
    });
  }

  updateInventory(productId: number, stockValue: string): void {
    this.api.updateInventory(productId, Number(stockValue)).subscribe(() => {
      this.message.set('Inventory updated.');
      this.loadData();
    });
  }

  deleteProduct(id: number): void {
    this.api.deleteProduct(id).subscribe(() => {
      this.message.set('Product deleted.');
      this.loadData();
    });
  }
}
