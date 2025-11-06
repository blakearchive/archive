import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';

/**
 * BlakeDataService - Core service for accessing Blake Archive API
 * Mirrors the back-end BlakeDataService API
 */

export interface SearchConfig {
  searchTitle?: boolean;
  workTitleOffset?: number;
  searchWorkInformation?: boolean;
  workInformationOffset?: number;
  searchImageKeywords?: boolean;
  searchText?: boolean;
  searchImageDescription?: boolean;
  searchIlluminatedBooks?: boolean;
  searchCommercialBookIllustrations?: boolean;
  searchSeparatePrints?: boolean;
  searchDrawingsPaintings?: boolean;
  searchManuscripts?: boolean;
  searchRelatedMaterials?: boolean;
  minDate?: number;
  maxDate?: number;
  searchString?: string;
  [key: string]: any;
}

export interface BlakeObject {
  desc_id: string;
  title: string;
  copy_bad_id: string;
  object_number: number;
  full_object_id: string;
  illustration_description?: string;
  text_transcription?: string;
  [key: string]: any;
}

export interface BlakeCopy {
  bad_id: string;
  title: string;
  copy_information?: string;
  work_id: string;
  institution?: string;
  composition_date?: string;
  [key: string]: any;
}

export interface BlakeWork {
  bad_id: string;
  title: string;
  composition_date?: string;
  medium?: string;
  work_information?: string;
  [key: string]: any;
}

export interface BlakeExhibit {
  id: number;
  title: string;
  content?: string;
  [key: string]: any;
}

export interface BlakePreview {
  id: number;
  title: string;
  content?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class BlakeDataService {
  private http = inject(HttpClient);
  private readonly apiBase = '/api';

  /**
   * Query objects from Solr
   */
  queryObjects(config: SearchConfig): Observable<any> {
    return this.http.post(`${this.apiBase}/query_objects`, config).pipe(
      catchError(this.handleError('queryObjects'))
    );
  }

  /**
   * Query copies from Solr
   */
  queryCopies(config: SearchConfig): Observable<any> {
    return this.http.post(`${this.apiBase}/query_copies`, config).pipe(
      catchError(this.handleError('queryCopies'))
    );
  }

  /**
   * Query works from Solr
   */
  queryWorks(config: SearchConfig): Observable<any> {
    return this.http.post(`${this.apiBase}/query_works`, config).pipe(
      catchError(this.handleError('queryWorks'))
    );
  }

  /**
   * Get a specific object by descriptor ID
   */
  getObject(descId: string): Observable<BlakeObject> {
    return this.http.get<BlakeObject>(`${this.apiBase}/object/${descId}`).pipe(
      catchError(this.handleError('getObject'))
    );
  }

  /**
   * Get a specific copy by copy ID
   */
  getCopy(copyId: string): Observable<BlakeCopy> {
    return this.http.get<BlakeCopy>(`${this.apiBase}/copy/${copyId}`).pipe(
      catchError(this.handleError('getCopy'))
    );
  }

  /**
   * Get objects for a specific copy
   */
  getCopyObjects(copyId: string): Observable<BlakeObject[]> {
    return this.http.get<BlakeObject[]>(`${this.apiBase}/copy/${copyId}/objects`).pipe(
      catchError(this.handleError('getCopyObjects'))
    );
  }

  /**
   * Get a specific work by work ID
   */
  getWork(workId: string): Observable<BlakeWork> {
    return this.http.get<BlakeWork>(`${this.apiBase}/work/${workId}`).pipe(
      catchError(this.handleError('getWork'))
    );
  }

  /**
   * Get copies for a specific work
   */
  getWorkCopies(workId: string): Observable<BlakeCopy[]> {
    return this.http.get<BlakeCopy[]>(`${this.apiBase}/work/${workId}/copies`).pipe(
      catchError(this.handleError('getWorkCopies'))
    );
  }

  /**
   * Get a specific exhibit by exhibit ID
   */
  getExhibit(exhibitId: string): Observable<BlakeExhibit> {
    return this.http.get<BlakeExhibit>(`${this.apiBase}/exhibit/${exhibitId}`).pipe(
      catchError(this.handleError('getExhibit'))
    );
  }

  /**
   * Get a specific preview by preview ID
   */
  getPreview(previewId: string): Observable<BlakePreview> {
    return this.http.get<BlakePreview>(`${this.apiBase}/preview/${previewId}`).pipe(
      catchError(this.handleError('getPreview'))
    );
  }

  /**
   * Get featured works for the homepage
   */
  getFeaturedWorks(): Observable<any> {
    return this.http.get(`${this.apiBase}/featured`).pipe(
      catchError(this.handleError('getFeaturedWorks'))
    );
  }

  /**
   * Get related objects by relationship type
   */
  getRelatedObjects(descId: string, relationship: string): Observable<BlakeObject[]> {
    return this.http.get<BlakeObject[]>(`${this.apiBase}/object/${descId}/related/${relationship}`).pipe(
      catchError(this.handleError('getRelatedObjects'))
    );
  }

  /**
   * Error handler
   */
  private handleError(operation: string) {
    return (error: any): Observable<never> => {
      console.error(`${operation} failed:`, error);
      return throwError(() => new Error(`${operation} failed: ${error.message || error}`));
    };
  }
}
