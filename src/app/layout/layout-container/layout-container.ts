import { Component } from '@angular/core';
import { Header } from './components/header/header';
import { Content } from './components/content/content';
import { Footer } from './components/footer/footer';

@Component({
  selector: 'app-layout-container',
  imports: [Header, Content, Footer],
  templateUrl: './layout-container.html',
  styleUrl: './layout-container.css',
})
export class LayoutContainer {}
