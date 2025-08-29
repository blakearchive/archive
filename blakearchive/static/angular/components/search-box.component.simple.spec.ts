import { SearchBoxComponent } from './search-box.component';
import { Router } from '@angular/router';
import { SearchService } from '../services/search.service';
import { of, Subject } from 'rxjs';

describe('SearchBoxComponent (Simple)', () => {
  let component: SearchBoxComponent;
  let mockRouter: jest.MockedObjectDeep<Router>;
  let mockSearchService: jest.MockedObjectDeep<SearchService>;
  let mockSearchState$: Subject<any>;

  beforeEach(() => {
    mockSearchState$ = new Subject();
    
    mockRouter = {
      navigate: jest.fn()
    } as any;

    mockSearchService = {
      state$: mockSearchState$.asObservable(),
      setSearchString: jest.fn(),
      removeStopWords: jest.fn(),
      performSearch: jest.fn()
    } as any;

    component = new SearchBoxComponent(mockRouter, mockSearchService);
  });

  afterEach(() => {
    if (component) {
      component.ngOnDestroy();
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Properties', () => {
    it('should have default properties', () => {
      expect(component.searchString).toBe('');
      expect(component.searchTooltip).toContain('Search titles');
    });
  });

  describe('ngOnInit', () => {
    it('should subscribe to search service state changes', () => {
      component.ngOnInit();
      
      // Emit a state change
      const mockState = {
        searchConfig: {
          searchString: 'test search'
        }
      };
      
      mockSearchState$.next(mockState);
      
      expect(component.searchString).toBe('test search');
    });

    it('should not update search string if it matches current state', () => {
      component.searchString = 'existing search';
      component.ngOnInit();
      
      const mockState = {
        searchConfig: {
          searchString: 'existing search'
        }
      };
      
      mockSearchState$.next(mockState);
      
      expect(component.searchString).toBe('existing search');
    });

    it('should handle empty search string from state', () => {
      component.searchString = 'current';
      component.ngOnInit();
      
      const mockState = {
        searchConfig: {
          searchString: null
        }
      };
      
      mockSearchState$.next(mockState);
      
      expect(component.searchString).toBe('');
    });
  });

  describe('onSearchInputClick', () => {
    it('should clear empty search string', () => {
      component.searchString = '';
      component.onSearchInputClick();
      
      expect(component.searchString).toBe('');
    });

    it('should clear whitespace-only search string', () => {
      component.searchString = '   ';
      component.onSearchInputClick();
      
      expect(component.searchString).toBe('');
    });

    it('should not affect valid search string', () => {
      component.searchString = 'valid search';
      component.onSearchInputClick();
      
      expect(component.searchString).toBe('valid search');
    });
  });

  describe('onSubmitSearch', () => {
    it('should do nothing if search string is empty', () => {
      component.searchString = '';
      component.onSubmitSearch();
      
      expect(mockSearchService.setSearchString).not.toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should do nothing if search string is only whitespace', () => {
      component.searchString = '   ';
      component.onSubmitSearch();
      
      expect(mockSearchService.setSearchString).not.toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should perform search with valid search string', () => {
      component.searchString = '  jerusalem  ';
      component.onSubmitSearch();
      
      expect(mockSearchService.setSearchString).toHaveBeenCalledWith('jerusalem');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/search'], {
        queryParams: { search: 'jerusalem' }
      });
      expect(mockSearchService.removeStopWords).toHaveBeenCalled();
      expect(mockSearchService.performSearch).toHaveBeenCalled();
    });

    it('should trim search string before processing', () => {
      component.searchString = '  blake america  ';
      component.onSubmitSearch();
      
      expect(mockSearchService.setSearchString).toHaveBeenCalledWith('blake america');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/search'], {
        queryParams: { search: 'blake america' }
      });
    });

    it('should call search service methods in correct order', () => {
      component.searchString = 'test';
      component.onSubmitSearch();
      
      const calls = [
        mockSearchService.setSearchString,
        mockSearchService.removeStopWords,
        mockSearchService.performSearch
      ];
      
      calls.forEach(call => {
        expect(call).toHaveBeenCalled();
      });
    });
  });

  describe('loadSearchPage', () => {
    it('should call onSubmitSearch', () => {
      const spy = jest.spyOn(component, 'onSubmitSearch');
      component.loadSearchPage();
      
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('State Management', () => {
    it('should update search string when state changes', () => {
      component.ngOnInit();
      
      const newState = {
        searchConfig: {
          searchString: 'new search term'
        }
      };
      
      mockSearchState$.next(newState);
      
      expect(component.searchString).toBe('new search term');
    });

    it('should handle multiple state changes', () => {
      component.ngOnInit();
      
      mockSearchState$.next({
        searchConfig: { searchString: 'first' }
      });
      expect(component.searchString).toBe('first');
      
      mockSearchState$.next({
        searchConfig: { searchString: 'second' }
      });
      expect(component.searchString).toBe('second');
    });
  });

  describe('Component Lifecycle', () => {
    it('should complete destroy subject on ngOnDestroy', () => {
      const completeSpy = jest.spyOn(component['destroy$'], 'complete');
      const nextSpy = jest.spyOn(component['destroy$'], 'next');
      
      component.ngOnDestroy();
      
      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });

    it('should unsubscribe from observables on destroy', () => {
      component.ngOnInit();
      
      // Subscribe to changes
      mockSearchState$.next({
        searchConfig: { searchString: 'test' }
      });
      expect(component.searchString).toBe('test');
      
      // Destroy component
      component.ngOnDestroy();
      
      // Further changes should not affect component
      const originalValue = component.searchString;
      mockSearchState$.next({
        searchConfig: { searchString: 'should not update' }
      });
      
      expect(component.searchString).toBe(originalValue);
    });
  });
});