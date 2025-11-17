import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { HomeComponent } from './home';
import { BlakeDataService } from '../../core/services/blake-data.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let blakeDataService: jasmine.SpyObj<BlakeDataService>;

  beforeEach(async () => {
    const blakeDataSpy = jasmine.createSpyObj('BlakeDataService', ['getFeaturedWorks']);

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: BlakeDataService, useValue: blakeDataSpy },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    blakeDataService = TestBed.inject(BlakeDataService) as jasmine.SpyObj<BlakeDataService>;
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load featured works on init', () => {
    const mockWorks = [
      { bad_id: 'work1', title: 'Work 1' },
      { bad_id: 'work2', title: 'Work 2' }
    ];

    blakeDataService.getFeaturedWorks.and.returnValue(of(mockWorks));

    component.ngOnInit();

    expect(blakeDataService.getFeaturedWorks).toHaveBeenCalled();
    expect(component.featuredWorks.length).toBe(2);
  });

  it('should handle error when loading featured works', () => {
    blakeDataService.getFeaturedWorks.and.returnValue(throwError(() => new Error('Failed to load')));

    // Spy on console.error to verify error handling
    spyOn(console, 'error');

    component.ngOnInit();

    expect(console.error).toHaveBeenCalled();
  });
});
