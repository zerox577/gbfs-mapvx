import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { LayoutContainer } from './layout/layout-container/layout-container';
import { VehicleApiService } from '@core/api';
import { of } from 'rxjs';

@Component({ selector: 'app-splash', template: '' })
class SplashStub {}

@Component({ selector: 'app-content', template: '' })
class ContentStub {}

@Component({ selector: 'app-header', template: '<h1>GBFS MapVX</h1>' })
class HeaderStub {}

@Component({ selector: 'app-footer', template: '' })
class FooterStub {}

describe('App', () => {
  beforeEach(async () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: VehicleApiService, useValue: { getVehicles: vi.fn().mockReturnValue(of([])) } },
      ],
    })
      .overrideComponent(LayoutContainer, {
        set: { imports: [HeaderStub, ContentStub, FooterStub] },
      })
      .overrideComponent(App, {
        set: { imports: [SplashStub, LayoutContainer] },
      })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title after splash', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.onSplashDone();
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('GBFS MapVX');
  });

  it('should hide splash when done event fires', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.showSplash()).toBe(true);
    app.onSplashDone();
    expect(app.showSplash()).toBe(false);
  });
});
