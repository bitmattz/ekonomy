import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Transaction, TransferRequest } from '../../core/models/transaction.model';
import { Account } from '../../core/models/account.model';
import { Category } from '../../core/models/category.model';
import { TransactionService } from '../../core/services/transaction.service';
import { AccountService } from '../../core/services/account.service';
import { CategoryService } from '../../core/services/category.service';

type FormMode = 'transaction' | 'transfer';

@Component({
  selector: 'app-transactions',
  standalone: true,
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }
  ],
  imports: [
    CommonModule, CurrencyPipe, DatePipe, ReactiveFormsModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatTableModule, MatChipsModule,
    MatButtonToggleModule, MatDatepickerModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Transactions</h1>
        <div class="header-actions">
          <button mat-stroked-button (click)="openTransferForm()">
            <mat-icon>swap_horiz</mat-icon> New Transfer
          </button>
          <button mat-flat-button color="primary" (click)="openForm()">
            <mat-icon>add</mat-icon> New Transaction
          </button>
        </div>
      </div>

      <ng-container *ngIf="!showForm">
        <mat-button-toggle-group [(ngModel)]="filterType" (change)="applyFilter()" class="filter-toggle">
          <mat-button-toggle value="">All</mat-button-toggle>
          <mat-button-toggle value="INCOME">Income</mat-button-toggle>
          <mat-button-toggle value="EXPENSE">Expense</mat-button-toggle>
          <mat-button-toggle value="TRANSFER">Transfer</mat-button-toggle>
        </mat-button-toggle-group>

        <mat-card>
          <mat-card-content style="padding: 0">
            <table mat-table [dataSource]="filteredTransactions">
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let tx">{{ tx.date | date:'dd/MM/yyyy' }}</td>
              </ng-container>

              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Description</th>
                <td mat-cell *matCellDef="let tx">
                  <div class="tx-desc">{{ tx.description }}</div>
                  <div class="tx-sub" *ngIf="tx.categoryName">{{ tx.categoryName }}</div>
                </td>
              </ng-container>

              <ng-container matColumnDef="account">
                <th mat-header-cell *matHeaderCellDef>Account</th>
                <td mat-cell *matCellDef="let tx">{{ tx.accountName }}</td>
              </ng-container>

              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let tx">
                  <span class="type-chip" [ngClass]="chipClass(tx.type)">
                    {{ typeLabel(tx.type) }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef style="text-align:right">Amount</th>
                <td mat-cell *matCellDef="let tx" style="text-align:right">
                  <span [ngClass]="amountClass(tx.type)" class="amount">
                    {{ amountPrefix(tx.type) }}{{ tx.amount | currency:'BRL':'symbol':'1.2-2' }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="actions-col"></th>
                <td mat-cell *matCellDef="let tx" class="actions-col">
                  <button mat-icon-button (click)="edit(tx)" [disabled]="isTransfer(tx)" [title]="isTransfer(tx) ? 'Delete and recreate to edit a transfer' : ''">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="delete(tx)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="columns"></tr>
              <tr mat-row *matRowDef="let row; columns: columns"></tr>
            </table>

            <p class="empty-msg" *ngIf="filteredTransactions.length === 0">No transactions found.</p>
          </mat-card-content>
        </mat-card>
      </ng-container>

      <!-- Transaction form -->
      <mat-card *ngIf="showForm && formMode === 'transaction'" class="form-card">
        <mat-card-header>
          <mat-card-title>{{ editingId ? 'Edit Transaction' : 'New Transaction' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Type</mat-label>
              <mat-select formControlName="type">
                <mat-option value="INCOME">Income</mat-option>
                <mat-option value="EXPENSE">Expense</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <input matInput formControlName="description">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Amount</mat-label>
              <input matInput type="number" formControlName="amount" step="0.01" min="0.01">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Date</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="date" placeholder="dd/mm/yyyy">
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Account</mat-label>
              <mat-select formControlName="accountId">
                <mat-option *ngFor="let a of accounts" [value]="a.id">{{ a.name }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Category (optional)</mat-label>
              <mat-select formControlName="categoryId">
                <mat-option [value]="null">None</mat-option>
                <mat-option *ngFor="let c of filteredCategories" [value]="c.id">{{ c.name }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Notes (optional)</mat-label>
              <textarea matInput formControlName="notes" rows="2"></textarea>
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

      <!-- Transfer form -->
      <mat-card *ngIf="showForm && formMode === 'transfer'" class="form-card">
        <mat-card-header>
          <mat-card-title>New Transfer</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="transferForm" (ngSubmit)="onSubmitTransfer()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>From account</mat-label>
              <mat-select formControlName="fromAccountId">
                <mat-option *ngFor="let a of accounts" [value]="a.id">{{ a.name }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>To account</mat-label>
              <mat-select formControlName="toAccountId">
                <mat-option *ngFor="let a of accounts" [value]="a.id">{{ a.name }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Amount</mat-label>
              <input matInput type="number" formControlName="amount" step="0.01" min="0.01">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Date</mat-label>
              <input matInput [matDatepicker]="transferPicker" formControlName="date" placeholder="dd/mm/yyyy">
              <mat-datepicker-toggle matIconSuffix [for]="transferPicker"></mat-datepicker-toggle>
              <mat-datepicker #transferPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <input matInput formControlName="description">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Notes (optional)</mat-label>
              <textarea matInput formControlName="notes" rows="2"></textarea>
            </mat-form-field>

            <div class="form-actions">
              <button mat-button type="button" (click)="cancelForm()">Cancel</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="transferForm.invalid">
                Transfer
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .header-actions { display: flex; gap: 8px; }
    .filter-toggle { margin-bottom: 16px; }

    .tx-desc { font-weight: 500; font-size: 14px; }
    .tx-sub { font-size: 12px; color: #888; }

    .type-chip {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    .chip-income   { background: #e8f5e9; color: #2e7d32; }
    .chip-expense  { background: #fce4ec; color: #c62828; }
    .chip-transfer { background: #e3f2fd; color: #1565c0; }

    .income-color  { color: #2e7d32; }
    .expense-color { color: #c62828; }
    .transfer-color { color: #1565c0; }
    .amount { font-weight: 600; }

    .empty-msg {
      text-align: center;
      padding: 32px;
      color: #aaa;
    }

    .form-card { max-width: 560px; }

    .form-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 8px;
    }
  `]
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  accounts: Account[] = [];
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  columns = ['date', 'description', 'account', 'type', 'amount', 'actions'];
  filterType = '';
  showForm = false;
  formMode: FormMode = 'transaction';
  editingId: number | null = null;
  form: FormGroup;
  transferForm: FormGroup;

  constructor(
    private txService: TransactionService,
    private accountService: AccountService,
    private categoryService: CategoryService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      type: ['EXPENSE', Validators.required],
      description: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      date: [new Date(), Validators.required],
      accountId: [null, Validators.required],
      categoryId: [null],
      notes: ['']
    });

    this.transferForm = this.fb.group({
      fromAccountId: [null, Validators.required],
      toAccountId: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      date: [new Date(), Validators.required],
      description: ['Credit card payment', Validators.required],
      notes: ['']
    });

    this.form.get('type')?.valueChanges.subscribe(type => {
      this.filteredCategories = this.categories.filter(c => c.type === type);
      this.form.patchValue({ categoryId: null });
    });
  }

  ngOnInit() {
    forkJoin({
      transactions: this.txService.list(),
      accounts: this.accountService.list(),
      categories: this.categoryService.list()
    }).subscribe(({ transactions, accounts, categories }) => {
      this.transactions = transactions;
      this.filteredTransactions = transactions;
      this.accounts = accounts;
      this.categories = categories;
    });
  }

  applyFilter() {
    if (!this.filterType) {
      this.filteredTransactions = [...this.transactions];
    } else if (this.filterType === 'TRANSFER') {
      this.filteredTransactions = this.transactions.filter(t => this.isTransfer(t));
    } else {
      this.filteredTransactions = this.transactions.filter(t => t.type === this.filterType);
    }
  }

  openForm() {
    this.editingId = null;
    this.formMode = 'transaction';
    this.form.reset({ type: 'EXPENSE', date: new Date(), categoryId: null, notes: '' });
    this.filteredCategories = this.categories.filter(c => c.type === 'EXPENSE');
    this.showForm = true;
  }

  openTransferForm() {
    this.formMode = 'transfer';
    this.transferForm.reset({ date: new Date(), description: 'Credit card payment', notes: '' });
    this.showForm = true;
  }

  edit(tx: Transaction) {
    if (this.isTransfer(tx)) return;
    this.editingId = tx.id ?? null;
    this.formMode = 'transaction';
    this.filteredCategories = this.categories.filter(c => c.type === tx.type);
    const [y, m, d] = tx.date.split('-').map(Number);
    this.form.patchValue({ ...tx, date: new Date(y, m - 1, d) });
    this.showForm = true;
  }

  cancelForm() {
    this.showForm = false;
    this.editingId = null;
  }

  onSubmit() {
    if (this.form.invalid) return;
    const raw = this.form.value;
    const dateObj: Date = raw.date;
    const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    const value = { ...raw, date: dateStr } as Transaction;

    const op = this.editingId
      ? this.txService.update(this.editingId, value)
      : this.txService.create(value);

    op.subscribe(() => this.reloadAndClose());
  }

  onSubmitTransfer() {
    if (this.transferForm.invalid) return;
    const raw = this.transferForm.value;
    const dateObj: Date = raw.date;
    const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    const transfer: TransferRequest = { ...raw, date: dateStr };

    this.txService.createTransfer(transfer).subscribe(() => this.reloadAndClose());
  }

  delete(tx: Transaction) {
    const label = this.isTransfer(tx) ? `transfer "${tx.description}" (both legs will be deleted)` : `"${tx.description}"`;
    if (!tx.id || !confirm(`Delete ${label}?`)) return;
    this.txService.delete(tx.id).subscribe(() => {
      this.txService.list().subscribe(txs => {
        this.transactions = txs;
        this.applyFilter();
      });
    });
  }

  isTransfer(tx: Transaction) {
    return tx.type === 'TRANSFER_OUT' || tx.type === 'TRANSFER_IN';
  }

  chipClass(type: string) {
    if (type === 'INCOME') return 'chip-income';
    if (type === 'EXPENSE') return 'chip-expense';
    return 'chip-transfer';
  }

  amountClass(type: string) {
    if (type === 'INCOME') return 'income-color';
    if (type === 'EXPENSE') return 'expense-color';
    return 'transfer-color';
  }

  amountPrefix(type: string) {
    if (type === 'INCOME' || type === 'TRANSFER_IN') return '+';
    return '-';
  }

  typeLabel(type: string) {
    const labels: Record<string, string> = {
      INCOME: 'Income',
      EXPENSE: 'Expense',
      TRANSFER_OUT: 'Transfer Out',
      TRANSFER_IN: 'Transfer In'
    };
    return labels[type] ?? type;
  }

  private reloadAndClose() {
    this.txService.list().subscribe(txs => {
      this.transactions = txs;
      this.applyFilter();
    });
    this.cancelForm();
  }
}
