import { 
  Directive, 
  ElementRef, 
  Input, 
  OnInit, 
  OnDestroy, 
  Renderer2, 
  HostListener 
} from '@angular/core';
import { Subject } from 'rxjs';

@Directive({
  selector: '[affix]',
  standalone: true
})
export class AffixDirective implements OnInit, OnDestroy {
  @Input() offsetTop: number = 0;
  @Input() offsetStart: number = 0;
  @Input() offsetBottom: number = 0;
  @Input() minWidth: number = 0;

  private destroy$ = new Subject<void>();
  private elementOffsetTop: number = 0;
  private originalWidth: number = 0;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    // Get initial element position
    const element = this.elementRef.nativeElement;
    const rect = element.getBoundingClientRect();
    this.elementOffsetTop = rect.top + window.pageYOffset;
    this.originalWidth = element.clientWidth;

    // Initial affix check
    this.affixElement();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(): void {
    this.affixElement();
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(): void {
    this.resetWidth();
  }

  /**
   * Handle element affixing based on scroll position
   */
  private affixElement(): void {
    const element = this.elementRef.nativeElement;
    const elementHeight = element.offsetHeight;
    const pageHeight = document.body.scrollHeight;
    const doNotPass = pageHeight - this.offsetBottom;
    const currentScrollTop = window.pageYOffset;

    // Check if we should position at bottom
    if (
      this.offsetBottom !== 0 && 
      currentScrollTop + elementHeight >= doNotPass && 
      pageHeight - this.offsetBottom > elementHeight
    ) {
      this.renderer.setStyle(element, 'position', 'absolute');
      this.renderer.removeStyle(element, 'top');
      this.renderer.setStyle(element, 'bottom', '50px');
    } 
    // Check if we should stick to top
    else if (
      currentScrollTop > this.elementOffsetTop + this.offsetStart && 
      pageHeight - this.offsetBottom > elementHeight
    ) {
      this.renderer.setStyle(element, 'position', 'fixed');
      this.renderer.setStyle(element, 'top', `${this.offsetTop}px`);
      this.renderer.removeStyle(element, 'bottom');
      
      // Maintain width when fixed
      if (this.originalWidth > 0) {
        this.renderer.setStyle(element, 'width', `${this.originalWidth}px`);
      }
    } 
    // Default position
    else {
      this.renderer.removeStyle(element, 'position');
      this.renderer.removeStyle(element, 'top');
      this.renderer.removeStyle(element, 'bottom');
      this.renderer.removeStyle(element, 'width');
      
      // Update original width
      this.originalWidth = element.clientWidth;
    }
  }

  /**
   * Reset width and re-calculate positioning on resize
   */
  private resetWidth(): void {
    const element = this.elementRef.nativeElement;
    const currentScrollTop = window.pageYOffset;
    
    if (currentScrollTop > (this.elementOffsetTop + this.offsetStart)) {
      // Temporarily reset to get natural width
      this.renderer.removeStyle(element, 'position');
      this.renderer.removeStyle(element, 'top');
      this.renderer.removeStyle(element, 'bottom');
      this.renderer.removeStyle(element, 'width');
      
      // Update original width
      this.originalWidth = element.clientWidth;
      
      // Re-apply affixing
      this.affixElement();
    }
  }
}