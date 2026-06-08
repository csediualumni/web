import { Component, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/admin.service';

@Component({
  selector: 'app-image-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-2">
      <!-- Tab toggle -->
      <div class="flex items-center gap-1 p-0.5 bg-zinc-100 rounded-lg w-fit">
        <button type="button" (click)="tab.set('url')"
          class="px-3 h-7 rounded-md text-xs font-medium transition-all"
          [class]="tab() === 'url' ? 'bg-white shadow-sm text-zinc-800' : 'text-zinc-500 hover:text-zinc-700'">
          <i class="fa-solid fa-link text-[10px] mr-1"></i>URL
        </button>
        <button type="button" (click)="tab.set('upload')"
          class="px-3 h-7 rounded-md text-xs font-medium transition-all"
          [class]="tab() === 'upload' ? 'bg-white shadow-sm text-zinc-800' : 'text-zinc-500 hover:text-zinc-700'">
          <i class="fa-solid fa-arrow-up-from-bracket text-[10px] mr-1"></i>Upload
        </button>
      </div>

      <!-- URL input -->
      @if (tab() === 'url') {
        <input type="url" [ngModel]="value()" (ngModelChange)="value.set($event); valueChange.emit($event)"
          [placeholder]="placeholder()"
          class="shad-input w-full text-sm" />
      }

      <!-- Upload input -->
      @if (tab() === 'upload') {
        <div class="flex items-center gap-2">
          <label class="flex-1">
            <input type="file" accept="image/*" (change)="onFileSelected($any($event.target).files[0])"
              class="hidden" #fileInput />
            <div (click)="fileInput.click()" class="shad-input w-full text-sm cursor-pointer flex items-center gap-2 text-zinc-500 hover:border-blue-400 transition-colors">
              <i class="fa-solid fa-image text-zinc-400 text-xs"></i>
              @if (uploading()) {
                <span class="text-xs text-blue-600">Uploading…</span>
              } @else if (value()) {
                <span class="text-xs text-emerald-600 truncate max-w-[160px]">File uploaded ✓</span>
              } @else {
                <span class="text-xs">Choose image file</span>
              }
            </div>
          </label>
          @if (uploading()) {
            <i class="fa-solid fa-spinner animate-spin text-blue-500 text-sm"></i>
          }
        </div>
        @if (uploadError()) {
          <p class="text-xs text-red-600">{{ uploadError() }}</p>
        }
      }

      <!-- Preview -->
      @if (value() && !uploading()) {
        <div class="flex items-center gap-2 mt-1">
          <img [src]="value()" alt="preview" class="h-10 w-10 rounded object-cover border border-zinc-200" />
          <button type="button" (click)="clear()" class="text-xs text-red-500 hover:text-red-700">
            <i class="fa-solid fa-xmark"></i> Remove
          </button>
        </div>
      }
    </div>
  `,
})
export class ImageInputComponent {
  private readonly adminSvc = inject(AdminService);

  readonly value = input<string>('');
  readonly placeholder = input('https://…');
  readonly valueChange = output<string>();

  tab = signal<'url' | 'upload'>('url');
  uploading = signal(false);
  uploadError = signal<string | null>(null);

  onFileSelected(file: File | undefined): void {
    if (!file) return;
    this.uploading.set(true);
    this.uploadError.set(null);
    this.adminSvc.uploadEventImage(file).subscribe({
      next: ({ url }) => {
        this.valueChange.emit(url);
        this.uploading.set(false);
      },
      error: () => {
        this.uploadError.set('Upload failed. Try again or paste a URL.');
        this.uploading.set(false);
      },
    });
  }

  clear(): void {
    this.valueChange.emit('');
  }
}
