import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AccountingService,
  AccountCategory,
  AccountTransaction,
  TransactionType,
  CreateTransactionDto,
  formatBDT,
  MONTH_NAMES,
} from '../../../core/accounting.service';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-admin-accounting-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-accounting-transactions.component.html',
})
export class AdminAccountingTransactionsComponent implements OnInit {
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  success = signal('');

  transactions = signal<AccountTransaction[]>([]);
  total = signal(0);
  categories = signal<AccountCategory[]>([]);

  // Filters
  filterType = signal<string>('');
  filterCategoryId = signal<string>('');
  filterMonth = signal<number>(new Date().getMonth() + 1);
  filterYear = signal<number>(new Date().getFullYear());
  page = signal(1);
  readonly limit = 50;

  // New / Edit form
  showForm = signal(false);
  editingId = signal<string | null>(null);
  form = signal<Partial<CreateTransactionDto>>({
    type: 'income',
    amount: undefined,
    categoryId: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
    receiptUrl: '',
  });

  // Auto-import dialog
  showImport = signal(false);
  importMonth = signal<number>(new Date().getMonth() + 1);
  importYear = signal<number>(new Date().getFullYear());
  importing = signal(false);

  readonly formatBDT = formatBDT;
  readonly MONTH_NAMES = MONTH_NAMES;
  readonly years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  readonly auth = inject(AuthService);
  private readonly svc = inject(AccountingService);

  readonly incomeTotal = computed(() =>
    this.transactions()
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0),
  );
  readonly expenseTotal = computed(() =>
    this.transactions()
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0),
  );

  readonly filteredCategories = computed(() => {
    const type = this.form().type;
    return this.categories().filter(
      (c) => c.type === type || c.type === 'both',
    );
  });

  ngOnInit(): void {
    this.loadCategories();
    this.loadTransactions();
  }

  loadCategories(): void {
    this.svc.getCategories().subscribe({
      next: (cats) => this.categories.set(cats),
    });
  }

  loadTransactions(): void {
    this.loading.set(true);
    this.svc
      .getTransactions({
        type: this.filterType() || undefined,
        categoryId: this.filterCategoryId() || undefined,
        month: this.filterMonth() || undefined,
        year: this.filterYear() || undefined,
        page: this.page(),
        limit: this.limit,
      })
      .subscribe({
        next: ({ data, total }) => {
          this.transactions.set(data);
          this.total.set(total);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Failed to load transactions.');
          this.loading.set(false);
        },
      });
  }

  applyFilters(): void {
    this.page.set(1);
    this.loadTransactions();
  }

  openAdd(): void {
    this.editingId.set(null);
    this.form.set({
      type: 'income',
      amount: undefined,
      categoryId: '',
      description: '',
      date: new Date().toISOString().slice(0, 10),
      receiptUrl: '',
    });
    this.showForm.set(true);
  }

  openEdit(t: AccountTransaction): void {
    this.editingId.set(t.id);
    this.form.set({
      type: t.type,
      amount: t.amount,
      categoryId: t.categoryId,
      description: t.description,
      date: t.date,
      receiptUrl: t.receiptUrl ?? '',
    });
    this.showForm.set(true);
  }

  patchForm(partial: Partial<CreateTransactionDto>): void {
    this.form.update((f) => ({ ...f, ...partial }));
  }

  saveTransaction(): void {
    const f = this.form();
    if (!f.type || !f.amount || !f.categoryId || !f.description || !f.date) {
      this.error.set('Please fill in all required fields.');
      return;
    }
    const dto: CreateTransactionDto = {
      type: f.type as TransactionType,
      amount: Number(f.amount),
      categoryId: f.categoryId!,
      description: f.description!,
      date: f.date!,
      receiptUrl: f.receiptUrl || undefined,
    };
    this.saving.set(true);
    const id = this.editingId();
    const obs$ = id
      ? this.svc.updateTransaction(id, dto)
      : this.svc.createTransaction(dto);

    obs$.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.success.set(id ? 'Transaction updated.' : 'Transaction recorded.');
        this.loadTransactions();
        setTimeout(() => this.success.set(''), 3000);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.message ?? 'Failed to save transaction.');
      },
    });
  }

  deleteTransaction(t: AccountTransaction): void {
    if (!confirm(`Delete this ${t.type} entry of ${formatBDT(t.amount)}?`)) return;
    this.svc.deleteTransaction(t.id).subscribe({
      next: () => {
        this.transactions.update((list) => list.filter((x) => x.id !== t.id));
        this.total.update((n) => n - 1);
      },
      error: () => this.error.set('Failed to delete transaction.'),
    });
  }

  runAutoImport(): void {
    this.importing.set(true);
    this.svc
      .autoImport({ month: this.importMonth(), year: this.importYear() })
      .subscribe({
        next: ({ imported }) => {
          this.importing.set(false);
          this.showImport.set(false);
          this.success.set(`Imported ${imported} payment${imported !== 1 ? 's' : ''} as income transactions.`);
          this.loadTransactions();
          setTimeout(() => this.success.set(''), 4000);
        },
        error: (err) => {
          this.importing.set(false);
          this.error.set(err?.error?.message ?? 'Auto-import failed.');
        },
      });
  }
}
