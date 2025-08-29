import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LoadingState {
  [key: string]: boolean;
}

export interface ErrorState {
  [key: string]: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<LoadingState>({});
  private errorSubject = new BehaviorSubject<ErrorState>({});

  loading$ = this.loadingSubject.asObservable();
  errors$ = this.errorSubject.asObservable();

  constructor() {}

  /**
   * Set loading state for a specific operation
   */
  setLoading(operation: string, loading: boolean): void {
    const currentState = this.loadingSubject.value;
    this.loadingSubject.next({
      ...currentState,
      [operation]: loading
    });
  }

  /**
   * Get loading state for a specific operation
   */
  isLoading(operation: string): boolean {
    return this.loadingSubject.value[operation] || false;
  }

  /**
   * Check if any operation is currently loading
   */
  isAnyLoading(): boolean {
    const loadingState = this.loadingSubject.value;
    return Object.values(loadingState).some(loading => loading);
  }

  /**
   * Set error for a specific operation
   */
  setError(operation: string, error: string | null): void {
    const currentState = this.errorSubject.value;
    this.errorSubject.next({
      ...currentState,
      [operation]: error
    });
  }

  /**
   * Get error for a specific operation
   */
  getError(operation: string): string | null {
    return this.errorSubject.value[operation] || null;
  }

  /**
   * Clear error for a specific operation
   */
  clearError(operation: string): void {
    this.setError(operation, null);
  }

  /**
   * Clear all errors
   */
  clearAllErrors(): void {
    this.errorSubject.next({});
  }

  /**
   * Clear loading state for a specific operation
   */
  clearLoading(operation: string): void {
    this.setLoading(operation, false);
  }

  /**
   * Clear all loading states
   */
  clearAllLoading(): void {
    this.loadingSubject.next({});
  }

  /**
   * Get current loading state snapshot
   */
  getCurrentLoadingState(): LoadingState {
    return this.loadingSubject.value;
  }

  /**
   * Get current error state snapshot
   */
  getCurrentErrorState(): ErrorState {
    return this.errorSubject.value;
  }

  /**
   * Utility method to wrap an observable with loading state
   */
  withLoading<T>(operation: string, source$: Observable<T>): Observable<T> {
    return new Observable(subscriber => {
      this.setLoading(operation, true);
      this.clearError(operation);

      const subscription = source$.subscribe({
        next: (value) => {
          subscriber.next(value);
        },
        error: (error) => {
          this.setLoading(operation, false);
          this.setError(operation, this.formatError(error));
          subscriber.error(error);
        },
        complete: () => {
          this.setLoading(operation, false);
          subscriber.complete();
        }
      });

      return () => subscription.unsubscribe();
    });
  }

  /**
   * Format error message from HTTP error or other error types
   */
  private formatError(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'An unexpected error occurred';
  }
}