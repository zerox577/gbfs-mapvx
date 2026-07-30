import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapComponent } from './map';
import { VehicleStore } from '@core/store';
import { VehicleApiService } from '@core/api';
import { of } from 'rxjs';

const mockMap = {
  on: vi.fn(),
  addSource: vi.fn(),
  addLayer: vi.fn(),
  addImage: vi.fn(),
  addControl: vi.fn(),
  flyTo: vi.fn(),
  getSource: vi.fn().mockReturnValue({ setData: vi.fn() }),
  getCanvas: vi.fn().mockReturnValue({ style: {} }),
  queryRenderedFeatures: vi.fn().mockReturnValue([]),
  remove: vi.fn(),
};

let maplibreMapInstance: any = mockMap;

vi.mock('maplibre-gl', () => {
  const instance = {
    on: vi.fn(),
    addSource: vi.fn(),
    addLayer: vi.fn(),
    addImage: vi.fn(),
    addControl: vi.fn(),
    flyTo: vi.fn(),
    getSource: vi.fn().mockReturnValue({ setData: vi.fn() }),
    getCanvas: vi.fn().mockReturnValue({ style: {} }),
    queryRenderedFeatures: vi.fn().mockReturnValue([]),
    remove: vi.fn(),
  };
  maplibreMapInstance = instance;
  return {
    Map: class { constructor() { return instance; } },
    NavigationControl: vi.fn(),
    Popup: class {
      setLngLat() { return this; }
      setHTML() { return this; }
      addTo() { return this; }
      remove() {}
    },
  };
});

