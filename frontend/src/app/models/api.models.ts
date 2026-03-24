export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  loyaltyPoints: number;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  brand: string;
  packaging: string;
  price: number;
  description: string;
  isActive: boolean;
  stockQty: number;
}

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  category: string;
  brand: string;
  packaging: string;
  price: number;
  quantity: number;
  stockQty: number;
}

export interface CartResponse {
  items: CartItem[];
  subtotal: number;
}

export interface Promotion {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: number;
  totalAmount: number;
  status: string;
  placedAt: string;
  items: OrderItem[];
}

export interface CouponValidation {
  valid: boolean;
  code: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  finalAmount: number;
  message: string;
}

export interface InventoryItem {
  productId: number;
  productName: string;
  category: string;
  brand: string;
  stockQty: number;
  updatedAt: string;
}
