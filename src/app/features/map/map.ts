import { afterNextRender, Component, effect, ElementRef, inject, input, OnDestroy, viewChild } from '@angular/core';
import { Map, NavigationControl, Popup } from 'maplibre-gl';
import type { GeoJSONSource } from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';
import { VehicleStore } from '@core/store';
import type { Vehicle } from '@core/models';
import { BIKE_SVG, EBIKE_SVG, SCOOTER_SVG } from './custom-svg';
import {
  MAP_STYLE_URL, DEFAULT_CENTER, DEFAULT_ZOOM, SELECTED_ZOOM,
  SOURCE_ID, HIGHLIGHT_SOURCE_ID,
  LAYER_ID, HIGHLIGHT_LAYER_ID,
  FALLBACK_CIRCLE_RADIUS, HIGHLIGHT_CIRCLE_RADIUS,
  ICON_SIZE, ICON_IMG_SIZE,
  TYPE_COLOR, STATUS_COLORS,
} from './config-map';
import { popupContent } from './popup-map/popup-content';

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.html',
  styleUrl: './map.css',
})
export class MapComponent implements OnDestroy {
  private readonly mapContainer = viewChild.required<string, ElementRef>('mapContainer', { read: ElementRef });
  private readonly store = inject(VehicleStore);
  public readonly center = input<[number, number]>(DEFAULT_CENTER);
  public readonly zoom = input(DEFAULT_ZOOM);

  private map!: Map;
  private popup: Popup | null = null;

  constructor() {
    afterNextRender(() => {
      this.initializeMap();
    });

    effect(() => {
      const currentCenter = this.center();
      const currentZoom = this.zoom();
      if (this.map) {
        this.map.flyTo({ center: currentCenter, zoom: currentZoom });
      }
    });

    effect(() => {
      const vehicles = this.store.vehicles();
      const selectedId = this.store.selectedVehicleId();
      if (!this.map) return;
      this.updateMapVehicles(vehicles, selectedId);
    });

    effect(() => {
      const vehicle = this.store.selectedVehicle();
      if (!this.map) return;
      if (vehicle) {
        this.map.flyTo({ center: [vehicle.lon, vehicle.lat], zoom: SELECTED_ZOOM, essential: true });
        this.popup?.remove();
        this.popup = new Popup({ closeButton: true, maxWidth: '280px', className: 'gbfs-popup' })
          .setLngLat([vehicle.lon, vehicle.lat])
          .setHTML(popupContent(vehicle))
          .addTo(this.map);
      } else {
        this.popup?.remove();
        this.popup = null;
      }
    });
  }

  private initializeMap(): void {
    this.map = new Map({
      container: this.mapContainer().nativeElement,
      style: MAP_STYLE_URL,
      center: this.center(),
      zoom: this.zoom(),
    });

    this.map.addControl(new NavigationControl(), 'top-right');
    this.map.on('load', () => this.addBikesSource());
  }

  private addBikesSource(): void {
    const source: FeatureCollection = { type: 'FeatureCollection', features: [] };
    this.map.addSource(SOURCE_ID, { type: 'geojson', data: source });
    this.map.addSource(HIGHLIGHT_SOURCE_ID, { type: 'geojson', data: source });

    this.loadIcons()
      .then(() => this.addIconLayers())
      .catch(() => this.addCircleLayers())
      .then(() => {
        this.setupInteractionHandlers();
        this.updateMapVehicles(this.store.vehicles(), this.store.selectedVehicleId());
      });
  }

  private loadIcons(): Promise<void> {
    return Promise.all([
      this.imageFromSvg(BIKE_SVG, ICON_IMG_SIZE),
      this.imageFromSvg(EBIKE_SVG, ICON_IMG_SIZE),
      this.imageFromSvg(SCOOTER_SVG, ICON_IMG_SIZE),
    ]).then(([bike, ebike, scooter]) => {
      this.map.addImage('bike-icon', bike, { sdf: true });
      this.map.addImage('ebike-icon', ebike, { sdf: true });
      this.map.addImage('scooter-icon', scooter, { sdf: true });
    });
  }

