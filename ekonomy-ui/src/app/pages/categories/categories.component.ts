import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { Category } from '../../core/models/category.model';
import { CategoryService } from '../../core/services/category.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatChipsModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Categories</h1>
        <button mat-flat-button color="primary" (click)="openForm()">
          <mat-icon>add</mat-icon> New Category
        </button>
      </div>

      <ng-container *ngIf="!showForm">
        <div class="section-title">Income Categories</div>
        <div class="card-grid">
          <mat-card class="cat-card" *ngFor="let cat of incomeCategories">
            <mat-card-content>
              <div class="cat-header">
                <div class="cat-icon income-bg">
                  <mat-icon>{{ cat.icon || 'attach_money' }}</mat-icon>
                </div>
                <div class="cat-actions">
                  <button mat-icon-button (click)="edit(cat)"><mat-icon>edit</mat-icon></button>
                  <button mat-icon-button color="warn" (click)="delete(cat)"><mat-icon>delete</mat-icon></button>
                </div>
              </div>
              <div class="cat-name">{{ cat.name }}</div>
              <span class="type-chip chip-income">Income</span>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="section-title" style="margin-top: 16px">Expense Categories</div>
        <div class="card-grid">
          <mat-card class="cat-card" *ngFor="let cat of expenseCategories">
            <mat-card-content>
              <div class="cat-header">
                <div class="cat-icon expense-bg">
                  <mat-icon>{{ cat.icon || 'shopping_cart' }}</mat-icon>
                </div>
                <div class="cat-actions">
                  <button mat-icon-button (click)="edit(cat)"><mat-icon>edit</mat-icon></button>
                  <button mat-icon-button color="warn" (click)="delete(cat)"><mat-icon>delete</mat-icon></button>
                </div>
              </div>
              <div class="cat-name">{{ cat.name }}</div>
              <span class="type-chip chip-expense">Expense</span>
            </mat-card-content>
          </mat-card>
        </div>

        <mat-card *ngIf="categories.length === 0" class="empty-state">
          <mat-card-content>
            <mat-icon>category</mat-icon>
            <p>No categories yet. Create your first one!</p>
          </mat-card-content>
        </mat-card>
      </ng-container>

      <mat-card *ngIf="showForm" class="form-card">
        <mat-card-header>
          <mat-card-title>{{ editingId ? 'Edit Category' : 'New Category' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Name</mat-label>
              <input matInput formControlName="name" placeholder="e.g. Groceries">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Type</mat-label>
              <mat-select formControlName="type">
                <mat-option value="INCOME">Income</mat-option>
                <mat-option value="EXPENSE">Expense</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Icon (Material icon name, optional)</mat-label>
              <input matInput formControlName="icon" placeholder="e.g. restaurant">
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
    .section-title {
      font-size: 16px;
      font-weight: 500;
      color: #555;
      margin-bottom: 12px;
    }

    .cat-card { cursor: default; }

    .cat-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .cat-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .income-bg { background: #e8f5e9; mat-icon { color: #2e7d32; } }
    .expense-bg { background: #ffebee; mat-icon { color: #c62828; } }

    .cat-name { font-size: 16px; font-weight: 600; margin-bottom: 6px; }

    .type-chip {
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .empty-state mat-card-content {
      text-align: center;
      padding: 48px;
      color: #aaa;

      mat-icon { font-size: 64px; width: 64px; height: 64px; }
      p { font-size: 16px; margin-top: 12px; }
    }

    .form-card { max-width: 480px; }

    .form-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 8px;
    }
  `]
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  incomeCategories: Category[] = [];
  expenseCategories: Category[] = [];
  form: FormGroup;
  showForm = false;
  editingId: number | null = null;

  constructor(private categoryService: CategoryService, private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      type: ['EXPENSE', Validators.required],
      icon: ['']
    });
  }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.list().subscribe(cats => {
      this.categories = cats;
      this.incomeCategories = cats.filter(c => c.type === 'INCOME');
      this.expenseCategories = cats.filter(c => c.type === 'EXPENSE');
    });
  }

  openForm() {
    this.editingId = null;
    this.form.reset({ type: 'EXPENSE', icon: '' });
    this.showForm = true;
  }

  edit(cat: Category) {
    this.editingId = cat.id ?? null;
    this.form.patchValue(cat);
    this.showForm = true;
  }

  cancelForm() {
    this.showForm = false;
    this.editingId = null;
  }

  onSubmit() {
    if (this.form.invalid) return;
    const value = this.form.value as Category;

    const op = this.editingId
      ? this.categoryService.update(this.editingId, value)
      : this.categoryService.create(value);

    op.subscribe(() => {
      this.loadCategories();
      this.cancelForm();
    });
  }

  delete(cat: Category) {
    if (!cat.id || !confirm(`Delete category "${cat.name}"?`)) return;
    this.categoryService.delete(cat.id).subscribe(() => this.loadCategories());
  }
}
