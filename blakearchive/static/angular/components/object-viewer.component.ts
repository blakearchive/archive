import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ObjectViewerService } from '../services/object-viewer.service';
import { BlakeDataService } from '../services/blake-data.service';
import { ApplicationStateService } from '../services/application-state.service';
import { LoadingIndicatorComponent } from './loading-indicator.component';
import { DpiSelectorComponent } from './dpi-selector.component';

export interface BlakeObject {
  desc_id: string;
  supplemental?: string;
  object_group?: string;
  source?: any;
  header?: any;
}

export interface BlakeCopy {
  virtual?: boolean;
  archive_copy_id?: string;
  header?: any;
  source?: any;
}

@Component({
  selector: 'app-object-viewer',
  standalone: true,
  imports: [CommonModule, LoadingIndicatorComponent, DpiSelectorComponent],
  template: `
    <div id="carousel-example-generic" class="carousel slide object-viewer-container">
      <!-- Loading indicator -->
      <app-loading-indicator 
        *ngIf="isLoading"
        operation="load-object"
        loadingText="Loading object data..."
        size="medium"
        type="block">
      </app-loading-indicator>

      <div class="featured-object" *ngIf="!isLoading">
        <div class="carousel-inner" role="listbox">
          <!-- Regular Object Viewer -->
          <div class="regular-object-viewer" [class.active]="!isSupplementalMode">
            <div class="object-content">
              <div *ngIf="currentObject" class="object-display">
                <h3>{{ getObjectTitle() }}</h3>
                
                <!-- Object Image -->
                <div class="object-image-container">
                  <div class="image-viewer" 
                       [style.width.px]="imageWidth" 
                       [style.height.px]="imageHeight">
                    <img 
                      *ngIf="getImageUrl()" 
                      class="blake-object-image"
                      [src]="getImageUrl()"
                      [alt]="getImageAlt()"
                      [style.transform]="getImageTransform()"
                      [style.max-width.%]="imageMaxWidth"
                      (load)="onImageLoad($event)"
                      (error)="onImageError($event)"
                      (click)="toggleZoom()"
                    >
                    
                    <!-- Image controls -->
                    <div class="image-controls" *ngIf="showImageControls">
                      <div class="zoom-controls">
                        <button 
                          type="button" 
                          class="btn btn-sm btn-zoom"
                          (click)="zoomIn()"
                          [disabled]="zoomLevel >= maxZoom"
                          title="Zoom In"
                        >
                          +
                        </button>
                        
                        <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
                        
                        <button 
                          type="button" 
                          class="btn btn-sm btn-zoom"
                          (click)="zoomOut()"
                          [disabled]="zoomLevel <= minZoom"
                          title="Zoom Out"
                        >
                          −
                        </button>
                        
                        <button 
                          type="button" 
                          class="btn btn-sm btn-zoom"
                          (click)="resetZoom()"
                          title="Reset Zoom"
                        >
                          Reset
                        </button>
                      </div>
                      
                      <div class="dpi-controls">
                        <app-dpi-selector 
                          [currentDpi]="currentDpi"
                          (dpiChange)="changeDpi($event)">
                        </app-dpi-selector>
                      </div>
                      
                      <div class="image-tools">
                        <button 
                          type="button" 
                          class="btn btn-sm btn-tool"
                          (click)="rotateImage(90)"
                          title="Rotate Right"
                        >
                          ↻
                        </button>
                        
                        <button 
                          type="button" 
                          class="btn btn-sm btn-tool"
                          (click)="rotateImage(-90)"
                          title="Rotate Left"
                        >
                          ↺
                        </button>
                        
                        <button 
                          type="button" 
                          class="btn btn-sm btn-tool"
                          (click)="flipHorizontal()"
                          title="Flip Horizontal"
                        >
                          ↔
                        </button>
                      </div>
                    </div>
                    
                    <!-- Loading indicator -->
                    <div class="image-loading" *ngIf="imageLoading">
                      <div class="loading-spinner"></div>
                      <p>Loading image...</p>
                    </div>
                    
                    <!-- Error message -->
                    <div class="image-error" *ngIf="imageError">
                      <p>Failed to load image</p>
                      <button 
                        type="button" 
                        class="btn btn-sm btn-retry"
                        (click)="retryImageLoad()"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                </div>
                
                <!-- Object Information -->
                <div class="object-info">
                  <div *ngIf="currentObject.object_group" class="object-group">
                    <strong>Object Group:</strong> {{ currentObject.object_group }}
                  </div>
                  
                  <div *ngIf="hasSource()" class="object-source">
                    <strong>Source:</strong>
                    <pre>{{ getSourceInfo() | json }}</pre>
                  </div>
                </div>
              </div>
              
              <div *ngIf="!currentObject" class="no-object">
                <p>No object selected</p>
              </div>
            </div>
          </div>
          
          <!-- Supplemental Image Viewer -->
          <div class="supplemental-image-viewer" [class.active]="isSupplementalMode">
            <div class="supplemental-content">
              <div *ngIf="currentObject?.supplemental" class="supplemental-display">
                <h3>Supplemental View: {{ currentObject.supplemental }}</h3>
                
                <div class="supplemental-image-container">
                  <div class="image-placeholder">
                    <!-- TODO: Implement supplemental image display -->
                    <p>Supplemental Image: {{ currentObject.supplemental }}</p>
                  </div>
                </div>
              </div>
              
              <div *ngIf="!currentObject?.supplemental" class="no-supplemental">
                <p>No supplemental view available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Navigation Controls -->
      <div class="object-viewer-navigation">
        <div class="nav-controls">
          <!-- Previous/Next Navigation -->
          <div class="previous-next-controls">
            <button 
              type="button"
              class="btn btn-nav btn-previous"
              [disabled]="!hasPrevious()"
              (click)="goToPrevious()"
              title="Previous Object"
            >
              <span class="nav-arrow">‹</span>
              Previous
            </button>
            
            <div class="object-counter" *ngIf="getTotalCount() > 0">
              <span>{{ getCurrentIndex() + 1 }} of {{ getTotalCount() }}</span>
            </div>
            
            <button 
              type="button"
              class="btn btn-nav btn-next"
              [disabled]="!hasNext()"
              (click)="goToNext()"
              title="Next Object"
            >
              Next
              <span class="nav-arrow">›</span>
            </button>
          </div>
          
          <!-- View Mode Toggle -->
          <div class="view-mode-controls">
            <button 
              type="button"
              class="btn btn-toggle"
              [class.active]="!isSupplementalMode"
              (click)="setRegularMode()"
            >
              Regular View
            </button>
            
            <button 
              type="button"
              class="btn btn-toggle"
              [class.active]="isSupplementalMode"
              [disabled]="!hasSupplementalView()"
              (click)="setSupplementalMode()"
            >
              Supplemental View
            </button>
          </div>
          
          <!-- Additional Controls -->
          <div class="additional-controls">
            <button 
              type="button"
              class="btn btn-action"
              (click)="openUseRestriction()"
              *ngIf="hasUseRestriction()"
            >
              Use Restriction
            </button>
            
            <button 
              type="button"
              class="btn btn-action"
              (click)="refreshObject()"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .object-viewer-container {
      position: relative;
      background: #2c3e50;
      min-height: 600px;
      border-radius: 8px;
      overflow: hidden;
      color: white;
    }
    
    .featured-object {
      position: relative;
      width: 100%;
      height: 100%;
    }
    
    .carousel-inner {
      position: relative;
      width: 100%;
      overflow: hidden;
    }
    
    .regular-object-viewer,
    .supplemental-image-viewer {
      display: none;
      width: 100%;
      padding: 20px;
    }
    
    .regular-object-viewer.active,
    .supplemental-image-viewer.active {
      display: block;
    }
    
    .object-content,
    .supplemental-content {
      min-height: 500px;
    }
    
    .object-display h3,
    .supplemental-display h3 {
      color: #ecf0f1;
      margin-bottom: 20px;
      text-align: center;
    }
    
    .object-image-container,
    .supplemental-image-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 300px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      margin-bottom: 20px;
    }
    
    .image-placeholder {
      text-align: center;
      color: #bdc3c7;
      padding: 40px;
    }
    
    .object-info {
      background: rgba(255, 255, 255, 0.05);
      padding: 15px;
      border-radius: 6px;
      margin-top: 20px;
    }
    
    .object-info strong {
      color: #3498db;
    }
    
    .object-info pre {
      background: rgba(0, 0, 0, 0.2);
      padding: 10px;
      border-radius: 4px;
      margin-top: 10px;
      font-size: 12px;
      overflow-x: auto;
    }
    
    .no-object,
    .no-supplemental {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      color: #95a5a6;
      font-size: 18px;
    }
    
    .object-viewer-navigation {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.8);
      padding: 15px;
    }
    
    .nav-controls {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      align-items: center;
      justify-content: space-between;
    }
    
    .previous-next-controls {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .view-mode-controls {
      display: flex;
      gap: 10px;
    }
    
    .additional-controls {
      display: flex;
      gap: 10px;
    }
    
    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .btn-nav {
      background-color: #3498db;
      color: white;
    }
    
    .btn-nav:hover:not(:disabled) {
      background-color: #2980b9;
    }
    
    .btn-toggle {
      background-color: #34495e;
      color: #bdc3c7;
    }
    
    .btn-toggle.active {
      background-color: #e67e22;
      color: white;
    }
    
    .btn-toggle:hover:not(:disabled) {
      background-color: #4a5f7a;
    }
    
    .btn-action {
      background-color: #27ae60;
      color: white;
    }
    
    .btn-action:hover {
      background-color: #229954;
    }
    
    .nav-arrow {
      font-size: 18px;
      font-weight: bold;
    }
    
    .object-counter {
      background: rgba(255, 255, 255, 0.1);
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 14px;
      color: #ecf0f1;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
      .nav-controls {
        flex-direction: column;
        gap: 10px;
      }
      
      .previous-next-controls {
        width: 100%;
        justify-content: space-between;
      }
      
      .view-mode-controls,
      .additional-controls {
        width: 100%;
        justify-content: center;
      }
    }

    /* Image display styles */
    .object-image-container {
      position: relative;
      margin: 20px 0;
      background: #000;
      border-radius: 8px;
      overflow: hidden;
    }

    .image-viewer {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      max-height: 80vh;
      overflow: auto;
      background: #000;
    }

    .blake-object-image {
      max-width: 100%;
      max-height: 100%;
      cursor: zoom-in;
      transition: transform 0.3s ease;
      transform-origin: center;
    }

    .blake-object-image:hover {
      cursor: grab;
    }

    .blake-object-image:active {
      cursor: grabbing;
    }

    /* Image controls */
    .image-controls {
      position: absolute;
      top: 10px;
      right: 10px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: rgba(0, 0, 0, 0.8);
      padding: 10px;
      border-radius: 6px;
      z-index: 10;
    }

    .zoom-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .image-tools {
      display: flex;
      gap: 5px;
    }

    .btn-zoom,
    .btn-tool {
      background: #3498db;
      color: white;
      border: none;
      padding: 6px 10px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      transition: background-color 0.2s;
      min-width: 32px;
    }

    .btn-zoom:hover:not(:disabled),
    .btn-tool:hover {
      background: #2980b9;
    }

    .btn-zoom:disabled {
      background: #7f8c8d;
      cursor: not-allowed;
    }

    .zoom-level {
      color: white;
      font-size: 12px;
      min-width: 40px;
      text-align: center;
    }

    /* Loading and error states */
    .image-loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      color: white;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-left: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 10px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .image-error {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      color: #e74c3c;
      background: rgba(0, 0, 0, 0.8);
      padding: 20px;
      border-radius: 6px;
    }

    .btn-retry {
      background: #e67e22;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 10px;
    }

    .btn-retry:hover {
      background: #d35400;
    }
  `]
})
export class ObjectViewerComponent implements OnInit, OnDestroy, OnChanges {
  @Input() copyId: string | null = null;
  @Input() descId: string | null = null;
  
