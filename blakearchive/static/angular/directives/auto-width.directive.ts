import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer2, HostListener } from '@angular/core';
import { WindowSizeService } from '../services/window-size.service';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

@Directive({
  selector: '[autoWidth]',
  standalone: true
})
export class AutoWidthDirective implements OnInit, OnDestroy {
  @Input() adjust: number = 0;
  @Input() breakpoint: number = 768;
  @Input() divide: number = 1;
  @Input() percent: number = 1;

  private destroy$ = new Subject<void>();

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private windowSizeService: WindowSizeService
  ) {}

  ngOnInit(): void {
    // Set initial styles
    this.setStyles(this.windowSizeService.windowSize);

    // Listen to window resize events
    fromEvent(window, 'resize')
      .pipe(
        debounceTime(100),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.setStyles(this.windowSizeService.windowSize);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Set element width based on window size and configuration
   * @param windowSize - Current window dimensions
   */
  private setStyles(windowSize: { width: number; height: number }): void {
    const element = this.elementRef.nativeElement;

    if (windowSize.width < this.breakpoint) {
      // Below breakpoint - remove width constraint
      this.renderer.removeStyle(element, 'width');
    } else {
      // Above breakpoint - calculate and set width
      let newWidth = windowSize.width - this.adjust;

      if (this.percent !== 1) {
        newWidth = newWidth * this.percent;
      }

      if (this.divide > 1) {
        newWidth = newWidth / this.divide;
      }

      this.renderer.setStyle(element, 'width', `${Math.floor(newWidth)}px`);
    }
  }
}