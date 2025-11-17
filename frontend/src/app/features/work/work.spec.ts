import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { Work } from './work';
import { BlakeDataService, BlakeWork, BlakeCopy } from '../../core/services/blake-data.service';

describe('Work', () => {
  let component: Work;
  let fixture: ComponentFixture<Work>;
  let blakeDataService: jasmine.SpyObj<BlakeDataService>;
  let activatedRoute: any;

  beforeEach(async () => {
    const blakeDataSpy = jasmine.createSpyObj('BlakeDataService', ['getWork', 'getWorkCopies']);

    activatedRoute = {
      params: of({ workId: 'but11.1' })
    };

    await TestBed.configureTestingModule({
      imports: [Work],
      providers: [
        { provide: BlakeDataService, useValue: blakeDataSpy },
        { provide: ActivatedRoute, useValue: activatedRoute },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    blakeDataService = TestBed.inject(BlakeDataService) as jasmine.SpyObj<BlakeDataService>;
    fixture = TestBed.createComponent(Work);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load work and copies on init', () => {
    const mockWork: BlakeWork = {
      bad_id: 'but11.1',
      title: 'The Book of Thel',
      info: 'Test work info',
      composition_date: '1789',
      medium: 'illbk'
    };

    const mockCopies: BlakeCopy[] = [
      { bad_id: 'but11.1.wc', title: 'Copy A', work_id: 'but11.1', institution: 'Test' },
      { bad_id: 'but11.1.wc.b', title: 'Copy B', work_id: 'but11.1', institution: 'Test 2' }
    ];

    blakeDataService.getWork.and.returnValue(of(mockWork));
    blakeDataService.getWorkCopies.and.returnValue(of(mockCopies));

    component.ngOnInit();

    expect(blakeDataService.getWork).toHaveBeenCalledWith('but11.1');
    expect(blakeDataService.getWorkCopies).toHaveBeenCalledWith('but11.1');
    expect(component.work).toEqual(mockWork);
    expect(component.copies.length).toBe(2);
    expect(component.loading).toBe(false);
  });

  it('should handle error when loading work', () => {
    blakeDataService.getWork.and.returnValue(throwError(() => new Error('Not found')));

    component.ngOnInit();

    expect(component.error).toBeTruthy();
    expect(component.loading).toBe(false);
    expect(component.work).toBeNull();
  });

  it('should get correct medium label for illuminated book', () => {
    component.work = {
      bad_id: 'but11.1',
      title: 'Test',
      medium: 'illbk'
    };

    expect(component.getMediumLabel()).toBe('Illuminated Book');
  });

  it('should get correct medium label for commercial book illustration', () => {
    component.work = {
      bad_id: 'test',
      title: 'Test',
      medium: 'cbi'
    };

    expect(component.getMediumLabel()).toBe('Commercial Book Illustration');
  });

  it('should get correct medium label for separate print', () => {
    component.work = {
      bad_id: 'test',
      title: 'Test',
      medium: 'spri'
    };

    expect(component.getMediumLabel()).toBe('Separate Print');
  });

  it('should return medium as-is if not in map', () => {
    component.work = {
      bad_id: 'test',
      title: 'Test',
      medium: 'unknown'
    };

    expect(component.getMediumLabel()).toBe('unknown');
  });

  it('should return empty string if no medium', () => {
    component.work = {
      bad_id: 'test',
      title: 'Test'
    };

    expect(component.getMediumLabel()).toBe('');
  });

  it('should get correct copy count text for single copy', () => {
    component.copies = [
      { bad_id: 'copy1', title: 'Copy A', work_id: 'work1' }
    ];

    expect(component.getCopyCountText()).toBe('1 copy');
  });

  it('should get correct copy count text for multiple copies', () => {
    component.copies = [
      { bad_id: 'copy1', title: 'Copy A', work_id: 'work1' },
      { bad_id: 'copy2', title: 'Copy B', work_id: 'work1' },
      { bad_id: 'copy3', title: 'Copy C', work_id: 'work1' }
    ];

    expect(component.getCopyCountText()).toBe('3 copies');
  });

  it('should get correct copy count text for zero copies', () => {
    component.copies = [];

    expect(component.getCopyCountText()).toBe('0 copies');
  });
});
