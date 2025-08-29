import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap, finalize } from 'rxjs/operators';
import { LoadingService } from './loading.service';
import { CacheService } from './cache.service';

export interface SearchConfig {
  searchString: string;
  useCompDate: boolean;
  usePrintDate: boolean;
  searchAllFields: boolean;
  searchTitle: boolean;
  searchText: boolean;
  searchNotes: boolean;
  searchImageDescriptions: boolean;
  searchImageKeywords: boolean;
  searchWorks: boolean;
  searchCopies: boolean;
  searchAllTypes: boolean;
  searchIlluminatedBooks: boolean;
  searchCommercialBookIllustrations: boolean;
  searchCopyInformation: boolean;
  searchWorkInformation: boolean;
  searchSeparatePrints: boolean;
  searchDrawingsPaintings: boolean;
  searchManuscripts: boolean;
  searchRelatedMaterials: boolean;
  minDate: number;
  maxDate: number;
}

export interface SearchState {
  selectedWork: number;
  selectedCopy: number;
  selectedObject: number;
  searching: boolean;
  queryString: string;
  searchingFromFilter: boolean;
  persistingQueryString: string;
  objectResults: any[];
  copyResults: any[];
  workResults: any[];
  searchConfig: SearchConfig;
  searchError?: string | null;
}

export interface SearchResult {
  objects?: any[];
  copies?: any[];
  works?: any[];
  totalCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private readonly SEARCH_TYPES = [
    'searchIlluminatedBooks',
    'searchCommercialBookIllustrations', 
    'searchSeparatePrints',
    'searchDrawingsPaintings',
    'searchManuscripts',
    'searchRelatedMaterials'
  ];

  private readonly STOP_WORDS = [
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
    "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
    "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't",
    "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
    "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
    "have", "haven't", "he", "he'd", "he'll", "he's", "her", "here", "here's",
    "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd",
    "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's",
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

  private stateSubject = new BehaviorSubject<SearchState>(this.getInitialState());
  
  // Observable for reactive updates
  state$ = this.stateSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private loadingService: LoadingService,
    private cacheService: CacheService
  ) {}

  private getInitialState(): SearchState {
    return {
      selectedWork: -1,
      selectedCopy: 0,
      selectedObject: 0,
      searching: false,
      queryString: '',
      searchingFromFilter: false,
      persistingQueryString: '',
      objectResults: [],
      copyResults: [],
      workResults: [],
      searchConfig: this.getDefaultSearchConfig()
    };
  }

  private getDefaultSearchConfig(): SearchConfig {
    return {
      searchString: '',
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
      searchWorkInformation: false,
      searchSeparatePrints: false,
      searchDrawingsPaintings: false,
      searchManuscripts: false,
      searchRelatedMaterials: false,
      minDate: 1772,
      maxDate: 1827
    };
  }

  /**
   * Get current search state
   */
  get currentState(): SearchState {
    return this.stateSubject.value;
  }

  /**
   * Update state with partial changes
   */
  private updateState(changes: Partial<SearchState>): void {
    const newState = { ...this.currentState, ...changes };
    this.stateSubject.next(newState);
  }

  /**
   * Get search types
   */
  get searchTypes(): string[] {
    return [...this.SEARCH_TYPES];
  }

  /**
   * Get stop words
   */
  get stopWords(): string[] {
    return [...this.STOP_WORDS];
  }

  /**
   * Reset search results
   */
  resetResults(): void {
    this.updateState({
      objectResults: [],
      copyResults: [],
      workResults: []
    });
  }

  /**
   * Reset search filters to defaults
   */
  resetFilters(): void {
    this.updateState({
      searchConfig: this.getDefaultSearchConfig()
    });
  }

  /**
   * Reset entire search state
   */
  resetSearch(): void {
    this.stateSubject.next(this.getInitialState());
  }

  /**
   * Set search query string
   */
  setQueryString(queryString: string): void {
    this.updateState({ queryString });
  }

  /**
   * Set persisting query string
   */
  setPersistingQueryString(queryString: string): void {
    this.updateState({ persistingQueryString: queryString });
  }

