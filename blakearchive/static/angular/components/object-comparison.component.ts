import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BlakeDataService } from '../services/blake-data.service';
import { CompareObjectsService, ComparisonObject, ComparisonState } from '../services/compare-objects.service';
import { ApplicationStateService } from '../services/application-state.service';
import { DpiSelectorComponent } from './dpi-selector.component';

@Component({
  selector: 'app-object-comparison',
  standalone: true,
  imports: [CommonModule, DpiSelectorComponent],
  template: `
    <div class="comparison-container" *ngIf="comparisonState">
      <!-- Comparison Header -->
      <div class="comparison-header">
        <div class="comparison-title">
          <h3>Object Comparison</h3>
          <div class="comparison-info">
            <span class="comparison-type">{{ comparisonState.comparisonType | titlecase }}</span>
            <span class="object-count">
              {{ comparisonState.comparisonObjects.length + 1 }} objects
            </span>
          </div>
        </div>
        
        <div class="comparison-controls">
          <app-dpi-selector
            [currentDpi]="currentDpi"
            (dpiChange)="onDpiChange($event)">
          </app-dpi-selector>
          
          <button 
            class="btn btn-secondary"
            (click)="exitComparison()">
            Exit Comparison
          </button>
        </div>
      </div>

      <!-- Main Object -->
      <div class="main-object-section">
        <h4>Main Object</h4>
        <div class="object-display main-object" *ngIf="comparisonState.main">
          <div class="object-image">
            <img 
              [src]="getImageUrl(comparisonState.main)"
              [alt]="comparisonState.main.title || 'Blake Archive Object'"
              (error)="onImageError($event)"
              [style.transform]="getImageTransform()"
            />
          </div>
          <div class="object-info">
            <h5>{{ comparisonState.main.title || 'Untitled' }}</h5>
            <p class="object-id">{{ comparisonState.main.full_object_id }}</p>
            <p class="object-date" *ngIf="comparisonState.main.compdate">
              {{ comparisonState.main.compdate }}
            </p>
          </div>
        </div>
      </div>

      <!-- Comparison Objects Grid -->
      <div class="comparison-objects-section">
        <h4>Comparison Objects</h4>
        <div class="comparison-grid">
          <div 
            *ngFor="let object of comparisonState.comparisonObjects; trackBy: trackByObjectId"
            class="object-display comparison-object">
            <div class="object-image">
              <img 
                [src]="getImageUrl(object)"
                [alt]="object.title || 'Blake Archive Object'"
                (error)="onImageError($event)"
                [style.transform]="getImageTransform()"
              />
            </div>
            <div class="object-info">
              <h5>{{ object.title || 'Untitled' }}</h5>
              <p class="object-id">{{ object.full_object_id }}</p>
              <p class="object-date" *ngIf="object.compdate">
                {{ object.compdate }}
              </p>
              <button 
                class="btn btn-sm btn-outline-secondary"
                (click)="removeFromComparison(object)">
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- No Comparison Objects Message -->
      <div class="no-objects" *ngIf="comparisonState.comparisonObjects.length === 0">
        <p>No objects selected for comparison.</p>
        <p>Use the comparison tools to add objects.</p>
      </div>
    </div>
  `,
  styles: [`
    .comparison-container {
      padding: 20px;
      background: #fff;
      min-height: 100vh;
    }

    .comparison-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 20px;
      border-bottom: 2px solid #dee2e6;
      margin-bottom: 30px;
    }

    .comparison-title h3 {
      margin: 0 0 5px 0;
      color: #2c3e50;
      font-size: 24px;
      font-weight: 600;
    }

    .comparison-info {
      display: flex;
      gap: 15px;
    }

    .comparison-type {
      background: #3498db;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .object-count {
      color: #7f8c8d;
      font-size: 14px;
    }

    .comparison-controls {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .btn {
      padding: 8px 16px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s ease;
    }

    .btn-secondary {
      background: #6c757d;
      border-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #545b62;
      border-color: #4e555b;
    }

    .btn-outline-secondary {
      border-color: #6c757d;
      color: #6c757d;
    }

    .btn-outline-secondary:hover {
      background: #6c757d;
      color: white;
    }

    .btn-sm {
      padding: 4px 8px;
      font-size: 12px;
    }

    .main-object-section,
    .comparison-objects-section {
      margin-bottom: 40px;
    }

    .main-object-section h4,
    .comparison-objects-section h4 {
      margin: 0 0 20px 0;
      color: #34495e;
      font-size: 18px;
      font-weight: 600;
      padding-bottom: 10px;
      border-bottom: 1px solid #ecf0f1;
    }

    .object-display {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .main-object {
      max-width: 600px;
    }

    .comparison-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .object-image {
      text-align: center;
      margin-bottom: 15px;
      background: white;
      padding: 15px;
      border-radius: 6px;
      border: 1px solid #e9ecef;
    }

    .object-image img {
      max-width: 100%;
      max-height: 300px;
      height: auto;
      transition: transform 0.3s ease;
      cursor: zoom-in;
    }

    .object-image img:hover {
      transform: scale(1.05);
    }

    .object-info {
      text-align: center;
    }

    .object-info h5 {
      margin: 0 0 8px 0;
      color: #2c3e50;
      font-size: 16px;
      font-weight: 600;
    }

    .object-id {
      color: #7f8c8d;
      font-size: 13px;
      margin: 0 0 5px 0;
      font-family: 'Courier New', monospace;
    }

    .object-date {
      color: #95a5a6;
      font-size: 12px;
      margin: 0 0 15px 0;
      font-style: italic;
    }

    .no-objects {
      text-align: center;
      padding: 60px 20px;
      color: #7f8c8d;
      background: #f8f9fa;
      border-radius: 8px;
      border: 2px dashed #dee2e6;
    }

    .no-objects p {
      margin: 0 0 10px 0;
      font-size: 16px;
    }

    .no-objects p:last-child {
      font-size: 14px;
      color: #95a5a6;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .comparison-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
      }

      .comparison-controls {
        width: 100%;
        justify-content: space-between;
      }

      .comparison-grid {
        grid-template-columns: 1fr;
      }

      .object-image img {
        max-height: 250px;
      }
    }
  `]
})
export class ObjectComparisonComponent implements OnInit, OnDestroy {
  comparisonState: ComparisonState | null = null;
  currentDpi: string = '100';
  
