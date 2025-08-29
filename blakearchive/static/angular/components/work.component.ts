import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BlakeDataService } from '../services/blake-data.service';
import { LoadingIndicatorComponent } from './loading-indicator.component';

@Component({
  selector: 'app-work',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingIndicatorComponent],
  template: `
    <div class="work-container">
      <!-- Loading indicator -->
      <app-loading-indicator 
        *ngIf="isLoading"
        operation="load-work"
        loadingText="Loading work data..."
        size="medium"
        type="block">
      </app-loading-indicator>
      
      <div *ngIf="workId && !isLoading" class="work-display">
        <h2>{{ workData?.title || workId }}</h2>
        
        <div *ngIf="workData" class="work-content">
          <div class="work-info">
            <p><strong>Work ID:</strong> {{ workId }}</p>
            <p *ngIf="workData.medium"><strong>Medium:</strong> {{ workData.medium }}</p>
            <p *ngIf="workData.composition_date"><strong>Composition Date:</strong> {{ workData.composition_date }}</p>
          </div>
          
          <!-- Work copies list -->
          <div *ngIf="workData.related_works && workData.related_works.length > 0" class="related-works">
            <h3>Copies</h3>
            <ul class="copies-list">
              <li *ngFor="let copy of workData.related_works">
                <a [routerLink]="['/copy', copy.bad_id]" [queryParams]="{descId: copy.desc_id}">
                  {{ copy.title }}
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div *ngIf="!workData" class="work-loading-error">
          <p>Failed to load work data</p>
        </div>
      </div>
      
      <div *ngIf="!workId && !isLoading" class="no-work">
        <p>No work selected</p>
      </div>
    </div>
  `,
  styles: [`
    .work-container {
      padding: 20px;
      min-height: 400px;
    }
    
    .work-display h2 {
      color: #333;
      margin-bottom: 20px;
    }
    
    .no-work {
      text-align: center;
      color: #666;
      margin-top: 100px;
    }
  `]
})
export class WorkComponent implements OnInit, OnDestroy {
  workId: string | null = null;
  workData: any = null;
  isLoading: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private blakeDataService: BlakeDataService
  ) {}

  ngOnInit(): void {
    // Set global state
    this.setGlobalState();
    
    // Get work ID from route parameters
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.workId = params['workId'];
        if (this.workId) {
          this.loadWork(this.workId);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Set global application state
   */
  private setGlobalState(): void {
    // Access global scope for AngularJS compatibility
    (window as any).$rootScope = (window as any).$rootScope || {};
    const $rootScope = (window as any).$rootScope;
    
    $rootScope.showOverlay = false;
    $rootScope.help = 'work';
    $rootScope.worksNavState = false;
    $rootScope.showWorkTitle = 'work';
  }

  /**
   * Load work data using Blake Work Service
   */
  private loadWork(workId: string): void {
    this.isLoading = true;
    
    this.blakeDataService.getWork(workId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (workData) => {
          this.workData = workData;
          this.isLoading = false;
          
          // Set global state for compatibility
          const $rootScope = (window as any).$rootScope;
          $rootScope.selectedWork = workData;
        },
        error: (error) => {
          console.error('Error loading work:', error);
          this.isLoading = false;
        }
      });
  }
}