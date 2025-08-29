import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ErrorHandlerService } from '../services/error-handler.service';

@Component({
  selector: 'app-error-boundary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-boundary" *ngIf="hasError; else content">
      <div class="error-boundary-container">
        <div class="error-icon mb-3">
          <i class="fas fa-exclamation-triangle text-warning fa-3x"></i>
        </div>
        
        <h4 class="error-title">{{ errorTitle }}</h4>
        <p class="error-message mb-4">{{ errorMessage }}</p>
        
        <div class="error-actions">
          <button 
            class="btn btn-primary me-2" 
            (click)="retry()"
            *ngIf="showRetry">
            <i class="fas fa-redo-alt me-2"></i>Try Again
          </button>
          
          <button 
            class="btn btn-secondary me-2" 
            (click)="reload()"
            *ngIf="showReload">
            <i class="fas fa-sync-alt me-2"></i>Reload Page
          </button>
          
          <button 
            class="btn btn-outline-info" 
            (click)="toggleDetails()"
            *ngIf="errorDetails">
            <i class="fas" [ngClass]="showDetails ? 'fa-eye-slash' : 'fa-eye'" class="me-2"></i>
            {{ showDetails ? 'Hide' : 'Show' }} Details
          </button>
        </div>
        
        <div class="error-details mt-4" *ngIf="showDetails && errorDetails">
          <div class="card">
            <div class="card-header">
              <h6 class="card-title mb-0">Error Details</h6>
            </div>
            <div class="card-body">
              <pre class="error-stack">{{ errorDetails }}</pre>
            </div>
          </div>
        </div>
        
        <div class="error-help mt-4">
          <small class="text-muted">
            <i class="fas fa-info-circle me-1"></i>
            If this problem persists, please 
            <a href="mailto:support@blakearchive.org" class="text-decoration-none">
              contact support
            </a>
            or try refreshing the page.
          </small>
        </div>
      </div>
    </div>
    
    <ng-template #content>
      <ng-content></ng-content>
    </ng-template>
  `,
  styles: [`
    .error-boundary {
      min-height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    
    .error-boundary-container {
      text-align: center;
      max-width: 600px;
    }
    
    .error-icon {
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    
    .error-title {
      color: #dc3545;
      font-weight: 600;
      margin-bottom: 1rem;
    }
    
    .error-message {
      color: #6c757d;
      font-size: 1.1rem;
      line-height: 1.5;
    }
    
    .error-stack {
      font-size: 0.875rem;
      line-height: 1.4;
      max-height: 300px;
      overflow-y: auto;
      background-color: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 0.375rem;
      padding: 1rem;
      text-align: left;
      white-space: pre-wrap;
      word-break: break-word;
    }
    
    .error-actions .btn {
      margin-bottom: 0.5rem;
    }
    
    .error-help {
      border-top: 1px solid #e9ecef;
      padding-top: 1rem;
    }
    
    .card {
      border: 1px solid #dee2e6;
      border-radius: 0.5rem;
    }
    
    .card-header {
      background-color: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
      padding: 0.75rem 1rem;
    }
    
    .card-body {
      padding: 1rem;
    }
    
    @media (max-width: 576px) {
      .error-boundary {
        padding: 1rem;
      }
      
      .error-actions .btn {
        display: block;
        width: 100%;
        margin-bottom: 0.5rem;
      }
    }
  `]
})
export class ErrorBoundaryComponent implements OnInit, OnDestroy {
  @Input() errorTitle = 'Something went wrong';
  @Input() errorMessage = 'An unexpected error occurred while loading this content.';
  @Input() showRetry = true;
  @Input() showReload = true;
  @Input() retryDelay = 1000;
  @Output() onRetry = new EventEmitter<void>();
  @Output() onReload = new EventEmitter<void>();

  hasError = false;
  showDetails = false;
  errorDetails: string | null = null;
  private destroy$ = new Subject<void>();
  private retryCount = 0;
  private maxRetries = 3;

  constructor(private errorHandler: ErrorHandlerService) {}

  ngOnInit(): void {
    // Listen for component-level errors
    window.addEventListener('error', this.handleError.bind(this));
    window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('error', this.handleError.bind(this));
    window.removeEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
  }

  private handleError(event: ErrorEvent): void {
    this.setError(event.error || new Error(event.message));
  }

  private handlePromiseRejection(event: PromiseRejectionEvent): void {
    this.setError(event.reason || new Error('Unhandled promise rejection'));
  }

  setError(error: Error | any): void {
    this.hasError = true;
    this.errorDetails = this.formatErrorDetails(error);
    
    // Report to error handler service
    this.errorHandler.handleAppError(
      'client',
      this.errorTitle,
      error.message || this.errorMessage,
      'high'
    );
  }

  retry(): void {
    if (this.retryCount >= this.maxRetries) {
      this.errorHandler.handleAppError(
        'client',
        'Max Retries Exceeded',
        `Failed after ${this.maxRetries} retry attempts. Please reload the page.`,
        'high'
      );
      return;
    }

    this.retryCount++;
    this.hasError = false;
    this.errorDetails = null;

    setTimeout(() => {
      this.onRetry.emit();
    }, this.retryDelay);
  }

  reload(): void {
    this.onReload.emit();
    window.location.reload();
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  resetError(): void {
    this.hasError = false;
    this.errorDetails = null;
    this.retryCount = 0;
    this.showDetails = false;
  }

  private formatErrorDetails(error: any): string {
    if (error instanceof Error) {
      let details = `Error: ${error.name}\nMessage: ${error.message}`;
      
      if (error.stack) {
        details += `\n\nStack Trace:\n${error.stack}`;
      }
      
      return details;
    } else if (typeof error === 'string') {
      return `Error: ${error}`;
    } else {
      try {
        return `Error Details:\n${JSON.stringify(error, null, 2)}`;
      } catch {
        return `Error: ${String(error)}`;
      }
    }
  }
}

// Higher Order Component wrapper for error boundary functionality
export function withErrorBoundary<T>(component: T): T {
  return component;
}