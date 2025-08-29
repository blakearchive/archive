import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, combineLatest, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

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
  [key: string]: any;
}

export interface BlakeDataState {
  featured: any;
  work: any;
  workCopies: any[];
  copy: any;
  copyObjects: any[];
  object: any;
  fragment_pairs: any[];
  exhibit: any;
  preview: any;
}

export interface TextuallyReferencedMaterial {
  objects: any[];
  copies: any[];
  works: any[];
}

@Injectable({
  providedIn: 'root'
})
export class BlakeDataService {
  private readonly directoryPrefix: string = '';
  
  public blakeData: BlakeDataState = {
    featured: {},
    work: {},
    workCopies: [],
    copy: {},
    copyObjects: [],
    object: {},
    fragment_pairs: [],
    exhibit: {},
    preview: {}
  };

  constructor(private http: HttpClient) {
    // Get directory prefix from global or assume empty
    this.directoryPrefix = (window as any).directoryPrefix || '';
  }

  // Query methods
  queryObjects(config: SearchConfig): Observable<any> {
    const url = `${this.directoryPrefix}/api/query_objects`;
    
    return this.http.post(url, config).pipe(
      catchError(error => {
        console.error('XHR Failed for queryObjects', error);
        throw error;
      })
    );
  }

  queryCopies(config: SearchConfig): Observable<any> {
    const url = `${this.directoryPrefix}/api/query_copies`;
    
    return this.http.post(url, config).pipe(
      catchError(error => {
        console.error('XHR Failed for queryCopies', error);
        throw error;
      })
    );
  }

  queryWorks(config: SearchConfig): Observable<any> {
    const url = `${this.directoryPrefix}/api/query_works`;
    
    return this.http.post(url, config).pipe(
      catchError(error => {
        console.error('XHR Failed for queryWorks', error);
        throw error;
      })
    );
  }

  // Object methods
  getObject(descId: string): Observable<any> {
    const url = `${this.directoryPrefix}/api/object/${descId}`;
    
    return this.http.get(url).pipe(
      map(response => this.createBlakeObject(response)),
      catchError(error => {
        console.error('XHR Failed for getObject', error);
        throw error;
      })
    );
  }

  getObjects(descIds: string[]): Observable<any> {
    const url = `${this.directoryPrefix}/api/object/`;
    const params = new HttpParams().set('desc_ids', descIds.join(','));
    
    return this.http.get(url, { params }).pipe(
      map((response: any) => this.createBlakeObject(response.results)),
      catchError(error => {
        console.error('XHR Failed for getObjects: multi', error);
        throw error;
      })
    );
  }

  getFragmentPair(descId1: string, descId2: string): Observable<any> {
    const url = `${this.directoryPrefix}/api/object/${descId1}/${descId2}/fragment_pair`;
    
    return this.http.get(url).pipe(
      map(response => this.createBlakeFragmentPair(response)),
      catchError(error => {
        console.error('XHR Failed for getFragmentPair', error);
        throw error;
      })
    );
  }

  getObjectsWithSameMotif(descId: string): Observable<any> {
    const url = `${this.directoryPrefix}/api/object/${descId}/objects_with_same_motif`;
    
    return this.http.get(url).pipe(
      map((response: any) => this.createBlakeObject(response.results)),
      catchError(error => {
        console.error('XHR Failed for getObjectsWithSameMotif', error);
        throw error;
      })
    );
  }

  getObjectsFromSameMatrix(descId: string): Observable<any> {
    const url = `${this.directoryPrefix}/api/object/${descId}/objects_from_same_matrix`;
    
    return this.http.get(url).pipe(
      map((response: any) => this.createBlakeObject(response.results)),
      catchError(error => {
        console.error('XHR Failed for getObjectsFromSameMatrix', error);
        throw error;
      })
    );
  }

  getSameMatrixObjectFromOtherCopy(descId: string, badId: string): Observable<any> {
    const url = `${this.directoryPrefix}/api/object/${descId}/${badId}`;
    
    return this.http.get(url).pipe(
      map(response => this.createBlakeObject(response)),
      catchError(error => {
        console.error('XHR Failed for getSameMatrixObjectFromOtherCopy', error);
        throw error;
      })
    );
  }

  getObjectsFromSameProductionSequence(descId: string): Observable<any> {
    const url = `${this.directoryPrefix}/api/object/${descId}/objects_from_same_production_sequence`;
    
    return this.http.get(url).pipe(
      map((response: any) => this.createBlakeObject(response.results)),
      catchError(error => {
        console.error('XHR Failed for getObjectsFromSameProductionSequence', error);
        throw error;
      })
    );
  }

