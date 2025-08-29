import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, combineLatest } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, switchMap, catchError, tap } from 'rxjs/operators';
import { SearchService } from './search.service';

export interface SearchFilter {
  id: string;
  name: string;
  type: 'text' | 'select' | 'multiselect' | 'range' | 'date' | 'boolean';
  options?: SearchFilterOption[];
  value?: any;
  enabled: boolean;
}

export interface SearchFilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface SearchFacet {
  field: string;
  name: string;
  buckets: SearchFacetBucket[];
}

export interface SearchFacetBucket {
  key: string;
  doc_count: number;
  selected?: boolean;
}

export interface AdvancedSearchQuery {
  query: string;
  filters: { [key: string]: any };
  facets?: string[];
  sort?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  size?: number;
}

export interface AdvancedSearchResult {
  results: any[];
  total: number;
  facets: SearchFacet[];
  suggestions: string[];
  page: number;
  size: number;
  query: AdvancedSearchQuery;
  executionTime: number;
}

export interface SearchHistory {
  query: string;
  timestamp: Date;
  resultCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdvancedSearchService {
  private searchFiltersSubject = new BehaviorSubject<SearchFilter[]>([]);
  private searchResultsSubject = new BehaviorSubject<AdvancedSearchResult | null>(null);
  private searchHistorySubject = new BehaviorSubject<SearchHistory[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private suggestionsSubject = new BehaviorSubject<string[]>([]);

  // Public observables
  searchFilters$ = this.searchFiltersSubject.asObservable();
  searchResults$ = this.searchResultsSubject.asObservable();
  searchHistory$ = this.searchHistorySubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  suggestions$ = this.suggestionsSubject.asObservable();

  // Default filters configuration
  private defaultFilters: SearchFilter[] = [
    {
      id: 'work_type',
      name: 'Work Type',
      type: 'multiselect',
      options: [
        { value: 'illuminated_book', label: 'Illuminated Books' },
        { value: 'commercial_book_illustration', label: 'Commercial Book Illustrations' },
        { value: 'separate_plate', label: 'Separate Plates' },
        { value: 'drawing', label: 'Drawings' },
        { value: 'painting', label: 'Paintings' },
        { value: 'manuscript', label: 'Manuscripts' },
        { value: 'letter', label: 'Letters' }
      ],
      value: [],
      enabled: true
    },
    {
      id: 'composition_date',
      name: 'Composition Date',
      type: 'range',
      value: { min: 1757, max: 1827 },
      enabled: true
    },
    {
      id: 'medium',
      name: 'Medium',
      type: 'multiselect',
      options: [
        { value: 'etching', label: 'Etching' },
        { value: 'engraving', label: 'Engraving' },
        { value: 'relief_etching', label: 'Relief Etching' },
        { value: 'watercolor', label: 'Watercolor' },
        { value: 'pen_ink', label: 'Pen and Ink' },
        { value: 'pencil', label: 'Pencil' },
        { value: 'tempera', label: 'Tempera' }
      ],
      value: [],
      enabled: true
    },
    {
      id: 'institution',
      name: 'Institution',
      type: 'multiselect',
      options: [
        { value: 'british_museum', label: 'British Museum' },
        { value: 'tate', label: 'Tate Collection' },
        { value: 'fitzwilliam', label: 'Fitzwilliam Museum' },
        { value: 'huntington', label: 'Huntington Library' },
        { value: 'morgan', label: 'Morgan Library' },
        { value: 'yale', label: 'Yale Center for British Art' }
      ],
      value: [],
      enabled: true
    },
    {
      id: 'has_text',
      name: 'Has Transcription',
      type: 'boolean',
      value: null,
      enabled: true
    },
    {
      id: 'supplemental',
      name: 'Include Supplemental Views',
      type: 'boolean',
      value: false,
      enabled: true
    }
  ];

  constructor(
    private http: HttpClient,
    private searchService: SearchService
  ) {
    this.initializeFilters();
    this.loadSearchHistory();
  }

  /**
   * Initialize search filters
   */
  private initializeFilters(): void {
    this.searchFiltersSubject.next([...this.defaultFilters]);
  }

  /**
   * Perform advanced search
   */
  search(query: AdvancedSearchQuery): Observable<AdvancedSearchResult> {
    this.loadingSubject.next(true);
    const startTime = Date.now();

    // Build search parameters
    const searchParams = this.buildSearchParams(query);

    return this.http.post<any>('/api/advanced-search', searchParams).pipe(
      map(response => this.transformSearchResponse(response, query, startTime)),
      tap(result => {
        this.searchResultsSubject.next(result);
        this.addToSearchHistory(query.query, result.total);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('Advanced search error:', error);
        this.loadingSubject.next(false);
        // Fallback to basic search
        return this.fallbackSearch(query);
      })
    );
  }

  /**
   * Get search suggestions
   */
  getSuggestions(query: string): Observable<string[]> {
    if (!query || query.length < 2) {
      return of([]);
    }

    return this.http.get<any>(`/api/search-suggestions?q=${encodeURIComponent(query)}`).pipe(
      map(response => response.suggestions || []),
      tap(suggestions => this.suggestionsSubject.next(suggestions)),
      catchError(() => {
        // Fallback to local suggestions
        return of(this.getLocalSuggestions(query));
      })
    );
  }

  /**
   * Update filter value
   */
  updateFilter(filterId: string, value: any): void {
    const currentFilters = this.searchFiltersSubject.value;
    const updatedFilters = currentFilters.map(filter => 
      filter.id === filterId ? { ...filter, value } : filter
    );
    this.searchFiltersSubject.next(updatedFilters);
  }

  /**
   * Toggle filter enabled state
   */
  toggleFilter(filterId: string): void {
    const currentFilters = this.searchFiltersSubject.value;
    const updatedFilters = currentFilters.map(filter => 
      filter.id === filterId ? { ...filter, enabled: !filter.enabled } : filter
    );
    this.searchFiltersSubject.next(updatedFilters);
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    const clearedFilters = this.defaultFilters.map(filter => ({
      ...filter,
      value: Array.isArray(filter.value) ? [] : (filter.type === 'boolean' ? null : filter.value)
    }));
    this.searchFiltersSubject.next(clearedFilters);
  }

  /**
   * Get current active filters
   */
  getActiveFilters(): SearchFilter[] {
    return this.searchFiltersSubject.value.filter(filter => 
      filter.enabled && this.hasActiveValue(filter)
    );
  }

  /**
   * Export search results
   */
  exportResults(format: 'json' | 'csv' | 'xml' = 'json'): Observable<Blob> {
    const currentResults = this.searchResultsSubject.value;
    if (!currentResults) {
      return of(new Blob());
    }

    const exportData = this.formatExportData(currentResults, format);
    const blob = new Blob([exportData], { 
      type: this.getContentType(format) 
    });

    return of(blob);
  }

  /**
   * Save search query as preset
   */
  saveSearchPreset(name: string, query: AdvancedSearchQuery): void {
    const presets = this.getSearchPresets();
    presets[name] = query;
    localStorage.setItem('blake-search-presets', JSON.stringify(presets));
  }

  /**
   * Load search presets
   */
  getSearchPresets(): { [name: string]: AdvancedSearchQuery } {
    try {
      const saved = localStorage.getItem('blake-search-presets');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.warn('Error loading search presets:', e);
      return {};
    }
  }

  /**
   * Delete search preset
   */
  deleteSearchPreset(name: string): void {
    const presets = this.getSearchPresets();
    delete presets[name];
    localStorage.setItem('blake-search-presets', JSON.stringify(presets));
  }

  /**
   * Get search statistics
   */
  getSearchStats(): Observable<any> {
    return this.http.get('/api/search-stats').pipe(
      catchError(() => of({
        totalWorks: 0,
        totalObjects: 0,
        recentSearches: 0,
        popularTerms: []
      }))
    );
  }

  private buildSearchParams(query: AdvancedSearchQuery): any {
    const params: any = {
      q: query.query,
      page: query.page || 1,
      size: query.size || 20,
      sort: query.sort || 'relevance',
      sort_direction: query.sortDirection || 'desc'
    };

    // Add filters
    const activeFilters = this.getActiveFilters();
    activeFilters.forEach(filter => {
      if (this.hasActiveValue(filter)) {
        params[filter.id] = filter.value;
      }
    });

    // Add facets
    if (query.facets) {
      params.facets = query.facets.join(',');
    }

    return params;
  }

  private transformSearchResponse(response: any, query: AdvancedSearchQuery, startTime: number): AdvancedSearchResult {
    return {
      results: response.results || [],
      total: response.total || 0,
      facets: response.facets || [],
      suggestions: response.suggestions || [],
      page: query.page || 1,
      size: query.size || 20,
      query,
      executionTime: Date.now() - startTime
    };
  }

  private fallbackSearch(query: AdvancedSearchQuery): Observable<AdvancedSearchResult> {
    // Create fallback result since basic search doesn't return Observable
    const fallbackResult: AdvancedSearchResult = {
      results: [],
      total: 0,
      facets: [],
      suggestions: [],
      page: 1,
      size: 20,
      query,
      executionTime: 0
    };
    
    return of(fallbackResult);
  }

  private hasActiveValue(filter: SearchFilter): boolean {
    if (filter.value === null || filter.value === undefined) {
      return false;
    }
    if (Array.isArray(filter.value)) {
      return filter.value.length > 0;
    }
    if (typeof filter.value === 'string') {
      return filter.value.trim().length > 0;
    }
    return true;
  }

  private getLocalSuggestions(query: string): string[] {
    const commonTerms = [
      'jerusalem', 'america', 'songs of innocence', 'songs of experience',
      'marriage of heaven and hell', 'book of job', 'dante', 'milton',
      'urizen', 'los', 'orc', 'albion', 'vala', 'blake', 'william blake'
    ];
    
    const lowerQuery = query.toLowerCase();
    return commonTerms
      .filter(term => term.includes(lowerQuery))
      .slice(0, 8);
  }

  private formatExportData(results: AdvancedSearchResult, format: string): string {
    switch (format) {
      case 'csv':
        return this.formatAsCSV(results);
      case 'xml':
        return this.formatAsXML(results);
      case 'json':
      default:
        return JSON.stringify(results, null, 2);
    }
  }

  private formatAsCSV(results: AdvancedSearchResult): string {
    const headers = ['Title', 'Work ID', 'Object ID', 'Date', 'Medium', 'Institution'];
    const rows = results.results.map(item => [
      item.title || '',
      item.work_id || '',
      item.object_id || '',
      item.date || '',
      item.medium || '',
      item.institution || ''
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');
  }

  private formatAsXML(results: AdvancedSearchResult): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<search-results>\n';
    xml += `  <query>${this.escapeXML(results.query.query)}</query>\n`;
    xml += `  <total>${results.total}</total>\n`;
    xml += '  <results>\n';

    results.results.forEach(item => {
      xml += '    <result>\n';
      Object.keys(item).forEach(key => {
        xml += `      <${key}>${this.escapeXML(String(item[key]))}</${key}>\n`;
      });
      xml += '    </result>\n';
    });

    xml += '  </results>\n</search-results>';
    return xml;
  }

  private escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private getContentType(format: string): string {
    switch (format) {
      case 'csv':
        return 'text/csv';
      case 'xml':
        return 'application/xml';
      case 'json':
      default:
        return 'application/json';
    }
  }

  private addToSearchHistory(query: string, resultCount: number): void {
    if (!query.trim()) return;

    const currentHistory = this.searchHistorySubject.value;
    const newEntry: SearchHistory = {
      query,
      timestamp: new Date(),
      resultCount
    };

    // Remove duplicate queries and add new entry at the beginning
    const updatedHistory = [newEntry, ...currentHistory.filter(h => h.query !== query)]
      .slice(0, 50); // Keep last 50 searches

    this.searchHistorySubject.next(updatedHistory);
    this.saveSearchHistory(updatedHistory);
  }

  private loadSearchHistory(): void {
    try {
      const saved = localStorage.getItem('blake-search-history');
      if (saved) {
        const history = JSON.parse(saved).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        this.searchHistorySubject.next(history);
      }
    } catch (e) {
      console.warn('Error loading search history:', e);
    }
  }

  private saveSearchHistory(history: SearchHistory[]): void {
    try {
      localStorage.setItem('blake-search-history', JSON.stringify(history));
    } catch (e) {
      console.warn('Error saving search history:', e);
    }
  }
}