import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { TransactionService } from '../../core/services/transaction.service';
import { Transaction } from '../../core/models/transaction.model';

interface MonthReport {
  key: string;
  label: string;
  income: number;
  expenses: number;
  savings: number;
  categories: { name: string; amount: number }[];
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DecimalPipe, MatCardModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Monthly Reports</h1>
      </div>

      <div class="reports-layout">
        <mat-card class="months-card">
          <mat-card-content>
            <p class="empty-msg" *ngIf="reports.length === 0">No transaction data yet.</p>
            <div class="month-row"
                 *ngFor="let r of reports"
                 [class.selected]="r.key === selectedKey"
                 (click)="selectedKey = r.key">
              <div class="month-top">
                <span class="month-label">{{ r.label }}</span>
                <span class="month-net"
                      [class.income-color]="r.savings >= 0"
                      [class.expense-color]="r.savings < 0">
                  {{ r.savings >= 0 ? '+' : '' }}{{ r.savings | currency:'BRL':'symbol':'1.2-2' }}
                </span>
              </div>
              <div class="month-stats">
                <span class="income-color">▲ {{ r.income | currency:'BRL':'symbol':'1.0-0' }}</span>
                <span class="expense-color">▼ {{ r.expenses | currency:'BRL':'symbol':'1.0-0' }}</span>
              </div>
              <div class="bar-row">
                <div class="bar-wrap">
                  <div class="bar inc" [style.width.%]="barPct(r.income)"></div>
                </div>
                <div class="bar-wrap">
                  <div class="bar exp" [style.width.%]="barPct(r.expenses)"></div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="detail-card" *ngIf="selected">
          <mat-card-header>
            <mat-card-title>{{ selected.label }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="summary-row">
              <span>Income</span>
              <span class="income-color">{{ selected.income | currency:'BRL':'symbol':'1.2-2' }}</span>
            </div>
            <div class="summary-row">
              <span>Expenses</span>
              <span class="expense-color">{{ selected.expenses | currency:'BRL':'symbol':'1.2-2' }}</span>
            </div>
            <div class="summary-row net">
              <span>Net savings</span>
              <span [class.income-color]="selected.savings >= 0" [class.expense-color]="selected.savings < 0">
                {{ selected.savings >= 0 ? '+' : '' }}{{ selected.savings | currency:'BRL':'symbol':'1.2-2' }}
              </span>
            </div>

            <div class="section-title" *ngIf="selected.categories.length > 0">Expenses by category</div>
            <div class="cat-row" *ngFor="let c of selected.categories">
              <div class="cat-meta">
                <span class="cat-name">{{ c.name }}</span>
                <span class="cat-pct">{{ c.amount / selected.expenses * 100 | number:'1.0-1' }}%</span>
              </div>
              <div class="cat-bar-wrap">
                <div class="cat-bar" [style.width.%]="c.amount / selected.expenses * 100"></div>
              </div>
              <span class="cat-amount expense-color">{{ c.amount | currency:'BRL':'symbol':'1.2-2' }}</span>
            </div>
            <p class="empty-msg" *ngIf="selected.categories.length === 0">No categorized expenses this month.</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .reports-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      align-items: start;
      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }

    .month-row {
      padding: 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s;
      margin-bottom: 2px;
      &:hover   { background: #f5f5f5; }
      &.selected { background: #e8eaf6; }
    }

    .month-top {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 2px;
    }

    .month-label { font-weight: 600; font-size: 14px; }
    .month-net   { font-weight: 600; font-size: 14px; }

    .month-stats {
      display: flex;
      gap: 16px;
      font-size: 12px;
      margin-bottom: 6px;
    }

    .bar-row { display: flex; flex-direction: column; gap: 3px; }
    .bar-wrap { height: 4px; background: #eee; border-radius: 2px; overflow: hidden; }
    .bar { height: 100%; border-radius: 2px; transition: width 0.3s; }
    .bar.inc { background: #4caf50; }
    .bar.exp { background: #f44336; }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
      border-bottom: 1px solid #f0f0f0;
      &.net { font-weight: 600; }
    }

    .section-title { font-size: 13px; font-weight: 600; color: #555; margin: 16px 0 8px; }

    .cat-row {
      display: grid;
      grid-template-columns: 160px 1fr 130px;
      align-items: center;
      gap: 12px;
      padding: 6px 0;
      border-bottom: 1px solid #f0f0f0;
      &:last-child { border-bottom: none; }
    }

    .cat-meta {
      display: flex;
      justify-content: space-between;
      .cat-name { font-size: 13px; font-weight: 500; }
      .cat-pct  { font-size: 12px; color: #888; }
    }

    .cat-bar-wrap { height: 8px; background: #f0f0f0; border-radius: 4px; overflow: hidden; }
    .cat-bar { height: 100%; background: #ef9a9a; border-radius: 4px; }

    .cat-amount { font-size: 13px; font-weight: 600; text-align: right; }

    .empty-msg { text-align: center; color: #888; padding: 24px; }
  `]
})
export class ReportsComponent implements OnInit {
  reports: MonthReport[] = [];
  selectedKey: string | null = null;

  constructor(private txService: TransactionService) {}

  ngOnInit() {
    this.txService.list().subscribe(txs => {
      this.buildReports(txs);
      if (this.reports.length > 0) this.selectedKey = this.reports[0].key;
    });
  }

  get selected(): MonthReport | null {
    return this.reports.find(r => r.key === this.selectedKey) ?? null;
  }

  barPct(amount: number): number {
    const max = Math.max(...this.reports.map(r => Math.max(r.income, r.expenses)), 1);
    return (amount / max) * 100;
  }

  private buildReports(txs: Transaction[]) {
    const map = new Map<string, { income: number; expenses: number; cats: Map<string, number> }>();

    for (const t of txs) {
      const [y, m] = t.date.split('-');
      const key = `${y}-${m}`;
      if (!map.has(key)) map.set(key, { income: 0, expenses: 0, cats: new Map() });
      const entry = map.get(key)!;
      if (t.type === 'INCOME') {
        entry.income += Number(t.amount);
      } else if (t.type === 'EXPENSE') {
        entry.expenses += Number(t.amount);
        const cat = t.categoryName ?? 'Uncategorized';
        entry.cats.set(cat, (entry.cats.get(cat) ?? 0) + Number(t.amount));
      }
    }

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    this.reports = [...map.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, data]) => {
        const [y, m] = key.split('-');
        return {
          key,
          label: `${months[parseInt(m) - 1]} ${y}`,
          income:   data.income,
          expenses: data.expenses,
          savings:  data.income - data.expenses,
          categories: [...data.cats.entries()]
            .map(([name, amount]) => ({ name, amount }))
            .sort((a, b) => b.amount - a.amount)
        };
      });
  }
}
