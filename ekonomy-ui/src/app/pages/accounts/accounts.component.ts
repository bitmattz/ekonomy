import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { Account, AccountType } from '../../core/models/account.model';
import { AccountService } from '../../core/services/account.service';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [
    CommonModule, CurrencyPipe, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDialogModule, MatTableModule, MatChipsModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Accounts</h1>
        <button mat-flat-button color="primary" (click)="openForm()">
          <mat-icon>add</mat-icon> New Account
        </button>
      </div>

      <ng-container *ngIf="!showForm">
        <div class="card-grid">
          <mat-card class="account-card" *ngFor="let account of accounts">
            <mat-card-content>
              <div class="account-header">
                <div class="account-icon-wrap">
                  <mat-icon>{{ accountIcon(account.type) }}</mat-icon>
                </div>
                <div class="account-actions">
                  <button mat-icon-button (click)="edit(account)"><mat-icon>edit</mat-icon></button>
                  <button mat-icon-button color="warn" (click)="delete(account)"><mat-icon>delete</mat-icon></button>
                </div>
              </div>
              <div class="account-name">{{ account.name }}</div>
              <div class="account-type-label">{{ account.type | titlecase }}</div>
              <div class="account-balance" [class.negative]="account.balance < 0">
                {{ account.balance | currency:'BRL':'symbol':'1.2-2' }}
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <mat-card *ngIf="accounts.length === 0" class="empty-state">
          <mat-card-content>
            <mat-icon>account_balance</mat-icon>
            <p>No accounts yet. Create your first account!</p>
          </mat-card-content>
        </mat-card>
      </ng-container>

      <mat-card *ngIf="showForm" class="form-card">
        <mat-card-header>
          <mat-card-title>{{ editingId ? 'Edit Account' : 'New Account' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Name</mat-label>
              <input matInput formControlName="name" placeholder="e.g. Main Checking">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Type</mat-label>
              <mat-select formControlName="type">
                <mat-option value="CHECKING">Checking</mat-option>
                <mat-option value="SAVINGS">Savings</mat-option>
                <mat-option value="CREDIT_CARD">Credit Card</mat-option>
                <mat-option value="INVESTMENT">Investment</mat-option>
                <mat-option value="WALLET">Wallet</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width" *ngIf="!editingId">
              <mat-label>Initial Balance</mat-label>
              <input matInput type="number" formControlName="balance" step="0.01">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Currency</mat-label>
              <mat-select formControlName="currency">
                <mat-option value="BRL">BRL (R$)</mat-option>
                <mat-option value="USD">USD ($)</mat-option>
                <mat-option value="EUR">EUR (€)</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Balance</mat-label>
              <input matInput formControlName="balance" placeholder="e.g. 1000.00">
            </mat-form-field>

            <div class="form-actions">
              <button mat-button type="button" (click)="cancelForm()">Cancel</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">
                {{ editingId ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .account-card { cursor: default; }

    .account-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .account-icon-wrap {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: rgba(57,73,171,0.1);
      display: flex;
      align-items: center;
      justify-content: center;

      mat-icon { color: #3949ab; }
    }

    .account-name { font-size: 18px; font-weight: 600; color: #333; }
    .account-type-label { font-size: 13px; color: #888; margin: 2px 0 12px; }

    .account-balance {
      font-size: 24px;
      font-weight: 700;
      color: #333;

      &.negative { color: #f44336; }
    }

    .empty-state mat-card-content {
      text-align: center;
      padding: 48px;
      color: #aaa;

      mat-icon { font-size: 64px; width: 64px; height: 64px; }
      p { font-size: 16px; margin-top: 12px; }
    }

    .form-card { max-width: 500px; }

    .form-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 8px;
    }
  `]
})
export class AccountsComponent implements OnInit {
  accounts: Account[] = [];
  form: FormGroup;
  showForm = false;
  editingId: number | null = null;

  constructor(private accountService: AccountService, private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      type: ['CHECKING', Validators.required],
      balance: [0],
      currency: ['BRL', Validators.required]
    });
  }

  ngOnInit() {
    this.loadAccounts();
  }

  loadAccounts() {
    this.accountService.list().subscribe(accounts => this.accounts = accounts);
  }

  openForm() {
    this.editingId = null;
    this.form.reset({ type: 'CHECKING', balance: 0, currency: 'BRL' });
    this.showForm = true;
  }

  edit(account: Account) {
    this.editingId = account.id ?? null;
    this.form.patchValue(account);
    this.showForm = true;
  }

  cancelForm() {
    this.showForm = false;
    this.editingId = null;
  }

  onSubmit() {
    if (this.form.invalid) return;
    const value = this.form.value as Account;

    const op = this.editingId
      ? this.accountService.update(this.editingId, value)
      : this.accountService.create(value);

    op.subscribe(() => {
      this.loadAccounts();
      this.cancelForm();
    });
  }

  delete(account: Account) {
    if (!account.id || !confirm(`Delete account "${account.name}"?`)) return;
    this.accountService.delete(account.id).subscribe(() => this.loadAccounts());
  }

  accountIcon(type: string): string {
    const icons: Record<string, string> = {
      CHECKING: 'account_balance', SAVINGS: 'savings',
      CREDIT_CARD: 'credit_card', INVESTMENT: 'trending_up', WALLET: 'account_balance_wallet'
    };
    return icons[type] ?? 'account_balance';
  }
}
