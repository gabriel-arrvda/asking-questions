import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import katex from 'katex';

type MathSegment = {
  text: string;
  math: boolean;
  displayMode: boolean;
};

@Pipe({
  name: 'math',
  standalone: true,
})
export class MathPipe implements PipeTransform {
  constructor(private readonly sanitizer: DomSanitizer) {}

  transform(value: string | null | undefined): SafeHtml {
    if (!value) return '';

    const html = this.parseSegments(value)
      .map((segment) => {
        if (!segment.math) return this.escapeHtml(segment.text);

        try {
          return katex.renderToString(segment.text, {
            displayMode: segment.displayMode,
            throwOnError: false,
            strict: false,
            trust: false,
          });
        } catch {
          return this.escapeHtml(segment.text);
        }
      })
      .join('');

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private parseSegments(value: string): MathSegment[] {
    const segments: MathSegment[] = [];
    const pattern = /\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)|\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;
    let lastIndex = 0;

    for (const match of value.matchAll(pattern)) {
      const index = match.index ?? 0;
      if (index > lastIndex) {
        segments.push({ text: value.slice(lastIndex, index), math: false, displayMode: false });
      }

      const displayText = match[1] ?? match[3];
      const inlineText = match[2] ?? match[4];
      segments.push({
        text: displayText ?? inlineText ?? '',
        math: true,
        displayMode: Boolean(displayText),
      });
      lastIndex = index + match[0].length;
    }

    if (lastIndex < value.length) {
      segments.push({ text: value.slice(lastIndex), math: false, displayMode: false });
    }

    return segments;
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
