import { AfterViewInit, Component, effect, ElementRef, input, OnInit, viewChild } from '@angular/core';

const MAX_FOCUS_INDEX = 4;

@Component({
  selector: 'app-word-canvas',
  imports: [],
  templateUrl: './word-canvas.html',
  styleUrl: './word-canvas.scss',
})
export class WordCanvas implements OnInit, AfterViewInit {
  word = input.required<string>()
  letterSpacing = input<number>(2);
  font = input<string>('bold 200px Arial');

  width = input.required<number>();
  height = input.required<number>();

  mainCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('mainCanvas');

  normalTextStyle = input<string>('black');
  focusTextStyle = input<string>('red');
  backgroundStyle = input<string>('white');

  constructor(
  ) {
    effect(() => {
      const word = this.word();
      this.writeWord(word);
    })
  }

  focusIndex(length: number) {
    let index = 0;

    if (length > 2) {
      index = Math.floor(length / 2);
    }

    return Math.min(MAX_FOCUS_INDEX, index);
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.writeWord(this.word());
  }

  writeWord(word: string) {
    const ctx = this.ctx;

    ctx.save();

    ctx.font = this.font();
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = `${this.letterSpacing()}px`;

    ctx.fillStyle = this.backgroundStyle();
    ctx.fillRect(0, 0, this.width(), this.height());

    const focusIndex = this.focusIndex(word.length);

    const firstHalf = word.slice(0, focusIndex);
    const firstHalfMetrics  = ctx.measureText(firstHalf);

    const focusLetter = word.charAt(focusIndex);
    const focusMetrics = ctx.measureText(focusLetter);

    const secondHalf = word.slice(focusIndex + 1);

    const halfWidth = this.width() / 2;
    const halfHeight = this.height() / 2;

    const focusStartX = halfWidth - (focusMetrics.width / 2);

    ctx.fillStyle = this.normalTextStyle();
    ctx.fillText(firstHalf, focusStartX - firstHalfMetrics.width - this.letterSpacing(), halfHeight);

    ctx.fillStyle = this.focusTextStyle();
    ctx.fillText(focusLetter, focusStartX, halfHeight);

    ctx.fillStyle = this.normalTextStyle();
    ctx.fillText(secondHalf, focusStartX + focusMetrics.width + this.letterSpacing(), halfHeight);

    ctx.restore();
  }

  get ctx(): CanvasRenderingContext2D {
    const canvas = this.mainCanvas().nativeElement;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      return ctx
    } else {
      throw new Error('Can\'t get the canvas context.');
    }
  }
}
