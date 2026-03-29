import { Component, OnInit, signal } from '@angular/core';
import { WordCanvas } from '../word-canvas/word-canvas';

@Component({
  selector: 'app-main-view',
  imports: [
    WordCanvas
  ],
  templateUrl: './main-view.html',
  styleUrl: './main-view.css',
})
export class MainView implements OnInit {
  text = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam condimentum vel nisl posuere tincidunt. Mauris
  iaculis nisl ac felis semper fringilla. Aliquam feugiat nulla erat, eget efficitur mauris iaculis vitae. Sed fringilla,
  ex fringilla hendrerit auctor, leo mauris consectetur arcu, et sagittis lacus magna vitae purus. Vestibulum nec tortor
  a libero sagittis ultrices. Praesent eu turpis non libero rutrum consectetur. Integer dictum tortor non tellus porta posuere.
  Aenean vel enim et tellus placerat semper in eu massa. Curabitur ornare mi vel nunc laoreet elementum. Suspendisse vel est
  metus. Nulla molestie vehicula turpis, id cursus ante condimentum at. Integer laoreet at lectus vitae commodo. Mauris et
  nibh ut ligula fermentum pellentesque. Fusce condimentum dolor ullamcorper sagittis scelerisque. Nulla nunc enim, laoreet
  at mauris faucibus, lacinia cursus lacus. Sed arcu erat, scelerisque quis rhoncus tincidunt, placerat sed sapien. Orci
  varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
  `;
  words: string[] = this.text.split(/\s/).filter((word) => word.length > 0);
  currentWordIndex: number = 0;

  currentWord = signal<string>('');
  advanceDelay = signal<number>(150);

  isPaused: boolean = false;

  ngOnInit() {
    this.start();
  }

  advance() {
    const currentWord = this.words[this.currentWordIndex];
    this.currentWord.set(currentWord);

    this.currentWordIndex++;
    if (this.currentWordIndex > this.words.length - 1) {
      this.currentWordIndex = 0;
    }
  }

  start() {
    const loopF = () => {
      this.advance();
      if (!this.isPaused) {
        setTimeout(() => {
          requestAnimationFrame(loopF);  // TODO: Just use chained setTimeout?
        }, this.advanceDelay());
      }
    }

    this.isPaused = false;
    requestAnimationFrame(loopF);
  }

  pause() {
    this.isPaused = true;
  }
}
