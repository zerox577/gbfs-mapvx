import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VehiclesComponent } from './vehicles';
import { VehicleStore } from '@core/store';
import { VehicleApiService } from '@core/api';
import { of } from 'rxjs';
import { Vehicle } from '@core/models';

const mockVehicles: Vehicle[] = [
  { bike_id: 'bike-001', lat: 40.71, lon: -74.0, is_reserved: false, is_disabled: false, vehicle_type: 'bike' },
  { bike_id: 'ebike-002', lat: 40.72, lon: -74.01, is_reserved: true, is_disabled: false, vehicle_type: 'ebike' },
  { bike_id: 'scooter-003', lat: 40.73, lon: -74.02, is_reserved: false, is_disabled: true, vehicle_type: 'scooter' },
];

describe('VehiclesComponent', () => {
  let component: VehiclesComponent;
  let fixture: ComponentFixture<VehiclesComponent>;
  let store: VehicleStore;

  beforeEach(async () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false, media: query, onchange: null, addListener: vi.fn(),
      removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    await TestBed.configureTestingModule({
      imports: [VehiclesComponent],
      providers: [
        VehicleStore,
        { provide: VehicleApiService, useValue: { getVehicles: vi.fn().mockReturnValue(of(mockVehicles)) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VehiclesComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(VehicleStore);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('typeIcon', () => {
    it('should return matElectricBike for ebike', () => {
      expect(component.typeIcon('ebike')).toBe('matElectricBike');
    });

    it('should return matElectricScooter for scooter', () => {
      expect(component.typeIcon('scooter')).toBe('matElectricScooter');
    });

    it('should return matPedalBike for bike', () => {
      expect(component.typeIcon('bike')).toBe('matPedalBike');
    });

    it('should return matPedalBike for undefined', () => {
      expect(component.typeIcon(undefined)).toBe('matPedalBike');
    });
  });

  describe('typeColor', () => {
    it('should return blue for ebike', () => {
      expect(component.typeColor('ebike')).toContain('130, 246');
    });

    it('should return purple for scooter', () => {
      expect(component.typeColor('scooter')).toContain('85, 247');
    });

    it('should return green for bike', () => {
      expect(component.typeColor('bike')).toContain('197, 94');
    });

    it('should return green for undefined', () => {
      expect(component.typeColor(undefined)).toContain('197, 94');
    });
  });

  describe('selectVehicle', () => {
    it('should call store.selectVehicle with the given id', () => {
      const spy = vi.spyOn(store, 'selectVehicle');
      component.selectVehicle('bike-001');
      expect(spy).toHaveBeenCalledWith('bike-001');
    });

    it('should call store.selectVehicle with null', () => {
      const spy = vi.spyOn(store, 'selectVehicle');
      component.selectVehicle(null);
      expect(spy).toHaveBeenCalledWith(null);
    });
  });

  describe('filteredVehicles', () => {
    it('should return all vehicles when filter is empty', () => {
      component.filterQuery.set('');
      expect(component.filteredVehicles().length).toBe(3);
    });

    it('should filter by bike_id', () => {
      component.filterQuery.set('bike-001');
      const result = component.filteredVehicles();
      expect(result.length).toBe(1);
      expect(result[0].bike_id).toBe('bike-001');
    });

    it('should filter by vehicle_type', () => {
      component.filterQuery.set('ebike');
      const result = component.filteredVehicles();
      expect(result.length).toBe(1);
      expect(result[0].bike_id).toBe('ebike-002');
    });

    it('should be case insensitive', () => {
      component.filterQuery.set('BIKE');
      const result = component.filteredVehicles();
      expect(result.length).toBe(2);
    });

    it('should return empty when no match', () => {
      component.filterQuery.set('zzzzz');
      expect(component.filteredVehicles().length).toBe(0);
    });
  });
});