  /**
   * Set searching state
   */
  setSearching(searching: boolean): void {
    this.updateState({ searching });
  }

  /**
   * Set searching from filter state
   */
  setSearchingFromFilter(searchingFromFilter: boolean): void {
    this.updateState({ searchingFromFilter });
  }

  /**
   * Update search configuration
   */
  updateSearchConfig(config: Partial<SearchConfig>): void {
    const currentConfig = this.currentState.searchConfig;
    const newConfig = { ...currentConfig, ...config };
    this.updateState({ searchConfig: newConfig });
  }

  /**
   * Set search results
   */
  setResults(results: SearchResult): void {
    this.updateState({
      objectResults: results.objects || [],
      copyResults: results.copies || [],
      workResults: results.works || []
    });
  }

  /**
   * Add to object results
   */
  addObjectResults(objects: any[]): void {
    const currentResults = this.currentState.objectResults;
    this.updateState({
      objectResults: [...currentResults, ...objects]
    });
  }

  /**
   * Set selected work, copy, and object indices
   */
  setSelected(work: number, copy: number = 0, object: number = 0): void {
    this.updateState({
      selectedWork: work,
      selectedCopy: copy,
      selectedObject: object
    });
  }

  /**
   * Set selected work
   */
  setSelectedWork(selectedWork: number): void {
    this.updateState({ selectedWork });
  }

  /**
   * Set selected copy
   */
  setSelectedCopy(selectedCopy: number): void {
    this.updateState({ selectedCopy });
  }

  /**
   * Set selected object
   */
  setSelectedObject(selectedObject: number): void {
    this.updateState({ selectedObject });
  }

  /**
   * Check if search has results
   */
  hasResults(): boolean {
    const state = this.currentState;
    return state.objectResults.length > 0 || 
           state.copyResults.length > 0 || 
           state.workResults.length > 0;
  }

  /**
   * Get total result count
   */
  getTotalResultCount(): number {
    const state = this.currentState;
    return state.objectResults.length + 
           state.copyResults.length + 
           state.workResults.length;
  }

  /**
   * Check if currently searching
   */
  isSearching(): boolean {
    return this.currentState.searching;
  }

  /**
   * Get query string (processed search string)
   */
  get queryString(): string {
    return this.currentState.queryString;
  }

  /**
   * Set search string
   */
  setSearchString(searchString: string): void {
    this.updateSearchConfig({ searchString });
  }

  /**
   * Get results by type
   */
  getResults(type: string): any[] {
    const results = (this.currentState as any).objectResults;
    return results[type] || [];
  }

  /**
   * Get copy results by type
   */
  getCopyResults(type: string): any[] {
    const results = (this.currentState as any).copyResults;
    return results[type] || [];
  }

  /**
   * Get work results by type
   */
  getWorkResults(type: string): any[] {
    const results = (this.currentState as any).workResults;
    return results[type] || [];
  }

  /**
   * Search configuration checks
   */
  shouldSearchTitle(): boolean {
    return this.currentState.searchConfig.searchTitle;
  }

  shouldSearchText(): boolean {
    return this.currentState.searchConfig.searchText;
  }

  shouldSearchImageDescriptions(): boolean {
    return this.currentState.searchConfig.searchImageDescriptions;
  }

  shouldSearchImageKeywords(): boolean {
    return this.currentState.searchConfig.searchImageKeywords;
  }

  shouldSearchNotes(): boolean {
    return this.currentState.searchConfig.searchNotes;
  }

  shouldSearchCopyInformation(): boolean {
    return this.currentState.searchConfig.searchCopyInformation;
  }

  shouldSearchWorkInformation(): boolean {
    return this.currentState.searchConfig.searchWorkInformation;
  }

  shouldSearchAllFields(): boolean {
    return this.currentState.searchConfig.searchAllFields;
  }

