import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AccountService } from '../../core/services/account.service';
import { TransactionService } from '../../core/services/transaction.service';
import { Account } from '../../core/models/account.model';
import { Transaction } from '../../core/models/transaction.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, MatCardModule, MatIconModule, MatButtonModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Dashboard</h1>
      </div>

      <div class="card-grid">
        <mat-card class="summary-card total">
          <mat-card-content>
            <div class="summary-icon"><mat-icon>account_balance_wallet</mat-icon></div>
            <div class="summary-info">
              <span class="label">Total Balance</span>
              <span class="value">{{ totalBalance | currency:'BRL':'symbol':'1.2-2' }}</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card income">
          <mat-card-content>
            <div class="summary-icon"><mat-icon>trending_up</mat-icon></div>
            <div class="summary-info">
              <span class="label">Monthly Income</span>
              <span class="value income-color">{{ monthlyIncome | currency:'BRL':'symbol':'1.2-2' }}</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card expense">
          <mat-card-content>
            <div class="summary-icon"><mat-icon>trending_down</mat-icon></div>
            <div class="summary-info">
              <span class="label">Monthly Expenses</span>
              <span class="value expense-color">{{ monthlyExpenses | currency:'BRL':'symbol':'1.2-2' }}</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="dashboard-grid">
        <mat-card class="accounts-card">
          <mat-card-header>
            <mat-card-title>Accounts</mat-card-title>
            <button mat-button color="primary" routerLink="/accounts">View All</button>
          </mat-card-header>
          <mat-card-content>
            <div class="account-item" *ngFor="let account of accounts">
              <div class="account-info">
                <mat-icon class="account-icon">{{ accountIcon(account.type) }}</mat-icon>
                <div>
                  <div class="account-name">{{ account.name }}</div>
                  <div class="account-type">{{ account.type | titlecase }}</div>
                </div>
              </div>
              <div class="account-balance" [class.negative]="account.balance < 0">
                {{ account.balance | currency:'BRL':'symbol':'1.2-2' }}
              </div>
            </div>
            <p class="empty-msg" *ngIf="accounts.length === 0">
              No accounts yet. <a routerLink="/accounts">Add one!</a>
            </p>
          </mat-card-content>
        </mat-card>

        <mat-card class="transactions-card">
          <mat-card-header>
            <mat-card-title>Recent Transactions</mat-card-title>
            <button mat-button color="primary" routerLink="/transactions">View All</button>
          </mat-card-header>
          <mat-card-content>
            <div class="tx-item" *ngFor="let tx of recentTransactions">
              <div class="tx-info">
                <mat-icon [class]="tx.type === 'INCOME' ? 'income-color' : 'expense-color'">
                  {{ tx.type === 'INCOME' ? 'add_circle' : 'remove_circle' }}
                </mat-icon>
                <div>
                  <div class="tx-desc">{{ tx.description }}</div>
                  <div class="tx-meta">{{ tx.date | date }} · {{ tx.accountName }}</div>
                </div>
              </div>
              <div class="tx-amount" [class]="tx.type === 'INCOME' ? 'income-color' : 'expense-color'">
                {{ tx.type === 'INCOME' ? '+' : '-' }}{{ tx.amount | currency:'BRL':'symbol':'1.2-2' }}
              </div>
            </div>
            <p class="empty-msg" *ngIf="recentTransactions.length === 0">
              No transactions yet. <a routerLink="/transactions">Add one!</a>
            </p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .summary-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px !important;
    }

    .summary-icon {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(57,73,171,0.1);

      mat-icon { font-size: 28px; width: 28px; height: 28px; color: #3949ab; }
    }

    .summary-info {
      display: flex;
      flex-direction: column;

      .label { font-size: 13px; color: #666; }
      .value { font-size: 22px; font-weight: 600; color: #333; }
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;

      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }

    mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .account-item, .tx-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child { border-bottom: none; }
    }

    .account-info, .tx-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .account-icon { color: #3949ab; }
    .account-name, .tx-desc { font-weight: 500; font-size: 14px; }
    .account-type, .tx-meta { font-size: 12px; color: #888; }

    .account-balance {
      font-weight: 600;
      font-size: 15px;
      color: #333;

      &.negative { color: #f44336; }
    }

    .tx-amount { font-weight: 600; font-size: 14px; }

    .empty-msg {
      text-align: center;
      color: #888;
      padding: 24px;

      a { color: #3949ab; text-decoration: none; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  accounts: Account[] = [];
  recentTransactions: Transaction[] = [];
  totalBalance = 0;
  monthlyIncome = 0;
  monthlyExpenses = 0;

  constructor(
    private accountService: AccountService,
    private transactionService: TransactionService
  ) {}

  ngOnInit() {
    forkJoin({
      accounts: this.accountService.list(),
      transactions: this.transactionService.list()
    }).subscribe(({ accounts, transactions }) => {
      this.accounts = accounts;
      this.totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const monthlyTx = transactions.filter(t => {
        const [year, month] = t.date.split('-').map(Number);
        return month - 1 === currentMonth && year === currentYear;
      });

      this.monthlyIncome = monthlyTx
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      this.monthlyExpenses = monthlyTx
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      this.recentTransactions = transactions.slice(0, 8);
    });
  }

  accountIcon(type: string): string {
    const icons: Record<string, string> = {
      CHECKING: 'account_balance',
      SAVINGS: 'savings',
      CREDIT_CARD: 'credit_card',
      INVESTMENT: 'trending_up',
      WALLET: 'account_balance_wallet'
    };
    return icons[type] ?? 'account_balance';
  }
}
