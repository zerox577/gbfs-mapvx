import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LayoutContainer } from './layout-container';
import { VehicleApiService } from '@core/api';
import { of } from 'rxjs';

@Component({ selector: 'app-header', template: '' })
class HeaderStub {}

@Component({ selector: 'app-content', template: '' })
class ContentStub {}

@Component({ selector: 'app-footer', template: '' })
class FooterStub {}

describe('LayoutContainer', () => {
  let component: LayoutContainer;
  let fixture: ComponentFixture<LayoutContainer>;

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
      imports: [LayoutContainer],
      providers: [
        { provide: VehicleApiService, useValue: { getVehicles: vi.fn().mockReturnValue(of([])) } },
      ],
    })
      .overrideComponent(LayoutContainer, {
        set: { imports: [HeaderStub, ContentStub, FooterStub] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(LayoutContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
