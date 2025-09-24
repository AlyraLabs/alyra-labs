import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmoothScrollService } from '../services/smooth-scroll.service';
import { timer, Subscription } from 'rxjs';

@Component({
  selector: 'app-intro',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.scss',
		'./intro.component.adaptives.scss'
	],
})
export class IntroComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('typed') typedEl!: ElementRef<HTMLElement>;
  @ViewChild('textBlock1') textBlock1!: ElementRef<HTMLElement>;
  @ViewChild('textBlock2') textBlock2!: ElementRef<HTMLElement>;
  @ViewChild('textBlock3') textBlock3!: ElementRef<HTMLElement>;

  /** Текст, который будет «печаться» */
  private readonly fullText = 'AlyraLabs.';
  /** Диапазон задержки между символами (мс) – теперь медленнее */
  private readonly minDelay = 100;
  private readonly maxDelay = 200;
  /** Сколько раз курсор будет мигать перед стартом */
  private readonly preBlinkCount = 1;

  /** Быстрая анимация печатания для text-block */
  private readonly fastMinDelay = 5;
  private readonly fastMaxDelay = 20;

  private typingSub!: Subscription;
  
  /** Хранилище оригинального текста для text-block */
  private originalTexts: string[] = [];
  
  /** Флаги для отслеживания уже проигранных анимаций */
  private animationPlayed: boolean[] = [false, false, false];
  
  /** Intersection Observer для отслеживания видимости блоков */
  private intersectionObserver!: IntersectionObserver;

  constructor(
    private smoothScrollService: SmoothScrollService,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    // Сервис автоматически инициализируется при создании
  }

  ngAfterViewInit(): void {
    this.saveOriginalTexts();
    this.startHeaderLogoTyping();
    this.startPreBlinkThenType();
    this.setupIntersectionObserver();
  }

  /** 1️⃣ Пара миганий → 2️⃣ типинг */
  private startPreBlinkThenType(): void {
    const blinkMs = 900; // длительность одной анимации blink
    const totalDelay = this.preBlinkCount * blinkMs;

    setTimeout(() => this.startTyping(), totalDelay);
  }

  /** Запуск «мягкого» typewriter‑эффекта */
  private startTyping(): void {
    let idx = 0;

    const typeNext = () => {
      const part = this.fullText.slice(0, idx);
      this.typedEl.nativeElement.textContent = part;
      idx++;

        if (idx > this.fullText.length) {
          // Всё напечатано → фиксируем курсор и показываем логотип
          this.stopCursorBlink();
          this.positionCursorAfterText();
          this.revealLogoParts();
          return;
        }

      // рандомная задержка между символами
      const delay =
        this.minDelay + Math.random() * (this.maxDelay - this.minDelay);
      this.typingSub = timer(delay).subscribe(() => typeNext());
    };

    typeNext();
  }

  /** Отключаем мигание курсора, оставляем его видимым */
  private stopCursorBlink(): void {
    const cursor = document.querySelector('.cursor') as HTMLElement;
    if (cursor) this.renderer.addClass(cursor, 'stop');
  }

  /** Фиксируем курсор в начальной позиции рядом с логотипом */
  private positionCursorAfterText(): void {
    const cursor = document.querySelector('.cursor') as HTMLElement;
    
    if (cursor) {
      // Возвращаем курсор в начальную позицию (left: 0)
      this.renderer.setStyle(cursor, 'left', '0px');
    }
  }

  /** Появление скрытых частей – более растянутый тайм‑лайн */
  private revealLogoParts(): void {
    const hiddenParts = Array.from(
      document.querySelectorAll('.logo-part.hidden')
    );

    hiddenParts.forEach((el, i) => {
      // Увеличиваем интервал до 350 мс между частями
      const delay = 350 * i; // 0 мс, 350 мс, 700 мс …
      setTimeout(() => {
        this.renderer.removeClass(el, 'hidden');
        this.renderer.addClass(el, 'reveal');
      }, delay);
    });

    // Анимация text-block теперь запускается через Intersection Observer
  }

  /** Сохранение оригинального текста text-block элементов */
  private saveOriginalTexts(): void {
    const textBlocks = [this.textBlock1, this.textBlock2, this.textBlock3];
    
    textBlocks.forEach((block, index) => {
      if (block) {
        this.originalTexts[index] = block.nativeElement.innerHTML;
        // Очищаем текст для анимации
        block.nativeElement.innerHTML = '';
      }
    });
  }

  /** Запуск анимации печатания для логотипа в хедере */
  private startHeaderLogoTyping(): void {
    const headerLogo = document.querySelector('.header .logo p') as HTMLElement;
    if (headerLogo) {
      const originalText = headerLogo.textContent || 'AlyraLabs.';
      headerLogo.textContent = '';
      
      // Запускаем анимацию после CSS анимации хедера
      setTimeout(() => {
        this.typeHeaderLogoText(headerLogo, originalText);
      }, 500);
    }
  }

  /** Анимация печатания для логотипа в хедере */
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


  /** Анимация печатания для одного text-block */
  private typeTextBlock(element: HTMLElement, fullText: string): void {
    // Создаем массив символов, пропуская HTML теги
    const visibleChars = this.getVisibleCharacters(fullText);
    let currentIndex = 0;
    
    const typeNext = () => {
      if (currentIndex < visibleChars.length) {
        // Собираем текст до текущего видимого символа
        const currentText = this.buildTextUpToIndex(fullText, currentIndex);
        element.innerHTML = currentText;
        currentIndex++;
        
        // Быстрая рандомная задержка
        const delay = this.fastMinDelay + Math.random() * (this.fastMaxDelay - this.fastMinDelay);
        setTimeout(typeNext, delay);
      }
    };
    
    typeNext();
  }

  /** Получаем только видимые символы (без HTML тегов) */
  private getVisibleCharacters(html: string): string[] {
    const chars: string[] = [];
    let inTag = false;
    
    for (let i = 0; i < html.length; i++) {
      const char = html[i];
      
      if (char === '<') {
        inTag = true;
      } else if (char === '>') {
        inTag = false;
      } else if (!inTag) {
        chars.push(char);
      }
    }
    
    return chars;
  }

  /** Строим текст до определенного индекса видимого символа */
  private buildTextUpToIndex(html: string, targetIndex: number): string {
    let result = '';
    let visibleCount = 0;
    let inTag = false;
    
    for (let i = 0; i < html.length; i++) {
      const char = html[i];
      
      if (char === '<') {
        inTag = true;
        result += char;
      } else if (char === '>') {
        inTag = false;
        result += char;
      } else if (inTag) {
        result += char;
      } else {
        if (visibleCount < targetIndex) {
          result += char;
          visibleCount++;
        } else {
          break;
        }
      }
    }
    
    return result;
  }

  /** Настройка Intersection Observer для отслеживания видимости text-block */
  private setupIntersectionObserver(): void {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.3 // Анимация запустится когда 30% блока будет видно
    };

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

    // Наблюдаем за text-block элементами
    const textBlocks = [this.textBlock1, this.textBlock2, this.textBlock3];
    textBlocks.forEach((block) => {
      if (block) {
        this.intersectionObserver.observe(block.nativeElement);
      }
    });
  }

  /** Получение индекса text-block элемента */
  private getTextBlockIndex(element: HTMLElement): number {
    const textBlocks = [this.textBlock1, this.textBlock2, this.textBlock3];
    return textBlocks.findIndex(block => block && block.nativeElement === element);
  }

  /** Запуск анимации для одного text-block */
  private startSingleTextBlockTyping(blockIndex: number): void {
    const textBlocks = [this.textBlock1, this.textBlock2, this.textBlock3];
    const block = textBlocks[blockIndex];
    
    if (block && this.originalTexts[blockIndex]) {
      // Небольшая задержка для плавности
      setTimeout(() => {
        this.typeTextBlock(block.nativeElement, this.originalTexts[blockIndex]);
      }, 200);
    }
  }

  /** Очистка ресурсов при уничтожении компонента */
  ngOnDestroy(): void {
    if (this.typingSub) {
      this.typingSub.unsubscribe();
    }
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }

} 