  private imageFromSvg(svg: string, size: number): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = `data:image/svg+xml;base64,${btoa(svg)}`;
    });
  }

  private addIconLayers(): void {
    this.map.addLayer({
      id: LAYER_ID,
      type: 'symbol',
      source: SOURCE_ID,
      layout: {
        'icon-image': [
          'match', ['get', 'vehicle_type'],
          'ebike', 'ebike-icon',
          'scooter', 'scooter-icon',
          'bike-icon',
        ],
        'icon-size': ICON_SIZE,
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
      paint: {
        'icon-color': [
          'match', ['get', 'vehicle_type'],
          'ebike', TYPE_COLOR('ebike'),
          'scooter', TYPE_COLOR('scooter'),
          TYPE_COLOR('bike'),
        ],
        'icon-halo-color': [
          'case',
          ['==', ['get', 'is_disabled'], true], STATUS_COLORS['disabled'],
          ['==', ['get', 'is_reserved'], true], STATUS_COLORS['reserved'],
          STATUS_COLORS['available'],
        ],
        'icon-halo-width': 2,
        'icon-opacity': 0.95,
      },
    });

    this.addHighlightLayer();
  }

  private addCircleLayers(): void {
    this.map.addLayer({
      id: LAYER_ID,
      type: 'circle',
      source: SOURCE_ID,
      paint: {
        'circle-radius': FALLBACK_CIRCLE_RADIUS,
        'circle-color': [
          'match', ['get', 'vehicle_type'],
          'ebike', TYPE_COLOR('ebike'),
          'scooter', TYPE_COLOR('scooter'),
          TYPE_COLOR('bike'),
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': [
          'case',
          ['==', ['get', 'is_disabled'], true], STATUS_COLORS['disabled'],
          ['==', ['get', 'is_reserved'], true], STATUS_COLORS['reserved'],
          STATUS_COLORS['available'],
        ],
        'circle-opacity': 0.9,
      },
    });

    this.addHighlightLayer();
  }

  private addHighlightLayer(): void {
    this.map.addLayer({
      id: HIGHLIGHT_LAYER_ID,
      type: 'circle',
      source: HIGHLIGHT_SOURCE_ID,
      paint: {
        'circle-radius': HIGHLIGHT_CIRCLE_RADIUS,
        'circle-color': '#3b82f6',
        'circle-stroke-width': 3,
        'circle-stroke-color': '#1e3a5f',
        'circle-opacity': 1,
      },
    });
  }

  private setupInteractionHandlers(): void {
    this.map.on('click', LAYER_ID, (e) => {
      const feature = e.features?.[0];
      if (!feature?.properties?.['bike_id']) return;
      this.store.selectVehicle(feature.properties['bike_id'] as string);

      this.popup?.remove();
      this.popup = new Popup({ closeButton: true, maxWidth: '280px', className: 'gbfs-popup' })
        .setLngLat(e.lngLat)
        .setHTML(popupContent(feature.properties))
        .addTo(this.map);
    });

    this.map.on('click', (e) => {
      const features = this.map.queryRenderedFeatures(e.point, { layers: [LAYER_ID] });
      if (features.length === 0) {
        this.popup?.remove();
        this.popup = null;
        this.store.selectVehicle(null);
      }
    });

    this.map.on('mouseenter', LAYER_ID, () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });

    this.map.on('mouseleave', LAYER_ID, () => {
      this.map.getCanvas().style.cursor = '';
    });
  }

  private updateMapVehicles(
    vehicles: Vehicle[],
    selectedId: string | null,
  ): void {
    const geojson: FeatureCollection = {
      type: 'FeatureCollection',
      features: vehicles.map((v) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [v.lon, v.lat] },
        properties: v,
      })),
    };

    const source = this.map.getSource(SOURCE_ID) as GeoJSONSource | undefined;
    if (source) {
      source.setData(geojson);
    }

    const highlightSource = this.map.getSource(HIGHLIGHT_SOURCE_ID) as GeoJSONSource | undefined;
    if (highlightSource) {
      if (selectedId) {
        const selected = vehicles.find((v) => v.bike_id === selectedId);
        if (selected) {
          highlightSource.setData({
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [selected.lon, selected.lat] },
                properties: selected,
              },
            ],
          });
          return;
        }
      }
      highlightSource.setData({ type: 'FeatureCollection', features: [] });
    }
  }

  ngOnDestroy(): void {
    this.popup?.remove();
    this.map?.remove();
  }
}
