import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { VehicleApiService } from './vehicle-api.service';
import { environment } from '../../../environments/environment';

describe('VehicleApiService', () => {
  let service: VehicleApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(VehicleApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch and return bikes array from response', () => {
    const mockResponse = {
      last_updated: 1681146190,
      ttl: 5,
      data: {
        bikes: [
          { bike_id: '1', lat: 40.71, lon: -74.0, is_reserved: false, is_disabled: false },
          { bike_id: '2', lat: 40.72, lon: -74.01, is_reserved: true, is_disabled: false },
        ],
      },
    };

    service.getVehicles().subscribe((bikes) => {
      expect(bikes).toEqual(mockResponse.data.bikes);
    });

    const req = httpMock.expectOne(environment.apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should pass through extra fields on vehicles', () => {
    const mockResponse = {
      last_updated: 0,
      ttl: 0,
      data: {
        bikes: [
          {
            bike_id: '3',
            lat: 40.71,
            lon: -74.0,
            is_reserved: false,
            is_disabled: false,
            vehicle_type: 'scooter',
            current_range_meters: 5000,
          },
        ],
      },
    };

    service.getVehicles().subscribe((bikes) => {
      expect(bikes[0].vehicle_type).toBe('scooter');
      expect(bikes[0].current_range_meters).toBe(5000);
    });

    const req = httpMock.expectOne(environment.apiUrl);
    req.flush(mockResponse);
  });
});
