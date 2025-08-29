import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BlakeDataService } from '../services/blake-data.service';
import { CompareObjectsService } from '../services/compare-objects.service';
import { ImageManipulationService } from '../services/image-manipulation.service';
import { ApplicationStateService } from '../services/application-state.service';
import { ReactiveStateService } from '../services/reactive-state.service';
import { ObjectViewerComponent } from './object-viewer.component';
import { ObjectEditButtonsComponent } from './object-edit-buttons.component';
import { InfoTrayComponent } from './info-tray.component';
import { CopyTabsComponent } from './copy-tabs.component';
import { ObjectComparisonComponent } from './object-comparison.component';
import { ReadingModeComponent } from './reading-mode.component';

@Component({
  selector: 'app-copy',
  standalone: true,
  imports: [CommonModule, ObjectViewerComponent, ObjectEditButtonsComponent, InfoTrayComponent, CopyTabsComponent, ObjectComparisonComponent, ReadingModeComponent],
  template: `
    <div class="copy-container" [class.tools-hidden]="!showTools">
      <!-- Toolbar -->
      <div class="toolbar" [class.show]="showTools">
        <div class="toolbar-controls">
          <button 
            type="button" 
            class="btn btn-primary"
            (click)="toggleTray()"
          >
            Toggle Tray
          </button>
          
          <button 
            type="button" 
            class="btn btn-secondary"
            (click)="toggleTools()"
          >
            {{ showTools ? 'Hide Tools' : 'Show Tools' }}
          </button>
          
          <div class="ovp-controls" *ngIf="showTools">
            <!-- OVP (Object Viewer Panel) controls -->
            <button 
              type="button" 
              class="btn btn-info"
              (click)="openTrueSize()"
              [disabled]="!canOpenTrueSize()"
            >
              True Size
            </button>
          </div>
        </div>
      </div>

      <!-- Main content area -->
      <div class="copy-content" [class.tray-open]="trayOpen">
        <div *ngIf="copyId" class="copy-display">
          
          <div *ngIf="doneSettingCopy" class="object-view-container">
            <!-- Object Viewer -->
            <div class="object-view" 
                 [class.show-tools]="showTools" 
                 [class.hide-tools]="!showTools"
                 [class.view-objects]="persistentMode === 'gallery'"
                 [class.reading-view]="persistentMode === 'reading'"
                 [class.compare-objects]="viewMode === 'compare'">
              
              <!-- Gallery Mode Object Viewer -->
              <app-object-viewer 
                *ngIf="persistentMode === 'gallery' && viewMode !== 'compare'"
                [copyId]="copyId"
                [descId]="descId">
              </app-object-viewer>
              
              <!-- Object Edit Buttons -->
              <app-object-edit-buttons 
                *ngIf="persistentMode !== 'reading'"
                [copyId]="copyId"
                [descId]="descId">
              </app-object-edit-buttons>
              
              <!-- Object Comparison Component -->
              <app-object-comparison 
                *ngIf="viewMode === 'compare'">
              </app-object-comparison>
              
              <!-- Reading Mode Component -->
              <app-reading-mode 
                *ngIf="persistentMode === 'reading'"
                [copyId]="copyId"
                [descId]="descId">
              </app-reading-mode>
            </div>
          </div>
          
          <div *ngIf="!doneSettingCopy" class="copy-loading">
            <p>Loading copy data...</p>
          </div>
        </div>
        
        <div *ngIf="!copyId" class="no-copy">
          <p>No copy selected</p>
        </div>
      </div>

      <!-- Info tray -->
      <app-info-tray 
        [isOpen]="trayOpen"
        [adjustHeight]="persistentMode === 'reading' ? 10 : 134"
        (toggle)="toggleTray()">
      </app-info-tray>
    </div>

    <!-- Copy tabs section -->
    <div class="archive-tabs" role="tabpanel" *ngIf="persistentMode !== 'reading' && doneSettingCopy">
      <app-copy-tabs></app-copy-tabs>
    </div>
  `,
  styles: [`
    .copy-container {
      position: relative;
      min-height: 100vh;
      transition: all 0.3s ease;
    }
    
    .toolbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 10px;
      z-index: 1000;
      transform: translateY(-100%);
      transition: transform 0.3s ease;
    }
    
    .toolbar.show {
      transform: translateY(0);
    }
    
    .toolbar-controls {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .ovp-controls {
      display: flex;
      gap: 10px;
      margin-left: 20px;
    }
    
    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.2s ease;
    }
    
    .btn-primary {
      background-color: #007bff;
      color: white;
    }
    
    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }
    
    .btn-info {
      background-color: #17a2b8;
      color: white;
    }
    
    .btn:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
    
    .copy-content {
      padding: 20px;
      margin-top: 60px;
      transition: margin-right 0.3s ease;
    }
    
    .copy-content.tray-open {
      margin-right: 300px;
    }
    
    .copy-display h2 {
      color: #333;
      margin-bottom: 20px;
    }
    
    .object-info {
      background: #f8f9fa;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
    
    .copy-loading, .copy-ready {
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .no-copy {
      text-align: center;
      color: #666;
      margin-top: 100px;
    }
    
    .info-tray {
      position: fixed;
      top: 0;
      right: 0;
      width: 300px;
      height: 100vh;
      background: white;
      border-left: 1px solid #ddd;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      z-index: 999;
    }
    
    .info-tray.open {
      transform: translateX(0);
    }
    
    .tray-content {
      padding: 20px;
      margin-top: 60px;
    }
    
    .tray-content h3 {
      margin-bottom: 20px;
      color: #333;
    }
    
    .tools-hidden .copy-content {
      margin-top: 20px;
    }

    .archive-tabs {
      background: #f8f9fa;
      padding: 20px;
      border-top: 1px solid #dee2e6;
    }
  `]
})
export class CopyComponent implements OnInit, OnDestroy {
  copyId: string | null = null;
  descId: string | null = null;
  showTools: boolean = true;
  trayOpen: boolean = false;
  doneSettingCopy: boolean = false;
  persistentMode: string = 'gallery'; // 'gallery' or 'reading'
  viewMode: string = 'object'; // 'object' or 'compare'

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private blakeDataService: BlakeDataService,
    private compareObjectsService: CompareObjectsService,
    private imageManipulationService: ImageManipulationService,
    private appState: ApplicationStateService,
    private reactiveState: ReactiveStateService
  ) {}

  ngOnInit(): void {
    // Set global state
    this.setGlobalState();
    
    // Get route parameters
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.copyId = params['copyId'];
        this.descId = params['descId']; // from query params
        this.loadCopy();
      });
    
    // Get query parameters for descId
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(queryParams => {
        if (queryParams['descId']) {
          this.descId = queryParams['descId'];
        }
      });

    // Set up event listeners
    this.setupEventListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Set application state using modern Angular service
   */
  private setGlobalState(): void {
    // Set initial application state
    this.appState.setWorksNavState(false);
    this.appState.setShowWorkTitle('copy');
    this.appState.setShowOverlay(false);
    this.appState.setZoom(false);
    this.appState.setSupplemental(false);
    this.appState.setHelp('copy');
    this.appState.setDpiValue('100');
    this.appState.setDoneSettingCopy(false);
    
    // Set persistent mode if not already set
    const currentPersistentMode = this.appState.getCurrentState().persistentMode;
    if (!currentPersistentMode || currentPersistentMode === 'gallery') {
      this.appState.setPersistentMode('gallery');
    }
    
    // Initialize view settings
    this.appState.setViewMode('object');
    this.appState.setViewScope('image');
    
    // Subscribe to state changes using reactive state service (preferred)
    // Note: In Angular 17+, we could use signals directly in templates
    // but maintaining observables for compatibility
    this.appState.persistentMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe(mode => this.persistentMode = mode);
      
    this.appState.viewState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(view => this.viewMode = view.mode);

    // Example: Using reactive state service for more efficient updates
    // this.persistentMode = this.reactiveState.persistentMode();
    // this.viewMode = this.reactiveState.viewMode();
  }

  /**
   * Load copy data using Blake Data Service
   */
  private loadCopy(): void {
    if (!this.copyId) return;

    // Use proper Angular services
    this.blakeDataService.setSelectedCopy(this.copyId, this.descId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Reset comparison objects
          this.compareObjectsService.resetComparisonObjects();
          
          // Set application state using modern Angular service
          this.appState.setViewMode('object');
          this.appState.setViewScope('image');
          this.appState.setDoneSettingCopy(true);
          this.doneSettingCopy = true;
        },
        error: (error: any) => {
          console.error('Error setting copy:', error);
        }
      });
  }

  /**
   * Set up event listeners for AngularJS compatibility
   */
  private setupEventListeners(): void {
    // Listen for PPI save events
    fromEvent(window, 'clientPpi::savedPpi')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const persistentMode = this.appState.getCurrentState().persistentMode;
        if (persistentMode !== 'reading') {
          this.openTrueSize();
        }
      });

    // Listen for object change events
    fromEvent(window, 'change::selectedObject')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.imageManipulationService.reset();
      });
  }

  /**
   * Toggle toolbar visibility
   */
  toggleTools(): void {
    this.showTools = !this.showTools;
    // Broadcast event for AngularJS components
    const event = new CustomEvent('copyCtrl::toggleTools', { detail: this.showTools });
    window.dispatchEvent(event);
  }

  /**
   * Toggle information tray
   */
  toggleTray(): void {
    this.appState.setWorksNavState(false);
    this.trayOpen = !this.trayOpen;
  }

  /**
   * Open true size window
   */
  openTrueSize(): void {
    if (!this.canOpenTrueSize()) return;
    
    const url = `/new-window/truesize/${this.copyId}?descId=${this.descId}`;
    window.open(url, '_blank', 'width=800, height=600');
  }

  /**
   * Check if true size can be opened
   */
  canOpenTrueSize(): boolean {
    return !!(this.copyId && this.descId && this.doneSettingCopy);
  }

  /**
   * Get object to transform (for OVP toolbar)
   */
  getObjectToTransform(): any {
    const viewState = this.appState.getCurrentState().view;
    
    if (viewState.mode === 'object') {
      return this.blakeDataService.getCurrentObject();
    }
    if (viewState.mode === 'compare') {
      return this.compareObjectsService.getMainObject();
    }
    
    return {};
  }
}