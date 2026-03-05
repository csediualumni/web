import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './privacy-policy.component.html',
})
export class PrivacyPolicyComponent {
  readonly lastUpdated = 'March 5, 2026';
}
