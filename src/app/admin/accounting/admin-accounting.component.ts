import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-admin-accounting',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex items-center gap-2 mb-5">
      <div class="flex gap-1 bg-zinc-100 rounded-lg p-1">
        <a
          routerLink="transactions"
          routerLinkActive="bg-white shadow-sm text-zinc-900"
          [routerLinkActiveOptions]="{ exact: false }"
          class="px-3 py-1.5 rounded-md text-xs font-medium text-zinc-500 hover:text-zinc-700 transition-colors cursor-pointer"
        >
          <i class="fa-solid fa-list-ul mr-1.5"></i>Transactions
        </a>
        <a
          routerLink="categories"
          routerLinkActive="bg-white shadow-sm text-zinc-900"
          [routerLinkActiveOptions]="{ exact: false }"
          class="px-3 py-1.5 rounded-md text-xs font-medium text-zinc-500 hover:text-zinc-700 transition-colors cursor-pointer"
        >
          <i class="fa-solid fa-tags mr-1.5"></i>Categories
        </a>
        <a
          routerLink="reports"
          routerLinkActive="bg-white shadow-sm text-zinc-900"
          [routerLinkActiveOptions]="{ exact: false }"
          class="px-3 py-1.5 rounded-md text-xs font-medium text-zinc-500 hover:text-zinc-700 transition-colors cursor-pointer"
        >
          <i class="fa-solid fa-chart-pie mr-1.5"></i>Audit Reports
        </a>
      </div>
    </div>
    <router-outlet />
  `,
})
export class AdminAccountingComponent {}
