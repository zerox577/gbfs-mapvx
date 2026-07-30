import { TestBed } from '@angular/core/testing';
import { VehicleStore } from './vehicle.store';
import { VehicleApiService } from '@core/api';
import { of, throwError } from 'rxjs';
import { Vehicle } from '@core/models';

const mockBikes: Vehicle[] = [
  { bike_id: '1', lat: 40.71, lon: -74.0, is_reserved: false, is_disabled: false },
  { bike_id: '2', lat: 40.72, lon: -74.01, is_reserved: true, is_disabled: false },
  { bike_id: '3', lat: 40.73, lon: -74.02, is_reserved: false, is_disabled: true },
];

function flushMicrotasks(): Promise<void> {
  return new Promise((r) => setTimeout(r, 0));
}

describe('VehicleStore', () => {
  let store: VehicleStore;
  let api: { getVehicles: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    api = { getVehicles: vi.fn() };
    TestBed.configureTestingModule({
      providers: [VehicleStore, { provide: VehicleApiService, useValue: api }],
    });
    store = TestBed.inject(VehicleStore);
    store.stopPolling();
  });

  afterEach(() => {
    store.stopPolling();
  });

  it('should initialise with empty state', () => {
    expect(store.vehicles()).toEqual([]);
    expect(store.selectedVehicleId()).toBeNull();
    expect(store.loading()).toBe(true);
    expect(store.error()).toBeNull();
    expect(store.lastUpdated()).toBeNull();
    expect(store.vehicleCount()).toBe(0);
    expect(store.availableVehicles()).toEqual([]);
    expect(store.selectedVehicle()).toBeNull();
  });

  it('should populate vehicles on successful fetch', async () => {
    api.getVehicles.mockReturnValue(of(mockBikes));

    store.startPolling();
    await flushMicrotasks();
    store.stopPolling();

    expect(store.vehicles()).toEqual(mockBikes);
    expect(store.vehicleCount()).toBe(3);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
    expect(store.lastUpdated()).toBeGreaterThan(0);
  });

  it('should compute availableVehicles excluding reserved and disabled', async () => {
    api.getVehicles.mockReturnValue(of(mockBikes));

    store.startPolling();
    await flushMicrotasks();
    store.stopPolling();

    expect(store.availableVehicles().length).toBe(1);
    expect(store.availableVehicles()[0].bike_id).toBe('1');
  });

  it('should handle selectVehicle', async () => {
    api.getVehicles.mockReturnValue(of(mockBikes));

    store.startPolling();
    await flushMicrotasks();
    store.stopPolling();

    expect(store.selectedVehicleId()).toBeNull();
    expect(store.selectedVehicle()).toBeNull();

    store.selectVehicle('2');
    expect(store.selectedVehicleId()).toBe('2');
    expect(store.selectedVehicle()?.bike_id).toBe('2');
    expect(store.selectedVehicle()?.lat).toBe(40.72);

    store.selectVehicle(null);
    expect(store.selectedVehicleId()).toBeNull();
    expect(store.selectedVehicle()).toBeNull();
  });

  it('should return null selectedVehicle for non-existent id', async () => {
    api.getVehicles.mockReturnValue(of(mockBikes));

    store.startPolling();
    await flushMicrotasks();
    store.stopPolling();

    store.selectVehicle('non-existent');
    expect(store.selectedVehicle()).toBeNull();
  });

  it('should set error on fetch failure', async () => {
    api.getVehicles.mockReturnValue(throwError(() => new Error('Network error')));

    store.startPolling();
    await flushMicrotasks();
    store.stopPolling();

    expect(store.error()).toBe('Network error');
    expect(store.loading()).toBe(false);
    expect(store.vehicles()).toEqual([]);
  });

  it('should clear error and repopulate on retry after failure', async () => {
    api.getVehicles.mockReturnValue(throwError(() => new Error('Network error')));
    store.startPolling();
    await flushMicrotasks();
    store.stopPolling();
    expect(store.error()).toBe('Network error');

    api.getVehicles.mockReturnValue(of(mockBikes));
    store.retry();
    await flushMicrotasks();
    store.stopPolling();

    expect(store.error()).toBeNull();
    expect(store.vehicles()).toEqual(mockBikes);
    expect(store.vehicleCount()).toBe(3);
  });
});
