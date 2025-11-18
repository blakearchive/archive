// Angular core imports
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

// Import centralized Blake Archive data models
import {
  BlakeObject,
  BlakeCopy,
  BlakeWork,
  BlakeExhibit,
  BlakePreview,
  FeaturedWork
} from '../models/blake.models';

/**
 * BlakeDataService - Core service for accessing Blake Archive API
 *
 * This service provides a TypeScript interface to the Blake Archive back-end API.
 * It handles all HTTP communication with the server and returns strongly-typed
 * observables for data retrieval.
 *
 * Key features:
 * - Strongly typed return values (no 'any' types)
 * - Centralized error handling
 * - RESTful API communication
 * - Solr search query support
 *
 * The service mirrors the back-end BlakeDataService API endpoints.
 */

/**
 * Configuration object for Solr search queries
 * Allows filtering and searching across different Blake Archive content types
 */
export interface SearchConfig {
  // Title search options
  searchTitle?: boolean;              // Search in work titles
  workTitleOffset?: number;           // Pagination offset for title results

  // Work information search options
  searchWorkInformation?: boolean;    // Search in work descriptions/info
  workInformationOffset?: number;     // Pagination offset for info results

  // Content search options
  searchImageKeywords?: boolean;      // Search in image keywords/tags
  searchText?: boolean;               // Search in transcribed text
  searchImageDescription?: boolean;   // Search in image descriptions

  // Medium type filters (what types of works to search)
  searchIlluminatedBooks?: boolean;           // Include illuminated books
  searchCommercialBookIllustrations?: boolean;// Include commercial book illustrations
  searchSeparatePrints?: boolean;             // Include separate prints
  searchDrawingsPaintings?: boolean;          // Include drawings and paintings
  searchManuscripts?: boolean;                // Include manuscripts
  searchRelatedMaterials?: boolean;           // Include related materials

  // Date range filters
  minDate?: number;                   // Earliest composition date
  maxDate?: number;                   // Latest composition date

  // The actual search query string
  searchString?: string;              // User's search query

  // Allow additional properties for API flexibility
  [key: string]: any;
}

// Re-export types for backwards compatibility
// This allows other parts of the app to import types from this service
// without having to know about the centralized models file
export type { BlakeObject, BlakeCopy, BlakeWork, BlakeExhibit, BlakePreview, FeaturedWork };

@Injectable({
  providedIn: 'root'  // Makes this service available application-wide as a singleton
})
export class BlakeDataService {
  // Inject Angular's HttpClient for making HTTP requests
  private http = inject(HttpClient);

  // Base URL for all API endpoints
  // All API calls will be prefixed with this path
  private readonly apiBase = '/api';

  // ========================================
  // SEARCH/QUERY METHODS
  // These methods query Solr for multiple results
  // ========================================

  /**
   * Query objects from Solr based on search criteria
   *
   * Objects are individual pages/plates in the Blake Archive.
   * This method sends a POST request to the Solr query endpoint with
   * the search configuration and returns matching objects.
   *
   * @param config - Search configuration with filters and query string
   * @returns Observable of matching Blake objects
   */
  queryObjects(config: SearchConfig): Observable<BlakeObject[]> {
    // POST the search config to the query_objects endpoint
    // The pipe() adds error handling to the observable stream
    return this.http.post<BlakeObject[]>(`${this.apiBase}/query_objects`, config).pipe(
      catchError(this.handleError('queryObjects'))  // Handle any errors that occur
    );
  }

  /**
   * Query copies from Solr based on search criteria
   *
   * Copies are specific instances of works (e.g., "Copy A", "Copy B").
   * Each copy may be held by a different institution.
   *
   * @param config - Search configuration with filters and query string
   * @returns Observable of matching Blake copies
   */
  queryCopies(config: SearchConfig): Observable<BlakeCopy[]> {
    // POST the search config to the query_copies endpoint
    return this.http.post<BlakeCopy[]>(`${this.apiBase}/query_copies`, config).pipe(
      catchError(this.handleError('queryCopies'))  // Handle any errors that occur
    );
  }

  /**
   * Query works from Solr based on search criteria
   *
   * Works are the highest level entity (e.g., "Songs of Innocence").
   * A work may have multiple copies.
   *
   * @param config - Search configuration with filters and query string
   * @returns Observable of matching Blake works
   */
  queryWorks(config: SearchConfig): Observable<BlakeWork[]> {
    // POST the search config to the query_works endpoint
    return this.http.post<BlakeWork[]>(`${this.apiBase}/query_works`, config).pipe(
      catchError(this.handleError('queryWorks'))  // Handle any errors that occur
    );
  }

  // ========================================
  // SINGLE ENTITY RETRIEVAL METHODS
  // These methods fetch specific entities by ID
  // ========================================

  /**
   * Get a specific object by descriptor ID
   *
   * Fetches detailed information about a single Blake Archive object
   * (page/plate) using its unique descriptor ID.
   *
   * @param descId - The descriptor ID (e.g., "but11.1.wc.01")
   * @returns Observable of the requested Blake object
   */
  getObject(descId: string): Observable<BlakeObject> {
    // GET request to the object endpoint with the descriptor ID
    return this.http.get<BlakeObject>(`${this.apiBase}/object/${descId}`).pipe(
      catchError(this.handleError('getObject'))  // Handle any errors that occur
    );
  }

