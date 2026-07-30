import { Component, output, OnInit, OnDestroy, Inject, PLATFORM_ID, ElementRef, viewChild, afterNextRender } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { AnimationItem } from 'lottie-web';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.html',
  styles: [`
    :host {
      display: contents;
    }
  `],
})
export class SplashComponent implements OnInit, OnDestroy {
  private anim: AnimationItem | null = null;
  private readonly container = viewChild.required<string, ElementRef<HTMLDivElement>>('container', { read: ElementRef });

  readonly done = output<void>();

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {
    afterNextRender(() => this.initAnimation());
  }

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
  }

  private initAnimation(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    import('lottie-web')
      .then((lottie) => {
        this.anim = lottie.default.loadAnimation({
          container: this.container().nativeElement,
          renderer: 'svg',
          loop: false,
          autoplay: true,
          path: 'assets/animations/animation.json',
        });

        this.anim.addEventListener('complete', () => this.finish());
      })
      .catch(() => {
        /* lottie may fail in non-browser environments */
      });
  }

  private finish(): void {
    document.body.style.overflow = '';
    this.done.emit();
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
    this.anim?.destroy();
  }
}
