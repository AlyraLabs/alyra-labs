import { Injectable } from '@angular/core';
import { fromEvent } from 'rxjs';

@Injectable({providedIn: 'root'})
export class SmoothScrollService {
  private readonly DELAY = 150;

  constructor() {
    this.initListeners();
  }

  private initListeners(): void {
    fromEvent<KeyboardEvent>(document, 'keydown')
      .subscribe(e => {
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
          e.preventDefault();
          this.scrollToNextSection(1);
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
          e.preventDefault();
          this.scrollToNextSection(-1);
        }
      });
  }


  private scrollToNextSection(dir: number): void {
    const sections = document.querySelectorAll('.main,.text-block,.footer-block');
    const cur = this.getCurrentSection();
    if (!cur) return;

    const idx = Array.from(sections).indexOf(cur);
    let targetIdx = idx + dir;
    targetIdx = Math.max(0, Math.min(targetIdx, sections.length - 1));

    if (targetIdx !== idx) {
      const el = sections[targetIdx] as HTMLElement;
      setTimeout(() => {
        el.scrollIntoView({behavior: 'smooth', block: 'start'});
      }, this.DELAY);
    }
  }

  private getCurrentSection(): Element | null {
    const sections = document.querySelectorAll('.main,.text-block,.footer-block');
    const center = window.innerHeight / 2;

     for (const s of sections) {
       const r = s.getBoundingClientRect();
       if (r.top <= center && r.bottom >= center) return s;
     }
    return sections[0] || null;
  }

  scrollToNext()      { this.scrollToNextSection(1); }
  scrollToPrevious() { this.scrollToNextSection(-1); }
}