const mockVehicles: any[] = [
  { bike_id: 'b1', lat: 40.71, lon: -74.0, is_reserved: false, is_disabled: false, vehicle_type: 'bike' },
  { bike_id: 'b2', lat: 40.72, lon: -74.01, is_reserved: true, is_disabled: false, vehicle_type: 'ebike' },
];

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;
  let store: VehicleStore;

  beforeEach(async () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false, media: query, onchange: null, addListener: vi.fn(),
      removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [MapComponent],
      providers: [
        VehicleStore,
        { provide: VehicleApiService, useValue: { getVehicles: vi.fn().mockReturnValue(of(mockVehicles)) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(VehicleStore);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnDestroy', () => {
    it('should not throw when map and popup are null', () => {
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  describe('initializeMap', () => {
    it('should register load handler and add control', () => {
      (component as any).initializeMap();
      const map = (component as any).map;
      expect(map.addControl).toHaveBeenCalled();
      expect(map.on).toHaveBeenCalledWith('load', expect.any(Function));
    });
  });

  describe('updateMapVehicles', () => {
    beforeEach(() => {
      (component as any).map = mockMap;
    });

    it('should set source data with all vehicles', () => {
      const source = { setData: vi.fn() };
      (mockMap.getSource as any).mockReturnValue(source);

      (component as any).updateMapVehicles(mockVehicles, null);

      expect(source.setData).toHaveBeenCalled();
      const data = (source.setData as any).mock.calls[0][0];
      expect(data.type).toBe('FeatureCollection');
      expect(data.features.length).toBe(2);
    });

    it('should set highlight for selected vehicle', () => {
      const source = { setData: vi.fn() };
      const hlSource = { setData: vi.fn() };
      mockMap.getSource
        .mockReturnValueOnce(source)
        .mockReturnValueOnce(hlSource);

      (component as any).updateMapVehicles(mockVehicles, 'b1');

      const hlData = (hlSource.setData as any).mock.calls[0][0];
      expect(hlData.features[0].properties.bike_id).toBe('b1');
    });

    it('should clear highlight when selectedId is null', () => {
      const source = { setData: vi.fn() };
      const hlSource = { setData: vi.fn() };
      mockMap.getSource
        .mockReturnValueOnce(source)
        .mockReturnValueOnce(hlSource);

      (component as any).updateMapVehicles(mockVehicles, null);

      expect((hlSource.setData as any).mock.calls[0][0].features.length).toBe(0);
    });

    it('should not crash when sources are missing', () => {
      mockMap.getSource.mockReturnValue(undefined);
      expect(() => (component as any).updateMapVehicles(mockVehicles, 'b1')).not.toThrow();
    });
  });

  describe('setupInteractionHandlers', () => {
    beforeEach(() => {
      (component as any).map = mockMap;
      (component as any).setupInteractionHandlers();
    });

    it('should call selectVehicle on layer click', () => {
      const spy = vi.spyOn(store, 'selectVehicle');
      const handler = mockMap.on.mock.calls.find(
        (c: any[]) => c[0] === 'click' && c[1] === 'bikes-layer',
      );
      expect(handler).toBeDefined();
      handler![2]({
        features: [{ properties: { bike_id: 'b1', is_reserved: false, is_disabled: false } }],
        lngLat: { lat: 40.71, lng: -74.0 },
      });
      expect(spy).toHaveBeenCalledWith('b1');
    });

    it('should call selectVehicle(null) on background click', () => {
      const spy = vi.spyOn(store, 'selectVehicle');
      mockMap.queryRenderedFeatures.mockReturnValue([]);
      const handler = mockMap.on.mock.calls.find(
        (c: any[]) => c[0] === 'click' && c.length === 2,
      );
      expect(handler).toBeDefined();
      handler![1]({ point: [0, 0] });
      expect(spy).toHaveBeenCalledWith(null);
    });

    it('should set cursor on mouseenter', () => {
      const handler = mockMap.on.mock.calls.find((c: any[]) => c[0] === 'mouseenter');
      expect(handler).toBeDefined();
      handler![2]();
      expect(mockMap.getCanvas().style.cursor).toBe('pointer');
    });

    it('should reset cursor on mouseleave', () => {
      const handler = mockMap.on.mock.calls.find((c: any[]) => c[0] === 'mouseleave');
      expect(handler).toBeDefined();
      handler![2]();
      expect(mockMap.getCanvas().style.cursor).toBe('');
    });
  });

  describe('addBikesSource', () => {
    it('should add sources', () => {
      (component as any).map = mockMap;
      (component as any).addBikesSource();
      expect(mockMap.addSource).toHaveBeenCalledTimes(2);
    });
  });

  describe('addIconLayers', () => {
    it('should add symbol layer with highlight', () => {
      (component as any).map = mockMap;
      (component as any).addIconLayers();
      expect(mockMap.addLayer).toHaveBeenCalledTimes(2);
      expect(mockMap.addLayer.mock.calls[0][0].type).toBe('symbol');
    });
  });

  describe('addCircleLayers', () => {
    it('should add circle layer with highlight', () => {
      (component as any).map = mockMap;
      (component as any).addCircleLayers();
      expect(mockMap.addLayer).toHaveBeenCalledTimes(2);
      expect(mockMap.addLayer.mock.calls[0][0].type).toBe('circle');
    });
  });

  describe('addHighlightLayer', () => {
    it('should add highlight circle layer', () => {
      (component as any).map = mockMap;
      (component as any).addHighlightLayer();
      expect(mockMap.addLayer).toHaveBeenCalledTimes(1);
      expect(mockMap.addLayer.mock.calls[0][0].id).toBe('bikes-layer-selected');
    });
  });

  describe('load icons fallback', () => {
    it('should call addCircleLayers on load failure', async () => {
      const origImage = (globalThis as any).Image;
      (globalThis as any).Image = vi.fn().mockImplementation(() => {
        const instance: any = { crossOrigin: '', src: '', onload: null, onerror: null };
        setTimeout(() => { instance.onerror?.(new Error('fail')); }, 0);
        return instance;
      });

      (component as any).map = mockMap;
      const addCircleSpy = vi.spyOn(component as any, 'addCircleLayers');
      const addIconSpy = vi.spyOn(component as any, 'addIconLayers');

      (component as any).addBikesSource();
      await new Promise((r) => setTimeout(r, 50));

      expect(mockMap.addSource).toHaveBeenCalledTimes(2);
      expect(addIconSpy).not.toHaveBeenCalled();
      expect(addCircleSpy).toHaveBeenCalled();

      (globalThis as any).Image = origImage;
    });
  });
});
