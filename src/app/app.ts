import { Component, signal } from '@angular/core';
import { LayoutContainer } from './layout/layout-container/layout-container';
import { SplashComponent } from './shared/splash/splash';

@Component({
  selector: 'app-root',
  imports: [LayoutContainer, SplashComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly showSplash = signal(true);

  onSplashDone(): void {
    this.showSplash.set(false);
  }
}
