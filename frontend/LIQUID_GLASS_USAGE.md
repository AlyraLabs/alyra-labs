# Liquid Glass Effect - Использование

## 🔮 Описание

Liquid Glass эффект состоит из двух частей:
- **SCSS Миксин** - содержит только визуальные стили эффекта
- **Angular Сервис** - обрабатывает интерактивность и динамические блики

## 📦 Что включено

### Миксин `@liquid-glass`
```scss
@include liquid-glass(
  $border-radius: 20px,        // Радиус границ
  $backdrop-blur: 5px,         // Сила размытия backdrop
  $background-opacity: 0.01,   // Прозрачность фона
  $border-opacity: 0.01,       // Прозрачность границы
  $hover-scale: 1.06,          // Масштаб при hover
  $hover-scale-y: 0.97,        // Масштаб по Y при hover
  $active-scale: 1.02,         // Масштаб при active
  $active-scale-y: 0.99        // Масштаб по Y при active
);
```

### Сервис `LiquidGlassService`
- Автоматическое отслеживание движения мыши
- Управление несколькими элементами одновременно
- Настраиваемые параметры интенсивности

## 🚀 Быстрый старт

### 1. SCSS Использование

```scss
@import '../styles/liquid-glass';

.my-glass-button {
  @include liquid-glass();
  
  // Ваши специфичные стили
  position: relative;
  padding: 20px;
  cursor: pointer;
  // НЕ добавляйте position: absolute в миксин!
}

// Кастомные параметры
.my-custom-glass {
  @include liquid-glass(
    $border-radius: 15px,
    $backdrop-blur: 8px,
    $hover-scale: 1.1,
    $hover-scale-y: 0.95
  );
  
  width: 200px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### 2. TypeScript Использование

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { LiquidGlassService } from '../services/liquid-glass.service';

@Component({
  selector: 'app-my-component',
  template: `
    <div class="glass-card" #glassCard>
      <p>Liquid Glass элемент</p>
    </div>
  `
})
export class MyComponent implements OnInit, OnDestroy {

  constructor(private liquidGlassService: LiquidGlassService) {}

  ngOnInit() {
    // Автоматическая регистрация после рендера
    setTimeout(() => {
      const element = document.querySelector('.glass-card') as HTMLElement;
      if (element) {
        this.liquidGlassService.registerElement(element);
      }
    }, 100);
  }

  ngOnDestroy() {
    // Сервис автоматически очищает удаленные элементы
    // Но для гарантии можно вызвать destroy()
    this.liquidGlassService.destroy();
  }
}
```

### 3. Кастомные настройки сервиса

```typescript
// Регистрация с настройками
this.liquidGlassService.registerElement(element, {
  maxDistance: window.innerWidth * 0.3,  // Радиус действия эффекта  
  lightIntensityRange: [1.0, 3.0],       // Диапазон яркости бликов
  darkIntensityRange: [0.2, 1.0]         // Диапазон интенсивности теней
});

// Отмена регистрации конкретного элемента
this.liquidGlassService.unregisterElement(element);

// Проверка количества активных элементов
console.log(this.liquidGlassService.getRegisteredElementsCount());
```

## 🎨 Примеры использования

### Простая кнопка
```scss
.liquid-button {
  @include liquid-glass(
    $border-radius: 12px,
    $backdrop-blur: 6px
  );
  
  padding: 15px 30px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
```

### Карточка контента
```scss
.glass-card {
  @include liquid-glass(
    $border-radius: 20px,
    $backdrop-blur: 10px,
    $background-opacity: 0.02,
    $hover-scale: 1.03,
    $hover-scale-y: 0.98
  );
  
  padding: 40px;
  width: 400px;
  min-height: 200px;
  margin: 20px;
}
```

### Модальное окно
```scss
.glass-modal {
  @include liquid-glass(
    $border-radius: 25px,
    $backdrop-blur: 15px,
    $background-opacity: 0.05,
    $border-opacity: 0.02,
    $hover-scale: 1.0,  // Без масштабирования
    $hover-scale-y: 1.0
  );
  
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 600px;
  padding: 50px;
  z-index: 1000;
}
```

## ⚡ Производительность

- **Один глобальный слушатель** - эффективно для множества элементов
- **Автоматическая очистка** - удаленные из DOM элементы убираются из отслеживания
- **Оптимизированные расчеты** - кешированные значения и быстрые вычисления

## 🛡️ Требования

1. **SVG фильтр** должен быть добавлен в HTML:
```html
<svg style="display: none;">
  <filter id="displacementFilter">
    <feImage href="/img/DisplacementMap.png" preserveAspectRatio="none" />
    <feDisplacementMap in="SourceGraphic" scale="200" 
                       xChannelSelector="R" yChannelSelector="G" />
  </filter>
</svg>
```

2. **CSS переменные** для цветов:
```scss
:root {
  --white: 255, 255, 255;  // RGB значения без rgb()
}
```

## 💡 Советы

- Миксин содержит **только эффект**, добавляйте позиционирование отдельно
- Используйте `position: relative` для корректной работы псевдоэлементов
- Регистрируйте элементы после их рендера (используйте `setTimeout`)
- Один сервис может обрабатывать множество элементов одновременно

## 🔧 Кастомизация

Все параметры миксина настраиваются. Для специфических случаев можете переопределить CSS переменные:

```scss
.custom-glass {
  @include liquid-glass();
  
  // Кастомные цвета
  --c-light: #00ffff;
  --c-dark: #ff0066;
  
  // Кастомная интенсивность (будет перезаписана сервисом)
  --glass-reflex-light: 2.0;
  --glass-reflex-dark: 0.8;
}
``` 