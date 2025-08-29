import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BlakeDataService } from '../services/blake-data.service';
import { LoadingIndicatorComponent } from './loading-indicator.component';

export interface FeaturedWork {
  bad_id: string;
  title: string;
  desc_id: string;
  dbi: string;
  byline: string;
  column?: number;
}

export interface ColumnConfig {
  topOffset: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingIndicatorComponent],
  template: `
    <div id="home" class="container-fluid main" style="max-height:80vh;" parallax>
      <div class="row">
        <div 
          class="col-sm-2 col-xs-6 scroll-window" 
          *ngFor="let column of columnsArray; let colKey = index; trackBy: trackByColumn"
        >
          <div 
            id="scroll-wrapper" 
            [style.margin-top]="column.topOffset" 
            class="scrolling"
          >
            <span 
              class="object-container" 
              *ngFor="let work of getFeaturedWorksForColumn(colKey + 1); trackBy: trackByWork"
            >
              <a [routerLink]="['/copy', work.bad_id]" [queryParams]="{descId: work.desc_id}">
                <img 
                  class="lazy-load" 
                  [src]="'/static/img/featured/' + work.dbi + '.100.jpg'"
                  [alt]="work.title"
                >
              </a>
              <a [routerLink]="['/copy', work.bad_id]" [queryParams]="{descId: work.desc_id}">
                <span class="object-description">
                  <span class="category">{{ work.title }}</span>
                  <div class="clearfix"></div>
                  <span class="object-no text-capitalize">
                    <span class="copy-object">{{ work.byline }}</span>
                  </span>
                </span>
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
    <div style="margin-top: -22px; width: 324px; position: relative; display:table-caption; z-index:20; background:rgba(26, 138, 189, 0.85); font-size:16px; color:rgba(255, 255, 255, 0.9); padding-left:3px; padding-right:3px">
      Random Sample of Objects from the Archive
    </div>
  `,
  styleUrls: []
})
export class HomeComponent implements OnInit, OnDestroy {
  featuredWorks: FeaturedWork[] = [];
  columns: { [key: number]: ColumnConfig } = {
    1: { topOffset: '-90px' },
    2: { topOffset: '-20px' },
    3: { topOffset: '-90px' },
    4: { topOffset: '-20px' },
    5: { topOffset: '-90px' },
    6: { topOffset: '-20px' },
  };

  columnsArray: ColumnConfig[] = Object.values(this.columns);
  private destroy$ = new Subject<void>();

  constructor(private blakeDataService: BlakeDataService) {
    // Pure Angular service injection
  }

  ngOnInit(): void {
    // Set global state (will need to be managed via services in full Angular)
    this.setGlobalState();
    
    // Load featured works
    this.loadFeaturedWorks();
    
    // Set up scroll listener
    this.setupScrollListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Clean up scroll listener
    window.removeEventListener('scroll', this.handleScroll);
  }

  /**
   * Set global application state
   */
  private setGlobalState(): void {
    // In full Angular, these would be managed by services/state management
    // For now, using window object for hybrid compatibility
    (window as any).$rootScope = (window as any).$rootScope || {};
    const $rootScope = (window as any).$rootScope;
    
    $rootScope.showOverlay = false;
    $rootScope.worksNavState = true;
    $rootScope.showWorkTitle = 'home';
    $rootScope.help = 'home';
    
    if (!$rootScope.persistentmode) {
      $rootScope.persistentmode = 'gallery';
    }
  }

  /**
   * Load featured works from Blake Data Service
   */
  private loadFeaturedWorks(): void {

    this.blakeDataService.getFeaturedWorks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const results = response.results || response;
          let i = 0;
          let sci = 1;
          const used: string[] = [];

          results.forEach((work: FeaturedWork) => {
            // Handle encoding issues
            if (work.title === "LaocoÃ¶n") {
              work.title = "Laocoön";
            }

            if (used.indexOf(work.bad_id) === -1) {
              used.push(work.bad_id);
              work.column = sci;
              if (++i === 3) {
                ++sci;
                i = 0;
              }
            }
          });

          this.featuredWorks = results;
        },
        error: (error: any) => {
          console.error('Error loading featured works:', error);
          this.loadMockFeaturedWorks();
        }
      });
  }

  /**
   * Load mock featured works for development/testing
   */
  private loadMockFeaturedWorks(): void {
    const mockWorks: FeaturedWork[] = [
      { bad_id: 'work1', title: 'Mock Work 1', desc_id: 'desc1', dbi: 'mock1', byline: 'Mock Byline 1', column: 1 },
      { bad_id: 'work2', title: 'Mock Work 2', desc_id: 'desc2', dbi: 'mock2', byline: 'Mock Byline 2', column: 2 },
      { bad_id: 'work3', title: 'Mock Work 3', desc_id: 'desc3', dbi: 'mock3', byline: 'Mock Byline 3', column: 3 },
      { bad_id: 'work4', title: 'Mock Work 4', desc_id: 'desc4', dbi: 'mock4', byline: 'Mock Byline 4', column: 4 },
      { bad_id: 'work5', title: 'Mock Work 5', desc_id: 'desc5', dbi: 'mock5', byline: 'Mock Byline 5', column: 5 },
      { bad_id: 'work6', title: 'Mock Work 6', desc_id: 'desc6', dbi: 'mock6', byline: 'Mock Byline 6', column: 6 },
    ];
    this.featuredWorks = mockWorks;
  }

  /**
   * Set up parallax scroll listener
   */
  private setupScrollListener(): void {
    window.addEventListener('scroll', this.handleScroll.bind(this));
  }

  /**
   * Handle scroll events for parallax effect
   */
  private handleScroll = (): void => {
    const scrollOffset = window.pageYOffset;
    
    this.columns[1].topOffset = (-90 - (scrollOffset * 0.2)) + 'px';
    this.columns[2].topOffset = (-20 - (scrollOffset * 0.4)) + 'px';
    this.columns[3].topOffset = (-90 - (scrollOffset * 0.14)) + 'px';
    this.columns[4].topOffset = (-20 - (scrollOffset * 0.4)) + 'px';
    this.columns[5].topOffset = (-90 - (scrollOffset * 0.5)) + 'px';
    this.columns[6].topOffset = (-20 - (scrollOffset * 0.3)) + 'px';
    
    this.columnsArray = Object.values(this.columns);
  };

  /**
   * Get featured works for a specific column
   */
  getFeaturedWorksForColumn(columnNumber: number): FeaturedWork[] {
    return this.featuredWorks.filter(work => work.column === columnNumber);
  }

  /**
   * Track by function for column rendering
   */
  trackByColumn(index: number, column: ColumnConfig): string {
    return `column-${index}`;
  }

  /**
   * Track by function for work rendering
   */
  trackByWork(index: number, work: FeaturedWork): string {
    return work.bad_id || `work-${index}`;
  }
}