  getObjectsWithTextMatches(descId: string): Observable<any> {
    const url = `${this.directoryPrefix}/api/object/${descId}/objects_with_text_matches`;
    
    return this.http.get(url).pipe(
      map((response: any) => this.createBlakeObject(response.results)),
      catchError(error => {
        console.error('XHR Failed for getObjectsWithTextMatches', error);
        throw error;
      })
    );
  }

  getSupplementalObjects(descId: string): Observable<any> {
    const url = `${this.directoryPrefix}/api/object/${descId}/supplemental_objects`;
    
    return this.http.get(url).pipe(
      map((response: any) => this.createBlakeObject(response.results)),
      catchError(error => {
        console.error('XHR Failed for getSupplementalObjects', error);
        throw error;
      })
    );
  }

  getTextuallyReferencedMaterial(descId: string): Observable<TextuallyReferencedMaterial> {
    const url = `${this.directoryPrefix}/api/object/${descId}/textually_referenced_materials`;
    
    return this.http.get(url).pipe(
      map((response: any) => ({
        objects: response.objects?.length ? this.createBlakeObject(response.objects) : [],
        copies: response.copies?.length ? this.createBlakeObject(response.copies) : [],
        works: response.works?.length ? this.createBlakeObject(response.works) : []
      })),
      catchError(error => {
        console.error('XHR Failed for getTextuallyReferencedMaterial', error);
        throw error;
      })
    );
  }

  // Copy methods
  getCopy(copyId: string): Observable<any> {
    const url = `${this.directoryPrefix}/api/copy/${copyId}`;
    
    return this.http.get(url).pipe(
      map(response => this.createBlakeCopy(response)),
      catchError(error => {
        console.error('XHR Failed for getCopy', error);
        throw error;
      })
    );
  }

  getCopies(copyIds: string[]): Observable<any> {
    const url = `${this.directoryPrefix}/api/copy/`;
    const params = new HttpParams().set('bad_ids', copyIds.join(','));
    
    return this.http.get(url, { params }).pipe(
      map((response: any) => this.createBlakeCopy(response.results)),
      catchError(error => {
        console.error('XHR Failed for getCopies: multi', error);
        throw error;
      })
    );
  }

  getObjectsForCopy(copyId: string): Observable<any> {
    const url = `${this.directoryPrefix}/api/copy/${copyId}/objects`;
    
    return this.http.get(url).pipe(
      map((response: any) => this.createBlakeObject(response.results)),
      catchError(error => {
        console.error('XHR Failed for getObjectsForCopy', error);
        console.error('Requesting:', url);
        throw error;
      })
    );
  }

  // Work methods
  getWork(workId: string): Observable<any> {
    const url = `${this.directoryPrefix}/api/work/${workId}`;
    
    return this.http.get(url).pipe(
      map(response => this.createBlakeWork(response)),
      catchError(error => {
        console.error('XHR Failed for getWork', error);
        throw error;
      })
    );
  }

  getWorks(): Observable<any> {
    const url = `${this.directoryPrefix}/api/work/`;
    
    return this.http.get(url).pipe(
      map((response: any) => this.createBlakeWork(response.results)),
      catchError(error => {
        console.error('XHR Failed for getWorks: multi', error);
        throw error;
      })
    );
  }

  getCopiesForWork(workId: string): Observable<any> {
    const url = `${this.directoryPrefix}/api/work/${workId}/copies`;
    
    return this.http.get(url).pipe(
      map((response: any) => this.createBlakeCopy(response.results)),
      catchError(error => {
        console.error('XHR Failed for getCopies: multi', error);
        throw error;
      })
    );
  }

  getFeaturedWorks(): Observable<any> {
    const url = `${this.directoryPrefix}/api/featured_work/`;
    
    return this.http.get(url).pipe(
      map((response: any) => response.results),
      catchError(error => {
        console.error('XHR Failed for getWorks: multi', error);
        throw error;
      })
    );
  }

  // Exhibit methods
  getExhibit(exhibitId: string): Observable<any> {
    const url = `${this.directoryPrefix}/api/exhibit/${exhibitId}`;
    
    return this.http.get(url).pipe(
      map(response => this.createBlakeExhibit(response)),
      catchError(error => {
        console.error('XHR Failed for getObjects: multi', error);
        throw error;
      })
    );
  }

  getImagesForExhibit(exhibitId: string): Observable<any> {
    const url = `${this.directoryPrefix}/api/exhibit-images/${exhibitId}`;
    
    return this.http.get(url).pipe(
      map((response: any) => this.createBlakeExhibitImage(response.results)),
      catchError(error => {
        console.error('XHR Failed for getImagesForExhibit: multi', exhibitId, error);
        throw error;
      })
    );
  }

