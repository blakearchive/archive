import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { SearchService } from './search.service';
import { BlakeDataService } from './blake-data.service';

describe('SearchService', () => {
  let service: SearchService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SearchService,
        BlakeDataService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(SearchService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default search configuration', () => {
    const config = service.searchConfig();
    expect(config.useCompDate).toBe(true);
    expect(config.searchAllFields).toBe(true);
    expect(config.minDate).toBe(1772);
    expect(config.maxDate).toBe(1827);
  });

  it('should initialize with empty search results', () => {
    const results = service.searchResults();
    expect(results.objects).toEqual([]);
    expect(results.copies).toEqual([]);
    expect(results.works).toEqual([]);
  });

  it('should update query string', () => {
    service.queryString.set('blake');
    expect(service.queryString()).toBe('blake');
  });

  it('should toggle search types', () => {
    const initialIllbk = service.searchConfig().searchIlluminatedBooks;

    service.toggleType('searchIlluminatedBooks');
    expect(service.searchConfig().searchIlluminatedBooks).toBe(!initialIllbk);

    service.toggleType('searchIlluminatedBooks');
    expect(service.searchConfig().searchIlluminatedBooks).toBe(initialIllbk);
  });

  it('should toggle search fields', () => {
    const initialTitle = service.searchConfig().searchTitle;

    service.toggleField('searchTitle');
    expect(service.searchConfig().searchTitle).toBe(!initialTitle);

    service.toggleField('searchTitle');
    expect(service.searchConfig().searchTitle).toBe(initialTitle);
  });

  describe('search', () => {
    it('should perform search and update results', (done) => {
      const mockObjects = [{ desc_id: 'obj1', title: 'Object 1', copy_bad_id: 'copy1', object_number: 1, full_object_id: 'obj1' }];
      const mockCopies = [{ bad_id: 'copy1', title: 'Copy 1', work_id: 'work1' }];
      const mockWorks = [{ bad_id: 'work1', title: 'Work 1' }];

      service.search('test').subscribe(results => {
        expect(results.objects).toEqual(mockObjects);
        expect(results.copies).toEqual(mockCopies);
        expect(results.works).toEqual(mockWorks);
        expect(service.searching()).toBe(false);
        done();
      });

      expect(service.searching()).toBe(true);

      const reqObjects = httpMock.expectOne('/api/query_objects');
      reqObjects.flush(mockObjects);

      const reqCopies = httpMock.expectOne('/api/query_copies');
      reqCopies.flush(mockCopies);

      const reqWorks = httpMock.expectOne('/api/query_works');
      reqWorks.flush(mockWorks);
    });

    it('should handle search errors', (done) => {
      service.search('test').subscribe({
        next: (results) => {
          expect(results.objects).toEqual([]);
          expect(results.copies).toEqual([]);
          expect(results.works).toEqual([]);
          expect(service.searching()).toBe(false);
          done();
        },
        error: () => fail('should not error')
      });

      const reqObjects = httpMock.expectOne('/api/query_objects');
      reqObjects.flush('Error', { status: 500, statusText: 'Server Error' });

      const reqCopies = httpMock.expectOne('/api/query_copies');
      reqCopies.flush('Error', { status: 500, statusText: 'Server Error' });

      const reqWorks = httpMock.expectOne('/api/query_works');
      reqWorks.flush('Error', { status: 500, statusText: 'Server Error' });
    });

    it('should filter stop words from search string', (done) => {
      service.search('the test and query').subscribe(() => {
        done();
      });

      const reqObjects = httpMock.expectOne((req) =>
        req.url === '/api/query_objects' && !req.body.searchString.includes('the')
      );
      expect(reqObjects.request.body.searchString).not.toContain('the');
      expect(reqObjects.request.body.searchString).not.toContain('and');
      reqObjects.flush([]);

      httpMock.expectOne('/api/query_copies').flush([]);
      httpMock.expectOne('/api/query_works').flush([]);
    });
  });

});