  /**
   * Get a specific copy by copy ID
   *
   * Fetches information about a specific copy of a work, including
   * institution, print date, and other copy-specific details.
   *
   * @param copyId - The copy BAD ID (e.g., "but11.1")
   * @returns Observable of the requested Blake copy
   */
  getCopy(copyId: string): Observable<BlakeCopy> {
    // GET request to the copy endpoint with the copy ID
    return this.http.get<BlakeCopy>(`${this.apiBase}/copy/${copyId}`).pipe(
      catchError(this.handleError('getCopy'))  // Handle any errors that occur
    );
  }

  /**
   * Get all objects belonging to a specific copy
   *
   * Retrieves all pages/plates that are part of a given copy.
   * Useful for displaying a complete copy viewer.
   *
   * @param copyId - The copy BAD ID
   * @returns Observable of array of objects in this copy
   */
  getCopyObjects(copyId: string): Observable<BlakeObject[]> {
    // GET request to fetch all objects for this copy
    return this.http.get<BlakeObject[]>(`${this.apiBase}/copy/${copyId}/objects`).pipe(
      catchError(this.handleError('getCopyObjects'))  // Handle any errors that occur
    );
  }

  /**
   * Get a specific work by work ID
   *
   * Fetches high-level information about a work, such as composition date,
   * medium, and general work information.
   *
   * @param workId - The work BAD ID (e.g., "but11")
   * @returns Observable of the requested Blake work
   */
  getWork(workId: string): Observable<BlakeWork> {
    // GET request to the work endpoint with the work ID
    return this.http.get<BlakeWork>(`${this.apiBase}/work/${workId}`).pipe(
      catchError(this.handleError('getWork'))  // Handle any errors that occur
    );
  }

  /**
   * Get all copies of a specific work
   *
   * Retrieves all known copies of a work. Each work may have multiple copies
   * held by different institutions or created at different times.
   *
   * @param workId - The work BAD ID
   * @returns Observable of array of copies for this work
   */
  getWorkCopies(workId: string): Observable<BlakeCopy[]> {
    // GET request to fetch all copies for this work
    return this.http.get<BlakeCopy[]>(`${this.apiBase}/work/${workId}/copies`).pipe(
      catchError(this.handleError('getWorkCopies'))  // Handle any errors that occur
    );
  }

  // ========================================
  // SPECIAL CONTENT METHODS
  // These methods handle exhibits, previews, and featured content
  // ========================================

  /**
   * Get a specific virtual exhibit by ID
   *
   * Virtual exhibits are curated collections of Blake objects organized
   * around specific themes.
   *
   * @param exhibitId - The exhibit ID
   * @returns Observable of the requested exhibit
   */
  getExhibit(exhibitId: string): Observable<BlakeExhibit> {
    // GET request to the exhibit endpoint
    return this.http.get<BlakeExhibit>(`${this.apiBase}/exhibit/${exhibitId}`).pipe(
      catchError(this.handleError('getExhibit'))  // Handle any errors that occur
    );
  }

  /**
   * Get a specific preview by ID
   *
   * Previews are lightweight representations used for thumbnails and listings.
   *
   * @param previewId - The preview ID
   * @returns Observable of the requested preview
   */
  getPreview(previewId: string): Observable<BlakePreview> {
    // GET request to the preview endpoint
    return this.http.get<BlakePreview>(`${this.apiBase}/preview/${previewId}`).pipe(
      catchError(this.handleError('getPreview'))  // Handle any errors that occur
    );
  }

  /**
   * Get featured works for the homepage
   *
   * Returns a curated list of works to be highlighted on the homepage.
   * These are typically significant or representative works.
   *
   * @returns Observable of array of featured works
   */
  getFeaturedWorks(): Observable<FeaturedWork[]> {
    // GET request to the featured works endpoint
    return this.http.get<FeaturedWork[]>(`${this.apiBase}/featured`).pipe(
      catchError(this.handleError('getFeaturedWorks'))  // Handle any errors that occur
    );
  }

  /**
   * Get objects related to a specific object by relationship type
   *
   * Blake objects can be related in various ways (e.g., same work,
   * same copy, same theme). This method retrieves related objects
   * based on the specified relationship.
   *
   * @param descId - The descriptor ID of the source object
   * @param relationship - The type of relationship (e.g., "same_work", "same_copy")
   * @returns Observable of array of related objects
   */
  getRelatedObjects(descId: string, relationship: string): Observable<BlakeObject[]> {
    // GET request with both the object ID and relationship type in the URL
    return this.http.get<BlakeObject[]>(`${this.apiBase}/object/${descId}/related/${relationship}`).pipe(
      catchError(this.handleError('getRelatedObjects'))  // Handle any errors that occur
    );
  }

  // ========================================
  // ERROR HANDLING
  // ========================================

  /**
   * Centralized error handler for all HTTP requests
   *
   * This method creates an error handling function that:
   * 1. Logs the error to the console with context
   * 2. Transforms the error into a user-friendly Error object
   * 3. Returns an observable that emits the error
   *
   * @param operation - Name of the operation that failed (for logging)
   * @returns Function that handles the error and returns an observable
   */
  private handleError(operation: string) {
    // Return a function that takes the error and processes it
    return (error: any): Observable<never> => {
      // Log the error to the console for debugging
      // The operation name helps identify which API call failed
      console.error(`${operation} failed:`, error);

      // Create a new Error object with a descriptive message
      // throwError creates an observable that immediately errors
      // The arrow function creates the Error when the observable is subscribed to
      return throwError(() => new Error(`${operation} failed: ${error.message || error}`));
    };
  }
}
