import { Component, signal } from '@angular/core';
import { MapComponent } from '@features/map/map';
import { VehiclesComponent } from '@features/vehicles/vehicles';
import { AppIconMapVX } from '@shared/iconMapvx/iconMapvx';


@Component({
  selector: 'app-content',
  standalone: true,
  imports: [
    MapComponent, 
    VehiclesComponent, 
    AppIconMapVX,
  ],
  templateUrl: './content.html',
  styleUrl: './content.css',
})
export class Content {
  readonly sidebarOpen = signal(true);
}
