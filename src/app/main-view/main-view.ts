import { Component, computed, ElementRef, HostBinding, OnInit, Signal, signal } from '@angular/core';
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
import { ProgressBar } from 'primeng/progressbar';
import { PreviewProgressBar } from '../preview-progress-bar/preview-progress-bar.component';
import { Accordion, AccordionHeader, AccordionPanel } from 'primeng/accordion';

const SAMPLE_TEXT = `
dSo I posted here a few days ago asking for feedback on something I built. Got some honest responses that basically said "this already exists" and "just use Copilot for this." Which... fair enough.

Quick context on what I built: it runs pytest on your project, tries to fix what's failing, checks if the fix actually worked, and rolls back if it made things worse. Basically automating the fix → run → verify loop that I kept doing manually.

The feedback made me realize something I probably should have figured out earlier — developers don't actually want a bot modifying their files. They want suggestions. They want control. Makes complete sense in hindsight.

So now I'm wondering if I built the right thing in the wrong place.

What if instead of running this as a developer tool, it lived inside CI/CD? Like when your GitHub Actions pipeline fails — instead of just showing a red X and making you go debug it — something automatically tries to fix it and opens a PR. You still review everything. Nothing gets merged without you. But the boring "find the error, apply the fix, run tests again" part is handled automatically.

I genuinely don't know if this is a good idea or if I'm just looking for a reason to not throw away a month of work

Few honest questions for anyone who's dealt with this:

Does your CI pipeline failing actually drive you crazy or do you just fix it and move on? Is there already something that does this that I'm missing? Would you trust an automated PR from a tool like this or would it feel like more noise?

Not trying to sell anything. Just trying to figure out if there's something real here or if I should cut my losses and move on to the next thing.

Honest takes welcome
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
  ],
  templateUrl: './main-view.html',
  styleUrl: './main-view.scss',
})
export class MainView implements OnInit {
  words: string[] = [];
  currentWordIndex: number = 0;
  whitespaceCombinedText: string = '';

  minWpm: number = 150;
  maxWpm: number = 900;

  minSpacing: number = -40;
  maxSpacing: number = 40;

  canvasWidth: number = 1800;
  canvasHeight: number = 300;

  currentWord = signal<string>('');
  wordsPerMinute: Signal<number> = signal<number>(400);
  letterSpacing: Signal<number> = signal<number>(0);
  advanceDelay: Signal<number>;

  isPaused: boolean = true;

  importDialogShowing: boolean = false;

  textColor!: string;

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
