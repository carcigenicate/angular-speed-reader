import {
  Component,
  computed,
  ElementRef,
  HostListener,
  input,
  model, Renderer2,
  Signal,
  signal, viewChild,
  WritableSignal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProgressBar } from 'primeng/progressbar';

@Component({
  selector: 'app-preview-progress-bar',
  imports: [
    FormsModule,
    ProgressBar,
  ],
  templateUrl: './preview-progress-bar.component.html',
  styleUrl: './preview-progress-bar.component.scss',
})
export class PreviewProgressBar {
  currentWordIndex = model.required<number>();

  words = input.required<string[]>();
  textColor = input.required<string>();
  dialogBackgroundColor = input.required<string>();
  fontFamily = input<string>(`monospace`);

  height = input.required<number>();

  shownText: Signal<string>;
  font: Signal<string>;

  width: WritableSignal<number> = signal<number>(0);
  fontSizePx: Signal<number>;

  previewCardContainer = viewChild.required<ElementRef<HTMLDivElement>>('previewContainer');

  constructor(
    private host: ElementRef,
    private renderer: Renderer2,
  ) {
    this.shownText = computed(() => {
      return this.words().join(' ');
    })

    this.fontSizePx = computed(() => {
      const width = this.width();
      const text = this.shownText();
      const fontFamily = this.fontFamily();

      const testFontSize = 14;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

      ctx.font = this.getFont(testFontSize, fontFamily);

      const metrics = ctx.measureText(text);

      const factorOffBy = metrics.width / width;
      return testFontSize / factorOffBy;
    });

    this.font = computed(() => {
      const family = this.fontFamily();
      const fontSize = this.fontSizePx();
      return this.getFont(fontSize, family);
    });

    this.width.set(this.host.nativeElement.offsetWidth);
  }

  getFont(fontSize: number, fontFamily: string): string {
    return `normal ${fontSize}pt ${fontFamily}`;
  }

  @HostListener('window:resize')
  onResize() {
    this.width.set(this.host.nativeElement.offsetWidth);
  }

  private findFullWidthParent(clickTarget: HTMLElement): HTMLElement | null {
    if (clickTarget.classList.contains('p-progressbar')) {
      return clickTarget;
    } else {
      const parent = clickTarget.parentElement;
      if (parent) {
        return this.findFullWidthParent(parent);
      } else {
        return null;
      }
    }
  }

  private calculateWordIndexAt(parentBbox: DOMRect, eventClickX: number): number {

    const relativeClickX = eventClickX - parentBbox.left;

    const clickPerc = relativeClickX / parentBbox.width;
    return Math.floor(this.words().length * clickPerc)
  }

  progressBarClicked(event: MouseEvent) {
    const parent = this.findFullWidthParent(event.target as HTMLElement);

    if (parent) {
      const barBB = parent.getBoundingClientRect();
      const index = this.calculateWordIndexAt(barBB, event.clientX);
      this.currentWordIndex.set(index);
    }
  }

  progressBarMousedOver(event: MouseEvent) {
    const allWords = this.words();
    const parent = this.findFullWidthParent(event.target as HTMLElement);
    if (parent && allWords.length > 0) {
      const barBB = parent.getBoundingClientRect();
      const index = this.calculateWordIndexAt(barBB, event.clientX);
      const words = allWords.slice(index, index + 10).join(' ');

      const tooltip: HTMLSpanElement = this.renderer.createElement('span');
      this.renderer.addClass(tooltip, 'preview-card');
      this.renderer.setStyle(tooltip, 'color', this.textColor());
      this.renderer.setStyle(tooltip, 'background-color', this.dialogBackgroundColor());
      tooltip.innerText = words;

      const container = this.previewCardContainer().nativeElement;
      this.renderer.setProperty(container, 'innerHTML', '');
      this.renderer.appendChild(container, tooltip);
      container.appendChild(tooltip);

      const tooltipBB = tooltip.getBoundingClientRect();

      const y = event.clientY - barBB.top + 10;
      const x = Math.min(barBB.right - tooltipBB.width, event.clientX);

      tooltip.style.left = x + 'px';
      tooltip.style.top = y + 'px';
    }
  }

  progressBarMousedLeave(event: MouseEvent) {
    this.renderer.setProperty(this.previewCardContainer().nativeElement, 'innerHTML', '');
  }
}
