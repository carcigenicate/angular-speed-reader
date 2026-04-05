import { Component, computed, ElementRef, HostBinding, OnInit, Signal, signal } from '@angular/core';
import { FocusType, WordCanvas } from '../word-canvas/word-canvas';
import { Toolbar } from 'primeng/toolbar';
import { Button } from 'primeng/button';
import { LoadFromFile } from '../util-components/load-from-file/load-from-file';
import { Slider } from 'primeng/slider';
import { FormsModule } from '@angular/forms';
import { InputNumber } from 'primeng/inputnumber';
import { Dialog } from 'primeng/dialog';
import { Divider } from 'primeng/divider';
import { Textarea } from 'primeng/textarea';
import { PreviewProgressBar } from '../preview-progress-bar/preview-progress-bar.component';
import { SelectButton } from 'primeng/selectbutton';

const SAMPLE_TEXT = `
`;

@Component({
  selector: 'app-main-view',
  imports: [
    WordCanvas,
    Toolbar,
    Button,
    LoadFromFile,
    Slider,
    FormsModule,
    InputNumber,
    Dialog,
    Divider,
    Textarea,
    PreviewProgressBar,
    SelectButton,
  ],
  templateUrl: './main-view.html',
  styleUrl: './main-view.scss',
})
export class MainView implements OnInit {
  text: string = '';
  words: string[] = [];
  currentWordIndex: number = 0;
  whitespaceCombinedText: string = '';

  minWpm: number = 150;
  maxWpm: number = 900;
  wordsPerMinute: Signal<number> = signal<number>(400);

  minSpacing: number = -40;
  maxSpacing: number = 40;
  letterSpacing: Signal<number> = signal<number>(0);

  focusType: Signal<FocusType> = signal<FocusType>('center');

  canvasWidth: number = 1800;
  canvasHeight: number = 300;

  currentWord = signal<string>('');

  advanceDelay: Signal<number>;

  isPaused: boolean = true;

  importDialogShowing: boolean = false;

  textColor!: string;
  backgroundColor!: string;

  focusTypeOptions: { label: string, value: FocusType }[] = [
    { label: 'Center', value: 'center' },
    { label: 'Bionic', value: 'bionic' },
  ]

  constructor(
    private host: ElementRef,
  ) {
    this.advanceDelay = computed(() => {
      const wpm = this.wordsPerMinute();
      const delay = Math.floor(60_000 / wpm);
      return Math.min(1000, Math.max(0.1, delay));
    });
  }

  ngOnInit() {
    this.textColor = getComputedStyle(this.host.nativeElement).getPropertyValue('--p-text-color');
    this.backgroundColor = getComputedStyle(this.host.nativeElement).getPropertyValue('--p-overlay-modal-background');

    this.loadText(SAMPLE_TEXT);
    this.resume();
  }

  setCurrentWordByIndex(index: number) {
    this.currentWordIndex = index;
    const currentWord = this.words[this.currentWordIndex] ?? '';
    this.currentWord.set(currentWord);
  }

  restart() {
    this.setCurrentWordByIndex(0);
    this.resume();
  }

  advance() {
    this.setCurrentWordByIndex(this.currentWordIndex + 1);

    if (this.currentWordIndex >= this.words.length - 1) {
      this.pause();
    }
  }

  loadTextFromDialog(text: string) {
    this.importDialogShowing = false;
    this.loadText(text);
  }

  loadText(text: string) {
    this.text = text;
    this.whitespaceCombinedText = text.replace(/\s+/g, ' ');
    this.words = this.whitespaceCombinedText.split(/\s/).filter((word) => word.length > 0);
    this.setCurrentWordByIndex(0);
  }

  resume() {
    if (this.isPaused) {
      const loopF = () => {
        if (!this.isPaused) {
          this.advance();

          setTimeout(() => {
            loopF();
          }, this.advanceDelay());
        }
      }

      this.isPaused = false;
      loopF();
    }
  }

  pause() {
    this.isPaused = true;
  }
}
