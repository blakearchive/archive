import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
  selector: '[appToTopOnBroadcast]',
  standalone: true
})
export class ToTopOnBroadcastDirective implements OnInit, OnDestroy {
  @Input('appToTopOnBroadcast') eventName: string = '';
  @Input() target: string = '';

  private destroy$ = new Subject<void>();

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    if (this.eventName) {
      this.listenForEvent();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Listen for AngularJS broadcast events and custom DOM events
   */
  private listenForEvent(): void {
    // Listen for AngularJS events
    this.listenForAngularJSEvent();
    
    // Listen for custom DOM events
    this.listenForDOMEvent();
  }

  /**
   * Listen for AngularJS broadcast events
   */
  private listenForAngularJSEvent(): void {
    const $rootScope = (window as any).$rootScope;
    if ($rootScope) {
      const unsubscribe = $rootScope.$on(this.eventName, () => {
        this.scrollToTop();
      });

      // Clean up AngularJS listener
      this.destroy$.subscribe(() => {
        if (unsubscribe && typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    }
  }

  /**
   * Listen for custom DOM events
   */
  private listenForDOMEvent(): void {
    // Convert AngularJS event name to DOM event name
    const domEventName = this.eventName.replace('::', ':');
    
    fromEvent(window, domEventName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.scrollToTop();
      });
  }

  /**
   * Scroll to top of element or target elements
   */
  private scrollToTop(): void {
    if (this.target) {
      // Scroll all target elements to top
      const containerElement = this.elementRef.nativeElement;
      const targetElements = containerElement.querySelectorAll(this.target);
      
      targetElements.forEach((element: HTMLElement) => {
        this.smoothScrollToTop(element);
      });
    } else {
      // Scroll current element to top
      this.smoothScrollToTop(this.elementRef.nativeElement);
    }
  }

  /**
   * Smooth scroll element to top
   */
  private smoothScrollToTop(element: HTMLElement): void {
    const startScrollTop = element.scrollTop;
    const duration = 300; // Fast animation like the original
    let startTime: number | null = null;

    const easeInOutQuad = (t: number): number => {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    };

    const scroll = (currentTime: number): void => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const easedProgress = easeInOutQuad(progress);
      
      element.scrollTop = startScrollTop * (1 - easedProgress);

      if (progress < 1) {
        requestAnimationFrame(scroll);
      }
    };

    requestAnimationFrame(scroll);
  }

  /**
   * Manually trigger scroll to top
   */
  manualScrollToTop(): void {
    this.scrollToTop();
  }

  /**
   * Get current scroll position
   */
  getCurrentScrollTop(): number {
    return this.elementRef.nativeElement.scrollTop;
  }

  /**
   * Get target elements if specified
   */
  getTargetElements(): NodeList | null {
    if (this.target) {
      return this.elementRef.nativeElement.querySelectorAll(this.target);
    }
    return null;
  }
}