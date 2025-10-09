import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmoothScrollService } from '../services/smooth-scroll.service';
import { TypingAnimationService } from '../services/typing-animation.service';

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
export class IntroComponent implements AfterViewInit, OnDestroy {
  @ViewChild('typed') typedEl!: ElementRef<HTMLElement>;
  @ViewChild('textBlock1') textBlock1!: ElementRef<HTMLElement>;
  @ViewChild('textBlock2') textBlock2!: ElementRef<HTMLElement>;
  @ViewChild('textBlock3') textBlock3!: ElementRef<HTMLElement>;

  constructor(
    private renderer: Renderer2,
    private typingAnimation: TypingAnimationService,
    private smoothScrollService: SmoothScrollService
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