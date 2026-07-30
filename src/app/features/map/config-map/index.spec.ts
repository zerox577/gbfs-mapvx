import { TYPE_COLOR, TYPE_COLORS, STATUS_COLORS } from './index';

describe('config-map', () => {
  describe('TYPE_COLOR', () => {
    it('should return green for bike', () => {
      expect(TYPE_COLOR('bike')).toBe(TYPE_COLORS['bike']);
    });

    it('should return blue for ebike', () => {
      expect(TYPE_COLOR('ebike')).toBe(TYPE_COLORS['ebike']);
    });

    it('should return purple for scooter', () => {
      expect(TYPE_COLOR('scooter')).toBe(TYPE_COLORS['scooter']);
    });

    it('should default to bike colour for undefined', () => {
      expect(TYPE_COLOR(undefined)).toBe(TYPE_COLORS['bike']);
    });

    it('should default to bike colour for unknown type', () => {
      expect(TYPE_COLOR('unknown')).toBe(TYPE_COLORS['bike']);
    });
  });

  describe('STATUS_COLORS', () => {
    it('should have correct status colours', () => {
      expect(STATUS_COLORS['disabled']).toBe('#ef4444');
      expect(STATUS_COLORS['reserved']).toBe('#eab308');
      expect(STATUS_COLORS['available']).toBe('#ffffff');
    });
  });
});
