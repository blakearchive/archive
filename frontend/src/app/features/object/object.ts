// Angular core imports
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

// Blake Archive specific imports
import { BlakeDataService, BlakeObject } from '../../core/services/blake-data.service';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';
import { BaseComponent } from '../../core/base/base-component';
import { getObjectImageUrl } from '../../core/utils/image.utils';

// Type definition for the different view tabs available in the object viewer
type ViewTab = 'image' | 'transcription' | 'info' | 'notes';

/**
 * Object Component
 *
 * Displays a single Blake Archive object (page/plate) with multiple viewing modes.
 * Extends BaseComponent to inherit loading/error state management.
 */
@Component({
  selector: 'app-object',
  imports: [CommonModule, RouterLink, LoadingSpinner],
  templateUrl: './object.html',
  styleUrl: './object.scss',
})
export class Object extends BaseComponent implements OnInit {
  // Inject dependencies using Angular's inject() function
  private route = inject(ActivatedRoute);
  private blakeData = inject(BlakeDataService);

  // Component state
  object: BlakeObject | null = null;  // The Blake object data loaded from the API
  descId: string = '';                 // Descriptor ID from the route parameter

  // View state - tracks which tab is currently active
  activeTab: ViewTab = 'image';

  /**
   * Component initialization
   * Subscribes to route parameters to detect when the object ID changes
   */
  ngOnInit() {
    // Watch for route parameter changes
    this.route.params.subscribe(params => {
      // Extract the descriptor ID from the URL
      this.descId = params['descId'];
      // Load the object data for this ID
      this.loadObject();
    });
  }

  /**
   * Loads object data from the Blake Data Service
   * Uses the loadData() method from BaseComponent for automatic loading/error handling
   */
  private loadObject() {
    // BaseComponent.loadData() handles:
    // - Setting loading = true
    // - Clearing previous errors
    // - Subscribing to the observable
    // - Setting loading = false when complete
    // - Handling errors and logging them
    this.loadData(
      this.blakeData.getObject(this.descId),  // Observable from the service
      (object) => {
        // Success callback - store the loaded object
        this.object = object;
      }
    );
  }

  /**
   * Sets the active tab in the viewer
   * @param tab - The tab to activate
   */
  setActiveTab(tab: ViewTab) {
    this.activeTab = tab;
  }

  /**
   * Gets the full image URL for the current object
   * Uses the centralized image utility function for consistent URL generation
   * @returns Full image URL or empty string if no object loaded
   */
  getImageUrl(): string {
    // Return empty string if object hasn't loaded yet
    if (!this.object) return '';

    // Use the utility function to generate the URL
    // This ensures consistent path construction across the app
    return getObjectImageUrl(this.object);
  }

  /**
   * Checks if the object has a text transcription
   * Used to conditionally show the transcription tab
   * @returns true if transcription exists
   */
  hasTranscription(): boolean {
    // Use optional chaining and double negation to convert to boolean
    return !!this.object?.text_transcription;
  }

  /**
   * Checks if the object has an illustration description
   * Used to conditionally show the description in the info tab
   * @returns true if description exists
   */
  hasDescription(): boolean {
    // Use optional chaining and double negation to convert to boolean
    return !!this.object?.illustration_description;
  }
}
