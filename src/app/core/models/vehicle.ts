export interface Vehicle {
  bike_id: string;
  lat: number;
  lon: number;
  is_reserved: boolean;
  is_disabled: boolean;
  vehicle_type?: string;
  current_range_meters?: number;
  rental_uris?: Record<string, string>;
  [key: string]: unknown;
}

export interface GBFSResponse {
  last_updated: number;
  ttl: number;
  data: {
    bikes: Vehicle[];
  };
}
