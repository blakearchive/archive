// Angular core imports
import { Injectable, inject, signal } from '@angular/core';
import { Observable, forkJoin, tap, catchError, of, map } from 'rxjs';

// Blake Archive specific imports
import { BlakeDataService, SearchConfig, BlakeObject, BlakeCopy, BlakeWork } from './blake-data.service';

/**
 * Extended search configuration for the search service
 * Adds UI-specific search options on top of the base SearchConfig
 */
export interface SearchConfiguration extends SearchConfig {
  // Date options
  useCompDate?: boolean;        // Use composition date for filtering
  usePrintDate?: boolean;       // Use print date for filtering

  // Field search options
  searchAllFields?: boolean;         // Search across all text fields
  searchTitle?: boolean;             // Search only in titles
  searchText?: boolean;              // Search only in transcribed text
  searchNotes?: boolean;             // Search only in notes
  searchImageDescriptions?: boolean; // Search only in image descriptions
  searchImageKeywords?: boolean;     // Search only in image keywords

  // Entity type search options
  searchWorks?: boolean;        // Search works
  searchCopies?: boolean;       // Search copies
  searchAllTypes?: boolean;     // Search all medium types

  // Additional search fields
  searchCopyInformation?: boolean;   // Search in copy information/metadata
}

/**
 * Structure for search results
 * Contains arrays of all three entity types returned from a search
 */
export interface SearchResults {
  objects: BlakeObject[];  // Individual pages/plates matching the search
  copies: BlakeCopy[];     // Copies matching the search
  works: BlakeWork[];      // Works matching the search
}

/**
 * SearchService - Manages search functionality for the Blake Archive
 *
 * This service provides a complete search solution including:
 * - Parallel searching across objects, copies, and works
 * - Reactive state management using Angular signals
 * - Configurable search filters (fields, types, dates)
 * - Stop word filtering for optimized searches
 *
 * The service maintains search state that can be accessed by components
 * throughout the application.
 */
@Injectable({
  providedIn: 'root'  // Makes this service available application-wide as a singleton
})
export class SearchService {
  // Inject the Blake Data Service to access API methods
  private blakeData = inject(BlakeDataService);

  // ========================================
  // REACTIVE STATE (Angular Signals)
  // These signals allow components to reactively respond to search state changes
  // ========================================

  /**
   * Signal indicating whether a search is currently in progress
   * Components can use this to show loading spinners
   */
  searching = signal(false);

  /**
   * Signal containing the current search query string
   * Useful for displaying what the user searched for
   */
  queryString = signal('');

  /**
   * Signal containing the most recent search results
   * Components can subscribe to this to automatically update when results change
   */
  searchResults = signal<SearchResults>({
    objects: [],
    copies: [],
    works: []
  });

  /**
   * Signal containing the current search configuration
   * Defines all search filters and options
   * Initialized with sensible defaults for general searching
   */
  searchConfig = signal<SearchConfiguration>({
    // Date filter defaults - William Blake's lifetime
    useCompDate: true,          // Filter by composition date
    usePrintDate: false,        // Don't filter by print date
    minDate: 1772,              // Blake's birth year
    maxDate: 1827,              // Blake's death year

    // Field search defaults - search everything by default
    searchAllFields: true,           // Search across all fields
    searchTitle: false,              // Don't limit to titles only
    searchText: false,               // Don't limit to text only
    searchNotes: false,              // Don't limit to notes only
    searchImageDescriptions: false,  // Don't limit to descriptions only
    searchImageKeywords: false,      // Don't limit to keywords only

    // Entity type defaults
    searchWorks: false,         // Don't limit to works
    searchCopies: false,        // Don't limit to copies
    searchAllTypes: true,       // Search all medium types

    // Medium type defaults - all off when searchAllTypes is true
    searchIlluminatedBooks: false,
    searchCommercialBookIllustrations: false,
    searchSeparatePrints: false,
    searchDrawingsPaintings: false,
    searchManuscripts: false,
    searchRelatedMaterials: false,

    // Additional options
    searchCopyInformation: false,   // Don't specifically search copy info

    searchString: ''            // No search query by default
  });

