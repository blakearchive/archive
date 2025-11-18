/**
 * Base component class providing common loading and error state management.
 *
 * This abstract class eliminates the need for boilerplate loading/error handling code
 * in every component. Extend this class to automatically get:
 * - Loading state management
 * - Error state management
 * - Standardized data loading patterns
 * - Consistent error logging
 *
 * @example
 * ```typescript
 * export class MyComponent extends BaseComponent implements OnInit {
 *   data: BlakeObject[];
 *
 *   constructor(private blakeData: BlakeDataService) {
 *     super(); // Must call super()
 *   }
 *
 *   ngOnInit() {
 *     this.loadData(
 *       this.blakeData.getObjects(),
 *       (objects) => {
 *         this.data = objects;
 *       }
 *     );
 *   }
 * }
 * ```
 *
 * @example Template Usage
 * ```html
 * <div *ngIf="loading">Loading...</div>
 * <div *ngIf="error">{{ error }}</div>
 * <div *ngIf="!loading && !error">
 *   <!-- Your content -->
 * </div>
 * ```
 */

import { Directive } from '@angular/core';
import { Observable } from 'rxjs';

@Directive()
export abstract class BaseComponent {
  /**
   * Indicates whether the component is currently loading data.
   * Automatically managed by loadData() method.
   */
  loading = true;

  /**
   * Contains error message if data loading fails.
   * Null when no error is present.
   */
  error: string | null = null;

  /**
   * Loads data from an observable with automatic loading and error state management.
   *
   * This method handles the entire data loading lifecycle:
   * 1. Sets loading to true and clears any previous errors
   * 2. Subscribes to the provided observable
   * 3. On success: calls onSuccess callback and sets loading to false
   * 4. On error: sets error message, logs error, and calls optional onError callback
   *
   * @template T The type of data being loaded
   * @param observable$ The Observable to subscribe to for data
   * @param onSuccess Callback function invoked when data loads successfully
   * @param onError Optional callback function for custom error handling
   *
   * @example Basic Usage
   * ```typescript
   * this.loadData(
   *   this.service.getData(),
   *   (data) => {
   *     this.data = data;
   *   }
   * );
   * ```
   *
   * @example With Error Handling
   * ```typescript
   * this.loadData(
   *   this.service.getData(),
   *   (data) => {
   *     this.data = data;
   *   },
   *   (err) => {
   *     this.router.navigate(['/error']);
   *   }
   * );
   * ```
   *
   * @example Sequential Loading
   * ```typescript
   * this.loadData(
   *   this.service.getWork(this.workId),
   *   (work) => {
   *     this.work = work;
   *     // Load related data after first request completes
   *     this.loadCopies(work.bad_id);
   *   }
   * );
   * ```
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
   * Logs error to console with optional context information.
   *
   * Override this method in your component to implement custom logging
   * (e.g., sending errors to a logging service).
   *
   * @param error The error object to log
   * @param context Optional context string to identify where the error occurred
   *
   * @example Basic Usage
   * ```typescript
   * this.logError(err, 'loadData');
   * // Output: "Error in loadData: [error details]"
   * ```
   *
   * @example Custom Override
   * ```typescript
   * export class MyComponent extends BaseComponent {
   *   protected override logError(error: any, context?: string): void {
   *     super.logError(error, context);
   *     this.loggingService.logError(error, context);
   *   }
   * }
   * ```
   */
  protected logError(error: any, context?: string): void {
    const message = context
      ? `Error in ${context}:`
      : 'Error:';
    console.error(message, error);
  }

  /**
   * Resets both loading and error states to their default values.
   *
   * Useful when you need to clear all state before starting a new operation
   * or when implementing a retry mechanism.
   *
   * @example
   * ```typescript
   * retry() {
   *   this.resetState();
   *   this.loadData();
   * }
   * ```
   */
  protected resetState(): void {
    this.loading = false;
    this.error = null;
  }

  /**
   * Sets the error state with a custom message and stops loading.
   *
   * Use this when you need to manually set an error state without
   * going through the loadData() method.
   *
   * @param message The error message to display to the user
   *
   * @example Validation Error
   * ```typescript
   * if (!this.isValid()) {
   *   this.setError('Invalid data provided');
   *   return;
   * }
   * ```
   *
   * @example Custom Error Handling
   * ```typescript
   * if (response.status === 404) {
   *   this.setError('Resource not found');
   * }
   * ```
   */
  protected setError(message: string): void {
    this.error = message;
    this.loading = false;
  }

  /**
   * Manually sets the loading state.
   *
   * Useful for multi-step loading processes or when you need finer control
   * over the loading state. When setting loading to true, automatically
   * clears any previous error.
   *
   * @param isLoading Whether the component should be in loading state
   *
   * @example Multi-Step Loading
   * ```typescript
   * loadWorkWithCopies() {
   *   this.loadData(
   *     this.blakeData.getWork(this.workId),
   *     (work) => {
   *       this.work = work;
   *       // Keep loading while fetching copies
   *       this.setLoading(true);
   *       this.loadCopies();
   *     }
   *   );
   * }
   *
   * private loadCopies() {
   *   this.blakeData.getWorkCopies(this.workId).subscribe({
   *     next: (copies) => {
   *       this.copies = copies;
   *       this.setLoading(false); // All data loaded
   *     }
   *   });
   * }
   * ```
   */
  protected setLoading(isLoading: boolean): void {
    this.loading = isLoading;
    if (isLoading) {
      this.error = null;
    }
  }
}