  private destroy$ = new Subject<void>();

  constructor(
    private blakeDataService: BlakeDataService,
    private compareObjectsService: CompareObjectsService,
    private appState: ApplicationStateService
  ) {}

  ngOnInit(): void {
    // Subscribe to comparison state changes
    this.compareObjectsService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.comparisonState = state;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getImageUrl(object: ComparisonObject): string {
    const dbi = object.dbi || object.desc_id;
    if (!dbi) return '';
    return `/static/img/full/${dbi}.${this.currentDpi}.jpg`;
  }

  getImageTransform(): string {
    // Future: implement zoom, rotation controls for comparison view
    return '';
  }

  onDpiChange(dpi: string): void {
    this.currentDpi = dpi;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    
    // Try fallback image
    const parent = img.parentElement;
    if (parent) {
      const fallback = document.createElement('div');
      fallback.className = 'image-fallback';
      fallback.textContent = 'Image not available';
      fallback.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        width: 200px;
        height: 200px;
        background: #f8f9fa;
        border: 2px dashed #dee2e6;
        color: #6c757d;
        font-size: 14px;
        margin: 0 auto;
      `;
      parent.appendChild(fallback);
    }
  }

  exitComparison(): void {
    this.compareObjectsService.resetComparisonObjects();
    
    // Update application state to exit comparison mode
    this.appState.setViewMode('object');
    
    // Emit custom event for any listening components
    this.appState.emitEvent('comparison:exit');
  }

  removeFromComparison(object: ComparisonObject): void {
    this.compareObjectsService.removeComparisonObject(object);
  }

  trackByObjectId(index: number, object: ComparisonObject): string {
    return object.object_id;
  }
}