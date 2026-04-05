import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  OnInit,
  Signal,
  signal,
  viewChild
} from '@angular/core';

export type FocusType = 'center' | 'bionic';

const MAX_CENTER_FOCUS_INDEX = 4;

const BIONIC_FOCUS_LENGTH = 4;
const MIN_BIONIC_FOCUS_LENGTH = 4;

@Component({
  selector: 'app-word-canvas',
  imports: [],
  templateUrl: './word-canvas.html',
  styleUrl: './word-canvas.scss',
})
export class WordCanvas implements OnInit, AfterViewInit {
  word = input.required<string>()
  letterSpacing = input<number>(2);
  fontFamily = input<string>('monospace');

  width = input.required<number>();
  height = input.required<number>();

  focusType = input.required<FocusType>();

  normalTextStyle = input<string>('black');
  centerFocusTextStyle = input<string>('red');
  backgroundStyle = input<string>('white');

  mainCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('mainCanvas');

  fontSize: Signal<number>;
  centerFocusFont: Signal<string>;

  constructor(
  ) {
    effect(() => {
      const word = this.word();
      this.writeWord(word);
    });

    this.fontSize = computed(() => {
      return this.height() * (2/3);
    })

    this.centerFocusFont = computed(() => {
      const family = this.fontFamily();
      const fontSize = this.fontSize();

      return `normal ${fontSize}px ${family}`;
    });
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.writeWord(this.word());
  }

  writeWord(word: string) {
    const focusType = this.focusType();

    if (focusType == 'center') {
      this.writeWordWithCenterFocus(word);
    } else {
      this.writeWordWithBionicFocus(word);
    }
  }

  private commonCanvasSetup(ctx: CanvasRenderingContext2D) {
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = `${this.letterSpacing()}px`;

    ctx.fillStyle = this.backgroundStyle();
    ctx.fillRect(0, 0, this.width(), this.height());
  }

  private centerFocusIndex(length: number) {
    let index = 0;

    if (length > 2) {
      index = Math.floor(length / 2);
    }

    return Math.min(MAX_CENTER_FOCUS_INDEX, index);
  }

  writeWordWithCenterFocus(word: string) {
    const ctx = this.ctx;

    ctx.save();

    ctx.font = this.centerFocusFont();

    this.commonCanvasSetup(ctx);

    const focusIndex = this.centerFocusIndex(word.length);

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

    ctx.fillStyle = this.centerFocusTextStyle();
    ctx.fillText(focusLetter, focusStartX, halfHeight);

    ctx.fillStyle = this.normalTextStyle();
    ctx.fillText(secondHalf, focusStartX + focusMetrics.width + this.letterSpacing(), halfHeight);

    ctx.restore();
  }

  private bionicFocusIndex(length: number) {
    if (length <= MIN_BIONIC_FOCUS_LENGTH) {
      return MIN_BIONIC_FOCUS_LENGTH;
    } else {
      return BIONIC_FOCUS_LENGTH;
    }
  }

  writeWordWithBionicFocus(word: string) {
    const ctx = this.ctx;

    ctx.save();

    const bionicFocusFont = `900 ${this.fontSize()}px ${this.fontFamily()}`;
    const normalFont = `100 ${this.fontSize()}px ${this.fontFamily()}`;

    this.commonCanvasSetup(ctx);

    ctx.save();
    ctx.font = bionicFocusFont;
    const boldedWordMetrics = ctx.measureText(word);
    ctx.restore();

    const focusIndex = this.bionicFocusIndex(word.length);

    const firstHalf = word.slice(0, focusIndex);

    const secondHalf = word.slice(focusIndex);

    const halfWidth = this.width() / 2;
    const halfHeight = this.height() / 2;

    ctx.fillStyle = this.normalTextStyle();

    ctx.font = bionicFocusFont;
    const firstHalfMetrics  = ctx.measureText(firstHalf);
    const firstStartX = halfWidth - (boldedWordMetrics.width / 2);
    ctx.fillText(firstHalf, firstStartX, halfHeight);

    ctx.font = normalFont;
    const secondStartX = firstStartX + firstHalfMetrics.width + this.letterSpacing();
    ctx.fillText(secondHalf, secondStartX, halfHeight);

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
