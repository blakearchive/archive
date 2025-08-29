import { ErrorDisplayComponent } from './error-display.component';
import { ErrorHandlerService, AppError } from '../services/error-handler.service';
import { Subject } from 'rxjs';

describe('ErrorDisplayComponent (Simple)', () => {
  let component: ErrorDisplayComponent;
  let mockErrorHandler: jest.MockedObjectDeep<ErrorHandlerService>;
  let mockCurrentError$: Subject<AppError | null>;

  beforeEach(() => {
    mockCurrentError$ = new Subject<AppError | null>();
    
    mockErrorHandler = {
      currentError$: mockCurrentError$.asObservable(),
      resolveError: jest.fn(),
      clearCurrentError: jest.fn()
    } as any;

    component = new ErrorDisplayComponent(mockErrorHandler);
  });

  afterEach(() => {
    if (component) {
      component.ngOnDestroy();
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Properties', () => {
    it('should have default properties', () => {
      expect(component.currentError).toBeNull();
      expect(component.showDetails).toBe(false);
      expect(component.showMeta).toBe(true);
    });
  });

  describe('ngOnInit', () => {
    it('should subscribe to current error changes', () => {
      component.ngOnInit();
      
      const mockError: AppError = {
        id: 'test-error',
        type: 'client',
        title: 'Test Error',
        message: 'Test message',
        severity: 'medium',
        timestamp: new Date(),
        resolved: false,
        userAgent: 'test-agent'
      };
      
      mockCurrentError$.next(mockError);
      
      expect(component.currentError).toBe(mockError);
      expect(component.showDetails).toBe(false);
    });

    it('should auto-dismiss low severity errors after 5 seconds', (done) => {
      jest.useFakeTimers();
      const dismissSpy = jest.spyOn(component, 'dismissError');
      
      component.ngOnInit();
      
      const lowSeverityError: AppError = {
        id: 'low-error',
        type: 'client',
        title: 'Low Error',
        message: 'Low severity message',
        severity: 'low',
        timestamp: new Date(),
        resolved: false,
        userAgent: 'test-agent'
      };
      
      mockCurrentError$.next(lowSeverityError);
      
      // Fast-forward 5 seconds
      jest.advanceTimersByTime(5000);
      
      expect(dismissSpy).toHaveBeenCalled();
      
      jest.useRealTimers();
      done();
    });

    it('should not auto-dismiss high severity errors', (done) => {
      jest.useFakeTimers();
      const dismissSpy = jest.spyOn(component, 'dismissError');
      
      component.ngOnInit();
      
      const highSeverityError: AppError = {
        id: 'high-error',
        type: 'client',
        title: 'High Error',
        message: 'High severity message',
        severity: 'critical',
        timestamp: new Date(),
        resolved: false,
        userAgent: 'test-agent'
      };
      
      mockCurrentError$.next(highSeverityError);
      
      // Fast-forward 5 seconds
      jest.advanceTimersByTime(5000);
      
      expect(dismissSpy).not.toHaveBeenCalled();
      
      jest.useRealTimers();
      done();
    });
  });

  describe('dismissError', () => {
    it('should resolve current error and clear it', () => {
      const mockError: AppError = {
        id: 'test-error',
        type: 'client',
        title: 'Test Error',
        message: 'Test message',
        severity: 'medium',
        timestamp: new Date(),
        resolved: false,
        userAgent: 'test-agent'
      };
      
      component.currentError = mockError;
      component.dismissError();
      
      expect(mockErrorHandler.resolveError).toHaveBeenCalledWith('test-error');
      expect(mockErrorHandler.clearCurrentError).toHaveBeenCalled();
    });

    it('should handle null current error gracefully', () => {
      component.currentError = null;
      component.dismissError();
      
      expect(mockErrorHandler.resolveError).not.toHaveBeenCalled();
      expect(mockErrorHandler.clearCurrentError).toHaveBeenCalled();
    });
  });

  describe('executeAction', () => {
    it('should execute action function and dismiss error', () => {
      const mockAction = {
        label: 'Test Action',
        action: jest.fn(),
        style: 'primary'
      };
      
      const dismissSpy = jest.spyOn(component, 'dismissError');
      
      component.executeAction(mockAction);
      
      expect(mockAction.action).toHaveBeenCalled();
      expect(dismissSpy).toHaveBeenCalled();
    });

    it('should handle action execution errors', () => {
      const mockAction = {
        label: 'Failing Action',
        action: jest.fn(() => { throw new Error('Action failed'); }),
        style: 'primary'
      };
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => component.executeAction(mockAction)).not.toThrow();
      const calls = consoleSpy.mock.calls;
      expect(calls.length).toBe(1);
      expect(calls[0][0]).toBe('Error executing action:');
      expect(calls[0][1]).toBeInstanceOf(Error);
      
      consoleSpy.mockRestore();
    });
  });

  describe('toggleDetails', () => {
    it('should toggle showDetails state', () => {
      expect(component.showDetails).toBe(false);
      
      component.toggleDetails();
      expect(component.showDetails).toBe(true);
      
      component.toggleDetails();
      expect(component.showDetails).toBe(false);
    });
  });

  describe('getAlertClass', () => {
    it('should return correct alert classes for different severities', () => {
      expect(component.getAlertClass('critical')).toBe('alert-critical');
      expect(component.getAlertClass('high')).toBe('alert-high');
      expect(component.getAlertClass('medium')).toBe('alert-medium');
      expect(component.getAlertClass('low')).toBe('alert-low');
    });
  });

  describe('getIconClass', () => {
    it('should return correct icon classes for different severities', () => {
      expect(component.getIconClass('critical')).toBe('fa-exclamation-triangle text-danger');
      expect(component.getIconClass('high')).toBe('fa-exclamation-circle text-warning');
      expect(component.getIconClass('medium')).toBe('fa-info-circle text-info');
      expect(component.getIconClass('low')).toBe('fa-check-circle text-success');
      expect(component.getIconClass('unknown')).toBe('fa-check-circle text-success');
    });
  });

  describe('getActionButtonClass', () => {
    it('should return correct button classes for different styles', () => {
      expect(component.getActionButtonClass('primary')).toBe('btn-primary');
      expect(component.getActionButtonClass('danger')).toBe('btn-danger');
      expect(component.getActionButtonClass('secondary')).toBe('btn-secondary');
      expect(component.getActionButtonClass('unknown')).toBe('btn-secondary');
    });
  });

  describe('formatTimestamp', () => {
    it('should format timestamp correctly', () => {
      const testDate = new Date('2023-01-01T12:30:45Z');
      const formatted = component.formatTimestamp(testDate);
      
      // The format depends on the system locale, so we just verify it's a string
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('should handle different times consistently', () => {
      const morning = new Date('2023-01-01T09:15:30Z');
      const evening = new Date('2023-01-01T21:45:10Z');
      
      const morningFormatted = component.formatTimestamp(morning);
      const eveningFormatted = component.formatTimestamp(evening);
      
      expect(typeof morningFormatted).toBe('string');
      expect(typeof eveningFormatted).toBe('string');
      expect(morningFormatted).not.toBe(eveningFormatted);
    });
  });

  describe('Error State Management', () => {
    it('should update current error when new error is emitted', () => {
      component.ngOnInit();
      
      const error1: AppError = {
        id: 'error1',
        type: 'client',
        title: 'First Error',
        message: 'First message',
        severity: 'medium',
        timestamp: new Date(),
        resolved: false,
        userAgent: 'test-agent'
      };
      
      const error2: AppError = {
        id: 'error2',
        type: 'network',
        title: 'Second Error',
        message: 'Second message',
        severity: 'high',
        timestamp: new Date(),
        resolved: false,
        userAgent: 'test-agent'
      };
      
      mockCurrentError$.next(error1);
      expect(component.currentError).toBe(error1);
      
      mockCurrentError$.next(error2);
      expect(component.currentError).toBe(error2);
    });

    it('should reset showDetails when new error is displayed', () => {
      component.ngOnInit();
      component.showDetails = true;
      
      const mockError: AppError = {
        id: 'test-error',
        type: 'client',
        title: 'Test Error',
        message: 'Test message',
        severity: 'medium',
        timestamp: new Date(),
        resolved: false,
        userAgent: 'test-agent'
      };
      
      mockCurrentError$.next(mockError);
      expect(component.showDetails).toBe(false);
    });
  });

  describe('Component Lifecycle', () => {
    it('should complete destroy subject on ngOnDestroy', () => {
      const completeSpy = jest.spyOn(component['destroy$'], 'complete');
      const nextSpy = jest.spyOn(component['destroy$'], 'next');
      
      component.ngOnDestroy();
      
      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });

    it('should unsubscribe from observables on destroy', () => {
      component.ngOnInit();
      
      const mockError: AppError = {
        id: 'test-error',
        type: 'client',
        title: 'Test Error',
        message: 'Test message',
        severity: 'medium',
        timestamp: new Date(),
        resolved: false,
        userAgent: 'test-agent'
      };
      
      mockCurrentError$.next(mockError);
      expect(component.currentError).toBe(mockError);
      
      // Destroy component
      component.ngOnDestroy();
      
      // Further changes should not affect component
      const originalError = component.currentError;
      mockCurrentError$.next(null);
      
      expect(component.currentError).toBe(originalError);
    });
  });
});