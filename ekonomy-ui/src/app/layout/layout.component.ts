import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatSidenavModule, MatListModule,
    MatIconModule, MatButtonModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav mode="side" opened class="sidenav">
        <div class="sidenav-header">
          <mat-icon class="logo-icon">account_balance_wallet</mat-icon>
          <span class="logo-text">Ekonomy</span>
        </div>
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active-link">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/accounts" routerLinkActive="active-link">
            <mat-icon matListItemIcon>account_balance</mat-icon>
            <span matListItemTitle>Accounts</span>
          </a>
          <a mat-list-item routerLink="/transactions" routerLinkActive="active-link">
            <mat-icon matListItemIcon>receipt_long</mat-icon>
            <span matListItemTitle>Transactions</span>
          </a>
          <a mat-list-item routerLink="/categories" routerLinkActive="active-link">
            <mat-icon matListItemIcon>category</mat-icon>
            <span matListItemTitle>Categories</span>
          </a>
          <a mat-list-item routerLink="/calendar" routerLinkActive="active-link">
            <mat-icon matListItemIcon>calendar_today</mat-icon>
            <span matListItemTitle>Calendar</span>
          </a>
          <a mat-list-item routerLink="/reports" routerLinkActive="active-link">
            <mat-icon matListItemIcon>bar_chart</mat-icon>
            <span matListItemTitle>Reports</span>
          </a>
          <a mat-list-item routerLink="/salary" routerLinkActive="active-link">
            <mat-icon matListItemIcon>payments</mat-icon>
            <span matListItemTitle>Salary</span>
          </a>
          <a mat-list-item routerLink="/settings" routerLinkActive="active-link">
            <mat-icon matListItemIcon>settings</mat-icon>
            <span matListItemTitle>Settings</span>
          </a>
        </mat-nav-list>
        <div class="sidenav-footer">
          <span class="user-email">{{ email }}</span>
          <button mat-icon-button (click)="logout()" title="Logout">
            <mat-icon>logout</mat-icon>
          </button>
        </div>
      </mat-sidenav>
      <mat-sidenav-content class="main-content">
        <router-outlet />
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container { height: 100vh; }

    .sidenav {
      width: 240px;
      background: #3949ab;
      color: white;
      display: flex;
      flex-direction: column;
    }

    .sidenav-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.15);

      .logo-icon { font-size: 28px; width: 28px; height: 28px; }
      .logo-text { font-size: 20px; font-weight: 600; letter-spacing: 0.5px; }
    }

    mat-nav-list {
      flex: 1;
      padding-top: 8px;
    }

    a[mat-list-item] {
      color: rgba(255,255,255,0.85);
      border-radius: 8px;
      margin: 2px 8px;

      mat-icon { color: rgba(255,255,255,0.75); }

      &.active-link {
        background: rgba(255,255,255,0.15);
        color: white;
        mat-icon { color: white; }
      }
    }

    .sidenav-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-top: 1px solid rgba(255,255,255,0.15);

      .user-email { font-size: 12px; color: rgba(255,255,255,0.7); overflow: hidden; text-overflow: ellipsis; }
      button { color: rgba(255,255,255,0.7); }
    }

    .main-content { background: #f5f5f5; overflow-y: auto; }
  `]
})
export class LayoutComponent {
  email = this.authService.getEmail() ?? '';

  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout();
  }
}
