import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer, switchMap, catchError, of, Subscription } from 'rxjs';
import { Vehicle } from '@core/models';
import { VehicleApiService } from '@core/api';

const POLL_INTERVAL = 30_000;

@Injectable({ providedIn: 'root' })
export class VehicleStore {
  private readonly api = inject(VehicleApiService);
  private readonly destroyRef = inject(DestroyRef);
  private pollingSubscription: Subscription | null = null;

  readonly vehicles = signal<Vehicle[]>([]);
  readonly selectedVehicleId = signal<string | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly lastUpdated = signal<number | null>(null);

  readonly selectedVehicle = computed(() => {
    const id = this.selectedVehicleId();
    if (!id) return null;
    return this.vehicles().find((v) => v.bike_id === id) ?? null;
  });

  readonly vehicleCount = computed(() => this.vehicles().length);

  readonly availableVehicles = computed(() =>
    this.vehicles().filter((v) => !v.is_reserved && !v.is_disabled),
  );

  constructor() {
    this.startPolling();
  }

  startPolling(): void {
    if (this.pollingSubscription) return;

    this.loading.set(true);

    this.pollingSubscription = timer(0, POLL_INTERVAL)
      .pipe(
        switchMap(() =>
          this.api.getVehicles().pipe(
            catchError((err: Error) => {
              this.error.set(err.message);
              this.loading.set(false);
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((vehicles) => {
        if (vehicles === null) return;
        this.vehicles.set(vehicles);
        this.lastUpdated.set(Date.now());
        this.loading.set(false);
        this.error.set(null);
      });
  }

  stopPolling(): void {
    this.pollingSubscription?.unsubscribe();
    this.pollingSubscription = null;
  }

  retry(): void {
    this.stopPolling();
    this.error.set(null);
    this.startPolling();
  }

  selectVehicle(id: string | null): void {
    this.selectedVehicleId.set(id);
  }
}