  // ========================================
  // CONSTANTS
  // ========================================

  /**
   * Array of medium type filter field names
   * Used for iterating over all medium types when resetting or toggling
   */
  readonly types = [
    'searchIlluminatedBooks',
    'searchCommercialBookIllustrations',
    'searchSeparatePrints',
    'searchDrawingsPaintings',
    'searchManuscripts',
    'searchRelatedMaterials'
  ];

  /**
   * Common English stop words that may be filtered from search queries
   * These words are typically ignored by search engines as they don't
   * add significant meaning to searches
   *
   * Examples: "the", "a", "is", "and", etc.
   */
  readonly stopWords = [
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
    "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
    "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't",
    "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
    "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
    "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here",
    "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i",
    "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's",
    "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself",
    "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought",
    "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she",
    "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
    "than", "that", "that's", "the", "their", "theirs", "them", "themselves",
    "then", "there", "there's", "these", "they", "they'd", "they'll", "they're",
    "they've", "this", "those", "through", "to", "too", "under", "until", "up",
    "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
    "weren't", "what", "what's", "when", "when's", "where", "where's", "which",
    "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
    "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours",
    "yourself", "yourselves"
  ];

  // ========================================
  // PUBLIC METHODS
  // ========================================

  /**
   * Reset search results to empty arrays
   *
   * Clears all previous search results from the state.
   * Useful when starting a new search or clearing the search interface.
   */
  resetResults(): void {
    // Set the searchResults signal to empty arrays for all entity types
    this.searchResults.set({
      objects: [],
      copies: [],
      works: []
    });
  }

  /**
   * Reset search filters to their default values
   *
   * Restores the search configuration to the original defaults:
   * - Search all fields
   * - Search all medium types
   * - Date range: Blake's lifetime (1772-1827)
   * - Empty search string
   */
  resetFilters(): void {
    // Reset the searchConfig signal to default values
    this.searchConfig.set({
      useCompDate: true,
      usePrintDate: false,
      searchAllFields: true,
      searchTitle: false,
      searchText: false,
      searchNotes: false,
      searchImageDescriptions: false,
      searchImageKeywords: false,
      searchWorks: false,
      searchCopies: false,
      searchAllTypes: true,
      searchIlluminatedBooks: false,
      searchCommercialBookIllustrations: false,
      searchCopyInformation: false,
      searchSeparatePrints: false,
      searchDrawingsPaintings: false,
      searchManuscripts: false,
      searchRelatedMaterials: false,
      minDate: 1772,
      maxDate: 1827,
      searchString: ''
    });
  }

  /**
   * Enable searching across all fields
   *
   * Sets the search to look in all available text fields (titles, descriptions,
   * transcriptions, etc.) and disables field-specific filters.
   *
   * This is the default search behavior for broad queries.
   */
  allFields(): void {
    // Get the current configuration
    const config = this.searchConfig();

    // Update the configuration to search all fields
    this.searchConfig.set({
      ...config,                    // Keep other settings
      searchAllFields: true,        // Enable all-fields search
      // Disable individual field filters
      searchTitle: false,
      searchText: false,
      searchNotes: false,
      searchImageDescriptions: false,
      searchImageKeywords: false,
      searchWorks: false,
      searchCopies: false
    });
  }

  /**
   * Enable searching across all medium types
   *
   * Sets the search to include all types of Blake works (illuminated books,
   * drawings, prints, etc.) and disables type-specific filters.
   *
   * This is the default search behavior for broad queries.
   */
  allTypes(): void {
    // Get the current configuration
    const config = this.searchConfig();

    // Update the configuration to search all types
    this.searchConfig.set({
      ...config,                            // Keep other settings
      searchAllTypes: true,                 // Enable all-types search
      // Disable individual medium type filters
      searchIlluminatedBooks: false,
      searchCommercialBookIllustrations: false,
      searchSeparatePrints: false,
      searchDrawingsPaintings: false,
      searchManuscripts: false,
      searchRelatedMaterials: false
    });
  }

