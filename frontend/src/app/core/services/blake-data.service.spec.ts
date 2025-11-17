import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { BlakeDataService, BlakeObject, BlakeCopy, BlakeWork } from './blake-data.service';

describe('BlakeDataService', () => {
  let service: BlakeDataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BlakeDataService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(BlakeDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getObject', () => {
    it('should fetch an object by descId', () => {
      const mockObject: BlakeObject = {
        desc_id: 'but11.1.wc.01',
        title: 'Test Object',
        copy_bad_id: 'but11.1.wc',
        object_number: 1,
        full_object_id: 'but11.1.wc.01',
        illustration_description: 'Test description',
        text_transcription: 'Test transcription'
      };

      service.getObject('but11.1.wc.01').subscribe(obj => {
        expect(obj).toEqual(mockObject);
        expect(obj.desc_id).toBe('but11.1.wc.01');
      });

      const req = httpMock.expectOne('/api/object/but11.1.wc.01');
      expect(req.request.method).toBe('GET');
      req.flush(mockObject);
    });

    it('should handle errors when fetching object', () => {
      service.getObject('invalid').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      const req = httpMock.expectOne('/api/object/invalid');
      req.flush('Object not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getCopy', () => {
    it('should fetch a copy by badId', () => {
      const mockCopy: BlakeCopy = {
        bad_id: 'but11.1.wc',
        title: 'Copy C',
        copy_information: 'Test info',
        work_id: 'but11.1',
        institution: 'Test Institution',
        composition_date: '1794'
      };

      service.getCopy('but11.1.wc').subscribe(copy => {
        expect(copy).toEqual(mockCopy);
        expect(copy.bad_id).toBe('but11.1.wc');
      });

      const req = httpMock.expectOne('/api/copy/but11.1.wc');
      expect(req.request.method).toBe('GET');
      req.flush(mockCopy);
    });
  });

  describe('getWork', () => {
    it('should fetch a work by badId', () => {
      const mockWork: BlakeWork = {
        bad_id: 'but11.1',
        title: 'The Book of Thel',
        info: 'Test work info',
        composition_date: '1789',
        medium: 'illbk'
      };

      service.getWork('but11.1').subscribe(work => {
        expect(work).toEqual(mockWork);
        expect(work.bad_id).toBe('but11.1');
      });

      const req = httpMock.expectOne('/api/work/but11.1');
      expect(req.request.method).toBe('GET');
      req.flush(mockWork);
    });
  });

  describe('queryObjects', () => {
    it('should post search config and return objects', () => {
      const searchConfig = {
        searchString: 'test',
        searchText: true,
        minDate: 1780,
        maxDate: 1827
      };

      const mockResults = [
        { desc_id: 'obj1', title: 'Object 1', copy_bad_id: 'copy1', object_number: 1, full_object_id: 'obj1' },
        { desc_id: 'obj2', title: 'Object 2', copy_bad_id: 'copy2', object_number: 2, full_object_id: 'obj2' }
      ];

      service.queryObjects(searchConfig).subscribe(results => {
        expect(results).toEqual(mockResults);
        expect(results.length).toBe(2);
      });

      const req = httpMock.expectOne('/api/query_objects');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(searchConfig);
      req.flush(mockResults);
    });
  });

  describe('getCopyObjects', () => {
    it('should fetch objects for a copy', () => {
      const mockObjects: BlakeObject[] = [
        { desc_id: 'obj1', title: 'Object 1', copy_bad_id: 'copy1', object_number: 1, full_object_id: 'obj1' }
      ];

      service.getCopyObjects('but11.1.wc').subscribe(objects => {
        expect(objects).toEqual(mockObjects);
        expect(objects.length).toBe(1);
      });

      const req = httpMock.expectOne('/api/copy/but11.1.wc/objects');
      expect(req.request.method).toBe('GET');
      req.flush(mockObjects);
    });
  });

  describe('getWorkCopies', () => {
    it('should fetch copies for a work', () => {
      const mockCopies: BlakeCopy[] = [
        { bad_id: 'copy1', title: 'Copy A', work_id: 'work1' }
      ];

      service.getWorkCopies('but11.1').subscribe(copies => {
        expect(copies).toEqual(mockCopies);
        expect(copies.length).toBe(1);
      });

      const req = httpMock.expectOne('/api/work/but11.1/copies');
      expect(req.request.method).toBe('GET');
      req.flush(mockCopies);
    });
  });

  describe('getFeaturedWorks', () => {
    it('should fetch featured works', () => {
      const mockFeatured = [
        { work_id: 'work1', title: 'Featured Work 1' }
      ];

      service.getFeaturedWorks().subscribe(works => {
        expect(works).toEqual(mockFeatured);
        expect(works.length).toBe(1);
      });

      const req = httpMock.expectOne('/api/featured_works');
      expect(req.request.method).toBe('GET');
      req.flush(mockFeatured);
    });
  });
});
