import { Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matMenu, matClose, matElectricBike, matElectricScooter, matPedalBike } from '@ng-icons/material-icons/baseline';
import { heroSun, heroMoon } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-icon-mapvx',
  imports: [NgIcon],
  standalone: true,
  providers: [provideIcons({ matMenu, matClose, heroSun, heroMoon, matElectricBike, matElectricScooter, matPedalBike })],
  template: `<ng-icon [name]="name()" [size]="size()" />`,
})
export class AppIconMapVX {
  readonly name = input.required<string>();
  readonly size = input('26px');
}
