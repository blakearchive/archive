import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ImageTransform {
  rotate: number;
  scale: number;
  style: { [key: string]: any };
  orientation: number;
}

@Injectable({
  providedIn: 'root'
})
export class ImageManipulationService {
  private transformSubject = new BehaviorSubject<ImageTransform>({
    rotate: 0,
    scale: 1,
    style: {},
    orientation: 1
  });

  // Observable for components to subscribe to transform changes
  transform$: Observable<ImageTransform> = this.transformSubject.asObservable();

  /**
   * Get current transform state
   */
  get transform(): ImageTransform {
    return this.transformSubject.value;
  }

  /**
   * Rotate image by 90 degrees clockwise
   */
  rotate(): void {
    const currentTransform = this.transform;
    const newTransform: ImageTransform = {
      ...currentTransform,
      rotate: currentTransform.rotate + 90,
      orientation: currentTransform.orientation + 1 > 4 ? 1 : currentTransform.orientation + 1
    };

    this.transformSubject.next(newTransform);
  }

  /**
   * Set custom rotation angle
   * @param angle - Rotation angle in degrees
   */
  setRotation(angle: number): void {
    const currentTransform = this.transform;
    this.transformSubject.next({
      ...currentTransform,
      rotate: angle
    });
  }

  /**
   * Set scale factor
   * @param scale - Scale factor (1 = 100%, 2 = 200%, etc.)
   */
  setScale(scale: number): void {
    const currentTransform = this.transform;
    this.transformSubject.next({
      ...currentTransform,
      scale
    });
  }

  /**
   * Set custom styles
   * @param style - CSS style object
   */
  setStyle(style: { [key: string]: any }): void {
    const currentTransform = this.transform;
    this.transformSubject.next({
      ...currentTransform,
      style: { ...currentTransform.style, ...style }
    });
  }

  /**
   * Reset all transformations to default
   */
  reset(): void {
    this.transformSubject.next({
      rotate: 0,
      scale: 1,
      style: {},
      orientation: 1
    });
  }

  /**
   * Get CSS transform string for applying to elements
   */
  getCSSTransform(): string {
    const { rotate, scale } = this.transform;
    return `rotate(${rotate}deg) scale(${scale})`;
  }
}