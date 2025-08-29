import { ErrorHandlerService } from './error-handler.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

describe('ErrorHandlerService (Simple)', () => {
  let service: ErrorHandlerService;
  let mockRouter: jest.MockedObjectDeep<Router>;

  beforeEach(() => {
    mockRouter = {
      navigate: jest.fn()
    } as any;

    service = new ErrorHandlerService(mockRouter);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Error Creation', () => {
    it('should create app error from Error object', () => {
      const error = new Error('Test error message');
      service.handleError(error);

      service.errors$.subscribe(errors => {
        expect(errors.length).toBe(1);
        expect(errors[0].message).toBe('Test error message');
        expect(errors[0].type).toBe('unknown');
        expect(errors[0].severity).toBe('medium');
        expect(errors[0].resolved).toBe(false);
      });
    });

    it('should create app error from string', () => {
      const errorMessage = 'String error message';
      service.handleError(errorMessage);

      service.errors$.subscribe(errors => {
        expect(errors.length).toBe(1);
        expect(errors[0].message).toBe(errorMessage);
        expect(errors[0].type).toBe('unknown');
      });
    });

    it('should categorize TypeError correctly', () => {
      const typeError = new TypeError('Type error message');
      service.handleError(typeError);

      service.errors$.subscribe(errors => {
        expect(errors[0].type).toBe('client');
        expect(errors[0].title).toBe('Application Error');
      });
    });
  });

  describe('HTTP Error Handling', () => {
    it('should handle 401 authentication error', () => {
      const httpError = new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized',
        url: '/api/protected'
      });

      const appError = service.handleHttpError(httpError);

      expect(appError.type).toBe('permission');
      expect(appError.title).toBe('Authentication Required');
      expect(appError.severity).toBe('high');
      expect(appError.actions).toBeDefined();
      expect(appError.actions![0].label).toBe('Log In');
    });

    it('should handle 404 not found error', () => {
      const httpError = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found'
      });

      const appError = service.handleHttpError(httpError);

      expect(appError.type).toBe('notfound');
      expect(appError.title).toBe('Not Found');
      expect(appError.actions).toBeDefined();
      expect(appError.actions![0].label).toBe('Go Home');
    });

    it('should add context to error message', () => {
      const httpError = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request'
      });

      const appError = service.handleHttpError(httpError, 'User registration');

      expect(appError.message).toContain('User registration:');
    });
  });

  describe('Custom Error Actions', () => {
    it('should create retry action', () => {
      const retryFn = jest.fn();
      const action = service.createRetryAction(retryFn);

      expect(action.label).toBe('Retry');
      expect(action.style).toBe('primary');

      action.action();
      expect(retryFn).toHaveBeenCalled();
    });

    it('should create navigate action', () => {
      const action = service.createNavigateAction('/home', 'Go to Home');

      expect(action.label).toBe('Go to Home');
      expect(action.style).toBe('secondary');

      action.action();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });
  });

  describe('Error Management', () => {
    beforeEach(() => {
      // Add test error
      service.handleAppError('client', 'Test Error', 'Test Message', 'low');
    });

    it('should resolve error by id', () => {
      service.errors$.subscribe(errors => {
        if (errors.length > 0) {
          const errorId = errors[0].id;
          service.resolveError(errorId);

          service.errors$.subscribe(updatedErrors => {
            const resolvedError = updatedErrors.find(e => e.id === errorId);
            expect(resolvedError?.resolved).toBe(true);
          });
        }
      });
    });

    it('should clear all errors', () => {
      service.clearAllErrors();

      service.errors$.subscribe(errors => {
        expect(errors.length).toBe(0);
      });

      service.currentError$.subscribe(currentError => {
        expect(currentError).toBeNull();
      });
    });
  });

  describe('Error Export', () => {
    beforeEach(() => {
      service.clearAllErrors();
      service.handleAppError('client', 'Test Error', 'Test Message', 'medium');
    });

    it('should export error log as JSON', () => {
      const exportData = service.exportErrorLog();
      const parsed = JSON.parse(exportData);

      expect(parsed.exportDate).toBeDefined();
      expect(parsed.userAgent).toBeDefined();
      expect(parsed.errors).toBeDefined();
      expect(Array.isArray(parsed.errors)).toBe(true);
      expect(parsed.errors.length).toBeGreaterThan(0);
    });

    it('should include error details in export', () => {
      const exportData = service.exportErrorLog();
      const parsed = JSON.parse(exportData);

      const error = parsed.errors[0];
      expect(error.type).toBe('client');
      expect(error.title).toBe('Test Error');
      expect(error.message).toBe('Test Message');
      expect(error.timestamp).toBeDefined();
    });
  });

  describe('Error Statistics', () => {
    beforeEach(() => {
      service.clearAllErrors();
      service.handleAppError('client', 'Error 1', 'Message', 'high');
      service.handleAppError('network', 'Error 2', 'Message', 'low');
      service.handleAppError('validation', 'Error 3', 'Message', 'medium');
    });

    it('should get error summary', () => {
      const summary = service.getErrorSummary();

      expect(summary.total).toBe(3);
      expect(summary.byType).toBeDefined();
      expect(summary.bySeverity).toBeDefined();
      expect(summary.recentErrors).toBeDefined();
    });

    it('should group errors by type', () => {
      const summary = service.getErrorSummary();

      expect(summary.byType.client).toBe(1);
      expect(summary.byType.network).toBe(1);
      expect(summary.byType.validation).toBe(1);
    });

    it('should group errors by severity', () => {
      const summary = service.getErrorSummary();

      expect(summary.bySeverity.high).toBe(1);
      expect(summary.bySeverity.low).toBe(1);
      expect(summary.bySeverity.medium).toBe(1);
    });
  });
});