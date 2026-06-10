import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventsService, DistributionSummaryItem, DistributionRecord, DistributionItem } from '../../../core/events.service';
import { AdminService, ApiEvent } from '../../../core/admin.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-event-distribution',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './event-distribution.component.html',
})
export class EventDistributionComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly eventsService = inject(EventsService);
  private readonly adminService = inject(AdminService);

  eventId = '';
  event = signal<ApiEvent | null>(null);
  summary = signal<DistributionSummaryItem[]>([]);
  logData = signal<{ data: DistributionRecord[]; total: number }>({ data: [], total: 0 });
  loading = signal(true);
  logLoading = signal(false);
  error = signal<string | null>(null);

  // Distribution item management
  showAddItem = signal(false);
  addingItem = signal(false);
  newItem = signal<Partial<DistributionItem>>({
    itemType: 'kit',
    customLabel: null,
    appliesToMain: true,
    appliesToFamily: false,
    quantityPerMain: 1,
    quantityPerFamily: 0,
    sortOrder: 0,
  });

  readonly itemTypes = ['kit', 'breakfast', 'lunch', 'snacks', 'dinner', 'gift', 'custom'] as const;
  readonly itemTypeLabels: Record<string, string> = {
    kit: 'Kit', breakfast: 'Breakfast', lunch: 'Lunch',
    snacks: 'Snacks', dinner: 'Dinner', gift: 'Gift', custom: 'Custom',
  };

  logPage = signal(0);
  readonly pageSize = 20;

  totalDistributed = computed(() =>
    this.summary().reduce((sum, s) => sum + s.distributedMain + s.distributedFamily, 0),
  );

  totalRemaining = computed(() =>
    this.summary().reduce((sum, s) => sum + s.remainingMain + s.remainingFamily, 0),
  );

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('id')!;
    this.loadAll();
  }

  loadAll(): void {
    this.loading.set(true);
    this.adminService.getEvent(this.eventId).pipe(catchError(() => of(null))).subscribe((ev) => {
      this.event.set(ev);
    });
    this.eventsService.getDistributionSummary(this.eventId).subscribe({
      next: (summary) => {
        this.summary.set(summary);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load distribution data.');
        this.loading.set(false);
      },
    });
    this.loadLog();
  }

  loadLog(): void {
    this.logLoading.set(true);
    const skip = this.logPage() * this.pageSize;
    this.eventsService.getDistributionLog(this.eventId, skip, this.pageSize).subscribe({
      next: (data) => {
        this.logData.set(data);
        this.logLoading.set(false);
      },
      error: () => this.logLoading.set(false),
    });
  }

  prevPage(): void {
    if (this.logPage() > 0) {
      this.logPage.update((p) => p - 1);
      this.loadLog();
    }
  }

  nextPage(): void {
    const maxPage = Math.ceil(this.logData().total / this.pageSize) - 1;
    if (this.logPage() < maxPage) {
      this.logPage.update((p) => p + 1);
      this.loadLog();
    }
  }

  addItem(): void {
    if (this.addingItem()) return;
    this.addingItem.set(true);
    this.eventsService.createDistributionItem(this.eventId, this.newItem()).subscribe({
      next: () => {
        this.addingItem.set(false);
        this.showAddItem.set(false);
        this.newItem.set({
          itemType: 'kit', customLabel: null, appliesToMain: true,
          appliesToFamily: false, quantityPerMain: 1, quantityPerFamily: 0, sortOrder: 0,
        });
        this.loadAll();
      },
      error: () => this.addingItem.set(false),
    });
  }

  deleteItem(itemId: string): void {
    if (!confirm('Remove this distribution item? This cannot be undone.')) return;
    this.eventsService.deleteDistributionItem(this.eventId, itemId).subscribe({
      next: () => this.loadAll(),
    });
  }

  formatTime(ts: string): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    }).format(new Date(ts));
  }

  get logPages(): number {
    return Math.ceil(this.logData().total / this.pageSize);
  }
}
