import { Component, computed, inject } from '@angular/core';
import { ThemeService } from '@core/store/theme.service';
import { AppIconMapVX } from '@shared/iconMapvx/iconMapvx';
import { HlmButton } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AppIconMapVX, HlmButton],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  readonly theme = inject(ThemeService);

  readonly isDark = computed(() => this.theme.isDark());
}
