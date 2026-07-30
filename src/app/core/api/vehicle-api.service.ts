import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { GBFSResponse, Vehicle } from '@core/models';
import { mockVehicles } from './mock-vehicles.data';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VehicleApiService {
  private readonly http = inject(HttpClient);

  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<GBFSResponse>(environment.apiUrl).pipe(
      map((response) => {
        const bikes = response.data.bikes;
        return bikes.length > 0 ? bikes : mockVehicles;
      }),
    );
  }
}
