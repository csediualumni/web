import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cookie-policy',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './cookie-policy.component.html',
})
export class CookiePolicyComponent {
  readonly lastUpdated = 'March 5, 2026';
}
