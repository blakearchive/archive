import { Directive, OnInit, OnDestroy } from '@angular/core';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { WindowSizeService } from '../services/window-size.service';

@Directive({
  selector: '[appResize]',
  standalone: true
})
export class ResizeDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private resizeTimer?: number;

  constructor(private windowSizeService: WindowSizeService) {}

  ngOnInit(): void {
    // Set initial window size
    this.updateWindowSize();
    
    // Listen for window resize events with debouncing
    fromEvent(window, 'resize')
      .pipe(
        debounceTime(300), // Wait 300ms after user stops resizing
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.updateWindowSize();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
    }
  }

  /**
   * Update window size and broadcast resize event
   */
  private updateWindowSize(): void {
    const dimensions = {
      height: window.innerHeight,
      width: window.innerWidth
    };

    // Window size service provides current dimensions via getters
    // No need to update as it reads directly from window

    // Broadcast resize event for AngularJS compatibility
    this.broadcastResizeEvent(dimensions);

    console.log('Window resized:', dimensions);
  }

  /**
   * Broadcast resize event for AngularJS compatibility
   */
  private broadcastResizeEvent(dimensions: { height: number; width: number }): void {
    // Update global WindowSize object for AngularJS compatibility
    const windowSize = (window as any).WindowSize;
    if (windowSize) {
      windowSize.height = dimensions.height;
      windowSize.width = dimensions.width;
    }

    // Broadcast AngularJS event
    const $rootScope = (window as any).$rootScope;
    if ($rootScope && $rootScope.$broadcast) {
      try {
        $rootScope.$broadcast('resize::resize', dimensions);
        
        // Trigger digest cycle if not already in progress
        if (!$rootScope.$$phase) {
          $rootScope.$apply();
        }
      } catch (error) {
        // Ignore digest cycle errors
      }
    }

    // Emit custom DOM event for broader compatibility
    const event = new CustomEvent('window:resize', {
      detail: dimensions
    });
    window.dispatchEvent(event);
  }

  /**
   * Get current window dimensions
   */
  getWindowDimensions(): { h: number; w: number } {
    return {
      h: window.innerHeight,
      w: window.innerWidth
    };
  }
}