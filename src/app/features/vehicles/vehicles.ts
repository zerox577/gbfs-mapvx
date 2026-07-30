import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { VehicleStore } from '@core/store';
import { AppIconMapVX } from '@shared/iconMapvx/iconMapvx';

@Component({
  selector: 'app-vehicles',
  imports: [FormsModule, DatePipe, AppIconMapVX],
  templateUrl: './vehicles.html',
  styleUrl: './vehicles.css',
})
export class VehiclesComponent {
  readonly store = inject(VehicleStore);
  readonly filterQuery = signal('');

  readonly vehicleCount = computed(() => this.store.vehicleCount());
  readonly lastUpdated = computed(() => this.store.lastUpdated());
  readonly selectedVehicle = computed(() => this.store.selectedVehicle());
  readonly selectedVehicleId = computed(() => this.store.selectedVehicleId());
  readonly retry = computed(() => this.store.retry());
  readonly loading = computed(() => this.store.loading());
  readonly error = computed(() => this.store.error());

  selectVehicle(id: string | null): void {
    this.store.selectVehicle(id);
  }

  readonly typeIcon = (type: string | undefined): string => {
    switch (type) {
      case 'ebike': return 'matElectricBike';
      case 'scooter': return 'matElectricScooter';
      default: return 'matPedalBike';
    }
  };

  readonly typeColor = (type: string | undefined): string => {
    switch (type) {
      case 'ebike': return 'rgba(59, 130, 246, 0.85)';
      case 'scooter': return 'rgba(168, 85, 247, 0.85)';
      default: return 'rgba(34, 197, 94, 0.85)';
    }
  };

  readonly filteredVehicles = computed(() => {
    const query = this.filterQuery().toLowerCase().trim();
    const vehicles = this.store.vehicles();
    if (!query) return vehicles;
    return vehicles.filter(
      (v) =>
        v.bike_id.toLowerCase().includes(query) ||
        (v.vehicle_type && v.vehicle_type.toLowerCase().includes(query)),
    );
  });
}
