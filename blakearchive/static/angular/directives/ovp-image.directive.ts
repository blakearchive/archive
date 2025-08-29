import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Directive({
  selector: '[appOvpImage]',
  standalone: true
})
export class OvpImageDirective implements OnInit, OnDestroy {
  @Input() descId: string = '';

  private destroy$ = new Subject<void>();
  private height = 0;
  private width = 0;
  private parentHeight = 0;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.setupImageLoadListener();
    this.watchImageTransformation();
    this.setupResizeListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupImageLoadListener(): void {
    const element = this.elementRef.nativeElement;
    const image = element.children[0] as HTMLImageElement;
    
    if (image) {
      fromEvent(image, 'load')
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.handleImageLoad(image, element);
        });
    }
  }

  private handleImageLoad(image: HTMLImageElement, element: HTMLElement): void {
    this.height = image.naturalHeight;
    this.width = image.naturalWidth;
    
    const container = element.parentElement;
    if (container) {
      this.parentHeight = container.clientHeight;
    }

    console.log('Image dimensions:', this.width, this.height);

    this.applyImageSizing(image, element);
  }

  private applyImageSizing(image: HTMLImageElement, element: HTMLElement): void {
    const currentDescId = this.descId || this.getCurrentDescId();
    const specialDescIds = [
      'but343.1.pt.08',
      'but343.1.pt.10', 
      'but343.1.pt.13',
      'but343.1.pt.15',
      'but343.1.pt.16'
    ];

    if (this.width > (2 * this.height) || specialDescIds.includes(currentDescId)) {
      // Very wide images or special cases
      this.renderer.setStyle(image, 'height', 'auto');
      this.renderer.setStyle(image, 'width', '100%');
      this.renderer.setStyle(image, 'margin-top', '0');
      
      this.renderer.setStyle(element, 'display', 'flex');
      this.renderer.setStyle(element, 'justify-content', 'center');
      this.renderer.setStyle(element, 'align-items', 'center');
    } else if (this.width > this.height) {
      // Landscape images
      const newHeight = Math.round((this.height * this.parentHeight) / this.width);
      const margin = Math.round((this.parentHeight - newHeight) / 2);
      
      this.renderer.setStyle(image, 'height', 'auto');
      this.renderer.setStyle(image, 'width', `${this.parentHeight}px`);
      this.renderer.setStyle(image, 'margin-top', `${margin}px`);
    } else {
      // Portrait images
      this.renderer.setStyle(image, 'height', '100%');
      this.renderer.setStyle(image, 'width', 'auto');
      this.renderer.setStyle(image, 'margin-top', '0');
    }
  }

  private watchImageTransformation(): void {
    // Watch for image transformation changes from global imageManipulation service
    const checkTransformations = () => {
      const imageManipulation = (window as any).imageManipulation;
      if (imageManipulation?.transform) {
        this.transformRotate();
        this.setStyles();
      }
    };

    // Set up periodic checking for transformation changes
    const interval = setInterval(checkTransformations, 100);
    
    // Clean up interval on destroy
    this.destroy$.subscribe(() => {
      clearInterval(interval);
    });
  }

  private setupResizeListener(): void {
    fromEvent(window, 'resize')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.transformRotate();
        this.setStyles();
      });

    // Also listen for custom resize events
    fromEvent(window, 'resize::resize')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.transformRotate();
        this.setStyles();
      });
  }

  private transformRotate(): void {
    const imageManipulation = (window as any).imageManipulation;
    const element = this.elementRef.nativeElement;
    
    if (imageManipulation?.transform?.rotate === 0) {
      this.renderer.removeClass(element, 'rotated');
    } else {
      this.renderer.addClass(element, 'rotated');
    }
  }

  private setStyles(): void {
    const imageManipulation = (window as any).imageManipulation;
    if (!imageManipulation?.transform) return;

    const element = this.elementRef.nativeElement;
    const transformString = `rotate(${imageManipulation.transform.rotate || 0}deg)`;
    
    // Apply all vendor prefixes
    const transformStyles = {
      '-webkit-transform': transformString,
      '-moz-transform': transformString,
      '-o-transform': transformString,
      '-ms-transform': transformString,
      'transform': transformString
    };

    // Update the global transformation style object
    Object.assign(imageManipulation.transform.style, transformStyles);

    // Apply styles to element
    Object.entries(transformStyles).forEach(([property, value]) => {
      this.renderer.setStyle(element, property, value);
    });
  }

  private getCurrentDescId(): string {
    return this.route.snapshot.paramMap.get('descId') || '';
  }

  public refreshImageSizing(): void {
    const element = this.elementRef.nativeElement;
    const image = element.children[0] as HTMLImageElement;
    
    if (image && image.complete) {
      this.handleImageLoad(image, element);
    }
  }
}