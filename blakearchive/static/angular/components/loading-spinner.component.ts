import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-container" [ngClass]="containerClass" *ngIf="visible">
      <div class="loading-content">
        <div class="spinner-wrapper">
          <div class="spinner" [ngClass]="spinnerClass">
            <div class="spinner-inner" *ngIf="type === 'dots'">
              <div class="dot1"></div>
              <div class="dot2"></div>
              <div class="dot3"></div>
            </div>
            <div class="spinner-border" *ngIf="type === 'border'" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <div class="spinner-grow" *ngIf="type === 'grow'" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
        
        <div class="loading-text" *ngIf="showText">
          <p class="mb-0" [ngClass]="textClass">{{ text }}</p>
          <small class="text-muted" *ngIf="subText">{{ subText }}</small>
        </div>
        
        <div class="loading-progress" *ngIf="showProgress && progress >= 0">
          <div class="progress">
            <div 
              class="progress-bar" 
              [ngClass]="progressClass"
              [style.width.%]="progress"
              role="progressbar" 
              [attr.aria-valuenow]="progress" 
              aria-valuemin="0" 
              aria-valuemax="100">
            </div>
          </div>
          <small class="text-muted mt-1">{{ progress }}% complete</small>
        </div>
      </div>
      
      <div class="loading-overlay" *ngIf="overlay" [ngClass]="overlayClass"></div>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    
    .loading-container.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9998;
    }
    
    .loading-container.inline {
      padding: 2rem;
      min-height: 200px;
    }
    
    .loading-container.compact {
      padding: 1rem;
      min-height: 100px;
    }
    
    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      z-index: 9999;
      position: relative;
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .loading-container.inline .loading-content,
    .loading-container.compact .loading-content {
      background: transparent;
      box-shadow: none;
      padding: 1rem;
    }
    
    .spinner-wrapper {
      margin-bottom: 1rem;
    }
    
    .loading-container.compact .spinner-wrapper {
      margin-bottom: 0.5rem;
    }
    
    /* Dots Spinner */
    .spinner.dots {
      display: inline-block;
      position: relative;
      width: 64px;
      height: 64px;
    }
    
    .spinner-inner .dot1,
    .spinner-inner .dot2,
    .spinner-inner .dot3 {
      position: absolute;
      top: 50%;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #007bff;
      animation-timing-function: cubic-bezier(0, 1, 1, 0);
    }
    
    .spinner-inner .dot1 {
      left: 6px;
      animation: dots1 0.6s infinite;
    }
    
    .spinner-inner .dot2 {
      left: 6px;
      animation: dots2 0.6s infinite;
    }
    
    .spinner-inner .dot3 {
      left: 26px;
      animation: dots2 0.6s infinite;
    }
    
    @keyframes dots1 {
      0% { transform: scale(0); }
      100% { transform: scale(1); }
    }
    
    @keyframes dots3 {
      0% { transform: scale(1); }
      100% { transform: scale(0); }
    }
    
    @keyframes dots2 {
      0% { transform: translate(0, 0); }
      100% { transform: translate(19px, 0); }
    }
    
    /* Border Spinner */
    .spinner-border {
      width: 3rem;
      height: 3rem;
      color: #007bff;
    }
    
    .spinner.small .spinner-border {
      width: 2rem;
      height: 2rem;
    }
    
    .spinner.large .spinner-border {
      width: 4rem;
      height: 4rem;
    }
    
    /* Grow Spinner */
    .spinner-grow {
      width: 3rem;
      height: 3rem;
      color: #007bff;
    }
    
    .spinner.small .spinner-grow {
      width: 2rem;
      height: 2rem;
    }
    
    .spinner.large .spinner-grow {
      width: 4rem;
      height: 4rem;
    }
    
    /* Color variants */
    .spinner.primary { color: #007bff; }
    .spinner.primary .dot1,
    .spinner.primary .dot2,
    .spinner.primary .dot3 { background: #007bff; }
    
    .spinner.secondary { color: #6c757d; }
    .spinner.secondary .dot1,
    .spinner.secondary .dot2,
    .spinner.secondary .dot3 { background: #6c757d; }
    
    .spinner.success { color: #28a745; }
    .spinner.success .dot1,
    .spinner.success .dot2,
    .spinner.success .dot3 { background: #28a745; }
    
    .loading-text {
      margin-top: 1rem;
    }
    
    .loading-container.compact .loading-text {
      margin-top: 0.5rem;
    }
    
    .loading-progress {
      margin-top: 1rem;
      width: 100%;
      max-width: 300px;
    }
    
    .progress {
      height: 8px;
      background-color: #e9ecef;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .progress-bar {
      height: 100%;
      background-color: #007bff;
      transition: width 0.3s ease;
    }
    
    .progress-bar.success { background-color: #28a745; }
    .progress-bar.warning { background-color: #ffc107; }
    .progress-bar.danger { background-color: #dc3545; }
    
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(2px);
      z-index: 9997;
    }
    
    .loading-overlay.dark {
      background-color: rgba(0, 0, 0, 0.5);
    }
    
    .loading-overlay.light {
      background-color: rgba(255, 255, 255, 0.9);
    }
    
    /* Responsive adjustments */
    @media (max-width: 576px) {
      .loading-content {
        padding: 1.5rem 1rem;
      }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() visible = true;
  @Input() type: 'dots' | 'border' | 'grow' = 'border';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() color: 'primary' | 'secondary' | 'success' = 'primary';
  @Input() text = 'Loading...';
  @Input() subText = '';
  @Input() showText = true;
  @Input() layout: 'fullscreen' | 'inline' | 'compact' = 'inline';
  @Input() overlay = false;
  @Input() overlayStyle: 'light' | 'dark' = 'light';
  @Input() showProgress = false;
  @Input() progress = -1;
  @Input() progressColor: 'primary' | 'success' | 'warning' | 'danger' = 'primary';

  get containerClass(): string {
    return this.layout;
  }

  get spinnerClass(): string {
    const classes: string[] = [this.type];
    if (this.size !== 'medium') {
      classes.push(this.size);
    }
    classes.push(this.color);
    return classes.join(' ');
  }

  get textClass(): string {
    return `text-${this.color}`;
  }

  get overlayClass(): string {
    return this.overlayStyle;
  }

  get progressClass(): string {
    return this.progressColor;
  }
}