// Angular core imports
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

// Blake Archive specific imports
import { BlakeDataService, BlakeWork, BlakeCopy } from '../../core/services/blake-data.service';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';
import { BaseComponent } from '../../core/base/base-component';
import { getMediumLabel } from '../../core/models/blake.models';

/**
 * Work Component
 *
 * Displays a Blake work (e.g., "Songs of Innocence") with all its copies.
 * A work is the highest level entity - multiple copies can exist of the same work.
 * Extends BaseComponent to inherit loading/error state management.
 */
@Component({
  selector: 'app-work',
  imports: [CommonModule, RouterLink, LoadingSpinner],
  templateUrl: './work.html',
  styleUrl: './work.scss',
})
export class Work extends BaseComponent implements OnInit {
  // Inject dependencies using Angular's inject() function
  private route = inject(ActivatedRoute);
  private blakeData = inject(BlakeDataService);

  // Component state
  work: BlakeWork | null = null;  // The work data loaded from the API
  copies: BlakeCopy[] = [];       // All copies of this work
  workId: string = '';            // Work BAD ID from the route parameter

  /**
   * Component initialization
   * Subscribes to route parameters to detect when the work ID changes
   */
  ngOnInit() {
    // Watch for route parameter changes
    this.route.params.subscribe(params => {
      // Extract the work ID from the URL
      this.workId = params['workId'];
      // Load the work and its copies
      this.loadWork();
    });
  }

  /**
   * Loads work data from the Blake Data Service
   * Uses sequential loading: first load work, then load its copies
   * Uses BaseComponent.loadData() for automatic loading/error handling
   */
  private loadWork() {
    // BaseComponent.loadData() handles:
    // - Setting loading = true
    // - Clearing previous errors
    // - Subscribing to the observable
    // - Calling success callback when data arrives
    // - Handling errors and logging them
    this.loadData(
      this.blakeData.getWork(this.workId),  // Observable from the service
      (work) => {
        // Success callback - store the work data
        this.work = work;

        // Once work is loaded, fetch all copies of this work
        // This is a multi-step loading process
        this.loadCopies();
      }
    );
  }

  /**
   * Loads all copies associated with this work
   * This is called after the work data is loaded
   * Manual subscribe instead of loadData() because we need to keep loading state
   * active until copies are also loaded
   */
  private loadCopies() {
    this.blakeData.getWorkCopies(this.workId).subscribe({
      next: (copies) => {
        // Store the copies data
        this.copies = copies;

        // All data is now loaded, turn off loading spinner
        // Use setLoading() from BaseComponent instead of directly setting this.loading
        this.setLoading(false);
      },
      error: (err) => {
        // Log the error with context using BaseComponent.logError()
        // The context parameter helps identify where the error occurred
        this.logError(err, 'loadCopies');

        // Turn off loading even if there's an error
        // This prevents infinite spinner if copies fail to load
        this.setLoading(false);
      }
    });
  }

  /**
   * Gets the human-readable label for the work's medium
   * Uses the centralized utility function to convert medium codes
   * @returns Human-readable medium label (e.g., "Illuminated Book")
   */
  getMediumLabel(): string {
    // getMediumLabel() handles:
    // - Undefined/null medium values (returns empty string)
    // - Known medium codes (returns full label)
    // - Unknown medium codes (returns the code as-is)
    return getMediumLabel(this.work?.medium);
  }

  /**
   * Gets the grammatically correct copy count text
   * @returns "1 copy" or "X copies" depending on count
   */
  getCopyCountText(): string {
    const count = this.copies.length;
    // Use singular for 1, plural for everything else
    return count === 1 ? '1 copy' : `${count} copies`;
  }
}
