import { popupContent } from './popup-content';

describe('popupContent', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
  });

  it('should contain bike_id', () => {
    const html = popupContent({ bike_id: 'abc-123', lat: 40.71, lon: -74.0, is_reserved: false, is_disabled: false });
    expect(html).toContain('abc-123');
  });

  it('should show Disponible for active vehicle', () => {
    const html = popupContent({ bike_id: '1', lat: 0, lon: 0, is_reserved: false, is_disabled: false });
    expect(html).toContain('Disponible');
  });

  it('should show Reservada for reserved vehicle', () => {
    const html = popupContent({ bike_id: '2', lat: 0, lon: 0, is_reserved: true, is_disabled: false });
    expect(html).toContain('Reservada');
  });

  it('should show Deshabilitada for disabled vehicle', () => {
    const html = popupContent({ bike_id: '3', lat: 0, lon: 0, is_reserved: false, is_disabled: true });
    expect(html).toContain('Deshabilitada');
  });

  it('should render vehicle_type when provided', () => {
    const html = popupContent({ bike_id: '4', lat: 0, lon: 0, is_reserved: false, is_disabled: false, vehicle_type: 'ebike' });
    expect(html).toContain('ebike');
  });

  it('should omit vehicle_type when not provided', () => {
    const html = popupContent({ bike_id: '5', lat: 0, lon: 0, is_reserved: false, is_disabled: false });
    expect(html).not.toContain('Tipo:');
  });

  it('should render autonomy when current_range_meters is provided', () => {
    const html = popupContent({ bike_id: '6', lat: 0, lon: 0, is_reserved: false, is_disabled: false, current_range_meters: 5000 });
    expect(html).toContain('5.0 km');
  });

  it('should omit autonomy when current_range_meters is not provided', () => {
    const html = popupContent({ bike_id: '7', lat: 0, lon: 0, is_reserved: false, is_disabled: false });
    expect(html).not.toContain('Autonomía');
  });

  it('should use dark colours when dark class is present', () => {
    document.documentElement.classList.add('dark');
    const html = popupContent({ bike_id: '8', lat: 0, lon: 0, is_reserved: false, is_disabled: false });
    expect(html).toContain('#1e293b');
    expect(html).toContain('#f1f5f9');
  });

  it('should use light colours by default', () => {
    const html = popupContent({ bike_id: '9', lat: 0, lon: 0, is_reserved: false, is_disabled: false });
    expect(html).toContain('#ffffff');
    expect(html).toContain('#0f172a');
  });
});
