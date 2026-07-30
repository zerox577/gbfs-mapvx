import { TYPE_COLOR } from '../config-map';

export function popupContent(props: Record<string, unknown>): string {
  const vehicleType = props['vehicle_type'] as string | undefined;
  const isDisabled = props['is_disabled'] as boolean;
  const isReserved = props['is_reserved'] as boolean;
  const status = isDisabled ? 'Deshabilitada' : isReserved ? 'Reservada' : 'Disponible';
  const typeColor = TYPE_COLOR(vehicleType);
  const isDark = document.documentElement.classList.contains('dark');
  const bg = isDark ? '#1e293b' : '#ffffff';
  const text = isDark ? '#f1f5f9' : '#0f172a';
  const tip = isDark ? '#1e293b' : '#ffffff';
  return `
    <style>
      .gbfs-popup .maplibregl-popup-content { background: ${bg} !important; color: ${text} !important; border-radius: 0.5rem !important; padding: 0.75rem 1rem !important; font-family: system-ui, sans-serif !important; }
      .gbfs-popup .maplibregl-popup-close-button { color: ${text} !important; font-size: 1.25rem !important; opacity: 0.7; }
      .gbfs-popup .maplibregl-popup-close-button:hover { opacity: 1; }
      .gbfs-popup[class*="anchor-bottom"] .maplibregl-popup-tip { border-top-color: ${tip} !important; border-bottom-color: transparent !important; }
      .gbfs-popup[class*="anchor-top"] .maplibregl-popup-tip { border-bottom-color: ${tip} !important; border-top-color: transparent !important; }
      .gbfs-popup[class*="anchor-left"] .maplibregl-popup-tip { border-right-color: ${tip} !important; border-left-color: transparent !important; }
      .gbfs-popup[class*="anchor-right"] .maplibregl-popup-tip { border-left-color: ${tip} !important; border-right-color: transparent !important; }
    </style>
    <div class="text-sm leading-relaxed">
      <p class="font-bold mb-1.5">${props['bike_id']}</p>
      <p class="mb-0.5">Estado: <span class="font-medium">${status}</span></p>
      ${vehicleType ? `<p class="mb-0.5">Tipo: <span class="inline-flex items-center gap-1"><span class="inline-block w-2.5 h-2.5 rounded-full" style="background:${typeColor}"></span><span class="font-medium">${vehicleType}</span></span></p>` : ''}
      ${props['current_range_meters'] ? `<p>Autonomía: <span class="font-medium">${(Number(props['current_range_meters']) / 1000).toFixed(1)} km</span></p>` : ''}
    </div>`;
}
