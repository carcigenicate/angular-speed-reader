import { Component, ElementRef, output, viewChild } from '@angular/core';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-load-from-file',
  imports: [
    Button
  ],
  templateUrl: './load-from-file.html',
  styleUrl: './load-from-file.scss',
})
export class LoadFromFile {
    fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

    textImported = output<string>();

    onFileDialog() {
      const fileInput = this.fileInput().nativeElement;

      fileInput.addEventListener('change', async () => {
        const files = fileInput.files ?? [];
        if (files.length > 0) {
          const text = await files[0].text();
          this.textImported.emit(text);
        }
      })

      fileInput.click();
    }
}