  /**
   * Remove stop words from search string
   */
  removeStopWords(): void {
    const searchConfig = this.currentState.searchConfig;
    if (!searchConfig.searchString) return;

    const stopWords = [
      'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
      'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
      'to', 'was', 'will', 'with'
    ];

    const words = searchConfig.searchString.toLowerCase().split(/\s+/);
    const filteredWords = words.filter(word => !stopWords.includes(word.trim()));
    
    this.updateState({ 
      queryString: filteredWords.join(' '),
      searchConfig: { ...searchConfig }
    });
  }

  /**
   * Perform search with current configuration
   */
  performSearch(): void {
    this.updateState({ searching: true });
    
    // Remove stop words and set query string
    this.removeStopWords();
    
    // Trigger actual search implementation
    this.triggerSearch();
  }
  
  /**
   * Trigger the actual search operation
   */
  triggerSearch(): void {
    const config = this.currentState.searchConfig;
    const queryString = this.currentState.queryString;
    
    if (!queryString && !this.hasAdvancedFilters()) {
      this.updateState({ searching: false });
      return;
    }
    
    // Prepare search parameters
    const searchParams = this.buildSearchParams();
    
    // Execute parallel searches for objects, copies, and works
    this.executeSearch(searchParams);
  }
  
  /**
   * Execute search requests to API endpoints
   */
  private executeSearch(searchParams: any): void {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    
    // Clear previous errors
    this.loadingService.clearError('search-objects');
    this.loadingService.clearError('search-copies');
    this.loadingService.clearError('search-works');
    this.setSearchError(null);
    
    // Create cache keys for each search type
    const objectCacheKey = this.cacheService.createKey('search-objects', this.cacheService.createSearchKey(searchParams));
    const copyCacheKey = this.cacheService.createKey('search-copies', this.cacheService.createSearchKey(searchParams));
    const workCacheKey = this.cacheService.createKey('search-works', this.cacheService.createSearchKey(searchParams));
    
    // Execute all three searches with loading states and caching
    const objectSearch = this.loadingService.withLoading(
      'search-objects',
      this.cacheService.get(
        objectCacheKey,
        this.http.post<any>('/api/query_objects', searchParams, { headers }),
        2 * 60 * 1000 // Cache for 2 minutes
      )
    );
    
    const copySearch = this.loadingService.withLoading(
      'search-copies', 
      this.cacheService.get(
        copyCacheKey,
        this.http.post<any>('/api/query_copies', searchParams, { headers }),
        2 * 60 * 1000 // Cache for 2 minutes
      )
    );
    
    const workSearch = this.loadingService.withLoading(
      'search-works',
      this.cacheService.get(
        workCacheKey,
        this.http.post<any>('/api/query_works', searchParams, { headers }),
        2 * 60 * 1000 // Cache for 2 minutes
      )
    );
    
    let completedSearches = 0;
    const totalSearches = 3;
    
    // Handle object search
    objectSearch.pipe(
      catchError(error => {
        console.error('Object search failed:', error);
        this.setSearchError('Object search failed: ' + this.formatErrorMessage(error));
        return of([]);
      }),
      tap(results => {
        this.updateState({ objectResults: results || [] });
      }),
      finalize(() => {
        completedSearches++;
        if (completedSearches === totalSearches) {
          this.updateState({ searching: false });
        }
      })
    ).subscribe();
    
    // Handle copy search
    copySearch.pipe(
      catchError(error => {
        console.error('Copy search failed:', error);
        this.setSearchError('Copy search failed: ' + this.formatErrorMessage(error));
        return of([]);
      }),
      tap(results => {
        this.updateState({ copyResults: results || [] });
      }),
      finalize(() => {
        completedSearches++;
        if (completedSearches === totalSearches) {
          this.updateState({ searching: false });
        }
      })
    ).subscribe();
    
    // Handle work search
    workSearch.pipe(
      catchError(error => {
        console.error('Work search failed:', error);
        this.setSearchError('Work search failed: ' + this.formatErrorMessage(error));
        return of([]);
      }),
      tap(results => {
        this.updateState({ workResults: results || [] });
      }),
      finalize(() => {
        completedSearches++;
        if (completedSearches === totalSearches) {
          this.updateState({ searching: false });
        }
      })
    ).subscribe();
  }
  