  /**
   * Perform a search across objects, copies, and works
   *
   * This method executes three parallel searches (one for each entity type)
   * and combines the results. It updates the service's reactive state
   * throughout the process.
   *
   * Search flow:
   * 1. Update search string if provided
   * 2. Clear previous results
   * 3. Set searching flag to true
   * 4. Execute three parallel API calls using forkJoin
   * 5. Update results and clear searching flag when complete
   *
   * @param searchString - Optional search query. If not provided, uses current config's searchString
   * @returns Observable of SearchResults containing arrays of objects, copies, and works
   */
  search(searchString?: string): Observable<SearchResults> {
    // If a search string was provided, update the configuration
    if (searchString !== undefined) {
      const config = this.searchConfig();
      this.searchConfig.set({ ...config, searchString });  // Add searchString to config
      this.queryString.set(searchString);                  // Store for display purposes
    }

    // Clear any previous search results
    this.resetResults();

    // Set the searching flag to true (triggers loading spinners in UI)
    this.searching.set(true);

    // Get the current search configuration
    const config = this.searchConfig();

    // Execute three parallel searches using forkJoin
    // forkJoin waits for all observables to complete, then emits all results together
    // This is more efficient than sequential searches
    return forkJoin({
      objects: this.blakeData.queryObjects(config),  // Search for matching objects
      copies: this.blakeData.queryCopies(config),    // Search for matching copies
      works: this.blakeData.queryWorks(config)       // Search for matching works
    }).pipe(
      // tap() performs side effects without modifying the data stream
      tap(results => {
        // Store the results in the signal for reactive components
        this.searchResults.set(results);

        // Clear the searching flag (removes loading spinners)
        this.searching.set(false);
      }),
      // map() transforms the results to ensure proper typing
      map(results => results as SearchResults)
    );
  }

  /**
   * Update the search configuration with partial changes
   *
   * Allows updating one or more configuration properties without
   * affecting the others. Uses object spreading to merge changes.
   *
   * @param updates - Partial configuration object with properties to update
   *
   * @example
   * // Update just the date range
   * searchService.updateConfig({ minDate: 1780, maxDate: 1800 });
   *
   * @example
   * // Enable a specific medium type
   * searchService.updateConfig({ searchIlluminatedBooks: true, searchAllTypes: false });
   */
  updateConfig(updates: Partial<SearchConfiguration>): void {
    // Get the current configuration
    const current = this.searchConfig();

    // Merge the updates with the current config
    // The spread operator (...) combines objects, with later values overwriting earlier ones
    this.searchConfig.set({ ...current, ...updates });
  }

  /**
   * Toggle a specific medium type filter on or off
   *
   * Inverts the boolean value of a medium type filter.
   * If it was true, makes it false; if it was false, makes it true.
   *
   * @param type - The name of the medium type field to toggle
   *               (e.g., 'searchIlluminatedBooks', 'searchDrawingsPaintings')
   *
   * @example
   * searchService.toggleType('searchIlluminatedBooks');
   */
  toggleType(type: string): void {
    // Get the current configuration
    const config = this.searchConfig();

    // Create a new config with the specified type toggled
    this.searchConfig.set({
      ...config,                          // Keep all other settings
      [type]: !(config as any)[type]      // Flip the boolean value of this type
    });
  }

  /**
   * Toggle a specific field filter on or off
   *
   * Inverts the boolean value of a field filter and automatically
   * disables "search all fields" mode when enabling a specific field.
   *
   * @param field - The name of the field to toggle
   *                (e.g., 'searchTitle', 'searchText', 'searchNotes')
   *
   * @example
   * searchService.toggleField('searchTitle');  // Search only in titles
   */
  toggleField(field: string): void {
    // Get the current configuration
    const config = this.searchConfig();

    // Create a new config with the specified field toggled
    this.searchConfig.set({
      ...config,                          // Keep all other settings
      [field]: !(config as any)[field],   // Flip the boolean value of this field
      searchAllFields: false              // Disable "all fields" when selecting specific fields
    });
  }
}
