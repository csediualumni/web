import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-accessibility',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './accessibility.component.html',
})
export class AccessibilityComponent {
  readonly lastUpdated = 'March 5, 2026';
}
