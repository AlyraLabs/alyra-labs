import { Injectable, ElementRef, Renderer2 } from '@angular/core';
import { Subscription, timer } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TypingAnimationService {
  private typedEl?: HTMLElement;
  private textBlocks: HTMLElement[] = [];
  private renderer?: Renderer2;

  private readonly fullText = 'AlyraLabs.';
  private readonly minDelay = 100;
  private readonly maxDelay = 200;
  private readonly preBlinkCount = 1;

  private readonly fastMinDelay = 5;
  private readonly fastMaxDelay = 20;

  private typingSub?: Subscription;
  private originalTexts: string[] = [];
  private animationPlayed: boolean[] = [false, false, false];
  private intersectionObserver?: IntersectionObserver;

  initialize(typedEl: ElementRef<HTMLElement>, textBlockRefs: Array<ElementRef<HTMLElement> | undefined>, renderer: Renderer2): void {
    this.typedEl = typedEl?.nativeElement;
    this.textBlocks = textBlockRefs.filter(Boolean).map(ref => (ref as ElementRef<HTMLElement>).nativeElement);
    this.renderer = renderer;

    this.saveOriginalTexts();
    this.startHeaderLogoTyping();
    this.startPreBlinkThenType();
    this.setupIntersectionObserver();
  }

  destroy(): void {
    if (this.typingSub) this.typingSub.unsubscribe();
    if (this.intersectionObserver) this.intersectionObserver.disconnect();
    this.typedEl = undefined;
    this.textBlocks = [];
    this.originalTexts = [];
    this.animationPlayed = [false, false, false];
  }

  private startPreBlinkThenType(): void {
    const blinkMs = 900;
    const totalDelay = this.preBlinkCount * blinkMs;
    setTimeout(() => this.startTyping(), totalDelay);
  }

  private startTyping(): void {
    if (!this.typedEl) return;
    let idx = 0;

    const typeNext = () => {
      const part = this.fullText.slice(0, idx);
      if (this.typedEl) this.typedEl.textContent = part;
      idx++;

      if (idx > this.fullText.length) {
        this.stopCursorBlink();
        this.positionCursorAfterText();
        this.revealLogoParts();
        return;
      }

      const delay = this.minDelay + Math.random() * (this.maxDelay - this.minDelay);
      this.typingSub = timer(delay).subscribe(() => typeNext());
    };

    typeNext();
  }

  private stopCursorBlink(): void {
    if (!this.renderer) return;
    const cursor = document.querySelector('.main-logo .cursor') as HTMLElement | null;
    if (cursor) this.renderer.addClass(cursor, 'stop');
  }

  private positionCursorAfterText(): void {
    if (!this.renderer) return;
    const cursor = document.querySelector('.main-logo .cursor') as HTMLElement | null;
    if (cursor) this.renderer.setStyle(cursor, 'left', '0px');
  }

  private revealLogoParts(): void {
    if (!this.renderer) return;
    const hiddenParts = Array.from(document.querySelectorAll('.logo-part.hidden')) as HTMLElement[];
    hiddenParts.forEach((el, i) => {
      const delay = 350 * i;
      setTimeout(() => {
        this.renderer!.removeClass(el, 'hidden');
        this.renderer!.addClass(el, 'reveal');
      }, delay);
    });
  }

  private saveOriginalTexts(): void {
    this.originalTexts = [];
    this.textBlocks.forEach((block, index) => {
      this.originalTexts[index] = block.innerHTML;
      block.innerHTML = '';
    });
  }

  private startHeaderLogoTyping(): void {
    const headerLogo = document.querySelector('.header .logo p') as HTMLElement | null;
    if (!headerLogo) return;
    const originalText = headerLogo.textContent || 'AlyraLabs.';
    headerLogo.textContent = '';
    setTimeout(() => this.typeHeaderLogoText(headerLogo, originalText), 500);
  }

  private typeHeaderLogoText(element: HTMLElement, text: string): void {
    let currentLength = 0;
    const typeNext = () => {
      if (currentLength < text.length) {
        element.textContent = text.slice(0, currentLength + 1);
        currentLength++;
        const delay = this.fastMinDelay + Math.random() * (this.fastMaxDelay - this.fastMinDelay);
        setTimeout(typeNext, delay);
      }
    };
    typeNext();
  }

  private typeTextBlock(element: HTMLElement, fullText: string): void {
    const visibleChars = this.getVisibleCharacters(fullText);
    let currentIndex = 0;
    const typeNext = () => {
      if (currentIndex < visibleChars.length) {
        const currentText = this.buildTextUpToIndex(fullText, currentIndex);
        element.innerHTML = `${currentText}<span class="cursor temp-cursor"></span>`;
        currentIndex++;
        const delay = this.fastMinDelay + Math.random() * (this.fastMaxDelay - this.fastMinDelay);
        setTimeout(typeNext, delay);
      } else {
        const tempCursor = element.querySelector('.temp-cursor');
        if (tempCursor && tempCursor.parentElement) {
          tempCursor.parentElement.removeChild(tempCursor);
        }
      }
    };
    typeNext();
  }

  private getVisibleCharacters(html: string): string[] {
    const chars: string[] = [];
    let inTag = false;
    for (let i = 0; i < html.length; i++) {
      const char = html[i];
      if (char === '<') inTag = true;
      else if (char === '>') inTag = false;
      else if (!inTag) chars.push(char);
    }
    return chars;
  }

  private buildTextUpToIndex(html: string, targetIndex: number): string {
    let result = '';
    let visibleCount = 0;
    let inTag = false;
    for (let i = 0; i < html.length; i++) {
      const char = html[i];
      if (char === '<') { inTag = true; result += char; }
      else if (char === '>') { inTag = false; result += char; }
      else if (inTag) { result += char; }
      else {
        if (visibleCount < targetIndex) { result += char; visibleCount++; }
        else { break; }
      }
    }
    return result;
  }

  private setupIntersectionObserver(): void {
    const options: IntersectionObserverInit = { root: null, rootMargin: '0px', threshold: 0.3 };
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          const blockIndex = this.getTextBlockIndex(target);
          if (blockIndex !== -1 && !this.animationPlayed[blockIndex]) {
            this.animationPlayed[blockIndex] = true;
            this.startSingleTextBlockTyping(blockIndex);
          }
        }
      });
    }, options);

    this.textBlocks.forEach((block) => this.intersectionObserver!.observe(block));
  }

  private getTextBlockIndex(element: HTMLElement): number {
    return this.textBlocks.findIndex(block => block === element);
  }

  private startSingleTextBlockTyping(blockIndex: number): void {
    const block = this.textBlocks[blockIndex];
    const html = this.originalTexts[blockIndex];
    if (!block || !html) return;
    setTimeout(() => this.typeTextBlock(block, html), 200);
  }
}


