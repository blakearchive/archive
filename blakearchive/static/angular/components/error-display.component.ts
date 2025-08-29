import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ErrorHandlerService, AppError } from '../services/error-handler.service';

@Component({
  selector: 'app-error-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-container" *ngIf="currentError">
      <div class="alert alert-dismissible" [ngClass]="getAlertClass(currentError.severity)" role="alert">
        <div class="d-flex align-items-center mb-2">
          <i class="fas" [ngClass]="getIconClass(currentError.severity)" aria-hidden="true"></i>
          <h5 class="alert-heading mb-0 ms-2">{{ currentError.title }}</h5>
          <button type="button" class="btn-close ms-auto" (click)="dismissError()" aria-label="Close"></button>
        </div>
        
        <p class="mb-2">{{ currentError.message }}</p>
        
        <div class="error-details" *ngIf="currentError.details && showDetails">
          <small class="text-muted">
            <strong>Details:</strong><br>
            <pre class="mt-1">{{ currentError.details }}</pre>
          </small>
        </div>
        
        <div class="error-actions mt-2" *ngIf="currentError.actions && currentError.actions.length > 0">
          <button 
            *ngFor="let action of currentError.actions" 
            type="button" 
            class="btn btn-sm me-2"
            [ngClass]="getActionButtonClass(action.style)"
            (click)="executeAction(action)">
            {{ action.label }}
          </button>
        </div>
        
        <div class="error-meta mt-2" *ngIf="showMeta">
          <small class="text-muted d-flex justify-content-between">
            <span>{{ formatTimestamp(currentError.timestamp) }}</span>
            <span *ngIf="currentError.details" class="cursor-pointer" (click)="toggleDetails()">
              {{ showDetails ? 'Hide Details' : 'Show Details' }}
            </span>
          </small>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .error-container {
      position: fixed;
      top: 20px;
      right: 20px;
      max-width: 400px;
      z-index: 9999;
      animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    .alert {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border: none;
      border-radius: 8px;
    }
    
    .alert-critical {
      background-color: #f8d7da;
      color: #721c24;
      border-left: 4px solid #dc3545;
    }
    
    .alert-high {
      background-color: #fff3cd;
      color: #856404;
      border-left: 4px solid #ffc107;
    }
    
    .alert-medium {
      background-color: #cce5ff;
      color: #004085;
      border-left: 4px solid #007bff;
    }
    
    .alert-low {
      background-color: #d4edda;
      color: #155724;
      border-left: 4px solid #28a745;
    }
    
    .cursor-pointer {
      cursor: pointer;
    }
    
    .cursor-pointer:hover {
      text-decoration: underline;
    }
    
    pre {
      font-size: 0.75rem;
      max-height: 100px;
      overflow-y: auto;
      background: rgba(0, 0, 0, 0.05);
      padding: 8px;
      border-radius: 4px;
      white-space: pre-wrap;
      word-break: break-word;
    }
    
    .error-actions {
      border-top: 1px solid rgba(0, 0, 0, 0.1);
      padding-top: 8px;
    }
  `]
})
export class ErrorDisplayComponent implements OnInit, OnDestroy {
  currentError: AppError | null = null;
  showDetails = false;
  showMeta = true;
  private destroy$ = new Subject<void>();

  constructor(private errorHandler: ErrorHandlerService) {}

  ngOnInit(): void {
    this.errorHandler.currentError$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        this.currentError = error;
        this.showDetails = false;
        
        // Auto-dismiss low severity errors after 5 seconds
        if (error && error.severity === 'low') {
          setTimeout(() => this.dismissError(), 5000);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  dismissError(): void {
    if (this.currentError) {
      this.errorHandler.resolveError(this.currentError.id);
    }
    this.errorHandler.clearCurrentError();
  }

  executeAction(action: any): void {
    try {
      action.action();
      this.dismissError();
    } catch (error) {
      console.error('Error executing action:', error);
    }
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  getAlertClass(severity: string): string {
    return `alert-${severity}`;
  }

  getIconClass(severity: string): string {
    switch (severity) {
      case 'critical':
        return 'fa-exclamation-triangle text-danger';
      case 'high':
        return 'fa-exclamation-circle text-warning';
      case 'medium':
        return 'fa-info-circle text-info';
      case 'low':
      default:
        return 'fa-check-circle text-success';
    }
  }

  getActionButtonClass(style: string): string {
    switch (style) {
      case 'primary':
        return 'btn-primary';
      case 'danger':
        return 'btn-danger';
      case 'secondary':
      default:
        return 'btn-secondary';
    }
  }

  formatTimestamp(timestamp: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(timestamp);
  }
}