import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TransactionService } from '../../core/services/transaction.service';
import { Transaction } from '../../core/models/transaction.model';

interface DayCell {
  date: string | null;
  day: number;
  income: number;
  expense: number;
  txs: Transaction[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Calendar</h1>
      </div>

      <mat-card class="cal-card">
        <mat-card-content>
          <div class="cal-nav">
            <button mat-icon-button (click)="prevMonth()"><mat-icon>chevron_left</mat-icon></button>
            <h2>{{ monthLabel }}</h2>
            <button mat-icon-button (click)="nextMonth()"><mat-icon>chevron_right</mat-icon></button>
          </div>

          <div class="cal-grid">
            <div class="day-header" *ngFor="let h of headers">{{ h }}</div>
            <div class="day-cell"
                 *ngFor="let cell of days"
                 [class.empty]="!cell.date"
                 [class.today]="cell.date === todayStr"
                 [class.selected]="cell.date === selectedDate"
                 (click)="cell.date && select(cell.date)">
              <span class="day-num" *ngIf="cell.date">{{ cell.day }}</span>
              <div class="day-amounts" *ngIf="cell.income > 0 || cell.expense > 0">
                <span class="inc-pill" *ngIf="cell.income > 0">
                  +{{ cell.income | currency:'BRL':'symbol':'1.0-0' }}
                </span>
                <span class="exp-pill" *ngIf="cell.expense > 0">
                  -{{ cell.expense | currency:'BRL':'symbol':'1.0-0' }}
                </span>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="tx-card" *ngIf="selectedDate">
        <mat-card-header>
          <mat-card-title>{{ selectedLabel }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="tx-item" *ngFor="let tx of selectedTxs">
            <div class="tx-info">
              <mat-icon [class]="tx.type === 'INCOME' ? 'income-color' : 'expense-color'">
                {{ tx.type === 'INCOME' ? 'add_circle' : 'remove_circle' }}
              </mat-icon>
              <div>
                <div class="tx-desc">{{ tx.description }}</div>
                <div class="tx-sub">
                  {{ tx.accountName }}<ng-container *ngIf="tx.categoryName"> · {{ tx.categoryName }}</ng-container>
                </div>
              </div>
            </div>
            <span [class]="tx.type === 'INCOME' ? 'income-color' : 'expense-color'" class="tx-amount">
              {{ tx.type === 'INCOME' ? '+' : '-' }}{{ tx.amount | currency:'BRL':'symbol':'1.2-2' }}
            </span>
          </div>
          <p class="empty-msg" *ngIf="selectedTxs.length === 0">No transactions on this day.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .cal-card { margin-bottom: 16px; }

    .cal-nav {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-bottom: 16px;

      h2 { font-size: 18px; font-weight: 600; margin: 0; min-width: 180px; text-align: center; }
    }

    .cal-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
    }

    .day-header {
      text-align: center;
      font-size: 12px;
      font-weight: 600;
      color: #888;
      padding: 8px 0;
    }

    .day-cell {
      min-height: 76px;
      padding: 6px;
      border-radius: 8px;
      cursor: pointer;
      border: 2px solid transparent;
      transition: background 0.15s;

      &.empty { cursor: default; pointer-events: none; }
      &:not(.empty):hover { background: #f5f5f5; }
      &.today { background: #e8eaf6; }
      &.selected { border-color: #3949ab; background: #e8eaf6; }
    }

    .day-num { font-size: 13px; font-weight: 500; color: #333; display: block; margin-bottom: 4px; }

    .day-amounts { display: flex; flex-direction: column; gap: 2px; }

    .inc-pill, .exp-pill {
      font-size: 10px;
      font-weight: 600;
      padding: 1px 4px;
      border-radius: 3px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .inc-pill { background: #e8f5e9; color: #2e7d32; }
    .exp-pill { background: #ffebee; color: #c62828; }

    .tx-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
      &:last-child { border-bottom: none; }
    }

    .tx-info { display: flex; align-items: center; gap: 12px; }
    .tx-desc { font-weight: 500; font-size: 14px; }
    .tx-sub { font-size: 12px; color: #888; }
    .tx-amount { font-weight: 600; font-size: 14px; }

    .empty-msg { text-align: center; color: #888; padding: 24px; }
  `]
})
export class CalendarComponent implements OnInit {
  transactions: Transaction[] = [];
  days: DayCell[] = [];
  selectedDate: string | null = null;
  todayStr: string;
  currentDate: Date;
  headers = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  constructor(private txService: TransactionService) {
    this.currentDate = new Date();
    this.todayStr = this.toDateStr(this.currentDate);
  }

  ngOnInit() {
    this.txService.list().subscribe(txs => {
      this.transactions = txs;
      this.buildCalendar();
    });
  }

  get monthLabel(): string {
    return this.currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  get selectedLabel(): string {
    if (!this.selectedDate) return '';
    const [y, m, d] = this.selectedDate.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('default',
      { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  get selectedTxs(): Transaction[] {
    return this.selectedDate
      ? this.transactions.filter(t => t.date === this.selectedDate)
      : [];
  }

  prevMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.selectedDate = null;
    this.buildCalendar();
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.selectedDate = null;
    this.buildCalendar();
  }

  select(date: string) {
    this.selectedDate = this.selectedDate === date ? null : date;
  }

  buildCalendar() {
    const year  = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay    = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDow    = (firstDay.getDay() + 6) % 7; // 0 = Monday

    this.days = [];

    for (let i = 0; i < startDow; i++) {
      this.days.push({ date: null, day: 0, income: 0, expense: 0, txs: [] });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const txs     = this.transactions.filter(t => t.date === dateStr);
      const income  = txs.filter(t => t.type === 'INCOME').reduce((s, t)  => s + Number(t.amount), 0);
      const expense = txs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0);
      this.days.push({ date: dateStr, day: d, income, expense, txs });
    }
  }

  private toDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
