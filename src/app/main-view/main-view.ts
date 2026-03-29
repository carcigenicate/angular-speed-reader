import { Component, computed, OnInit, Signal, signal } from '@angular/core';
import { WordCanvas } from '../word-canvas/word-canvas';
import { Toolbar } from 'primeng/toolbar';
import { Button } from 'primeng/button';
import { FileUpload } from 'primeng/fileupload';
import { LoadFromFile } from '../util-components/load-from-file/load-from-file';
import { Slider } from 'primeng/slider';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Dialog } from 'primeng/dialog';
import { Divider } from 'primeng/divider';
import { Textarea } from 'primeng/textarea';

const SAMPLE_TEXT = `
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam condimentum vel nisl posuere tincidunt. Mauris iaculis nisl
    ac felis semper fringilla. Aliquam feugiat nulla erat, eget efficitur mauris iaculis vitae. Sed fringilla, ex fringilla
    hendrerit auctor, leo mauris consectetur arcu, et sagittis lacus magna vitae purus. Vestibulum nec tortor a libero sagittis
    ultrices. Praesent eu turpis non libero rutrum consectetur. Integer dictum tortor non tellus porta posuere. Aenean vel
    enim et tellus placerat semper in eu massa. Curabitur ornare mi vel nunc laoreet elementum. Suspendisse vel est metus. Nulla
    molestie vehicula turpis, id cursus ante condimentum at. Integer laoreet at lectus vitae commodo. Mauris et nibh ut ligula
    fermentum pellentesque. Fusce condimentum dolor ullamcorper sagittis scelerisque. Nulla nunc enim, laoreet at mauris faucibus,
    lacinia cursus lacus. Sed arcu erat, scelerisque quis rhoncus tincidunt, placerat sed sapien. Orci varius natoque penatibus
    et magnis dis parturient montes, nascetur ridiculus mus.
`;

@Component({
  selector: 'app-main-view',
  imports: [
    WordCanvas,
    Toolbar,
    Button,
    FileUpload,
    LoadFromFile,
    Slider,
    FormsModule,
    InputText,
    InputNumber,
    Dialog,
    Divider,
    Textarea
  ],
  templateUrl: './main-view.html',
  styleUrl: './main-view.scss',
})
export class MainView implements OnInit {
  words: string[] = [];
  currentWordIndex: number = 0;

  minWpm: number = 150;
  maxWpm: number = 900;

  currentWord = signal<string>('');
  wordsPerMinute: Signal<number> = signal<number>(400);
  advanceDelay: Signal<number>;

  isPaused: boolean = false;

  importDialogShowing: boolean = false;

  constructor() {
    this.advanceDelay = computed(() => {
      const wpm = this.wordsPerMinute();
      const delay = Math.floor(60_000 / wpm);
      return Math.min(1000, Math.max(0.1, delay));
    });
  }

  ngOnInit() {
    this.loadText(SAMPLE_TEXT);
    this.resume();
  }

  setCurrentWordByIndex(index: number) {
    this.currentWordIndex = index;
    const currentWord = this.words[this.currentWordIndex] ?? '';
    this.currentWord.set(currentWord);
  }

  advance() {
    this.setCurrentWordByIndex(this.currentWordIndex + 1);

    if (this.currentWordIndex > this.words.length - 1) {
      this.setCurrentWordByIndex(0);
    }
  }

  loadTextFromDialog(text: string) {
    this.importDialogShowing = false;
    this.loadText(text);
  }

  loadText(text: string) {
    this.words = text.split(/\s/).filter((word) => word.length > 0);
    this.setCurrentWordByIndex(0);
  }

  resume() {
    const loopF = () => {
      this.advance();
      if (!this.isPaused) {
        setTimeout(() => {
          loopF();
        }, this.advanceDelay());
      }
    }

    this.isPaused = false;
    loopF();
  }

  pause() {
    this.isPaused = true;
  }
}
