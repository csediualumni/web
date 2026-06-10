import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  signal,
  inject,
  computed,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReferenceItem, ReferenceService } from '../../core/reference.service';
import { debounceTime, Subject, switchMap, of, catchError } from 'rxjs';

export type ReferenceType = 'departments' | 'shifts' | 'sessions';

@Component({
  selector: 'app-reference-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative" (click)="$event.stopPropagation()">
      <!-- Display / trigger -->
      <button type="button" (click)="toggleDropdown()"
        class="w-full flex items-center justify-between gap-2 text-sm border rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        [class]="selectedItem() ? 'border-zinc-300 text-zinc-800' : 'border-zinc-300 text-zinc-400'">
        <span class="truncate">{{ selectedItem()?.name ?? placeholder }}</span>
        <i class="fa-solid fa-chevron-down text-zinc-400 text-xs flex-shrink-0 transition-transform"
          [class.rotate-180]="open()"></i>
      </button>

      <!-- Dropdown -->
      @if (open()) {
        <div class="absolute z-50 mt-1 w-full bg-white border border-zinc-200 rounded-xl shadow-lg overflow-hidden">
          @if (searchable) {
            <div class="px-3 pt-2.5 pb-2 border-b border-zinc-100">
              <input
                #searchInput
                type="text"
                [(ngModel)]="searchQuery"
                (ngModelChange)="onSearch($event)"
                [placeholder]="'Search ' + label + '…'"
                class="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                (click)="$event.stopPropagation()"
              />
            </div>
          }

          <ul class="max-h-52 overflow-y-auto py-1">
            @if (loading()) {
              <li class="px-4 py-3 text-sm text-zinc-400 text-center">
                <i class="fa-solid fa-spinner animate-spin mr-1"></i> Loading…
              </li>
            } @else if (filteredItems().length === 0) {
              <li class="px-4 py-2.5 text-sm text-zinc-400 text-center">No results found</li>
            } @else {
              @for (item of filteredItems(); track item.id) {
                <li>
                  <button type="button" (click)="select(item)"
                    class="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    [class]="selectedItem()?.id === item.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-zinc-700'">
                    {{ item.name }}
                  </button>
                </li>
              }
            }

            <!-- Create new option -->
            @if (allowCreate && searchQuery && !exactMatch()) {
              <li class="border-t border-zinc-100 mt-1 pt-1">
                <button type="button" (click)="createNew()"
                  class="w-full text-left px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2">
                  <i class="fa-solid fa-plus text-xs"></i>
                  Create "{{ searchQuery }}"
                </button>
              </li>
            }
          </ul>
        </div>
      }
    </div>
  `,
})
export class ReferenceSelectComponent implements OnInit {
  private readonly refService = inject(ReferenceService);

  @Input() type: ReferenceType = 'departments';
  @Input() label = 'Item';
  @Input() placeholder = 'Select…';
  @Input() searchable = true;
  @Input() allowCreate = true;
  @Input() value: string | null = null; // selected id

  @Output() valueChange = new EventEmitter<string | null>();
  @Output() itemSelected = new EventEmitter<ReferenceItem | null>();

  open = signal(false);
  loading = signal(false);
  items = signal<ReferenceItem[]>([]);
  searchQuery = '';
  private search$ = new Subject<string>();

  selectedItem = computed(() => this.items().find((i) => i.id === this.value) ?? null);
  filteredItems = computed(() => {
    if (!this.searchQuery) return this.items();
    return this.items().filter((i) => i.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
  });
  exactMatch = computed(() =>
    this.items().some((i) => i.name.toLowerCase() === this.searchQuery.toLowerCase()),
  );

  @HostListener('document:click')
  onDocumentClick() {
    this.open.set(false);
  }

  ngOnInit(): void {
    this.loadAll();
    if (this.type !== 'shifts') {
      this.search$
        .pipe(
          debounceTime(300),
          switchMap((q) => {
            this.loading.set(true);
            if (this.type === 'departments') return this.refService.listDepartments(q || undefined);
            if (this.type === 'sessions') return this.refService.listSessions(q || undefined);
            return of([] as ReferenceItem[]);
          }),
          catchError(() => of([] as ReferenceItem[])),
        )
        .subscribe((items) => {
          this.items.set(items);
          this.loading.set(false);
        });
    }
  }

  private loadAll(): void {
    this.loading.set(true);
    let obs$;
    if (this.type === 'departments') obs$ = this.refService.listDepartments();
    else if (this.type === 'shifts') obs$ = this.refService.listShifts();
    else obs$ = this.refService.listSessions();

    obs$.subscribe({
      next: (items) => { this.items.set(items); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  toggleDropdown(): void {
    this.open.update((v) => !v);
    if (this.open()) this.searchQuery = '';
  }

  onSearch(q: string): void {
    this.search$.next(q);
  }

  select(item: ReferenceItem): void {
    this.value = item.id;
    this.valueChange.emit(item.id);
    this.itemSelected.emit(item);
    this.open.set(false);
    this.searchQuery = '';
  }

  createNew(): void {
    const name = this.searchQuery.trim();
    if (!name) return;
    this.loading.set(true);
    const create$ = this.type === 'departments'
      ? this.refService.createDepartment(name)
      : this.refService.createSession(name);

    create$.subscribe({
      next: (item) => {
        this.items.update((list) => [...list, item]);
        this.loading.set(false);
        this.select(item);
      },
      error: () => this.loading.set(false),
    });
  }
}
