import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
  selector: '[appLeftOnBroadcast]',
  standalone: true
})
export class LeftOnBroadcastDirective implements OnInit, OnDestroy {
  @Input('appLeftOnBroadcast') eventName: string = '';

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
      const unsubscribe = $rootScope.$on(this.eventName, (event: any, data: any) => {
        this.handleBroadcastEvent(data);
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
      .subscribe((event: any) => {
        if (event.detail) {
          this.handleBroadcastEvent(event.detail);
        }
      });
  }

  /**
   * Handle broadcast event data and scroll to target
   */
  private handleBroadcastEvent(data: any): void {
    if (data?.target && this.isDoneSettingCopy()) {
      // Add delay to allow for DOM updates
      setTimeout(() => {
        this.scrollToTarget(data.target);
      }, 300);
    }
  }

  /**
   * Scroll to target element within the current element
   */
  private scrollToTarget(targetSelector: string): void {
    try {
      const containerElement = this.elementRef.nativeElement;
      const targetElement = containerElement.querySelector(targetSelector);
      
      if (targetElement) {
        console.log('Container element:', containerElement);
        console.log('Target selector:', targetSelector);
        console.log('Target element:', targetElement);
        
        const offsetLeft = targetElement.offsetLeft;
        
        // Smooth scroll to target position
        this.smoothScrollToLeft(containerElement, offsetLeft);
      } else {
        console.warn(`Target element not found: ${targetSelector}`);
      }
    } catch (error) {
      console.error('Error scrolling to target:', error);
    }
  }

  /**
   * Smooth scroll to left position
   */
  private smoothScrollToLeft(container: HTMLElement, targetScrollLeft: number): void {
    const startScrollLeft = container.scrollLeft;
    const distance = targetScrollLeft - startScrollLeft;
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
      
      container.scrollLeft = startScrollLeft + distance * easedProgress;

      if (progress < 1) {
        requestAnimationFrame(scroll);
      }
    };

    requestAnimationFrame(scroll);
  }

  /**
   * Check if done setting copy (for AngularJS compatibility)
   */
  private isDoneSettingCopy(): boolean {
    const $rootScope = (window as any).$rootScope;
    return $rootScope?.doneSettingCopy || false;
  }

  /**
   * Get current scroll position
   */
  getCurrentScrollLeft(): number {
    return this.elementRef.nativeElement.scrollLeft;
  }

  /**
   * Manually trigger scroll to target
   */
  scrollToTargetElement(targetSelector: string): void {
    this.scrollToTarget(targetSelector);
  }
}