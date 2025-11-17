import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Object } from './object';
import { BlakeDataService, BlakeObject } from '../../core/services/blake-data.service';

describe('Object', () => {
  let component: Object;
  let fixture: ComponentFixture<Object>;
  let blakeDataService: jasmine.SpyObj<BlakeDataService>;
  let activatedRoute: any;

  beforeEach(async () => {
    const blakeDataSpy = jasmine.createSpyObj('BlakeDataService', ['getObject']);

    activatedRoute = {
      params: of({ descId: 'but11.1.wc.01' })
    };

    await TestBed.configureTestingModule({
      imports: [Object],
      providers: [
        { provide: BlakeDataService, useValue: blakeDataSpy },
        { provide: ActivatedRoute, useValue: activatedRoute },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    blakeDataService = TestBed.inject(BlakeDataService) as jasmine.SpyObj<BlakeDataService>;
    fixture = TestBed.createComponent(Object);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load object on init', () => {
    const mockObject: BlakeObject = {
      desc_id: 'but11.1.wc.01',
      title: 'Test Object',
      copy_bad_id: 'but11.1.wc',
      object_number: 1,
      full_object_id: 'but11.1.wc.01',
      illustration_description: 'Test description',
      text_transcription: 'Test transcription'
    };

    blakeDataService.getObject.and.returnValue(of(mockObject));

    component.ngOnInit();

    expect(blakeDataService.getObject).toHaveBeenCalledWith('but11.1.wc.01');
    expect(component.object).toEqual(mockObject);
    expect(component.loading).toBe(false);
  });

  it('should handle error when loading object', () => {
    blakeDataService.getObject.and.returnValue(throwError(() => new Error('Not found')));

    component.ngOnInit();

    expect(component.error).toBeTruthy();
    expect(component.loading).toBe(false);
    expect(component.object).toBeNull();
  });

  it('should set active tab', () => {
    component.setActiveTab('transcription');
    expect(component.activeTab).toBe('transcription');

    component.setActiveTab('info');
    expect(component.activeTab).toBe('info');
  });

  it('should default to image tab', () => {
    expect(component.activeTab).toBe('image');
  });

  it('should generate correct image URL', () => {
    component.object = {
      desc_id: 'but11.1.wc.01',
      title: 'Test',
      copy_bad_id: 'but11.1.wc',
      object_number: 1,
      full_object_id: 'but11.1.wc.01'
    };

    const url = component.getImageUrl();
    expect(url).toBe('/static/img/but11.1.wc.01.jpg');
  });

  it('should use desc_id if full_object_id is not available', () => {
    component.object = {
      desc_id: 'but11.1.wc.01',
      title: 'Test',
      copy_bad_id: 'but11.1.wc',
      object_number: 1,
      full_object_id: ''
    };
    component.descId = 'but11.1.wc.01';

    const url = component.getImageUrl();
    expect(url).toBe('/static/img/but11.1.wc.01.jpg');
  });
});
