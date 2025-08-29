import { Directive, ElementRef, OnInit, OnDestroy, Renderer2, Inject } from '@angular/core';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';

@Directive({
  selector: '[appMagnifyImage]',
  standalone: true
})
export class MagnifyImageDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private nativeWidth = 0;
  private nativeHeight = 0;
  private mouse = { x: 0, y: 0 };
  private glassElement?: HTMLElement;
  private currentImg?: HTMLElement;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.createMagnifyingGlass();
    this.setupMouseMoveListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.removeMagnifyingGlass();
  }

  private createMagnifyingGlass(): void {
    if (this.elementRef.nativeElement) {
      this.glassElement = this.renderer.createElement('div');
      this.renderer.addClass(this.glassElement, 'glass');
      this.renderer.appendChild(this.document.body, this.glassElement);
    }
  }

  private removeMagnifyingGlass(): void {
    if (this.glassElement && this.glassElement.parentNode) {
      this.renderer.removeChild(this.document.body, this.glassElement);
    }
  }

  private setupMouseMoveListener(): void {
    fromEvent(this.elementRef.nativeElement, 'mousemove')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: Event) => {
        const mouseEvent = event as MouseEvent;
        if (this.isZoomEnabled()) {
          this.handleMouseMove(mouseEvent);
        }
      });

    if (this.glassElement) {
      fromEvent(this.glassElement, 'mouseout')
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.hideGlass();
        });
    }
  }

  private handleMouseMove(event: MouseEvent): void {
    this.currentImg = this.elementRef.nativeElement;

    if (!this.currentImg) return;

    const src = this.currentImg.getAttribute('src');
    if (!src) return;

    const highResSrc = src.replace('100', '300');

    if (this.glassElement) {
      this.renderer.setStyle(this.glassElement, 'background-image', `url(${highResSrc})`);
      this.renderer.setStyle(this.glassElement, 'background-repeat', 'no-repeat');
    }

    if (!this.getNativeWidth()) {
      this.loadImageDimensions(highResSrc, event);
      return;
    } else {
      this.nativeWidth = this.getNativeWidth();
      this.nativeHeight = this.getNativeHeight();
    }

    this.showGlass();
    this.updateGlassPosition(event);
  }

  private loadImageDimensions(src: string, event: MouseEvent): void {
    const imageObject = new Image();
    
    imageObject.onload = () => {
      this.nativeWidth = imageObject.width;
      this.nativeHeight = imageObject.height;
      
      this.setNativeWidth(this.nativeWidth);
      this.setNativeHeight(this.nativeHeight);
      
      this.showGlass();
      this.updateGlassPosition(event);
      
      if (this.glassElement) {
        fromEvent(this.glassElement, 'mousemove')
          .pipe(takeUntil(this.destroy$))
          .subscribe((moveEvent: Event) => {
            this.updateGlassPosition(moveEvent as MouseEvent);
          });
      }
    };
    
    imageObject.src = src;
  }

  private updateGlassPosition(event: MouseEvent): void {
    if (!this.currentImg || !this.glassElement) return;

    const imgRect = this.currentImg.getBoundingClientRect();
    const imgStyles = getComputedStyle(this.currentImg);
    const imgWidth = parseInt(imgStyles.width);
    const imgHeight = parseInt(imgStyles.height);

    let checkWidth = imgWidth;
    let checkHeight = imgHeight;

    const transform = this.getImageTransformation();
    if ((transform.rotate % 180) !== 0) {
      checkHeight = imgWidth;
      checkWidth = imgHeight;
    }

    this.mouse.x = event.pageX - imgRect.left - window.scrollX;
    this.mouse.y = event.pageY - imgRect.top - window.scrollY;

    if (this.mouse.x < checkWidth && this.mouse.y < checkHeight && this.mouse.x > 0 && this.mouse.y > 0) {
      this.magnify(event);
    } else {
      this.hideGlass();
    }
  }

  private magnify(event: MouseEvent): void {
    if (!this.currentImg || !this.glassElement) return;

    let rx: number, ry: number;
    const transform = this.getImageTransformation();
    const imgStyles = getComputedStyle(this.currentImg);
    const imgWidth = parseInt(imgStyles.width);
    const imgHeight = parseInt(imgStyles.height);
    const glassRect = this.glassElement.getBoundingClientRect();

    switch (transform.orientation) {
      case 4:
        const newY4 = imgWidth - this.mouse.y;
        rx = Math.round(newY4 / imgWidth * this.nativeWidth - glassRect.width / 2) * -1;
        ry = Math.round(this.mouse.x / imgHeight * this.nativeHeight - glassRect.height / 2) * -1;
        break;
      case 3:
        const newY3 = imgHeight - this.mouse.y;
        const newX3 = imgWidth - this.mouse.x;
        rx = Math.round(newX3 / imgWidth * this.nativeWidth - glassRect.width / 2) * -1;
        ry = Math.round(newY3 / imgHeight * this.nativeHeight - glassRect.height / 2) * -1;
        break;
      case 2:
        const newX2 = imgHeight - this.mouse.x;
        rx = Math.round(this.mouse.y / imgWidth * this.nativeWidth - glassRect.width / 2) * -1;
        ry = Math.round(newX2 / imgHeight * this.nativeHeight - glassRect.height / 2) * -1;
        break;
      default: // orientation 1
        rx = Math.round(this.mouse.x / imgWidth * this.nativeWidth - glassRect.width / 2) * -1;
        ry = Math.round(this.mouse.y / imgHeight * this.nativeHeight - glassRect.height / 2) * -1;
        break;
    }

    const bgPos = `${rx}px ${ry}px`;
    const glassLeft = event.pageX - glassRect.width / 2;
    const glassTop = event.pageY - glassRect.height / 2;

    this.renderer.setStyle(this.glassElement, 'left', `${glassLeft}px`);
    this.renderer.setStyle(this.glassElement, 'top', `${glassTop}px`);
    this.renderer.setStyle(this.glassElement, 'background-position', bgPos);
  }

  private showGlass(): void {
    if (this.glassElement) {
      this.renderer.addClass(this.glassElement, 'glass-on');
    }
  }

  private hideGlass(): void {
    if (this.glassElement) {
      this.renderer.removeClass(this.glassElement, 'glass-on');
    }
  }

  private isZoomEnabled(): boolean {
    return (window as any).$rootScope?.zoom || false;
  }

  private getImageTransformation(): { orientation: number, rotate: number } {
    const imageManipulation = (window as any).imageManipulation;
    return {
      orientation: imageManipulation?.transform?.orientation || 1,
      rotate: imageManipulation?.transform?.rotate || 0
    };
  }

  private getNativeWidth(): number {
    return this.currentImg ? 
      parseInt(this.currentImg.getAttribute('data-native-width') || '0') : 0;
  }

  private getNativeHeight(): number {
    return this.currentImg ? 
      parseInt(this.currentImg.getAttribute('data-native-height') || '0') : 0;
  }

  private setNativeWidth(width: number): void {
    if (this.currentImg) {
      this.renderer.setAttribute(this.currentImg, 'data-native-width', width.toString());
    }
  }

  private setNativeHeight(height: number): void {
    if (this.currentImg) {
      this.renderer.setAttribute(this.currentImg, 'data-native-height', height.toString());
    }
  }

  public resetImageData(): void {
    if (this.currentImg) {
      this.renderer.removeAttribute(this.currentImg, 'data-native-width');
      this.renderer.removeAttribute(this.currentImg, 'data-native-height');
    }
  }
}