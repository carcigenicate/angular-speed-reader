import { Component } from '@angular/core';
import { MainView } from './main-view/main-view';

@Component({
  selector: 'app-root',
  imports: [ MainView ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

}