  getCaptionsForImage(exhibitId: string, imageId: string): Observable<any> {
    const url = `${this.directoryPrefix}/api/exhibit-captions/${exhibitId}/${imageId}`;
    
    return this.http.get(url).pipe(
      map(response => this.createBlakeExhibitCaption(response)),
      catchError(error => {
        console.error('XHR Failed for getCaptionsForImage: multi', error);
        throw error;
      })
    );
  }

  // Preview methods
  getPreview(previewId: string): Observable<any> {
    const url = `${this.directoryPrefix}/api/preview/${previewId}`;
    
    return this.http.get(url).pipe(
      map(response => this.createBlakePreview(response)),
      catchError(error => {
        console.error('XHR Failed for getObjects: multi', error);
        throw error;
      })
    );
  }

  getImagesForPreview(previewId: string): Observable<any> {
    const url = `${this.directoryPrefix}/api/preview-images/${previewId}`;
    
    return this.http.get(url).pipe(
      map((response: any) => this.createBlakePreviewImage(response.results)),
      catchError(error => {
        console.error('XHR Failed for getImagesForPreview: multi', previewId, error);
        throw error;
      })
    );
  }

  // State management methods
  setSelectedWork(workId: string): Observable<void> {
    return combineLatest([
      this.getWork(workId),
      this.getCopiesForWork(workId)
    ]).pipe(
      tap(([work, copies]) => {
        this.blakeData.work = work;
        this.blakeData.workCopies = copies;
        this.setRelatedWorkObjectLinks();
        
        if (work.virtual === true) {
          return this.getObjectsForCopy(this.blakeData.workCopies[0].bad_id).pipe(
            tap(data => {
              this.blakeData.workCopies = data;
              
              if (work.bad_id === 'letters' || work.bad_id === 'shakespearewc') {
                const objectGroup: any = {};
                const objectArray: any[] = [];
                
                this.blakeData.workCopies.forEach((obj: any) => {
                  if (!objectGroup[obj.object_group]) {
                    objectGroup[obj.object_group] = obj;
                  }
                });
                
                Object.values(objectGroup).forEach(v => {
                  objectArray.push(v);
                });
                
                this.blakeData.workCopies = objectArray;
              } else {
                this.blakeData.workCopies = this.numberVirtualWorkObjects(this.blakeData.workCopies);
              }
            })
          ).subscribe();
        }
      }),
      map(() => void 0)
    );
  }

  setRelatedWorkObjectLinks(): Observable<void> {
    if (this.blakeData.work.related_works) {
      const relatedWorkObjects = this.blakeData.work.related_works.filter((obj: any) => 
        obj.type === 'object' && obj.link
      );
      
      if (relatedWorkObjects.length > 0) {
        const objectIds = relatedWorkObjects.map((obj: any) => obj.link);
        
        return this.getObjects(objectIds).pipe(
          tap(data => {
            this.blakeData.work.related_works.forEach((obj: any, key: number) => {
              if (obj.type === 'object' && obj.link) {
                const matchingObject = data.filter((o: any) => o.desc_id === obj.link);
                this.blakeData.work.related_works[key].link = `/copy/${matchingObject[0].copy_bad_id}?descId=${obj.link}`;
              }
            });
          }),
          map(() => void 0)
        );
      }
    }
    
    return of(void 0);
  }

  setWorkNoCopies(workId: string): Observable<void> {
    return this.getWork(workId).pipe(
      tap(data => {
        this.blakeData.work = data;
      }),
      map(() => void 0)
    );
  }

  setSelectedCopy(copyId: string, descId?: string): Observable<void> {
    const workBadMatch = copyId.indexOf('.');
    const workId = workBadMatch > 0 ? copyId.substring(0, workBadMatch) : copyId;
    
    return combineLatest([
      this.getCopy(copyId),
      this.getObjectsForCopy(copyId),
      this.setSelectedWork(workId)
    ]).pipe(
      tap(([copy, copyObjects]) => {
        this.blakeData.copy = copy;
        this.blakeData.copyObjects = copyObjects;
        
        console.log(this.blakeData.copyObjects);
        
        // Programmatically order objects if "copy" is a virtual group
        if (this.blakeData.work.virtual === true && 
            this.blakeData.work.bad_id !== 'letters' && 
            this.blakeData.work.bad_id !== 'shakespearewc') {
          this.blakeData.copyObjects = this.numberVirtualWorkObjects(this.blakeData.copyObjects);
        }
        
        // Set the selected object
        if (descId) {
          this.getObject(descId).subscribe(data => {
            this.changeObject(data);
          });
        } else {
          this.changeObject(this.blakeData.copyObjects[0]);
        }
      }),
      map(() => void 0)
    );
  }

  numberVirtualWorkObjects(objects: any[]): any[] {
    let inc = 1;
    objects.forEach((obj: any) => {
      if (!obj.supplemental) {
        obj.full_object_id = `Object ${inc} ${obj.full_object_id.replace(/object [\d]+/gi, '')}`;
        inc++;
      }
    });
    return objects;
  }

