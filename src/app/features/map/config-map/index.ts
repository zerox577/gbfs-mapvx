export const MAP_STYLE_URL = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';
export const DEFAULT_CENTER: [number, number] = [-74.006, 40.7128];
export const DEFAULT_ZOOM = 13;
export const SELECTED_ZOOM = 15;

export const SOURCE_ID = 'bikes-source';
export const HIGHLIGHT_SOURCE_ID = 'bikes-highlight-source';
export const LAYER_ID = 'bikes-layer';
export const HIGHLIGHT_LAYER_ID = 'bikes-layer-selected';

export const FALLBACK_CIRCLE_RADIUS = 6;
export const HIGHLIGHT_CIRCLE_RADIUS = 10;
export const ICON_SIZE = 0.45;
export const ICON_IMG_SIZE = 22;

export const TYPE_COLORS: Record<string, string> = {
  bike: 'rgba(34, 197, 94, 0.85)',
  ebike: 'rgba(59, 130, 246, 0.85)',
  scooter: 'rgba(168, 85, 247, 0.85)',
};

export const STATUS_COLORS: Record<string, string> = {
  disabled: '#ef4444',
  reserved: '#eab308',
  available: '#ffffff',
};

export const TYPE_COLOR = (type: string | undefined): string => TYPE_COLORS[type ?? 'bike'] ?? TYPE_COLORS['bike'];
