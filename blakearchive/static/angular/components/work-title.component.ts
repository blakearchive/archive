import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-work-title',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Overlay for Work Information -->
    <div id="Overlay" class="overlay" [class.show]="showOverlay" *ngIf="showOverlay">
      <div>
        <a class="closebtnleft" (click)="showOverlay = false">&times;</a>
        <header class="page-header">
          <p class="subhead">{{ work?.medium_pretty }}</p>
          <h1 style="color:rgba(233,188,71,1)">{{ work?.title }} (Composed {{ work?.composition_date_string }})</h1>
        </header>

        <article class="categories">
          <div style="color:white" class="container">
            <div class="section-group-workinfo" [innerHTML]="work?.info"></div>
            <hr>
            <p class="text-center"><em>Dates are the probable dates of {{ work?.probable }}.</em></p>

            <!-- TODO: Convert work-copies directive -->
            <div class="work-copies-placeholder">
              <!-- <app-work-copies></app-work-copies> -->
            </div>
          </div>
        </article>
      </div>
      <div class="containerForRelatedInOverlay">
        <!-- TODO: Convert all-known-copies and all-known-related-items directives -->
        <div class="all-known-copies-placeholder" *ngIf="work?.medium === 'illbk'">
          <!-- <app-all-known-copies [work]="work"></app-all-known-copies> -->
        </div>
        <div class="all-known-related-items-placeholder" [class.hidden]="!work?.related_works?.length">
          <!-- <app-all-known-related-items [work]="work"></app-all-known-related-items> -->
        </div>
      </div>
    </div>

    <!-- Overlay for Copy Information -->
    <div id="OverlayCopyInfo" class="overlay" [class.show]="showOverlayCopyInfo" *ngIf="showOverlayCopyInfo">
      <a class="closebtnleft" (click)="showOverlayCopyInfo = false">&times;</a>
      
      <!-- Copy Information Header -->
      <header *ngIf="!copy?.archive_set_id && work?.bad_id !== 'bb134'" class="page-header">
        <p class="subhead">COPY INFORMATION</p>
        <h1 style="color:rgba(233,188,71,1)">{{ work?.title }} {{ getCopyPhrase() }} (Composed {{ work?.composition_date_string }})</h1>
      </header>
      
      <header *ngIf="copy?.archive_set_id" class="page-header">
        <p class="subhead">SET INFORMATION</p>
        <h1 style="color:rgba(233,188,71,1)">{{ work?.title }} (Composed {{ work?.composition_date_string }})</h1>
      </header>

      <header *ngIf="!copy?.archive_set_id && work?.bad_id === 'bb134'" class="page-header">
        <p class="subhead">Receipt INFORMATION</p>
        <h1 style="color:rgba(233,188,71,1)">Receipt {{ getCopyPhrase() }}--{{ getTitle() }} (Composed {{ copy?.composition_date_string }})</h1>
      </header>

      <div id="archive-tabs" role="tabpanel">
        <div class="container-fluid overlaycopyinfo">
          <div class="container">
            <div class="tab-content">
              <div role="tabpanel" class="fadeinout tab-pane active in">
                <!-- TODO: Convert copy-information directive -->
                <div class="copy-information-placeholder" *ngIf="!copy?.virtual">
                  <!-- <app-copy-information [copy]="copy" [object]="object"></app-copy-information> -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Work Title Menu Bar -->
    <div class="object-view-menu hidden-xs hidden-sm">
      <!-- Static Page Title -->
      <span *ngIf="showWorkTitle === 'static'" class="worktitle" style="padding: 19px;">
        <a href="" style="color:white;" (click)="scrollToTop()">{{ staticPageTitle }}</a>
      </span>

      <!-- Work Page Title -->
      <span *ngIf="showWorkTitle === 'work'" class="worktitle" style="padding: 19px;">
        <span style="color:white;" (click)="scrollToTop()">{{ getTitle() }} (Composed {{ work?.composition_date_string }})</span>
      </span>

      <!-- Exhibit Title -->
      <span *ngIf="showWorkTitle === 'exhibit' && exhibit?.exhibit?.exhibit_id !== 'fakeblakesshort'" class="worktitle" style="padding: 19px;">
        <span style="color:#eabd39;" (click)="scrollToTop()">Archive Exhibition: {{ getTitle() }} ({{ exhibit?.exhibit?.composition_date_string }})</span>
      </span>

      <span *ngIf="showWorkTitle === 'exhibit' && exhibit?.exhibit?.exhibit_id === 'fakeblakesshort'" class="worktitle" style="padding: 19px;">
        <span style="color:#eabd39;" (click)="scrollToTop()">Archive Exhibition: <a href="" (click)="showArticle = true" style="color:#eabd39;font-weight:bold">{{ getTitle() }}</a> ({{ exhibit?.exhibit?.composition_date_string }})</span>
      </span>

      <!-- Home Page Latest Publication -->
      <span *ngIf="showWorkTitle === 'home'" class="worktitle" style="padding: 19px;">
        <a href="staticpage/update" style="color:#e3b838;">LATEST PUBLICATION (05/28/25): BLAKE'S ANNOTATIONS TO THORNTON'S "THE LORD'S PRAYER"</a>
      </span>

      <!-- Copy Page Titles -->
      <span *ngIf="showWorkTitle !== 'home' && showWorkTitle !== 'exhibit' && showWorkTitle !== 'work' && showWorkTitle !== 'static' && viewMode !== 'compare'" class="worktitle" style="padding: 19px;">
        
        <!-- Letters -->
        <span *ngIf="copy?.bad_id === 'letters'">
          <a href="" (click)="showOverlay = true" style="color:white;">Letters (Composed {{ work?.composition_date_string }})</a>: {{ getTitle() }}
        </span>

        <!-- Shakespeare Illustrations -->
        <span *ngIf="copy?.bad_id === 'shakespearewc'">
          <a href="" (click)="showOverlay = true" style="color:white;">Illustrations to Shakespeare (Composed {{ work?.composition_date_string }})</a>: {{ getTitle() }}
        </span>

        <!-- Regular Works -->
        <span *ngIf="copy?.bad_id !== 'letters' && copy?.bad_id !== 'shakespearewc' && work?.medium !== 'exhibit' && work?.bad_id !== 'bb134'">
          <a href="" (click)="showOverlay = true" style="color:white;">{{ getTitle() }}</a> 
          <a href="" (click)="showOverlayCopyInfo = true" style="color:white;">{{ getCopyPhrase() }}</a> 
          ({{ getCompOrPrintDateString() }})
        </span>

        <!-- Receipts (bb134) -->
        <span *ngIf="copy?.bad_id !== 'letters' && copy?.bad_id !== 'shakespearewc' && work?.medium !== 'exhibit' && work?.bad_id === 'bb134'">
          <a href="" (click)="showOverlay = true" style="color:white;">Receipts</a>: 
          <a href="" (click)="showOverlayCopyInfo = true" style="color:white;">{{ getCopyPhrase() }}--{{ getTitle() }}</a>
        </span>

        <!-- Exhibit Medium -->
        <span *ngIf="copy?.bad_id !== 'letters' && copy?.bad_id !== 'shakespearewc' && work?.medium === 'exhibit'">
          <a href="" (click)="showOverlay = true" style="color:white;">{{ getTitle() }}</a>
        </span>
      </span>

      <!-- Compare Mode -->
      <span *ngIf="viewMode === 'compare' && showWorkTitle !== 'static' && showWorkTitle !== 'exhibit' && showWorkTitle !== 'work'" class="worktitle" style="padding: 19px; color:yellow">
        <a href="" (click)="showOverlay = true" style="color:yellow;">{{ getTitle() }}</a> 
        <a href="" (click)="showOverlayCopyInfo = true" style="color:yellow;">{{ getCopyPhrase() }}</a> 
        ({{ getCompOrPrintDateString() }}) 
        <span style="color:yellow">(Selected)</span>
      </span>
    </div>
  `,
  styles: [`
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.9);
      z-index: 1000;
      display: none;
      overflow-y: auto;
    }

    .overlay.show {
      display: block;
    }

    .closebtnleft {
      position: absolute;
      top: 15px;
      right: 35px;
      color: #f1f1f1;
      font-size: 40px;
      font-weight: bold;
      text-decoration: none;
      cursor: pointer;
    }

    .closebtnleft:hover,
    .closebtnleft:focus {
      color: #bbb;
      text-decoration: none;
      cursor: pointer;
    }

    .page-header {
      text-align: center;
      padding: 50px 20px 20px;
      color: white;
    }

    .subhead {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 10px;
      color: #ccc;
    }

    .categories {
      padding: 20px;
      color: white;
    }

    .section-group-workinfo {
      margin-bottom: 20px;
    }

    .containerForRelatedInOverlay {
      padding: 20px;
    }

    .object-view-menu {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.8);
      z-index: 999;
      display: flex;
      align-items: center;
      min-height: 60px;
    }

    .worktitle {
      color: white;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
    }

    .worktitle a {
      color: inherit;
      text-decoration: none;
      transition: opacity 0.2s ease;
    }

    .worktitle a:hover {
      opacity: 0.8;
      text-decoration: none;
    }

    .hidden {
      display: none !important;
    }

    .container-fluid.overlaycopyinfo {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .tab-content {
      background: rgba(255, 255, 255, 0.1);
      padding: 30px;
      border-radius: 8px;
    }

    .fadeinout {
      transition: all 0.3s ease;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .object-view-menu {
        display: none;
      }
    }

    @media (max-width: 576px) {
      .object-view-menu {
        display: none;
      }
    }
  `]
})
export class WorkTitleComponent implements OnInit, OnDestroy {
  work: any = null;
  copy: any = null;
  object: any = null;
  exhibit: any = null;
  preview: any = null;
  
  showOverlay: boolean = false;
  showOverlayCopyInfo: boolean = false;
  showWorkTitle: string = '';
  staticPageTitle: string = '';
  viewMode: string = '';
  showArticle: boolean = false;

  private destroy$ = new Subject<void>();

  constructor() {}

  ngOnInit(): void {
    // Set up global state watching for AngularJS compatibility
    this.watchGlobalState();
    
    // Load initial data
    this.loadBlakeDataService();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Watch global state for AngularJS compatibility
   */
  private watchGlobalState(): void {
    // Poll for global state changes (not ideal, but needed for hybrid)
    setInterval(() => {
      const $rootScope = (window as any).$rootScope;
      if ($rootScope) {
        this.showWorkTitle = $rootScope.showWorkTitle || '';
        this.staticPageTitle = $rootScope.staticPageTitle || '';
        this.viewMode = $rootScope.view?.mode || '';
        this.showArticle = $rootScope.showArticle || false;
      }
    }, 100);
  }

  /**
   * Load Blake Data Service data
   */
  private loadBlakeDataService(): void {
    // Access Blake Data Service from global or injector
    try {
      const injector = (window as any).angular?.element(document.body).injector();
      if (injector) {
        const blakeDataService = injector.get('BlakeDataService');
        
        // Watch for data changes
        setInterval(() => {
          this.work = blakeDataService.work;
          this.copy = blakeDataService.copy;
          this.object = blakeDataService.object;
          this.exhibit = blakeDataService.exhibit;
          this.preview = blakeDataService.preview;
        }, 100);
      }
    } catch (error) {
      console.warn('Could not access Blake Data Service:', error);
    }
  }

  /**
   * Get the title based on current context
   */
  getTitle(): string {
    // Home page
    if (this.showWorkTitle === 'home') {
      return this.work?.title || '';
    }

    // Work pages
    if (this.showWorkTitle === 'work') {
      return this.work?.title || '';
    }

    // Exhibit pages
    if (this.showWorkTitle === 'exhibit' && this.exhibit?.exhibit) {
      return this.exhibit.exhibit.title || '';
    }

    // Letters
    if (this.work?.bad_id === 'letters' && this.object?.object_group) {
      let title = this.object.object_group;
      const fromMatch = title.match(/\s(from.*)/);
      const toMatch = title.match(/\s(to.*)/);
      
      if (fromMatch) {
        title = fromMatch[1];
      } else if (toMatch) {
        title = toMatch[1];
      } else {
        return title;
      }
      
      return title.charAt(0).toUpperCase() + title.slice(1);
    }

    // Shakespeare Water Colors
    if (this.work?.bad_id === 'shakespearewc' && this.object?.object_group) {
      return this.object.object_group;
    }

    // BB49
    if (this.work?.bad_id === 'bb49' && this.object?.object_group) {
      return this.object.object_group;
    }

    // Virtual Groups
    if (this.work?.virtual) {
      return this.work.title || '';
    }

    // Regular copies with header
    if (this.copy?.header && this.isDoneSettingCopy()) {
      let title = this.copy.header.filedesc?.titlestmt?.title?.['@reg'] || '';
      
      // Handle "Title, The" format
      const theMatch = title.match(/(.*), The/);
      if (theMatch) {
        title = 'The ' + theMatch[1];
      }
      
      return title.trim();
    }

    return '';
  }

  /**
   * Get composition or print date string
   */
  getCompOrPrintDateString(): string {
    if (this.work?.probable === 'printing') {
      return 'Printed ' + (this.copy?.print_date_string || '');
    }
    return 'Composed ' + (this.work?.composition_date_string || '');
  }

  /**
   * Get copy phrase
   */
  getCopyPhrase(): string {
    if (this.work?.virtual) {
      return '';
    }
    
    if (this.copy?.archive_set_id) {
      return this.copy.archive_set_id;
    }
    
    if (this.work?.bad_id === 'bb134') {
      return this.copy?.archive_copy_id ? '#' + this.copy.archive_copy_id : '';
    }
    
    return this.copy?.archive_copy_id ? 'Copy ' + this.copy.archive_copy_id : '';
  }

  /**
   * Get static page title
   */
  getStaticPageTitle(): string {
    return this.staticPageTitle;
  }

  /**
   * Check if done setting copy (for AngularJS compatibility)
   */
  private isDoneSettingCopy(): boolean {
    const $rootScope = (window as any).$rootScope;
    return $rootScope?.doneSettingCopy || false;
  }

  /**
   * Scroll to top functionality
   */
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Close overlays when copy changes (AngularJS compatibility)
   */
  private watchCopyChanges(): void {
    let previousCopy = this.copy;
    setInterval(() => {
      if (this.copy !== previousCopy) {
        this.showOverlay = false;
        this.showOverlayCopyInfo = false;
        previousCopy = this.copy;
      }
    }, 100);
  }
}