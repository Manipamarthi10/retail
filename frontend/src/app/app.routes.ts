import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';
import { authGuard } from './guards/auth.guard';
import { AppShellComponent } from './components/layout/app-shell.component';
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
import { HomeComponent } from './components/home/home.component';
import { ProductListComponent } from './components/products/product-list.component';
import { CartComponent } from './components/cart/cart.component';
import { CheckoutComponent } from './components/orders/checkout.component';
import { OrderSuccessComponent } from './components/orders/order-success.component';
import { OrderHistoryComponent } from './components/orders/order-history.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AdminPanelComponent } from './components/admin/admin-panel.component';
import { notAdminGuard } from './guards/not-admin.guard';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'products', component: ProductListComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'cart', component: CartComponent, canActivate: [authGuard, notAdminGuard] },
      { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard, notAdminGuard] },
      { path: 'order-confirmation', component: OrderSuccessComponent, canActivate: [authGuard, notAdminGuard] },
      { path: 'orders', component: OrderHistoryComponent, canActivate: [authGuard, notAdminGuard] },
      { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
      { path: 'admin', component: AdminPanelComponent, canActivate: [adminGuard] }
    ]
  },
  { path: '**', redirectTo: '' }
];
