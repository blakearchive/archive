import { ErrorHandlerService, AppError } from '../services/error-handler.service';
import { ErrorDisplayComponent } from '../components/error-display.component';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';

describe('Error Handling Workflow Integration', () => {
  let errorHandlerService: ErrorHandlerService;
  let errorDisplayComponent: ErrorDisplayComponent;
  let mockRouter: jest.MockedObjectDeep<Router>;
  let currentError$: Subject<AppError | null>;

  beforeEach(() => {
    currentError$ = new Subject<AppError | null>();

    mockRouter = {
      navigate: jest.fn()
    } as any;

    errorHandlerService = new ErrorHandlerService(mockRouter);
    
    // Override the service's currentError$ with our mock for testing
    (errorHandlerService as any).currentErrorSubject = currentError$;
    (errorHandlerService as any).currentError$ = currentError$.asObservable();
    
    errorDisplayComponent = new ErrorDisplayComponent(errorHandlerService);
  });

  afterEach(() => {
    if (errorDisplayComponent) {
      errorDisplayComponent.ngOnDestroy();
    }
  });

  describe('Complete Error Handling Flow', () => {
    it('should handle error creation, display, and dismissal', () => {
      // Initialize component
      errorDisplayComponent.ngOnInit();

      // Create a mock error and emit it
      const mockError: AppError = {
        id: 'test-error',
        type: 'unknown',
        title: 'Error',
        message: 'Test error message',
        severity: 'medium',
        timestamp: new Date(),
        resolved: false,
        userAgent: 'test-agent'
      };

      currentError$.next(mockError);

      // Verify error was displayed
      expect(errorDisplayComponent.currentError).toBeTruthy();
      expect(errorDisplayComponent.currentError?.message).toBe('Test error message');
      expect(errorDisplayComponent.currentError?.type).toBe('unknown');
      expect(errorDisplayComponent.currentError?.severity).toBe('medium');

      // Dismiss the error
      const resolveErrorSpy = jest.spyOn(errorHandlerService, 'resolveError');
      const clearCurrentErrorSpy = jest.spyOn(errorHandlerService, 'clearCurrentError');
      
      errorDisplayComponent.dismissError();
      
      expect(resolveErrorSpy).toHaveBeenCalledWith('test-error');
      expect(clearCurrentErrorSpy).toHaveBeenCalled();
    });

    it('should handle different error types with appropriate display', () => {
      errorDisplayComponent.ngOnInit();

      // Test client error display
      const clientError: AppError = {
        id: 'client-error',
        type: 'client',
        title: 'Application Error',
        message: 'Type error',
        severity: 'medium',
        timestamp: new Date(),
        resolved: false,
        userAgent: 'test-agent'
      };

      currentError$.next(clientError);
      
      expect(errorDisplayComponent.currentError?.type).toBe('client');
      expect(errorDisplayComponent.currentError?.title).toBe('Application Error');

      // Test unknown error display
      const unknownError: AppError = {
        id: 'unknown-error',
        type: 'unknown',
        title: 'Error',
        message: 'Simple string error',
        severity: 'medium',
        timestamp: new Date(),
        resolved: false,
        userAgent: 'test-agent'
      };

      currentError$.next(unknownError);
      
      expect(errorDisplayComponent.currentError?.message).toBe('Simple string error');
      expect(errorDisplayComponent.currentError?.type).toBe('unknown');
    });

    it('should auto-dismiss low severity errors', (done) => {
      jest.useFakeTimers();
      
      errorDisplayComponent.ngOnInit();
      const dismissSpy = jest.spyOn(errorDisplayComponent, 'dismissError');

      // Create low severity error
      const lowError: AppError = {
        id: 'low-error',
        type: 'client',
        title: 'Low Priority',
        message: 'This is not critical',
        severity: 'low',
        timestamp: new Date(),
        resolved: false,
        userAgent: 'test-agent'
      };
      
      currentError$.next(lowError);
      
      expect(errorDisplayComponent.currentError?.severity).toBe('low');
      
      // Fast-forward time
      jest.advanceTimersByTime(5000);
      
      expect(dismissSpy).toHaveBeenCalled();
      
      jest.useRealTimers();
      done();
    });

    it('should not auto-dismiss high severity errors', (done) => {
      jest.useFakeTimers();
      
      errorDisplayComponent.ngOnInit();
      const dismissSpy = jest.spyOn(errorDisplayComponent, 'dismissError');

      // Create high severity error
      const criticalError: AppError = {
        id: 'critical-error',
        type: 'server',
        title: 'Critical Error',
        message: 'This is critical',
        severity: 'critical',
        timestamp: new Date(),
        resolved: false,
        userAgent: 'test-agent'
      };
      
      currentError$.next(criticalError);
      
      expect(errorDisplayComponent.currentError?.severity).toBe('critical');
      
      // Fast-forward time
      jest.advanceTimersByTime(5000);
      
      expect(dismissSpy).not.toHaveBeenCalled();
      
      jest.useRealTimers();
      done();
    });
  });

  describe('HTTP Error Integration', () => {
    it('should handle 401 authentication errors with navigation action', () => {
      errorDisplayComponent.ngOnInit();

      const httpError = new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized',
        url: '/api/protected'
      });

      const appError = errorHandlerService.handleHttpError(httpError);
      
      expect(appError.type).toBe('permission');
      expect(appError.title).toBe('Authentication Required');
      expect(appError.severity).toBe('high');
      expect(appError.actions).toBeDefined();
      expect(appError.actions![0].label).toBe('Log In');

      // Test action execution
      if (appError.actions && appError.actions[0]) {
        appError.actions[0].action();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
      }
    });

    it('should handle 404 errors with home navigation', () => {
      errorDisplayComponent.ngOnInit();

      const httpError = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        url: '/api/nonexistent'
      });

      const appError = errorHandlerService.handleHttpError(httpError);
      
      expect(appError.type).toBe('notfound');
      expect(appError.title).toBe('Not Found');
      expect(appError.actions![0].label).toBe('Go Home');

      // Test navigation action
      if (appError.actions && appError.actions[0]) {
        appError.actions[0].action();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
      }
    });

    it('should add context to HTTP errors when provided', () => {
      const httpError = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request'
      });

      const appError = errorHandlerService.handleHttpError(httpError, 'User registration failed');
      
      expect(appError.message).toContain('User registration failed:');
      expect(appError.message).toContain('The request was invalid');
    });
  });

  describe('Error Actions Integration', () => {
    it('should create and execute retry actions', () => {
      const retryFunction = jest.fn();
      const retryAction = errorHandlerService.createRetryAction(retryFunction);

      expect(retryAction.label).toBe('Retry');
      expect(retryAction.style).toBe('primary');

      // Execute action via component
      errorDisplayComponent.executeAction(retryAction);
      
      expect(retryFunction).toHaveBeenCalled();
    });

    it('should create and execute navigation actions', () => {
      const navigateAction = errorHandlerService.createNavigateAction('/dashboard', 'Go to Dashboard');

      expect(navigateAction.label).toBe('Go to Dashboard');
      expect(navigateAction.style).toBe('secondary');

      // Execute action via component
      errorDisplayComponent.executeAction(navigateAction);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should handle action execution errors gracefully', () => {
      const failingAction = {
        label: 'Failing Action',
        action: jest.fn(() => { throw new Error('Action failed'); }),
        style: 'primary'
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Should not throw
      expect(() => {
        errorDisplayComponent.executeAction(failingAction);
      }).not.toThrow();

      // Should log error  
      const calls = consoleSpy.mock.calls;
      expect(calls.length).toBeGreaterThanOrEqual(1);
      expect(calls[0][0]).toBe('Error executing action:');
      expect(calls[0][1]).toBeInstanceOf(Error);
      
      consoleSpy.mockRestore();
    });
  });

  describe('Error State Management', () => {
    it('should maintain error history and provide statistics', () => {
      // Clear any existing errors
      errorHandlerService.clearAllErrors();

      // Add various errors
      errorHandlerService.handleAppError('client', 'Error 1', 'Client error', 'high');
      errorHandlerService.handleAppError('network', 'Error 2', 'Network error', 'medium');
      errorHandlerService.handleAppError('validation', 'Error 3', 'Validation error', 'low');

      const summary = errorHandlerService.getErrorSummary();

      expect(summary.total).toBe(3);
      expect(summary.byType.client).toBe(1);
      expect(summary.byType.network).toBe(1);
      expect(summary.byType.validation).toBe(1);
      expect(summary.bySeverity.high).toBe(1);
      expect(summary.bySeverity.medium).toBe(1);
      expect(summary.bySeverity.low).toBe(1);
    });

    it('should export error log with proper format', () => {
      errorHandlerService.clearAllErrors();
      errorHandlerService.handleAppError('client', 'Test Error', 'Test message', 'medium');

      const exportData = errorHandlerService.exportErrorLog();
      const parsed = JSON.parse(exportData);

      expect(parsed.exportDate).toBeDefined();
      expect(parsed.userAgent).toBeDefined();
      expect(parsed.errors).toBeDefined();
      expect(Array.isArray(parsed.errors)).toBe(true);
      expect(parsed.errors.length).toBeGreaterThan(0);

      const error = parsed.errors[0];
      expect(error.type).toBe('client');
      expect(error.title).toBe('Test Error');
      expect(error.message).toBe('Test message');
      expect(error.timestamp).toBeDefined();
    });

    it('should handle multiple errors with proper current error management', () => {
      errorDisplayComponent.ngOnInit();

      // Add first error
      const firstError: AppError = {
        id: 'first-error',
        type: 'client',
        title: 'First Error',
        message: 'First message',
        severity: 'medium',
        timestamp: new Date(),
        resolved: false,
        userAgent: 'test-agent'
      };
      
      currentError$.next(firstError);
      expect(errorDisplayComponent.currentError?.title).toBe('First Error');

      // Add second error (should become current)
      const secondError: AppError = {
        id: 'second-error',
        type: 'network',
        title: 'Second Error',
        message: 'Second message',
        severity: 'high',
        timestamp: new Date(),
        resolved: false,
        userAgent: 'test-agent'
      };
      
      currentError$.next(secondError);
      expect(errorDisplayComponent.currentError?.title).toBe('Second Error');

      // For integration test, we don't test the service's error history
      // That's covered in unit tests
    });
  });

  describe('Component Display Integration', () => {
    it('should update display classes based on error severity', () => {
      expect(errorDisplayComponent.getAlertClass('critical')).toBe('alert-critical');
      expect(errorDisplayComponent.getAlertClass('high')).toBe('alert-high');
      expect(errorDisplayComponent.getAlertClass('medium')).toBe('alert-medium');
      expect(errorDisplayComponent.getAlertClass('low')).toBe('alert-low');
    });

    it('should show appropriate icons for different severities', () => {
      expect(errorDisplayComponent.getIconClass('critical')).toBe('fa-exclamation-triangle text-danger');
      expect(errorDisplayComponent.getIconClass('high')).toBe('fa-exclamation-circle text-warning');
      expect(errorDisplayComponent.getIconClass('medium')).toBe('fa-info-circle text-info');
      expect(errorDisplayComponent.getIconClass('low')).toBe('fa-check-circle text-success');
    });

    it('should handle details toggle functionality', () => {
      expect(errorDisplayComponent.showDetails).toBe(false);
      
      errorDisplayComponent.toggleDetails();
      expect(errorDisplayComponent.showDetails).toBe(true);
      
      errorDisplayComponent.toggleDetails();
      expect(errorDisplayComponent.showDetails).toBe(false);
    });

    it('should format timestamps consistently', () => {
      const testDate = new Date('2023-01-01T15:30:45Z');
      const formatted = errorDisplayComponent.formatTimestamp(testDate);
      
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });
  });
});