import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appScrollToElement]',
  standalone: true
})
export class ScrollToElementDirective implements OnInit {
  @Input('appScrollToElement') targetSelector: string = '';
  @Input() offset: string = '0';

  private startingOffset: { top: number; left: number } = { top: 0, left: 0 };

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    // Store the initial position of this element
    this.updateStartingOffset();
  }

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    event.preventDefault();
    
    // Delay execution to allow for any layout changes
    setTimeout(() => {
      this.scrollToTarget();
    }, 300);
  }

  /**
   * Update starting offset of the current element
   */
  private updateStartingOffset(): void {
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    this.startingOffset = {
      top: rect.top + window.pageYOffset,
      left: rect.left + window.pageXOffset
    };
  }

  /**
   * Scroll to the target element or fallback to starting offset
   */
  private scrollToTarget(): void {
    let targetElement: Element | null = null;
    let targetOffset = this.startingOffset;

    // If a target selector is provided, try to find the target element
    if (this.targetSelector) {
      targetElement = document.querySelector(this.targetSelector);
      
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        targetOffset = {
          top: rect.top + window.pageYOffset,
          left: rect.left + window.pageXOffset
        };
      }
    }

    // Parse offset value
    const offsetValue = parseInt(this.offset) || 0;
    const scrollTop = targetOffset.top - offsetValue;

    // Smooth scroll to target
    this.smoothScrollTo(scrollTop);
  }

  /**
   * Smooth scroll to specified position
   */
  private smoothScrollTo(targetY: number): void {
    const startY = window.pageYOffset;
    const distance = targetY - startY;
    const duration = 500; // 500ms for smooth animation
    let startTime: number | null = null;

    const easeInOutQuart = (t: number): number => {
      return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
    };

    const scroll = (currentTime: number): void => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const easedProgress = easeInOutQuart(progress);
      
      window.scrollTo(0, startY + distance * easedProgress);

      if (progress < 1) {
        requestAnimationFrame(scroll);
      }
    };

    requestAnimationFrame(scroll);
  }

  /**
   * Get current element position
   */
  getElementPosition(): { top: number; left: number } {
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    return {
      top: rect.top + window.pageYOffset,
      left: rect.left + window.pageXOffset
    };
  }

  /**
   * Get target element position if it exists
   */
  getTargetPosition(): { top: number; left: number } | null {
    if (!this.targetSelector) return null;
    
    const targetElement = document.querySelector(this.targetSelector);
    if (!targetElement) return null;
    
    const rect = targetElement.getBoundingClientRect();
    return {
      top: rect.top + window.pageYOffset,
      left: rect.left + window.pageXOffset
    };
  }
}