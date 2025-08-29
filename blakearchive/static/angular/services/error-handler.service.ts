import { Injectable, ErrorHandler } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

export interface AppError {
  id: string;
  type: 'network' | 'validation' | 'permission' | 'notfound' | 'server' | 'client' | 'unknown';
  title: string;
  message: string;
  details?: string;
  timestamp: Date;
  url?: string;
  userId?: string;
  stackTrace?: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  actions?: ErrorAction[];
}

export interface ErrorAction {
  label: string;
  action: () => void;
  style: 'primary' | 'secondary' | 'danger';
}

export interface ErrorSummary {
  total: number;
  byType: { [key: string]: number };
  bySeverity: { [key: string]: number };
  recentErrors: AppError[];
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService implements ErrorHandler {
  private errorsSubject = new BehaviorSubject<AppError[]>([]);
  private currentErrorSubject = new BehaviorSubject<AppError | null>(null);
  
  public errors$ = this.errorsSubject.asObservable();
  public currentError$ = this.currentErrorSubject.asObservable();
  
  private maxStoredErrors = 100;
  private showErrorToUserFlag = true;

  constructor(private router: Router) {
    this.loadStoredErrors();
  }

  /**
   * Global error handler implementation
   */
  handleError(error: any): void {
    console.error('Global Error Handler:', error);
    
    const appError = this.createAppError(error);
    this.addError(appError);
    
    // Show error to user for critical/high severity errors
    if (appError.severity === 'critical' || appError.severity === 'high') {
      this.showErrorToUserMethod(appError);
    }
    
    // Log to external service in production
    this.logToExternalService(appError);
  }

  /**
   * Handle HTTP errors specifically
   */
  handleHttpError(error: HttpErrorResponse, context?: string): AppError {
    const appError = this.createHttpError(error, context);
    this.addError(appError);
    
    if (appError.severity === 'high' || appError.severity === 'critical') {
      this.showErrorToUserMethod(appError);
    }
    
    return appError;
  }

  /**
   * Handle custom application errors
   */
  handleAppError(
    type: AppError['type'], 
    title: string, 
    message: string, 
    severity: AppError['severity'] = 'medium',
    actions?: ErrorAction[]
  ): AppError {
    const appError: AppError = {
      id: this.generateErrorId(),
      type,
      title,
      message,
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      severity,
      resolved: false,
      actions
    };
    
    this.addError(appError);
    
    if (severity === 'high' || severity === 'critical') {
      this.showErrorToUserMethod(appError);
    }
    
    return appError;
  }

  /**
   * Show error notification to user
   */
  showError(error: AppError): void {
    this.currentErrorSubject.next(error);
  }

  /**
   * Clear current error
   */
  clearCurrentError(): void {
    this.currentErrorSubject.next(null);
  }

  /**
   * Mark error as resolved
   */
  resolveError(errorId: string): void {
    const errors = this.errorsSubject.value;
    const updatedErrors = errors.map(error => 
      error.id === errorId ? { ...error, resolved: true } : error
    );
    this.errorsSubject.next(updatedErrors);
    this.saveErrorsToStorage();
  }

  /**
   * Clear all errors
   */
  clearAllErrors(): void {
    this.errorsSubject.next([]);
    this.currentErrorSubject.next(null);
    localStorage.removeItem('blake-app-errors');
  }

  /**
   * Get error summary statistics
   */
  getErrorSummary(): ErrorSummary {
    const errors = this.errorsSubject.value;
    const recent24h = errors.filter(error => 
      Date.now() - error.timestamp.getTime() < 24 * 60 * 60 * 1000
    );

    return {
      total: errors.length,
      byType: this.groupBy(errors, 'type'),
      bySeverity: this.groupBy(errors, 'severity'),
      recentErrors: recent24h.slice(0, 10)
    };
  }

  /**
   * Export error log for debugging
   */
  exportErrorLog(): string {
    const errors = this.errorsSubject.value;
    const exportData = {
      exportDate: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errors: errors.map(error => ({
        ...error,
        timestamp: error.timestamp.toISOString()
      }))
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Create standardized error actions
   */
  createRetryAction(retryFn: () => void): ErrorAction {
    return {
      label: 'Retry',
      action: retryFn,
      style: 'primary'
    };
  }

  createReloadAction(): ErrorAction {
    return {
      label: 'Reload Page',
      action: () => window.location.reload(),
      style: 'secondary'
    };
  }

  createNavigateAction(route: string, label: string = 'Go Back'): ErrorAction {
    return {
      label,
      action: () => this.router.navigate([route]),
      style: 'secondary'
    };
  }

  private createAppError(error: any): AppError {
    let type: AppError['type'] = 'unknown';
    let title = 'An error occurred';
    let message = 'Something went wrong. Please try again.';
    let severity: AppError['severity'] = 'medium';
    let stackTrace: string | undefined;

    if (error instanceof Error) {
      message = error.message;
      stackTrace = error.stack;
      
      // Categorize common error types
      if (error.name === 'TypeError') {
        type = 'client';
        title = 'Application Error';
      } else if (error.name === 'ReferenceError') {
        type = 'client';
        title = 'Reference Error';
        severity = 'high';
      } else if (error.name === 'RangeError') {
        type = 'validation';
        title = 'Validation Error';
      }
    } else if (typeof error === 'string') {
      message = error;
    }

    return {
      id: this.generateErrorId(),
      type,
      title,
      message,
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      severity,
      resolved: false,
      stackTrace
    };
  }

  private createHttpError(error: HttpErrorResponse, context?: string): AppError {
    let type: AppError['type'];
    let title: string;
    let message: string;
    let severity: AppError['severity'] = 'medium';
    let actions: ErrorAction[] = [];

    switch (error.status) {
      case 0:
        type = 'network';
        title = 'Network Error';
        message = 'Unable to connect to the server. Please check your internet connection.';
        severity = 'high';
        actions = [this.createRetryAction(() => window.location.reload())];
        break;
        
      case 400:
        type = 'validation';
        title = 'Bad Request';
        message = 'The request was invalid. Please check your input and try again.';
        break;
        
      case 401:
        type = 'permission';
        title = 'Authentication Required';
        message = 'You need to log in to access this resource.';
        severity = 'high';
        actions = [this.createNavigateAction('/login', 'Log In')];
        break;
        
      case 403:
        type = 'permission';
        title = 'Access Denied';
        message = 'You don\'t have permission to access this resource.';
        severity = 'high';
        actions = [this.createNavigateAction('/', 'Go Home')];
        break;
        
      case 404:
        type = 'notfound';
        title = 'Not Found';
        message = 'The requested resource could not be found.';
        actions = [this.createNavigateAction('/', 'Go Home')];
        break;
        
      case 500:
      case 502:
      case 503:
      case 504:
        type = 'server';
        title = 'Server Error';
        message = 'The server is currently experiencing problems. Please try again later.';
        severity = 'high';
        actions = [this.createRetryAction(() => window.location.reload())];
        break;
        
      default:
        type = 'network';
        title = `HTTP ${error.status} Error`;
        message = error.error?.message || error.message || 'An unexpected error occurred.';
    }

    // Add context if provided
    if (context) {
      message = `${context}: ${message}`;
    }

    return {
      id: this.generateErrorId(),
      type,
      title,
      message,
      details: error.error ? JSON.stringify(error.error, null, 2) : undefined,
      timestamp: new Date(),
      url: error.url || window.location.href,
      userAgent: navigator.userAgent,
      severity,
      resolved: false,
      actions
    };
  }

  private addError(error: AppError): void {
    const errors = this.errorsSubject.value;
    const updatedErrors = [error, ...errors].slice(0, this.maxStoredErrors);
    this.errorsSubject.next(updatedErrors);
    this.saveErrorsToStorage();
  }

  private showErrorToUserMethod(error: AppError): void {
    if (this.showErrorToUserFlag) {
      this.currentErrorSubject.next(error);
    }
  }

  private generateErrorId(): string {
    return 'error-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
  }

  private groupBy<T>(array: T[], key: keyof T): { [key: string]: number } {
    return array.reduce((groups, item) => {
      const group = String(item[key]);
      groups[group] = (groups[group] || 0) + 1;
      return groups;
    }, {} as { [key: string]: number });
  }

  private saveErrorsToStorage(): void {
    try {
      const errors = this.errorsSubject.value;
      const serialized = errors.map(error => ({
        ...error,
        timestamp: error.timestamp.toISOString()
      }));
      localStorage.setItem('blake-app-errors', JSON.stringify(serialized));
    } catch (e) {
      console.warn('Could not save errors to storage:', e);
    }
  }

  private loadStoredErrors(): void {
    try {
      const stored = localStorage.getItem('blake-app-errors');
      if (stored) {
        const parsed = JSON.parse(stored);
        const errors = parsed.map((error: any) => ({
          ...error,
          timestamp: new Date(error.timestamp)
        }));
        this.errorsSubject.next(errors);
      }
    } catch (e) {
      console.warn('Could not load stored errors:', e);
    }
  }

  private logToExternalService(error: AppError): void {
    // In production, you would send this to an external logging service
    // like Sentry, LogRocket, or a custom endpoint
    if (environment?.production) {
      // Example: Send to logging service
      // this.http.post('/api/log-error', error).subscribe();
    }
  }
}

// Environment check (simplified) - In a real app this would be imported
const environment = { production: false };