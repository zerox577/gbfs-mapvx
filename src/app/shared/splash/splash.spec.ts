import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SplashComponent } from './splash';

describe('SplashComponent', () => {
  let component: SplashComponent;
  let fixture: ComponentFixture<SplashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SplashComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SplashComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set overflow hidden on init', () => {
    component.ngOnInit();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should restore overflow on destroy', () => {
    document.body.style.overflow = 'hidden';
    component.ngOnDestroy();
    expect(document.body.style.overflow).toBe('');
  });

  it('should emit done on finish', () => {
    const spy = vi.spyOn(component.done, 'emit');
    (component as any).finish.call(component);
    expect(spy).toHaveBeenCalled();
    expect(document.body.style.overflow).toBe('');
  });

  it('should render template content', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('GBFS MapVX');
    expect(compiled.textContent).toContain('Visualizador');
  });
});
