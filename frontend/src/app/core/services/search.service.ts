import { Injectable, inject, signal } from '@angular/core';
import { Observable, forkJoin, map, tap } from 'rxjs';
import { BlakeDataService, SearchConfig } from './blake-data.service';

export interface SearchConfiguration extends SearchConfig {
  useCompDate?: boolean;
  usePrintDate?: boolean;
  searchAllFields?: boolean;
  searchTitle?: boolean;
  searchText?: boolean;
  searchNotes?: boolean;
  searchImageDescriptions?: boolean;
  searchImageKeywords?: boolean;
  searchWorks?: boolean;
  searchCopies?: boolean;
  searchAllTypes?: boolean;
  searchCopyInformation?: boolean;
}

export interface SearchResults {
  objects: any[];
  copies: any[];
  works: any[];
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private blakeData = inject(BlakeDataService);

  // Signals for reactive state management
  searching = signal(false);
  queryString = signal('');
  searchResults = signal<SearchResults>({
    objects: [],
    copies: [],
    works: []
  });

  // Search configuration with defaults
  searchConfig = signal<SearchConfiguration>({
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

  // Medium types for filtering
  readonly types = [
    'searchIlluminatedBooks',
    'searchCommercialBookIllustrations',
    'searchSeparatePrints',
    'searchDrawingsPaintings',
    'searchManuscripts',
    'searchRelatedMaterials'
  ];

  // Stop words for search optimization
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

  /**
   * Reset search results
   */
  resetResults(): void {
    this.searchResults.set({
      objects: [],
      copies: [],
      works: []
    });
  }

  /**
   * Reset search filters to defaults
   */
  resetFilters(): void {
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
   * Enable searching all fields
   */
  allFields(): void {
    const config = this.searchConfig();
    this.searchConfig.set({
      ...config,
      searchAllFields: true,
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
   * Enable searching all types
   */
  allTypes(): void {
    const config = this.searchConfig();
    this.searchConfig.set({
      ...config,
      searchAllTypes: true,
      searchIlluminatedBooks: false,
      searchCommercialBookIllustrations: false,
      searchSeparatePrints: false,
      searchDrawingsPaintings: false,
      searchManuscripts: false,
      searchRelatedMaterials: false
    });
  }

  /**
   * Perform search across objects, copies, and works
   */
  search(searchString?: string): Observable<SearchResults> {
    if (searchString !== undefined) {
      const config = this.searchConfig();
      this.searchConfig.set({ ...config, searchString });
      this.queryString.set(searchString);
    }

    this.resetResults();
    this.searching.set(true);

    const config = this.searchConfig();

    // Perform parallel searches
    return forkJoin({
      objects: this.blakeData.queryObjects(config),
      copies: this.blakeData.queryCopies(config),
      works: this.blakeData.queryWorks(config)
    }).pipe(
      tap(results => {
        this.searchResults.set(results);
        this.searching.set(false);
      }),
      map(results => results as SearchResults)
    );
  }

  /**
   * Update a specific search configuration property
   */
  updateConfig(updates: Partial<SearchConfiguration>): void {
    const current = this.searchConfig();
    this.searchConfig.set({ ...current, ...updates });
  }

  /**
   * Toggle a medium type filter
   */
  toggleType(type: string): void {
    const config = this.searchConfig();
    this.searchConfig.set({
      ...config,
      [type]: !(config as any)[type]
    });
  }

  /**
   * Toggle a field filter
   */
  toggleField(field: string): void {
    const config = this.searchConfig();
    this.searchConfig.set({
      ...config,
      [field]: !(config as any)[field],
      searchAllFields: false
    });
  }
}
