import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { AuthResponse, User } from '../models/api.models';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly baseUrl = 'http://localhost:5001/api/auth';
  readonly user = signal<User | null>(this.readUser());

  register(payload: { name: string; email: string; password: string }) {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, payload).pipe(
      tap((response) => {
        this.persistSession(response);
        this.toast.success('Account created successfully!');
      })
    );
  }

  login(payload: { email: string; password: string }) {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, payload).pipe(
      tap((response) => {
        this.persistSession(response);
        this.toast.success(`Welcome, ${response.user.name}!`);
      })
    );
  }

  fetchProfile() {
    return this.http.get<User>(`${this.baseUrl}/profile`).pipe(
      tap((user) => {
        localStorage.setItem('retail_user', JSON.stringify(user));
        this.user.set(user);
      })
    );
  }

  updateProfile(payload: { name: string; email: string }) {
    return this.http.put<User>(`${this.baseUrl}/profile`, payload).pipe(
      tap((user) => {
        localStorage.setItem('retail_user', JSON.stringify(user));
        this.user.set(user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('retail_token');
    localStorage.removeItem('retail_user');
    localStorage.removeItem('retail_last_order');
    this.user.set(null);
    this.toast.success('Logged out successfully!');
    void this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('retail_token');
  }

  isAdmin(): boolean {
    return this.user()?.role === 'Admin';
  }

  private persistSession(response: AuthResponse): void {
    localStorage.setItem('retail_token', response.token);
    localStorage.setItem('retail_user', JSON.stringify(response.user));
    this.user.set(response.user);
  }

  private readUser(): User | null {
    const raw = localStorage.getItem('retail_user');
    return raw ? JSON.parse(raw) as User : null;
  }
}
