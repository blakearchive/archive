import { SearchService, SearchConfig } from './search.service';
import { LoadingService } from './loading.service';
import { CacheService } from './cache.service';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

describe('SearchService', () => {
  let service: SearchService;
  let mockHttpClient: jest.MockedObjectDeep<HttpClient>;
  let mockLoadingService: jest.MockedObjectDeep<LoadingService>;
  let mockCacheService: jest.MockedObjectDeep<CacheService>;

  beforeEach(() => {
    // Create mock services
    mockHttpClient = {
      post: jest.fn().mockReturnValue(of({ results: [] })),
      get: jest.fn().mockReturnValue(of({}))
    } as any;

    mockLoadingService = {
      setLoading: jest.fn(),
      isLoading: jest.fn().mockReturnValue(false),
      clearError: jest.fn(),
      withLoading: jest.fn().mockImplementation((key, observable) => {
        // Simulate the loading service behavior
        mockLoadingService.setLoading(key, true);
        return observable || of([]);
      })
    } as any;

    mockCacheService = {
      get: jest.fn().mockImplementation((key, fallbackObservable) => fallbackObservable || of([])),
      set: jest.fn(),
      clear: jest.fn(),
      createKey: jest.fn().mockReturnValue('mock-cache-key'),
      createSearchKey: jest.fn().mockReturnValue('mock-search-key')
    } as any;

    service = new SearchService(mockHttpClient, mockLoadingService, mockCacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should have default initial state', () => {
      const state = service.currentState;
      expect(state.selectedWork).toBe(-1);
      expect(state.selectedCopy).toBe(0);
      expect(state.selectedObject).toBe(0);
      expect(state.searching).toBe(false);
      expect(state.queryString).toBe('');
      expect(state.objectResults).toEqual([]);
      expect(state.copyResults).toEqual([]);
      expect(state.workResults).toEqual([]);
    });

    it('should have default search config', () => {
      const config = service.currentState.searchConfig;
      expect(config.searchString).toBe('');
      expect(config.searchAllFields).toBe(true);
      expect(config.minDate).toBe(1772);
      expect(config.maxDate).toBe(1827);
      expect(config.searchTitle).toBe(false);
      expect(config.searchText).toBe(false);
    });
  });

  describe('Search Configuration', () => {
    it('should update search string', () => {
      const testString = 'jerusalem';
      service.setSearchString(testString);
      
      expect(service.currentState.searchConfig.searchString).toBe(testString);
    });

    it('should update search config', () => {
      const config: Partial<SearchConfig> = {
        searchTitle: true,
        searchText: true,
        minDate: 1800
      };

      service.updateSearchConfig(config);
      const updatedConfig = service.currentState.searchConfig;

      expect(updatedConfig.searchTitle).toBe(true);
      expect(updatedConfig.searchText).toBe(true);
      expect(updatedConfig.minDate).toBe(1800);
    });

    it('should reset filters to default', () => {
      // First modify config
      service.updateSearchConfig({
        searchTitle: true,
        searchText: true,
        minDate: 1800
      });

      // Then reset
      service.resetFilters();
      const config = service.currentState.searchConfig;

      expect(config.searchTitle).toBe(false);
      expect(config.searchText).toBe(false);
      expect(config.minDate).toBe(1772);
    });
  });

  describe('Search Types', () => {
    it('should check if search title is enabled', () => {
      expect(service.shouldSearchTitle()).toBe(false);
      
      service.updateSearchConfig({ searchTitle: true });
      expect(service.shouldSearchTitle()).toBe(true);
    });

    it('should check if search text is enabled', () => {
      expect(service.shouldSearchText()).toBe(false);
      
      service.updateSearchConfig({ searchText: true });
      expect(service.shouldSearchText()).toBe(true);
    });

    it('should check if all fields search is enabled', () => {
      expect(service.shouldSearchAllFields()).toBe(true);
      
      service.updateSearchConfig({ searchAllFields: false });
      expect(service.shouldSearchAllFields()).toBe(false);
    });

    it('should toggle search types', () => {
      service.toggleSearchType('searchIlluminatedBooks', true);
      expect(service.currentState.searchConfig.searchIlluminatedBooks).toBe(true);

      service.toggleSearchType('searchIlluminatedBooks', false);
      expect(service.currentState.searchConfig.searchIlluminatedBooks).toBe(false);
    });
  });

  describe('Stop Words Removal', () => {
    it('should remove stop words from search string', () => {
      service.setSearchString('the quick brown fox and the lazy dog');
      service.removeStopWords();
      
      const queryString = service.currentState.queryString;
      expect(queryString).not.toContain('the');
      expect(queryString).not.toContain('and');
      expect(queryString).toContain('quick');
      expect(queryString).toContain('brown');
      expect(queryString).toContain('fox');
    });

    it('should handle empty search string', () => {
      service.setSearchString('');
      service.removeStopWords();
      
      expect(service.currentState.queryString).toBe('');
    });

    it('should preserve non-stop words', () => {
      service.setSearchString('jerusalem america blake');
      service.removeStopWords();
      
      const queryString = service.currentState.queryString;
      expect(queryString).toContain('jerusalem');
      expect(queryString).toContain('america');
      expect(queryString).toContain('blake');
    });
  });

  describe('Search Results', () => {
    it('should check if has results', () => {
      expect(service.hasResults()).toBe(false);
      
      // Test with actual search results would require mocking HTTP
      // For now just test initial state
      expect(service.currentState.objectResults).toEqual([]);
      expect(service.currentState.copyResults).toEqual([]);
      expect(service.currentState.workResults).toEqual([]);
    });

    it('should get total result count', () => {
      // Initially should be 0
      expect(service.getTotalResultCount()).toBe(0);
    });

    it('should check if searching', () => {
      expect(service.isSearching()).toBe(false);
    });
  });

  describe('HTTP Search Operations', () => {
    it('should call loading service when performing search', () => {
      service.setSearchString('test');
      service.performSearch();

      expect(mockLoadingService.setLoading).toHaveBeenCalledWith('search-objects', true);
    });

    it('should call cache service to check for cached results', () => {
      mockCacheService.get.mockReturnValue(null);
      
      service.setSearchString('test');
      service.performSearch();

      expect(mockCacheService.get).toHaveBeenCalled();
    });
  });

  describe('Cache Integration', () => {
    it('should call cache service methods', () => {
      service.setSearchString('cached-query');
      service.performSearch();

      expect(mockCacheService.get).toHaveBeenCalled();
    });
  });

  describe('State Management', () => {
    it('should emit state changes', () => {
      let stateEmissions = 0;
      service.state$.subscribe(() => stateEmissions++);

      service.setSearchString('test');

      expect(stateEmissions).toBeGreaterThan(0);
    });

    it('should clear search results', () => {
      service.resetResults();

      expect(service.currentState.objectResults).toEqual([]);
      expect(service.currentState.copyResults).toEqual([]);
      expect(service.currentState.workResults).toEqual([]);
    });
  });

  describe('Search Types', () => {
    it('should get selected search types', () => {
      service.updateSearchConfig({
        searchIlluminatedBooks: true,
        searchManuscripts: true,
        searchSeparatePrints: false
      });

      const selectedTypes = service.getSelectedSearchTypes();
      expect(selectedTypes).toContain('searchIlluminatedBooks');
      expect(selectedTypes).toContain('searchManuscripts');
      expect(selectedTypes).not.toContain('searchSeparatePrints');
    });
  });
});