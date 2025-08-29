import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SearchService } from '../services/search.service';
import { SearchResultsComponent } from './search-results.component';
import { LoadingIndicatorComponent } from './loading-indicator.component';
import { LoadingSpinnerComponent } from './loading-spinner.component';
import { SkeletonLoaderComponent } from './skeleton-loader.component';
import { ErrorBoundaryComponent } from './error-boundary.component';
import { DateSearchComponent } from './date-search.component';
import { FieldSearchComponent } from './field-search.component';
import { MediumSearchComponent } from './medium-search.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule, 
    SearchResultsComponent, 
    LoadingIndicatorComponent,
    DateSearchComponent,
    FieldSearchComponent,
    MediumSearchComponent,
    LoadingSpinnerComponent,
    SkeletonLoaderComponent,
    ErrorBoundaryComponent
  ],
  template: `
    <div class="navbar navbar-default" id="searchOptions">
      <div class="container-fluid">
        <div>
          <ul class="nav navbar-nav">
            <app-date-search></app-date-search>
            <app-field-search></app-field-search>
            <app-medium-search></app-medium-search>
          </ul>
        </div>
      </div>
    </div>

    <div id="archive-tabs" role="tabpanel">
      <div class="container-fluid main" id="search">
        
        <!-- Loading state -->
        <app-error-boundary (onRetry)="retrySearch()">
          <app-loading-spinner 
            *ngIf="isSearching"
            text="Searching Blake Archive..."
            subText="This may take a few moments"
            [visible]="isSearching"
            layout="inline">
          </app-loading-spinner>
          
          <!-- Search skeleton while loading -->
          <app-skeleton-loader 
            *ngIf="isSearching" 
            type="list" 
            [items]="3"
            [showAvatar]="false"
            [showActions]="true">
          </app-skeleton-loader>
          
          <div *ngIf="!isSearching">
            <div 
              *ngIf="searchService.queryString === ''" 
              style="padding-top:20px; text-align:center; color:white"
            >
              Search string with stopwords removed: <span style="color:yellow">NULL</span>
            </div>
            
            <div 
              *ngIf="searchService.queryString !== ''" 
              style="padding-top:20px; text-align:center; color:white"
            >
              Search string with stopwords removed: <i style="color:yellow">{{ searchService.queryString }}</i>
            </div>

            <!-- Search results using the converted component -->
        <app-search-results 
          *ngIf="shouldShowTitleResults()"
          label="Title" 
          [results]="getTitleResults()"
          type="title" 
          tree="object">
        </app-search-results>
        
        <app-search-results 
          *ngIf="shouldShowTextResults()"
          label="Transcription" 
          [results]="getTextResults()"
          type="text" 
          tree="object">
        </app-search-results>
        
        <app-search-results 
          *ngIf="shouldShowDescriptionResults()"
          label="Illustration Description" 
          [results]="getDescriptionResults()"
          type="description" 
          tree="object">
        </app-search-results>
        
        <app-search-results 
          *ngIf="shouldShowTagResults()"
          label="Image Tag" 
          [results]="getTagResults()"
          type="tag" 
          tree="object">
        </app-search-results>
        
        <app-search-results 
          *ngIf="shouldShowNotesResults()"
          label="Editors' Note" 
          [results]="getNotesResults()"
          type="notes" 
          tree="object">
        </app-search-results>
        
        <app-search-results 
          *ngIf="shouldShowCopyInfoResults()"
          label="Copy/Set/Receipt/Work-in-Preview Information" 
          [results]="getCopyInfoResults()"
          type="copy-info" 
          tree="copy">
        </app-search-results>
        
        <app-search-results 
          *ngIf="shouldShowSourceResults()"
          label="Object-in-Virtual-Group Information" 
          [results]="getSourceResults()"
          type="source" 
          tree="object">
        </app-search-results>
        
        <app-search-results 
          *ngIf="shouldShowWorkInfoResults()"
          label="Work Information" 
          [results]="getWorkInfoResults()"
          type="work-info" 
          tree="work">
        </app-search-results>

            <div 
              *ngIf="!searchService.hasResults() && !searchService.isSearching() && searchService.queryString" 
              style="padding-bottom:20px; text-align:center; color:yellow"
            >
              NO RESULTS
            </div>
          </div>
        </app-error-boundary>

      </div>
    </div>
  `,
  styles: [`
    .search-results-section {
      margin: 20px 0;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    
    .search-result {
      padding: 5px;
      margin: 5px 0;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
    }

    .search-results-section h3 {
      color: white;
      margin-bottom: 10px;
    }
  `]
})
export class SearchComponent implements OnInit, OnDestroy {
  isSafari: boolean = false;
  isSearching: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public searchService: SearchService
  ) {
    this.isSafari = navigator.userAgent.search("Safari") >= 0 && 
                   navigator.userAgent.search("Chrome") < 0;
  }

  ngOnInit(): void {
    // Set global state
    this.setGlobalState();
    
    // Subscribe to route parameter changes
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['search']) {
          this.handleSearchParam(params['search']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Set global application state
   */
  private setGlobalState(): void {
    // In full Angular, these would be managed by services/state management
    (window as any).$rootScope = (window as any).$rootScope || {};
    const $rootScope = (window as any).$rootScope;
    
    $rootScope.worksNavState = false;
    $rootScope.showWorkTitle = false;
  }

  /**
   * Handle search parameter from URL
   */
  private handleSearchParam(searchParam: string): void {
    this.isSearching = true;
    this.searchService.setSearchString(searchParam);
    this.searchService.removeStopWords();
    
    // Start search and set timeout for loading state
    this.searchService.performSearch();
    
    // Since performSearch doesn't return a promise, use timeout
    setTimeout(() => {
      this.isSearching = false;
    }, 2000);
  }

  /**
   * Retry search on error
   */
  retrySearch(): void {
    const currentSearch = this.searchService.currentState.searchConfig.searchString;
    if (currentSearch) {
      this.handleSearchParam(currentSearch);
    }
  }


  // Result display methods
  shouldShowTitleResults(): boolean {
    return this.searchService.shouldSearchTitle() || this.searchService.shouldSearchAllFields();
  }

  shouldShowTextResults(): boolean {
    return this.searchService.shouldSearchText() || this.searchService.shouldSearchAllFields();
  }

  shouldShowDescriptionResults(): boolean {
    return this.searchService.shouldSearchImageDescriptions() || this.searchService.shouldSearchAllFields();
  }

  shouldShowTagResults(): boolean {
    return this.searchService.shouldSearchImageKeywords() || this.searchService.shouldSearchAllFields();
  }

  shouldShowNotesResults(): boolean {
    return this.searchService.shouldSearchNotes() || this.searchService.shouldSearchAllFields();
  }

  shouldShowCopyInfoResults(): boolean {
    return this.searchService.shouldSearchCopyInformation() || this.searchService.shouldSearchAllFields();
  }

  shouldShowSourceResults(): boolean {
    return this.searchService.shouldSearchCopyInformation() || this.searchService.shouldSearchAllFields();
  }

  shouldShowWorkInfoResults(): boolean {
    return this.searchService.shouldSearchWorkInformation() || this.searchService.shouldSearchAllFields();
  }

  // Result getter methods - these extract specific result types from the API response
  getTitleResults(): any[] {
    const objectResults = this.searchService.currentState.objectResults;
    return this.extractResultsByType(objectResults, 'title');
  }

  getTextResults(): any[] {
    const objectResults = this.searchService.currentState.objectResults;
    return this.extractResultsByType(objectResults, 'text');
  }

  getDescriptionResults(): any[] {
    const objectResults = this.searchService.currentState.objectResults;
    return this.extractResultsByType(objectResults, 'description');
  }

  getTagResults(): any[] {
    const objectResults = this.searchService.currentState.objectResults;
    return this.extractResultsByType(objectResults, 'tag');
  }

  getNotesResults(): any[] {
    const objectResults = this.searchService.currentState.objectResults;
    return this.extractResultsByType(objectResults, 'notes');
  }

  getCopyInfoResults(): any[] {
    const copyResults = this.searchService.currentState.copyResults;
    return this.extractResultsByType(copyResults, 'copy-info');
  }

  getSourceResults(): any[] {
    const objectResults = this.searchService.currentState.objectResults;
    return this.extractResultsByType(objectResults, 'source');
  }

  getWorkInfoResults(): any[] {
    const workResults = this.searchService.currentState.workResults;
    return this.extractResultsByType(workResults, 'info');
  }

  /**
   * Extract results by type from the API response
   * The Blake Archive API returns results grouped by search type
   */
  private extractResultsByType(results: any[], type: string): any[] {
    if (!results || !Array.isArray(results)) {
      return [];
    }
    
    // If results is an object with type keys, return the specific type
    if (results.length === 1 && typeof results[0] === 'object' && results[0][type]) {
      return results[0][type] || [];
    }
    
    // Otherwise filter results by type or return all results
    return results.filter(result => !type || result.type === type || result.search_type === type) || results;
  }
}