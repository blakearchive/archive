import { Directive, OnInit, OnDestroy } from '@angular/core';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil, throttleTime } from 'rxjs/operators';

@Directive({
  selector: '[appParallax]',
  standalone: true
})
export class ParallaxDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor() {}

  ngOnInit(): void {
    // Listen for scroll events with throttling for performance
    fromEvent(window, 'scroll')
      .pipe(
        throttleTime(16), // ~60fps throttling
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.handleScroll();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handle scroll events
   */
  private handleScroll(): void {
    const offset = window.pageYOffset || document.documentElement.scrollTop;
    
    // Broadcast scroll event for AngularJS compatibility
    this.broadcastScrollEvent(offset);
  }

  /**
   * Broadcast scroll event for AngularJS compatibility
   */
  private broadcastScrollEvent(offset: number): void {
    // Broadcast AngularJS event
    const $rootScope = (window as any).$rootScope;
    if ($rootScope && $rootScope.$broadcast) {
      try {
        $rootScope.$broadcast('scroll::scroll', { offset });
        
        // Trigger digest cycle if not already in progress
        if (!$rootScope.$$phase) {
          $rootScope.$apply();
        }
      } catch (error) {
        // Ignore digest cycle errors
      }
    }

    // Emit custom DOM event for broader compatibility
    const event = new CustomEvent('parallax:scroll', {
      detail: { offset }
    });
    window.dispatchEvent(event);
  }

  /**
   * Get current scroll offset
   */
  getCurrentScrollOffset(): number {
    return window.pageYOffset || document.documentElement.scrollTop;
  }
}