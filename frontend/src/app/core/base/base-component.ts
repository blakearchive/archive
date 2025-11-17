/**
 * Base component class with common loading and error state management
 * Extend this class to get standard loading/error handling
 */

import { Directive } from '@angular/core';
import { Observable } from 'rxjs';

@Directive()
export abstract class BaseComponent {
  loading = true;
  error: string | null = null;

  /**
   * Handle data loading with automatic loading/error state management
   * @param observable$ Observable to subscribe to
   * @param onSuccess Success callback
   * @param onError Optional error callback
   */
  protected loadData<T>(
    observable$: Observable<T>,
    onSuccess: (data: T) => void,
    onError?: (err: any) => void
  ): void {
    this.loading = true;
    this.error = null;

    observable$.subscribe({
      next: (data) => {
        onSuccess(data);
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message || 'An error occurred while loading data.';
        this.loading = false;
        this.logError(err);
        if (onError) {
          onError(err);
        }
      }
    });
  }

  /**
   * Log error to console (can be overridden for custom logging)
   * @param error Error to log
   * @param context Optional context description
   */
  protected logError(error: any, context?: string): void {
    const message = context
      ? `Error in ${context}:`
      : 'Error:';
    console.error(message, error);
  }

  /**
   * Reset loading and error states
   */
  protected resetState(): void {
    this.loading = false;
    this.error = null;
  }

  /**
   * Set error state with message
   * @param message Error message
   */
  protected setError(message: string): void {
    this.error = message;
    this.loading = false;
  }

  /**
   * Set loading state
   * @param isLoading Loading state
   */
  protected setLoading(isLoading: boolean): void {
    this.loading = isLoading;
    if (isLoading) {
      this.error = null;
    }
  }
}
