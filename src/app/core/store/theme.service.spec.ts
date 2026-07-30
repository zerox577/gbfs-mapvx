import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false, media: query, onchange: null, addListener: vi.fn(),
      removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with dark=false by default', () => {
    expect(service.isDark()).toBe(false);
  });

  it('should toggle isDark signal', () => {
    service.toggle();
    expect(service.isDark()).toBe(true);
    service.toggle();
    expect(service.isDark()).toBe(false);
  });
});