  /**
   * Format error message for display
   */
  private formatErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    if (error?.status) {
      return `HTTP ${error.status}: ${error.statusText || 'Unknown error'}`;
    }
    return 'Unknown error occurred';
  }
  
  /**
   * Build search parameters object for Blake Archive API
   */
  private buildSearchParams(): any {
    const config = this.currentState.searchConfig;
    const params: any = {
      // Core search parameters
      searchString: config.searchString || '',
      queryString: this.currentState.queryString || '',
      
      // Date filtering
      useCompDate: config.useCompDate,
      usePrintDate: config.usePrintDate,
      minDate: config.minDate,
      maxDate: config.maxDate,
      
      // Field search options
      searchAllFields: config.searchAllFields,
      searchTitle: config.searchTitle,
      searchText: config.searchText,
      searchNotes: config.searchNotes,
      searchImageDescriptions: config.searchImageDescriptions,
      searchImageKeywords: config.searchImageKeywords,
      searchCopyInformation: config.searchCopyInformation,
      searchWorkInformation: config.searchWorkInformation,
      
      // Type filtering
      searchAllTypes: config.searchAllTypes,
      searchIlluminatedBooks: config.searchIlluminatedBooks,
      searchCommercialBookIllustrations: config.searchCommercialBookIllustrations,
      searchSeparatePrints: config.searchSeparatePrints,
      searchDrawingsPaintings: config.searchDrawingsPaintings,
      searchManuscripts: config.searchManuscripts,
      searchRelatedMaterials: config.searchRelatedMaterials,
      
      // Additional search parameters
      searchWorks: config.searchWorks,
      searchCopies: config.searchCopies
    };
    
    return params;
  }
  
  /**
   * Check if any advanced filters are enabled
   */
  private hasAdvancedFilters(): boolean {
    const config = this.currentState.searchConfig;
    return config.minDate !== 1772 || 
           config.maxDate !== 1827 ||
           !config.searchAllFields ||
           !config.searchAllTypes ||
           config.useCompDate !== true ||
           config.usePrintDate !== false;
  }
  
  /**
   * Clear all search results
   */
  clearResults(): void {
    this.updateState({
      objectResults: [],
      copyResults: [],
      workResults: [],
      selectedWork: -1,
      selectedCopy: 0,
      selectedObject: 0
    });
  }
  
  /**
   * Get search error state
   */
  getSearchError(): string | null {
    return this.currentState.searchError || null;
  }
  
  /**
   * Set search error state
   */
  setSearchError(error: string | null): void {
    this.updateState({ searchError: error } as any);
  }

  /**
   * Alias for performSearch for compatibility
   */
  search(): void {
    this.performSearch();
  }

  /**
   * Check if a word is a stop word
   */
  isStopWord(word: string): boolean {
    return this.STOP_WORDS.includes(word.toLowerCase());
  }

  /**
   * Filter stop words from query
   */
  filterStopWords(query: string): string[] {
    return query.toLowerCase()
                .split(/\s+/)
                .filter(word => word.length > 0 && !this.isStopWord(word));
  }

  /**
   * Prepare search query by removing stop words
   */
  prepareSearchQuery(query: string): string {
    const filteredWords = this.filterStopWords(query);
    return filteredWords.join(' ');
  }

  /**
   * Check if any search type is selected
   */
  hasSelectedSearchTypes(): boolean {
    const config = this.currentState.searchConfig;
    return this.SEARCH_TYPES.some(type => (config as any)[type]);
  }

  /**
   * Get selected search types
   */
  getSelectedSearchTypes(): string[] {
    const config = this.currentState.searchConfig;
    return this.SEARCH_TYPES.filter(type => (config as any)[type]);
  }

  /**
   * Toggle search type selection
   */
  toggleSearchType(type: string, selected?: boolean): void {
    const config = this.currentState.searchConfig;
    if (this.SEARCH_TYPES.includes(type)) {
      const newValue = selected !== undefined ? selected : !(config as any)[type];
      this.updateSearchConfig({ [type]: newValue } as any);
    }
  }

  /**
   * Set all search types
   */
  setAllSearchTypes(selected: boolean): void {
    const updates: any = { searchAllTypes: selected };
    this.SEARCH_TYPES.forEach(type => {
      updates[type] = selected;
    });
    this.updateSearchConfig(updates);
  }

  /**
   * Export current state (for debugging/persistence)
   */
  exportState(): SearchState {
    return { ...this.currentState };
  }

  /**
   * Import state (for restoration)
   */
  importState(state: Partial<SearchState>): void {
    const newState = { ...this.currentState, ...state };
    this.stateSubject.next(newState);
  }
  
  /**
   * Navigate to previous result
   */
  previousResult(): void {
    const state = this.currentState;
    if (state.selectedObject > 0) {
      this.updateState({
        selectedObject: state.selectedObject - 1
      });
    } else if (state.selectedCopy > 0) {
      this.updateState({
        selectedCopy: state.selectedCopy - 1,
        selectedObject: 0
      });
    } else if (state.selectedWork > 0) {
      this.updateState({
        selectedWork: state.selectedWork - 1,
        selectedCopy: 0,
        selectedObject: 0
      });
    }
  }
  
  /**
   * Navigate to next result
   */
  nextResult(): void {
    const state = this.currentState;
    const maxObjects = state.objectResults.length;
    const maxCopies = state.copyResults.length;
    const maxWorks = state.workResults.length;
    
    if (state.selectedObject < maxObjects - 1) {
      this.updateState({
        selectedObject: state.selectedObject + 1
      });
    } else if (state.selectedCopy < maxCopies - 1) {
      this.updateState({
        selectedCopy: state.selectedCopy + 1,
        selectedObject: 0
      });
    } else if (state.selectedWork < maxWorks - 1) {
      this.updateState({
        selectedWork: state.selectedWork + 1,
        selectedCopy: 0,
        selectedObject: 0
      });
    }
  }
  
  /**
   * Show objects view
   */
  showObjects(): void {
    // Update view state - in pure Angular this would be handled by router or view service
    const $rootScope = (window as any).$rootScope;
    if ($rootScope) {
      $rootScope.view = { scope: 'image' };
    }
  }
  
  /**
   * Show text view
   */
  showText(): void {
    // Update view state - in pure Angular this would be handled by router or view service
    const $rootScope = (window as any).$rootScope;
    if ($rootScope) {
      $rootScope.view = { scope: 'text' };
    }
  }
  
  /**
   * Get selected result object
   */
  getSelectedResult(): any {
    const state = this.currentState;
    
    if (state.objectResults.length > 0 && state.selectedObject >= 0) {
      return state.objectResults[state.selectedObject];
    }
    
    if (state.copyResults.length > 0 && state.selectedCopy >= 0) {
      return state.copyResults[state.selectedCopy];
    }
    
    if (state.workResults.length > 0 && state.selectedWork >= 0) {
      return state.workResults[state.selectedWork];
    }
    
    return null;
  }
  
  /**
   * Check if there are previous results
   */
  hasPreviousResult(): boolean {
    const state = this.currentState;
    return state.selectedObject > 0 || state.selectedCopy > 0 || state.selectedWork > 0;
  }
  
  /**
   * Check if there are next results
   */
  hasNextResult(): boolean {
    const state = this.currentState;
    const maxObjects = state.objectResults.length;
    const maxCopies = state.copyResults.length;
    const maxWorks = state.workResults.length;
    
    return state.selectedObject < maxObjects - 1 ||
           state.selectedCopy < maxCopies - 1 ||
           state.selectedWork < maxWorks - 1;
  }
  
  /**
   * Get current result position info
   */
  getCurrentResultPosition(): { current: number; total: number } {
    const state = this.currentState;
    const totalResults = this.getTotalResultCount();
    
    let currentPosition = 0;
    
    // Calculate current position across all result types
    currentPosition += state.selectedWork * (state.copyResults.length || 1) * (state.objectResults.length || 1);
    currentPosition += state.selectedCopy * (state.objectResults.length || 1);
    currentPosition += state.selectedObject;
    
    return {
      current: currentPosition + 1,
      total: totalResults
    };
  }
}