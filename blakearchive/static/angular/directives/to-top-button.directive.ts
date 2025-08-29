import { Directive, ElementRef, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil, throttleTime } from 'rxjs/operators';

@Directive({
  selector: '[appToTopButton]',
  standalone: true
})
export class ToTopButtonDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.setupScrollListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupScrollListener(): void {
    fromEvent(window, 'scroll')
      .pipe(
        throttleTime(16), // ~60fps throttling for smooth performance
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.handleScroll();
      });
  }

  private handleScroll(): void {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollY > 50) {
      this.renderer.addClass(this.elementRef.nativeElement, 'scrolling');
    } else {
      this.renderer.removeClass(this.elementRef.nativeElement, 'scrolling');
    }
  }

  public isScrolling(): boolean {
    return this.elementRef.nativeElement.classList.contains('scrolling');
  }

  public getCurrentScrollPosition(): number {
    return window.pageYOffset || document.documentElement.scrollTop;
  }
}