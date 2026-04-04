import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WordCanvas } from './word-canvas/word-canvas';
import { MainView } from './main-view/main-view';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-root',
  imports: [ RouterOutlet, WordCanvas, MainView, Button ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

}
