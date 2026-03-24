import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let toast of toastService.toasts()"
        [class]="'toast toast-' + toast.type"
        (click)="toastService.remove(toast.id)"
      >
        <span class="toast-icon">
          <span *ngIf="toast.type === 'success'" class="icon">✓</span>
          <span *ngIf="toast.type === 'error'" class="icon">✕</span>
          <span *ngIf="toast.type === 'info'" class="icon">ℹ</span>
        </span>
        <span class="toast-message">{{ toast.message }}</span>
        <button type="button" class="toast-close" (click)="toastService.remove(toast.id); $event.stopPropagation()">×</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      border-radius: 0.5rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
      pointer-events: auto;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.95rem;
      backdrop-filter: blur(10px);
    }

    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .toast-success {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(22, 163, 74, 0.95));
      color: white;
      border-left: 4px solid #22c55e;
    }

    .toast-error {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95));
      color: white;
      border-left: 4px solid #ef4444;
    }

    .toast-info {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(37, 99, 235, 0.95));
      color: white;
      border-left: 4px solid #3b82f6;
    }

    .toast-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      font-weight: bold;
    }

    .toast-message {
      flex: 1;
    }

    .toast-close {
      background: transparent;
      border: none;
      color: inherit;
      cursor: pointer;
      font-size: 1.5rem;
      padding: 0;
      line-height: 1;
      opacity: 0.7;
      transition: opacity 0.2s;
    }

    .toast-close:hover {
      opacity: 1;
    }

    @media (max-width: 600px) {
      .toast-container {
        left: 0.5rem;
        right: 0.5rem;
      }

      .toast {
        padding: 0.75rem 1rem;
      }
    }
  `]
})
export class ToastComponent {
  readonly toastService = inject(ToastService);
}
