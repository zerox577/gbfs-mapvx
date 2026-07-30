import { Injectable, signal, effect } from '@angular/core';

const STORAGE_KEY = 'gbfs-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal(this.loadInitial());

  constructor() {
    effect(() => {
      const dark = this.isDark();
      document.documentElement.classList.toggle('dark', dark);
      localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
    });
  }

  public toggle(): void {
    this.isDark.update((v) => !v);
  }

  private loadInitial(): boolean {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