  currentObject: BlakeObject | null = null;
  currentCopy: BlakeCopy | null = null;
  isSupplementalMode: boolean = false;
  onWorkPage: boolean = false;
  isLoading: boolean = false;

  // Image display properties
  imageWidth: number = 800;
  imageHeight: number = 600;
  imageMaxWidth: number = 100;
  zoomLevel: number = 1;
  minZoom: number = 0.25;
  maxZoom: number = 4;
  rotation: number = 0;
  flipX: boolean = false;
  imageLoading: boolean = true;
  imageError: boolean = false;
  showImageControls: boolean = true;
  
  // Current DPI setting
  currentDpi: string = '100';

  // Navigation properties
  allObjects: BlakeObject[] = [];
  currentObjectIndex: number = 0;

  // Math reference for template
  Math = Math;

  private destroy$ = new Subject<void>();

  constructor(
    private objectViewerService: ObjectViewerService,
    private blakeDataService: BlakeDataService,
    private appState: ApplicationStateService
  ) {}

  ngOnInit(): void {
    // Set global state
    this.setGlobalState();
    
    // Subscribe to supplemental state changes
    this.objectViewerService.supplemental$
      .pipe(takeUntil(this.destroy$))
      .subscribe(supplemental => {
        this.isSupplementalMode = supplemental;
      });
    
    // Set up keyboard navigation
    this.setupKeyboardNavigation();
    
    // Load object data if we have inputs
    if (this.copyId || this.descId) {
      this.loadObjectData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Reload object data when inputs change
    if ((changes['copyId'] || changes['descId']) && 
        (this.copyId || this.descId)) {
      this.loadObjectData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Set global state for AngularJS compatibility
   */
  /**
   * Set up keyboard navigation
   */
  private setupKeyboardNavigation(): void {
    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        // Only handle keys when object viewer is focused or visible
        if (!this.isObjectViewerActive()) return;
        
        switch (event.key) {
          case 'ArrowLeft':
          case 'ArrowUp':
            event.preventDefault();
            this.goToPrevious();
            break;
          case 'ArrowRight':
          case 'ArrowDown':
            event.preventDefault();
            this.goToNext();
            break;
          case ' ': // Space bar
            event.preventDefault();
            this.toggleZoom();
            break;
          case 'r':
          case 'R':
            event.preventDefault();
            this.rotateImage(90);
            break;
          case 'f':
          case 'F':
            event.preventDefault();
            this.flipHorizontal();
            break;
          case '0':
            event.preventDefault();
            this.resetZoom();
            break;
          case '+':
          case '=':
            event.preventDefault();
            this.zoomIn();
            break;
          case '-':
          case '_':
            event.preventDefault();
            this.zoomOut();
            break;
        }
      });
  }

  /**
   * Check if object viewer should handle keyboard events
   */
  private isObjectViewerActive(): boolean {
    // Only handle keyboard events if we're in gallery mode and have an object
    const persistentMode = this.appState.getCurrentState().persistentMode;
    return persistentMode === 'gallery' && !!this.currentObject;
  }

  private setGlobalState(): void {
    // No longer needed as we use ApplicationStateService
    // Keep method for compatibility during transition
  }

  /**
   * Initialize services for hybrid compatibility
   */
  /**
   * Load object data using proper Angular services
   */
  private loadObjectData(): void {
    if (!this.copyId && !this.descId) return;
    
    this.isLoading = true;

    // If we have a descId, load the specific object
    if (this.descId) {
      this.blakeDataService.getObject(this.descId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (objectData) => {
            this.currentObject = objectData;
            this.isLoading = false;
            
            // Initialize object viewer service with Blake data interface
            const blakeData = {
              copy: this.currentCopy,
              object: this.currentObject,
              copyObjects: []
            };
            this.objectViewerService.init(blakeData);
          },
          error: (error) => {
            console.error('Error loading object:', error);
            this.isLoading = false;
          }
        });
    }

    // Load copy data if we have copyId  
    if (this.copyId) {
      this.currentCopy = this.blakeDataService.getCurrentCopy();
      
      // Load all objects in this copy for navigation
      this.blakeDataService.getObjectsForCopy(this.copyId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (objects) => {
            this.allObjects = objects || [];
            // Find current object index
            if (this.descId) {
              this.currentObjectIndex = this.allObjects.findIndex(obj => obj.desc_id === this.descId);
              if (this.currentObjectIndex === -1) this.currentObjectIndex = 0;
            }
          },
          error: (error) => {
            console.error('Error loading copy objects:', error);
            this.allObjects = [];
          }
        });
    }
  }


  /**
   * Get object title
   */
  getObjectTitle(): string {
    return this.objectViewerService.getOvpTitle() || 'Object Viewer';
  }

  /**
   * Check if object has source information
   */
  hasSource(): boolean {
    return !!this.objectViewerService.getSource();
  }

  /**
   * Get source information
   */
  getSourceInfo(): any {
    return this.objectViewerService.getSource();
  }

  /**
   * Check if there's a previous object
   */
  hasPrevious(): boolean {
    return this.objectViewerService.hasPreviousObject();
  }

  /**
   * Check if there's a next object
   */
  hasNext(): boolean {
    return this.objectViewerService.hasNextObject();
  }

  /**
   * Go to previous object
   */
  goToPrevious(): void {
    const previousObject = this.objectViewerService.getPreviousObject();
    if (previousObject) {
      this.objectViewerService.changeObject(previousObject);
      this.loadObjectData();
    }
  }

  /**
   * Go to next object
   */
  goToNext(): void {
    const nextObject = this.objectViewerService.getNextObject();
    if (nextObject) {
      this.objectViewerService.changeObject(nextObject);
      this.loadObjectData();
    }
  }

  /**
   * Get current object index
   */
  getCurrentIndex(): number {
    return this.objectViewerService.getCurrentObjectIndex();
  }

  /**
   * Get total object count
   */
  getTotalCount(): number {
    return this.objectViewerService.getTotalObjectCount();
  }

  /**
   * Check if supplemental view is available
   */
  hasSupplementalView(): boolean {
    return !!(this.currentObject?.supplemental);
  }

  /**
   * Set regular view mode
   */
  setRegularMode(): void {
    this.objectViewerService.setSupplementalState(false);
    this.isSupplementalMode = false;
  }

  /**
   * Set supplemental view mode
   */
  setSupplementalMode(): void {
    if (this.hasSupplementalView()) {
      this.objectViewerService.setSupplementalState(true);
      this.isSupplementalMode = true;
    }
  }

  /**
   * Check if use restriction is available
   */
  hasUseRestriction(): boolean {
    return !!(this.currentCopy?.header?.userestrict || this.currentObject?.header?.userestrict);
  }

  /**
   * Open use restriction modal
   */
  openUseRestriction(): void {
    if (this.currentCopy && this.currentObject) {
      this.objectViewerService.useRestrictOpen(this.currentCopy, this.currentObject);
    }
  }

  /**
   * Refresh object data
   */
  refreshObject(): void {
    this.loadObjectData();
  }

  // Image display and manipulation methods

  /**
   * Get the URL for the current object image
   */
  getImageUrl(): string | null {
    if (!this.currentObject?.desc_id) return null;
    
    // Blake Archive image URL pattern
    return `/static/img/full/${this.currentObject.desc_id}.${this.currentDpi}.jpg`;
  }

  /**
   * Get alt text for the image
   */
  getImageAlt(): string {
    const title = this.getObjectTitle();
    return `Blake Archive object: ${title}`;
  }

  /**
   * Get CSS transform for the image
   */
  getImageTransform(): string {
    const transforms = [];
    
    if (this.zoomLevel !== 1) {
      transforms.push(`scale(${this.zoomLevel})`);
    }
    
    if (this.rotation !== 0) {
      transforms.push(`rotate(${this.rotation}deg)`);
    }
    
    if (this.flipX) {
      transforms.push('scaleX(-1)');
    }
    
    return transforms.join(' ');
  }

  /**
   * Handle image load success
   */
  onImageLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    this.imageLoading = false;
    this.imageError = false;
    
    // Update dimensions based on loaded image
    this.imageWidth = img.naturalWidth;
    this.imageHeight = img.naturalHeight;
  }

  /**
   * Handle image load error
   */
  onImageError(event: Event): void {
    this.imageLoading = false;
    this.imageError = true;
    console.error('Failed to load Blake Archive image:', this.getImageUrl());
  }

  /**
   * Retry loading the image
   */
  retryImageLoad(): void {
    this.imageLoading = true;
    this.imageError = false;
    
    // Force image reload by updating timestamp
    const currentUrl = this.getImageUrl();
    if (currentUrl) {
      // Trigger change detection
      setTimeout(() => {
        this.imageLoading = true;
      }, 10);
    }
  }

  /**
   * Zoom in
   */
  zoomIn(): void {
    if (this.zoomLevel < this.maxZoom) {
      this.zoomLevel = Math.min(this.zoomLevel * 1.5, this.maxZoom);
    }
  }

  /**
   * Zoom out
   */
  zoomOut(): void {
    if (this.zoomLevel > this.minZoom) {
      this.zoomLevel = Math.max(this.zoomLevel / 1.5, this.minZoom);
    }
  }

  /**
   * Reset zoom to 100%
   */
  resetZoom(): void {
    this.zoomLevel = 1;
    this.rotation = 0;
    this.flipX = false;
  }

  /**
   * Toggle zoom between fit and 100%
   */
  toggleZoom(): void {
    if (this.zoomLevel === 1) {
      this.zoomLevel = 1.5;
    } else {
      this.resetZoom();
    }
  }

  /**
   * Rotate image by degrees
   */
  rotateImage(degrees: number): void {
    this.rotation = (this.rotation + degrees) % 360;
    if (this.rotation < 0) {
      this.rotation += 360;
    }
  }

  /**
   * Flip image horizontally
   */
  flipHorizontal(): void {
    this.flipX = !this.flipX;
  }

  /**
   * Change DPI setting
   */
  changeDpi(dpi: string): void {
    if (['75', '100', '150', '200', '300'].includes(dpi)) {
      this.currentDpi = dpi;
      this.imageLoading = true;
      this.imageError = false;
    }
  }
}