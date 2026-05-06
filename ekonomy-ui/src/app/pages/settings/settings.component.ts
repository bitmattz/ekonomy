import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ExportService } from '../../core/services/export.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatDividerModule, MatProgressBarModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Settings</h1>
      </div>

      <mat-card class="section-card">
        <mat-card-header>
          <mat-icon mat-card-avatar>backup</mat-icon>
          <mat-card-title>Data Backup & Restore</mat-card-title>
          <mat-card-subtitle>Export your data as a JSON file or import a previous backup</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <mat-progress-bar *ngIf="loading" mode="indeterminate" class="progress-bar"></mat-progress-bar>

          <div class="action-row">
            <div class="action-info">
              <span class="action-title">Export Data</span>
              <span class="action-desc">Download all your accounts, transactions, categories and salary settings as a JSON file.</span>
            </div>
            <button mat-flat-button color="primary" (click)="exportData()" [disabled]="loading">
              <mat-icon>download</mat-icon> Export
            </button>
          </div>

          <mat-divider></mat-divider>

          <div class="action-row">
            <div class="action-info">
              <span class="action-title">Import Data</span>
              <span class="action-desc">Restore from a previously exported JSON file. <strong>This will replace all your current data.</strong></span>
            </div>
            <button mat-flat-button color="accent" (click)="fileInput.click()" [disabled]="loading">
              <mat-icon>upload</mat-icon> Import
            </button>
            <input #fileInput type="file" accept=".json" hidden (change)="onFileSelected($event)">
          </div>

          <div class="status-msg success" *ngIf="successMsg">
            <mat-icon>check_circle</mat-icon> {{ successMsg }}
          </div>
          <div class="status-msg error" *ngIf="errorMsg">
            <mat-icon>error</mat-icon> {{ errorMsg }}
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .section-card {
      max-width: 640px;

      mat-card-avatar { background: #e8eaf6; color: #3949ab; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
    }

    .progress-bar { margin-bottom: 16px; }

    .action-row {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 0;

      button { flex-shrink: 0; }
    }

    .action-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .action-title { font-weight: 500; font-size: 14px; }
    .action-desc { font-size: 12px; color: #666; }

    mat-divider { margin: 0; }

    .status-msg {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;

      &.success { background: #e8f5e9; color: #2e7d32; }
      &.error { background: #ffebee; color: #c62828; }

      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
  `]
})
export class SettingsComponent {
  loading = false;
  successMsg = '';
  errorMsg = '';

  constructor(private exportService: ExportService) {}

  exportData() {
    this.loading = true;
    this.clearMessages();
    this.exportService.exportData().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ekonomy-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.loading = false;
        this.successMsg = 'Export downloaded successfully.';
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'Export failed. Please try again.';
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    input.value = '';

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const bundle = JSON.parse(reader.result as string);
        this.importBundle(bundle);
      } catch {
        this.errorMsg = 'Invalid file — could not parse JSON.';
      }
    };
    reader.readAsText(file);
  }

  private importBundle(bundle: object) {
    if (!confirm('This will replace ALL your current data with the backup. Continue?')) return;
    this.loading = true;
    this.clearMessages();
    this.exportService.importData(bundle).subscribe({
      next: () => {
        this.loading = false;
        this.successMsg = 'Data imported successfully. Reload the page to see updated data.';
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'Import failed. Make sure the file is a valid Ekonomy backup.';
      }
    });
  }

  private clearMessages() {
    this.successMsg = '';
    this.errorMsg = '';
  }
}
