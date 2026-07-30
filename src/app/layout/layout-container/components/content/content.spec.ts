import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Content } from './content';
import { VehicleApiService } from '@core/api';
import { of } from 'rxjs';

@Component({ selector: 'app-map', template: '' })
class MapComponentStub {}

@Component({ selector: 'app-vehicles', template: '' })
class VehiclesComponentStub {}

@Component({ selector: 'app-icon-mapvx', template: '' })
class AppIconMapVXStub {}

describe('Content', () => {
  let component: Content;
  let fixture: ComponentFixture<Content>;

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
      imports: [Content],
      providers: [
        { provide: VehicleApiService, useValue: { getVehicles: vi.fn().mockReturnValue(of([])) } },
      ],
    })
      .overrideComponent(Content, {
        set: { imports: [MapComponentStub, VehiclesComponentStub, AppIconMapVXStub] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(Content);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
