import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

@Component({
  selector: 'app-loading-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-container" *ngIf="isLoading$ | async">
      <div class="loading-spinner" [class]="spinnerClass">
        <div class="spinner-border" role="status">
          <span class="sr-only">{{ loadingText }}</span>
        </div>
      </div>
      <div class="loading-text" *ngIf="showText && loadingText">
        {{ loadingText }}
      </div>
    </div>
    
    <div class="error-container" *ngIf="error$ | async as error">
      <div class="alert alert-danger" role="alert">
        <strong>Error:</strong> {{ error }}
        <button type="button" class="btn btn-sm btn-outline-danger ml-2" 
                (click)="clearError()" 
                *ngIf="allowClearError">
          Dismiss
        </button>
      </div>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      min-height: 60px;
    }
    
    .loading-spinner {
      margin-bottom: 10px;
    }
    
    .loading-spinner.small .spinner-border {
      width: 1rem;
      height: 1rem;
      border-width: 0.1em;
    }
    
    .loading-spinner.large .spinner-border {
      width: 3rem;
      height: 3rem;
      border-width: 0.3em;
    }
    
    .loading-text {
      color: #6c757d;
      font-size: 0.9em;
      text-align: center;
    }
    
    .error-container {
      margin: 10px 0;
    }
    
    .spinner-border {
      color: #007bff;
    }
    
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.8);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .inline {
      display: inline-block;
      vertical-align: middle;
    }
  `]
})
export class LoadingIndicatorComponent implements OnInit {
  @Input() operation!: string;
  @Input() loadingText = 'Loading...';
  @Input() showText = true;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() type: 'inline' | 'overlay' | 'block' = 'block';
  @Input() allowClearError = true;

  isLoading$!: Observable<boolean>;
  error$!: Observable<string | null>;

  constructor(private loadingService: LoadingService) {}

  ngOnInit(): void {
    if (!this.operation) {
      throw new Error('LoadingIndicatorComponent requires an operation input');
    }

    this.isLoading$ = this.loadingService.loading$.pipe(
      map(loadingState => loadingState[this.operation] || false)
    );

    this.error$ = this.loadingService.errors$.pipe(
      map(errorState => errorState[this.operation] || null)
    );
  }

  get spinnerClass(): string {
    let classes = [];
    
    switch (this.size) {
      case 'small':
        classes.push('small');
        break;
      case 'large':
        classes.push('large');
        break;
      default:
        // medium is default, no additional class needed
        break;
    }
    
    switch (this.type) {
      case 'overlay':
        classes.push('overlay');
        break;
      case 'inline':
        classes.push('inline');
        break;
      default:
        // block is default
        break;
    }
    
    return classes.join(' ');
  }

  clearError(): void {
    this.loadingService.clearError(this.operation);
  }
}