  setSelectedObject(descId: string): Observable<void> {
    return this.getObject(descId).pipe(
      tap(obj => {
        this.changeObject(obj);
      }),
      map(() => void 0)
    );
  }

  setFromSameX(object: any): Observable<void> {
    if (object.matrix !== undefined) {
      return of(void 0);
    }
    
    object.matrix = {};
    object.sequence = {};
    object.motif = {};
    object.supplemental_objects = {};
    object.textmatch = {};
    
    const descIdForSuppQuery = object.supplemental ? object.supplemental : object.desc_id;
    
    return combineLatest([
      this.getObjectsFromSameMatrix(object.desc_id),
      this.getObjectsFromSameProductionSequence(object.desc_id),
      this.getObjectsWithSameMotif(object.desc_id),
      this.getSupplementalObjects(descIdForSuppQuery),
      this.getTextuallyReferencedMaterial(object.desc_id),
      this.getObjectsWithTextMatches(object.desc_id)
    ]).pipe(
      tap(([matrix, sequence, motif, supplementalObjects, textRef, textMatch]) => {
        object.matrix = this.createBlakeObject(matrix);
        object.sequence = this.createBlakeObject(sequence);
        object.motif = this.createBlakeObject(motif);
        object.text_ref = textRef;
        object.supplemental_objects = this.createBlakeObject(supplementalObjects);
        object.textmatch = this.createBlakeObject(textMatch);
      }),
      map(() => void 0)
    );
  }

  changeObject(object: any): Observable<void> {
    return this.setFromSameX(object).pipe(
      tap(() => {
        this.blakeData.object = object;
        
        if (!object.supplemental) {
          // Update URL search parameters
          const target = '#' + object.desc_id.replace(/\./g, '-');
          
          // Broadcast events for AngularJS compatibility
          this.broadcastEvent('viewSubMenu::readingMode', { target });
        }
        
        this.broadcastEvent('change::selectedObject');
      }),
      map(() => void 0)
    );
  }

  changeCopy(copyId: string, descId?: string): Observable<void> {
    this.blakeData.fragment_pairs = [];
    
    return this.setSelectedCopy(copyId, descId).pipe(
      tap(() => {
        // Update location for AngularJS compatibility
        // These would be handled by Angular Router in full Angular app
      }),
      map(() => void 0)
    );
  }

  /**
   * Get the currently selected object
   */
  getCurrentObject(): any {
    return this.blakeData.object || null;
  }

  /**
   * Get the currently selected copy
   */
  getCurrentCopy(): any {
    return this.blakeData.copy || null;
  }

  setSelectedExhibit(exhibitId: string): Observable<void> {
    return this.getExhibit(exhibitId).pipe(
      tap(exhibit => {
        this.blakeData.exhibit = exhibit;
      }),
      map(() => void 0)
    );
  }

  setSelectedPreview(previewId: string): Observable<void> {
    return this.getPreview(previewId).pipe(
      tap(preview => {
        this.blakeData.preview = preview;
      }),
      map(() => void 0)
    );
  }

  // Factory methods for creating Blake objects
  // These would typically use actual factory classes
  private createBlakeObject(data: any): any {
    // TODO: Implement proper BlakeObject factory
    return data;
  }

  private createBlakeCopy(data: any): any {
    // TODO: Implement proper BlakeCopy factory
    return data;
  }

  private createBlakeWork(data: any): any {
    // TODO: Implement proper BlakeWork factory
    return data;
  }

  private createBlakeFragmentPair(data: any): any {
    // TODO: Implement proper BlakeFragmentPair factory
    return data;
  }

  private createBlakeExhibit(data: any): any {
    // TODO: Implement proper BlakeExhibit factory
    return data;
  }

  private createBlakeExhibitImage(data: any): any {
    // TODO: Implement proper BlakeExhibitImage factory
    return data;
  }

  private createBlakeExhibitCaption(data: any): any {
    // TODO: Implement proper BlakeExhibitCaption factory
    return data;
  }

  private createBlakePreview(data: any): any {
    // TODO: Implement proper BlakePreview factory
    return data;
  }

  private createBlakePreviewImage(data: any): any {
    // TODO: Implement proper BlakePreviewImage factory
    return data;
  }

  // Helper method to broadcast events for AngularJS compatibility
  private broadcastEvent(eventName: string, data?: any): void {
    const $rootScope = (window as any).$rootScope;
    if ($rootScope && $rootScope.$broadcast) {
      $rootScope.$broadcast(eventName, data);
    }
    
    // Also emit custom DOM events for broader compatibility
    const event = new CustomEvent(eventName, { detail: data });
    window.dispatchEvent(event);
  }
}