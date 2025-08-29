import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { WindowSizeService } from '../services/window-size.service';

@Directive({
  selector: '[appAutoHeight]',
  standalone: true
})
export class AutoHeightDirective implements OnInit, OnDestroy {
  @Input() adjust: string = '0';
  @Input() breakpoint: string = '768';
  @Input() divide: string = '1';

  private destroy$ = new Subject<void>();

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private windowSizeService: WindowSizeService
  ) {}

  ngOnInit(): void {
    // Set initial height
    this.setHeight();

    // Listen for window resize events
    fromEvent(window, 'resize')
      .pipe(
        debounceTime(100),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.setHeight();
      });

    // Listen for AngularJS resize events for compatibility
    this.listenForAngularJSEvents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Set element height based on window size and configuration
   */
  private setHeight(): void {
    const windowSize = this.windowSizeService.windowSize;
    const adjustValue = parseInt(this.adjust) || 0;
    const breakpointValue = parseInt(this.breakpoint) || 768;
    const divideValue = parseInt(this.divide) || 1;

    if (windowSize.width < breakpointValue) {
      // Below breakpoint - set to auto height
      this.renderer.setStyle(this.elementRef.nativeElement, 'height', 'auto');
    } else if (
      windowSize.height === screen.height && 
      this.elementRef.nativeElement.id === 'previewwindow'
    ) {
      // Special case for preview window in fullscreen
      this.renderer.setStyle(this.elementRef.nativeElement, 'height', '93.4%');
    } else {
      // Calculate height based on window size
      let newHeight = windowSize.height - adjustValue;
      
      if (divideValue > 1) {
        newHeight = newHeight / divideValue;
      }
      
      this.renderer.setStyle(
        this.elementRef.nativeElement, 
        'height', 
        `${Math.max(newHeight, 0)}px`
      );
    }
  }

  /**
   * Listen for AngularJS resize events for hybrid compatibility
   */
  private listenForAngularJSEvents(): void {
    // Listen for custom window resize events
    fromEvent(window, 'window:resize')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: any) => {
        if (event.detail) {
          this.setHeight();
        }
      });

    // Listen for AngularJS broadcast events if available
    const $rootScope = (window as any).$rootScope;
    if ($rootScope) {
      const unsubscribe = $rootScope.$on('resize::resize', () => {
        this.setHeight();
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
   * Get current calculated height
   */
  getCurrentHeight(): number {
    return this.elementRef.nativeElement.offsetHeight;
  }

  /**
   * Manually trigger height recalculation
   */
  recalculateHeight(): void {
    this.setHeight();
  }

  /**
   * Get configuration values
   */
  getConfig(): { adjust: number; breakpoint: number; divide: number } {
    return {
      adjust: parseInt(this.adjust) || 0,
      breakpoint: parseInt(this.breakpoint) || 768,
      divide: parseInt(this.divide) || 1
    };
  }
}