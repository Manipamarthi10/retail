import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="profile-layout">
      <div class="card">
        <h1>Profile</h1>
        <form [formGroup]="form" (ngSubmit)="save()">
          <label>Name<input type="text" formControlName="name"></label>
          <label>Email<input type="email" formControlName="email"></label>
          <button type="submit">Update profile</button>
        </form>
        <p *ngIf="message()" class="message">{{ message() }}</p>
      </div>
      <aside class="card points">
        <span>Loyalty points</span>
        <strong>{{ points() }}</strong>
        <p>You earn 1 point for every 10 currency spent.</p>
      </aside>
    </section>
  `,
  styles: [`
    .profile-layout { display: grid; grid-template-columns: 1.3fr 0.8fr; gap: 1rem; }
    .card { background: var(--surface); border-radius: var(--radius); box-shadow: var(--shadow); padding: 1.5rem; }
    form { display: grid; gap: 1rem; }
    label { display: grid; gap: 0.45rem; font-weight: 600; }
    input { padding: 0.95rem 1rem; border-radius: 14px; border: 1px solid var(--line); }
    button { width: fit-content; border: 0; border-radius: 14px; padding: 0.9rem 1.1rem; background: var(--primary); color: white; cursor: pointer; font-weight: 700; }
    .points strong { font-size: 3rem; color: var(--primary); }
    .message { color: var(--success); }
    @media (max-width: 900px) { .profile-layout { grid-template-columns: 1fr; } }
  `]
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  readonly points = signal(0);
  readonly message = signal('');

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]]
  });

  ngOnInit(): void {
    const currentUser = this.auth.user();
    if (currentUser) {
      this.form.patchValue({ name: currentUser.name, email: currentUser.email });
    }

    this.api.getLoyalty().subscribe((response) => this.points.set(response.loyaltyPoints));
  }

  save(): void {
    if (this.form.invalid) return;
    this.message.set('');
    this.auth.updateProfile(this.form.getRawValue()).subscribe(() => {
      this.message.set('Profile updated successfully.');
    });
  }
}
