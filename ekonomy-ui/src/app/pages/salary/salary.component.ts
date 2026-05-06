import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SalaryService } from '../../core/services/salary.service';
import { Salary } from '../../core/models/salary.model';

@Component({
  selector: 'app-salary',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Salary</h1>
        <button mat-flat-button color="primary" (click)="openForm()" *ngIf="!showForm">
          <mat-icon>add</mat-icon> New Salary
        </button>
      </div>

      <mat-card *ngIf="showForm" class="form-card">
        <mat-card-header>
          <mat-card-title>{{ editingId ? 'Edit' : 'New' }} Salary</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field appearance="outline" class="field-grow">
                <mat-label>Name</mat-label>
                <input matInput formControlName="name">
              </mat-form-field>
              <mat-form-field appearance="outline" class="field-amount">
                <mat-label>Amount (R$)</mat-label>
                <input matInput type="number" formControlName="amount" step="0.01" min="0.01">
              </mat-form-field>
            </div>

            <p class="hint">Allocation — total: <strong>{{ totalPct | number:'1.0-2' }}%</strong>
              &nbsp;·&nbsp; unallocated: <strong>{{ 100 - totalPct | number:'1.0-2' }}%</strong></p>

            <div class="form-row pct-row">
              <mat-form-field appearance="outline">
                <mat-label>Investments %</mat-label>
                <input matInput type="number" formControlName="investment_percentage" min="0" max="100" step="0.01">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Lifestyle cap %</mat-label>
                <input matInput type="number" formControlName="lifestyle_percentage" min="0" max="100" step="0.01">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Emergency fund %</mat-label>
                <input matInput type="number" formControlName="emergency_percentage" min="0" max="100" step="0.01">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Reward %</mat-label>
                <input matInput type="number" formControlName="reward_percentage" min="0" max="100" step="0.01">
              </mat-form-field>
            </div>

            <p class="error-hint" *ngIf="totalPct > 100">Total allocation exceeds 100%.</p>

            <div class="form-actions">
              <button mat-button type="button" (click)="cancelForm()">Cancel</button>
              <button mat-flat-button color="primary" type="submit"
                      [disabled]="form.invalid || totalPct > 100">Save</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <div class="salaries-grid">
        <mat-card *ngFor="let s of salaries" class="salary-card">
          <mat-card-header>
            <div class="card-title-row">
              <div>
                <mat-card-title>{{ s.name }}</mat-card-title>
                <mat-card-subtitle>{{ s.amount | currency:'BRL':'symbol':'1.2-2' }} / month</mat-card-subtitle>
              </div>
              <div class="card-actions">
                <button mat-icon-button (click)="edit(s)"><mat-icon>edit</mat-icon></button>
                <button mat-icon-button color="warn" (click)="remove(s)"><mat-icon>delete</mat-icon></button>
              </div>
            </div>
          </mat-card-header>
          <mat-card-content>
            <div class="alloc-list">
              <div class="alloc-row" *ngFor="let cat of categories(s)">
                <div class="alloc-meta">
                  <span class="alloc-label">{{ cat.label }}</span>
                  <span class="alloc-pct">{{ cat.pct | number:'1.0-2' }}%</span>
                </div>
                <div class="bar-wrap">
                  <div class="bar" [class]="cat.color" [style.width.%]="cat.pct"></div>
                </div>
                <span class="alloc-amount">{{ cat.amount | currency:'BRL':'symbol':'1.2-2' }}</span>
              </div>

              <div class="alloc-row unalloc" *ngIf="unallocPct(s) > 0">
                <div class="alloc-meta">
                  <span class="alloc-label">Unallocated</span>
                  <span class="alloc-pct">{{ unallocPct(s) | number:'1.0-2' }}%</span>
                </div>
                <div class="bar-wrap">
                  <div class="bar gray" [style.width.%]="unallocPct(s)"></div>
                </div>
                <span class="alloc-amount">{{ unallocAmount(s) | currency:'BRL':'symbol':'1.2-2' }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <p class="empty-msg" *ngIf="salaries.length === 0 && !showForm">
        No salary configured yet. Add one to see your budget breakdown.
      </p>
    </div>
  `,
  styles: [`
    .form-card { max-width: 800px; margin-bottom: 24px; }

    .form-row { display: flex; gap: 16px; &.pct-row { flex-wrap: wrap; } }
    .field-grow { flex: 2; }
    .field-amount { flex: 1; }
    .pct-row mat-form-field { flex: 1; min-width: 160px; }

    .hint { font-size: 13px; color: #555; margin: 0 0 12px; }
    .error-hint { font-size: 12px; color: #f44336; margin-bottom: 8px; }

    .form-actions { display: flex; gap: 8px; justify-content: flex-end; }

    .salaries-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
      gap: 16px;
    }

    .card-title-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
    }

    .card-actions { display: flex; }

    .alloc-list { margin-top: 8px; }

    .alloc-row {
      display: grid;
      grid-template-columns: 180px 1fr 140px;
      align-items: center;
      gap: 12px;
      padding: 7px 0;
      border-bottom: 1px solid #f0f0f0;
      &:last-child { border-bottom: none; }
      &.unalloc { opacity: 0.55; }
    }

    .alloc-meta {
      display: flex;
      justify-content: space-between;
      .alloc-label { font-size: 13px; font-weight: 500; }
      .alloc-pct { font-size: 12px; color: #888; }
    }

    .bar-wrap { height: 8px; background: #eeeeee; border-radius: 4px; overflow: hidden; }
    .bar {
      height: 100%; border-radius: 4px; transition: width 0.3s;
      &.green  { background: #4caf50; }
      &.blue   { background: #2196f3; }
      &.orange { background: #ff9800; }
      &.purple { background: #9c27b0; }
      &.gray   { background: #bdbdbd; }
    }

    .alloc-amount { font-size: 13px; font-weight: 600; text-align: right; color: #333; }

    .empty-msg { text-align: center; color: #888; padding: 48px; }
  `]
})
export class SalaryComponent implements OnInit {
  salaries: Salary[] = [];
  showForm = false;
  editingId: number | null = null;
  form: FormGroup;

  constructor(private salaryService: SalaryService, private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      investment_percentage: [0],
      lifestyle_percentage: [0],
      emergency_percentage: [0],
      reward_percentage: [0]
    });
  }

  ngOnInit() { this.load(); }

  load() { this.salaryService.list().subscribe(s => this.salaries = s); }

  get totalPct(): number {
    const f = this.form.value;
    return (Number(f.investment_percentage) || 0) + (Number(f.lifestyle_percentage) || 0)
         + (Number(f.emergency_percentage) || 0)  + (Number(f.reward_percentage) || 0);
  }

  categories(s: Salary) {
    return [
      { label: 'Investments',    pct: Number(s.investment_percentage), color: 'green'  },
      { label: 'Lifestyle cap',  pct: Number(s.lifestyle_percentage),  color: 'blue'   },
      { label: 'Emergency fund', pct: Number(s.emergency_percentage),  color: 'orange' },
      { label: 'Reward',         pct: Number(s.reward_percentage),     color: 'purple' },
    ]
      .filter(c => c.pct > 0)
      .map(c => ({ ...c, amount: Number(s.amount) * c.pct / 100 }));
  }

  unallocPct(s: Salary): number {
    const used = Number(s.investment_percentage) + Number(s.lifestyle_percentage)
               + Number(s.emergency_percentage)  + Number(s.reward_percentage);
    return Math.max(0, 100 - used);
  }

  unallocAmount(s: Salary): number {
    return Number(s.amount) * this.unallocPct(s) / 100;
  }

  openForm() {
    this.editingId = null;
    this.form.reset({ investment_percentage: 0, lifestyle_percentage: 0,
                      emergency_percentage: 0, reward_percentage: 0 });
    this.showForm = true;
  }

  edit(s: Salary) {
    this.editingId = s.id ?? null;
    this.form.patchValue(s);
    this.showForm = true;
  }

  cancelForm() { this.showForm = false; this.editingId = null; }

  onSubmit() {
    if (this.form.invalid || this.totalPct > 100) return;
    const value = this.form.value as Salary;
    const op = this.editingId
      ? this.salaryService.update(this.editingId, value)
      : this.salaryService.create(value);
    op.subscribe(() => { this.load(); this.cancelForm(); });
  }

  remove(s: Salary) {
    if (!s.id || !confirm(`Delete "${s.name}"?`)) return;
    this.salaryService.delete(s.id).subscribe(() => this.load());
  }
}
