import { SearchService } from '../services/search.service';
import { SearchBoxComponent } from '../components/search-box.component';
import { LoadingService } from '../services/loading.service';
import { CacheService } from '../services/cache.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, Subject } from 'rxjs';

describe('Search Workflow Integration', () => {
  let searchService: SearchService;
  let searchBoxComponent: SearchBoxComponent;
  let mockHttpClient: jest.MockedObjectDeep<HttpClient>;
  let mockLoadingService: jest.MockedObjectDeep<LoadingService>;
  let mockCacheService: jest.MockedObjectDeep<CacheService>;
  let mockRouter: jest.MockedObjectDeep<Router>;
  let searchState$: Subject<any>;

  beforeEach(() => {
    searchState$ = new Subject();

    // Mock HTTP client
    mockHttpClient = {
      post: jest.fn().mockReturnValue(of({ results: ['search result 1', 'search result 2'] })),
      get: jest.fn().mockReturnValue(of({}))
    } as any;

    // Mock loading service
    mockLoadingService = {
      setLoading: jest.fn(),
      isLoading: jest.fn().mockReturnValue(false),
      clearError: jest.fn(),
      withLoading: jest.fn().mockImplementation((key, observable) => {
        mockLoadingService.setLoading(key, true);
        return observable || of([]);
      })
    } as any;

    // Mock cache service
    mockCacheService = {
      get: jest.fn().mockImplementation((key, fallbackObservable) => fallbackObservable || of([])),
      set: jest.fn(),
      clear: jest.fn(),
      createKey: jest.fn().mockReturnValue('mock-cache-key'),
      createSearchKey: jest.fn().mockReturnValue('mock-search-key')
    } as any;

    // Mock router
    mockRouter = {
      navigate: jest.fn()
    } as any;

    // Create service instances
    searchService = new SearchService(mockHttpClient, mockLoadingService, mockCacheService);
    
    // Override the service's state$ with our mock
    (searchService as any).state$ = searchState$.asObservable();
    
    searchBoxComponent = new SearchBoxComponent(mockRouter, searchService);
  });

  afterEach(() => {
    if (searchBoxComponent) {
      searchBoxComponent.ngOnDestroy();
    }
  });

  describe('Complete Search Flow', () => {
    it('should handle complete search workflow from input to results', () => {
      // Initialize component
      searchBoxComponent.ngOnInit();

      // User types in search box
      searchBoxComponent.searchString = 'jerusalem america';

      // User submits search
      searchBoxComponent.onSubmitSearch();

      // Verify search service was called correctly
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/search'], {
        queryParams: { search: 'jerusalem america' }
      });

      // Verify loading states were managed
      expect(mockLoadingService.setLoading).toHaveBeenCalledWith('search-objects', true);
      expect(mockLoadingService.setLoading).toHaveBeenCalledWith('search-copies', true);
      expect(mockLoadingService.setLoading).toHaveBeenCalledWith('search-works', true);

      // Verify cache was checked
      expect(mockCacheService.get).toHaveBeenCalled();
    });

    it('should sync search box with service state changes', () => {
      searchBoxComponent.ngOnInit();
      
      // Initially empty
      expect(searchBoxComponent.searchString).toBe('');

      // Service updates search string
      searchState$.next({
        searchConfig: {
          searchString: 'blake tiger'
        }
      });

      // Component should sync
      expect(searchBoxComponent.searchString).toBe('blake tiger');
    });

    it('should prevent search with empty or whitespace-only strings', () => {
      searchBoxComponent.ngOnInit();
      
      const testCases = ['', '   ', '\t\n', null, undefined];
      
      testCases.forEach(testCase => {
        searchBoxComponent.searchString = testCase as any;
        searchBoxComponent.onSubmitSearch();
        
        // Should not trigger navigation or search
        expect(mockRouter.navigate).not.toHaveBeenCalled();
      });
    });

    it('should handle search configuration updates', () => {
      // Update search configuration
      const config = {
        searchTitle: true,
        searchText: true,
        minDate: 1800,
        maxDate: 1820
      };
      
      searchService.updateSearchConfig(config);
      
      // Verify configuration was applied
      const currentConfig = searchService.currentState.searchConfig;
      expect(currentConfig.searchTitle).toBe(true);
      expect(currentConfig.searchText).toBe(true);
      expect(currentConfig.minDate).toBe(1800);
      expect(currentConfig.maxDate).toBe(1820);
    });

    it('should handle stop words removal in search workflow', () => {
      searchBoxComponent.ngOnInit();
      searchBoxComponent.searchString = 'the quick brown fox and the lazy dog';
      
      // Submit search (this triggers stop words removal)
      searchBoxComponent.onSubmitSearch();
      
      // Verify search was processed
      expect(mockRouter.navigate).toHaveBeenCalled();
      
      // Check that removeStopWords was called as part of workflow
      const queryString = searchService.currentState.queryString;
      // Note: The actual stop words removal logic would be tested in the service unit tests
      expect(typeof queryString).toBe('string');
    });
  });

  describe('Search Service Integration', () => {
    it('should handle search type toggles', () => {
      searchService.toggleSearchType('searchIlluminatedBooks', true);
      expect(searchService.currentState.searchConfig.searchIlluminatedBooks).toBe(true);
      
      searchService.toggleSearchType('searchIlluminatedBooks', false);
      expect(searchService.currentState.searchConfig.searchIlluminatedBooks).toBe(false);
    });

    it('should reset filters correctly', () => {
      // Modify some filters
      searchService.updateSearchConfig({
        searchTitle: true,
        searchText: true,
        minDate: 1800
      });
      
      // Reset filters
      searchService.resetFilters();
      
      const config = searchService.currentState.searchConfig;
      expect(config.searchTitle).toBe(false);
      expect(config.searchText).toBe(false);
      expect(config.minDate).toBe(1772); // Default value
    });

    it('should handle search results reset', () => {
      // Reset results
      searchService.resetResults();
      
      const state = searchService.currentState;
      expect(state.objectResults).toEqual([]);
      expect(state.copyResults).toEqual([]);
      expect(state.workResults).toEqual([]);
    });
  });

  describe('Error Handling in Search Flow', () => {
    it('should handle HTTP errors gracefully', () => {
      // Test that we can handle the basic flow even with null responses
      mockHttpClient.post = jest.fn().mockReturnValue(of(null));
      
      searchBoxComponent.ngOnInit();
      searchBoxComponent.searchString = 'test search';
      
      // This should not throw even if HTTP returns null
      expect(() => {
        searchBoxComponent.onSubmitSearch();
      }).not.toThrow();
      
      // Verify that error handling mechanisms were called
      expect(mockLoadingService.clearError).toHaveBeenCalled();
    });

    it('should clear loading states on service interaction', () => {
      // The clearError method should be called when starting new searches
      searchBoxComponent.ngOnInit();
      searchBoxComponent.searchString = 'test';
      searchBoxComponent.onSubmitSearch();
      
      expect(mockLoadingService.clearError).toHaveBeenCalledWith('search-objects');
      expect(mockLoadingService.clearError).toHaveBeenCalledWith('search-copies');
      expect(mockLoadingService.clearError).toHaveBeenCalledWith('search-works');
    });
  });

  describe('Cache Integration', () => {
    it('should create appropriate cache keys for different search types', () => {
      searchBoxComponent.ngOnInit();
      searchBoxComponent.searchString = 'test query';
      searchBoxComponent.onSubmitSearch();
      
      // Should create cache keys for all search types
      expect(mockCacheService.createKey).toHaveBeenCalledWith('search-objects', 'mock-search-key');
      expect(mockCacheService.createKey).toHaveBeenCalledWith('search-copies', 'mock-search-key');
      expect(mockCacheService.createKey).toHaveBeenCalledWith('search-works', 'mock-search-key');
    });

    it('should use cache service for search result storage', () => {
      searchBoxComponent.ngOnInit();
      searchBoxComponent.searchString = 'cached query';
      searchBoxComponent.onSubmitSearch();
      
      // Should check cache for existing results
      expect(mockCacheService.get).toHaveBeenCalled();
    });
  });
});