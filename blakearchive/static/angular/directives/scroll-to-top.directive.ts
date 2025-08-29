import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[scrollToTop]',
  standalone: true
})
export class ScrollToTopDirective {

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    // Animate scroll to top for both html/body and overlay
    this.animateScrollToTop('html, body', 300);
    this.animateScrollToTop('#Overlay', 300);
  }

  /**
   * Smooth scroll animation to top
   * @param selector - CSS selector for elements to scroll
   * @param duration - Animation duration in milliseconds
   */
  private animateScrollToTop(selector: string, duration: number): void {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach(element => {
      if (element.scrollTop > 0) {
        const startTime = performance.now();
        const startScrollTop = element.scrollTop;

        const animateScroll = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Easing function for smooth animation
          const easeOutQuad = 1 - (1 - progress) * (1 - progress);
          
          element.scrollTop = startScrollTop * (1 - easeOutQuad);

          if (progress < 1) {
            requestAnimationFrame(animateScroll);
          }
        };

        requestAnimationFrame(animateScroll);
      }
    });
  }
}