import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AccountingService,
  AccountCategory,
  CategoryType,
  CreateCategoryDto,
} from '../../../core/accounting.service';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-admin-accounting-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-accounting-categories.component.html',
})
export class AdminAccountingCategoriesComponent implements OnInit {
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  success = signal('');

  categories = signal<AccountCategory[]>([]);

  showForm = signal(false);
  editingId = signal<string | null>(null);
  formName = signal('');
  formType = signal<CategoryType>('both');

  readonly auth = inject(AuthService);
  private readonly svc = inject(AccountingService);

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.svc.getCategories().subscribe({
      next: (cats) => {
        this.categories.set(cats);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load categories.');
        this.loading.set(false);
      },
    });
  }

  openAdd(): void {
    this.editingId.set(null);
    this.formName.set('');
    this.formType.set('both');
    this.showForm.set(true);
  }

  openEdit(cat: AccountCategory): void {
    this.editingId.set(cat.id);
    this.formName.set(cat.name);
    this.formType.set(cat.type);
    this.showForm.set(true);
  }

  save(): void {
    if (!this.formName().trim()) {
      this.error.set('Name is required.');
      return;
    }
    const dto: CreateCategoryDto = { name: this.formName().trim(), type: this.formType() };
    this.saving.set(true);
    const id = this.editingId();
    const obs$ = id ? this.svc.updateCategory(id, dto) : this.svc.createCategory(dto);
    obs$.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.success.set(id ? 'Category updated.' : 'Category created.');
        this.loadCategories();
        setTimeout(() => this.success.set(''), 3000);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.message ?? 'Failed to save.');
      },
    });
  }

  deleteCategory(cat: AccountCategory): void {
    if (cat.isSystem) return;
    if (!confirm(`Delete category "${cat.name}"? This cannot be undone.`)) return;
    this.svc.deleteCategory(cat.id).subscribe({
      next: () => this.categories.update((list) => list.filter((c) => c.id !== cat.id)),
      error: (err) => this.error.set(err?.error?.message ?? 'Failed to delete.'),
    });
  }
}
