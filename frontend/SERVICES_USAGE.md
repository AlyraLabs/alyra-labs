# Руководство: как использовать SmoothScrollService и TypingAnimationService

Ниже — минимальные шаги для интеграции двух сервисов в ваш Angular‑проект. Оба сервиса не требуют модульной регистрации (предоставлены в root), достаточно внедрить их в нужный компонент.

## 1) SmoothScrollService — плавная навигация по секциям с клавиатуры

- **Назначение**: перехватывает `ArrowUp/ArrowDown` и `PageUp/PageDown` и скроллит к ближайшему блоку.
- **Как включить**: просто внедрите сервис в конструктор любого живущего на странице компонента (его конструктор навесит глобальные обработчики).

```ts
import { Component } from '@angular/core';
import { SmoothScrollService } from './services/smooth-scroll.service';

@Component({
  selector: 'app-page',
  template: '<router-outlet />'
})
export class PageComponent {
  constructor(private smoothScrollService: SmoothScrollService) {}
}
```

- **Требование к разметке**: секции страницы должны иметь классы из списка: `.main`, `.text-block`, `.footer-block` — именно они участвуют в циклическом скролле.

Пример:
```html
<div class="main"> ... </div>
<div class="text-block"> ... </div>
<div class="text-block"> ... </div>
<div class="footer-block"> ... </div>
```

## 2) TypingAnimationService — анимация «печатания» и появления логотипа

- **Назначение**: печатает заголовок, управляет миганием курсора и поочередным показом частей логотипа; печатает тексты блоков по IntersectionObserver.
- **API**:
  - `initialize(typedEl, textBlockRefs[], renderer)` — запустить анимацию; передайте `ElementRef` основного поля печати, массив `ElementRef` текстовых блоков и `Renderer2`.
  - `destroy()` — корректно остановить и очистить ресурсы (вызывайте в `ngOnDestroy`).

### Шаги интеграции

1) В шаблоне добавьте минимальную разметку:
```html
<!-- Главный заголовок с печатью -->
<p #typed class="typewriter"></p>

<!-- Логотип: курсор и скрытые части -->
<div class="logo-img">
  <div class="logo-part cursor"></div>
  <div class="logo-parts">
    <div class="logo-part hidden"></div>
    <div class="logo-part hidden"></div>
  </div>
</div>

<!-- Текстовые блоки (любое содержимое; можно с тегами) -->
<p #textBlock1 class="typewriter-text"> ... </p>
<p #textBlock2 class="typewriter-text"> ... </p>
<p #textBlock3 class="typewriter-text"> ... </p>
```

2) В компоненте получите ссылки через `@ViewChild` и инициализируйте сервис:
```ts
import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { TypingAnimationService } from './services/typing-animation.service';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.component.html'
})
export class IntroComponent implements AfterViewInit, OnDestroy {
  @ViewChild('typed') typedEl!: ElementRef<HTMLElement>;
  @ViewChild('textBlock1') textBlock1!: ElementRef<HTMLElement>;
  @ViewChild('textBlock2') textBlock2!: ElementRef<HTMLElement>;
  @ViewChild('textBlock3') textBlock3!: ElementRef<HTMLElement>;

  constructor(
    private renderer: Renderer2,
    private typingAnimation: TypingAnimationService
  ) {}

  ngAfterViewInit(): void {
    this.typingAnimation.initialize(
      this.typedEl,
      [this.textBlock1, this.textBlock2, this.textBlock3],
      this.renderer
    );
  }

  ngOnDestroy(): void {
    this.typingAnimation.destroy();
  }
}
```

3) Разметка хедера (опционально, если нужна печать логотипа в хедере):
```html
<div class="header">
  <div class="logo">
    <p>AlyraLabs.</p>
  </div>
</div>
```
Сервис сам найдёт `.header .logo p`, очистит и «напишет» текст с ускоренной анимацией.

### Требования к CSS-классам
- `.cursor` — элемент-курсор; сервис добавляет класс `stop` для отключения мигания и изменяет `left` после печати.
- `.logo-part.hidden` — скрытые части логотипа; сервис постепенно убирает `hidden` и добавляет `reveal` с задержкой 350 мс между элементами.
- `.typewriter` и `.typewriter-text` — стилизуйте под ваш дизайн (минимально — моноширинный шрифт/курсор при желании).

### Важные детали
- Сервис корректно обрабатывает HTML внутри текстовых блоков: теги не «печататся» посимвольно, только видимые символы.
- Запуск печати основного заголовка начинается после короткой задержки имитации мигания курсора.
- Прослушка видимости блоков (`IntersectionObserver`) запускает печать каждого блока один раз при появлении ~30% блока в вьюпорте.

### Типичные проблемы и решения
- **Нет скролла с клавиатуры**: убедитесь, что `SmoothScrollService` внедрён в конструктор активного компонента (его инстанциирование навешивает обработчики).
- **Печать не начинается**: проверьте, что `@ViewChild('typed')` и блоки `#textBlockN` доступны к моменту вызова `initialize` (нужно вызывать в `ngAfterViewInit`).
- **Нет анимации логотипа**: удостоверьтесь, что в DOM есть `.header .logo p` и у частей логотипа есть классы `.logo-part cursor` и `.logo-part hidden`.

### Кастомизация
Если хотите управлять скоростями и задержками из компонента — несложно расширить сервис:
- добавить параметры в `initialize(...)` (например, `typingSpeed`, `revealDelayMs`),
- или ввести конфигурационный интерфейс и хранить его в приватном поле сервиса.

---

Готово. Достаточно:
- внедрить `SmoothScrollService` (для клавиатуры),
- вызвать `typingAnimation.initialize(...)`/`destroy()` (для анимаций печати),
- соблюсти минимальные требования к разметке и CSS-классам.
