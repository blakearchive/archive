import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BlakeDataService } from '../services/blake-data.service';
import { ApplicationStateService } from '../services/application-state.service';

@Component({
  selector: 'app-reading-mode',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="reading-mode-container" *ngIf="copyData && objectData">
      <!-- Reading Mode Header -->
      <div class="reading-header">
        <div class="reading-title">
          <h2>{{ getWorkTitle() }}</h2>
          <div class="reading-subtitle">
            <span class="copy-info">{{ getCopyInfo() }}</span>
            <span class="object-info">{{ getObjectInfo() }}</span>
          </div>
        </div>
        
        <div class="reading-controls">
          <button 
            class="btn btn-secondary"
            (click)="exitReadingMode()">
            Exit Reading Mode
          </button>
        </div>
      </div>

      <!-- Reading Content -->
      <div class="reading-content">
        <!-- Text Column -->
        <div class="text-column" *ngIf="hasTranscription()">
          <div class="transcription-container">
            <h3>Transcription</h3>
            <div 
              class="transcription-text"
              [innerHTML]="getTranscriptionText()">
            </div>
          </div>
          
          <!-- Notes Section -->
          <div class="notes-section" *ngIf="hasNotes()">
            <h3>Editor's Notes</h3>
            <div class="notes-content">
              <div *ngFor="let note of getNotes()" class="note-item">
                <div class="note-text" [innerHTML]="note.content"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Image Column -->
        <div class="image-column">
          <div class="image-container">
            <div class="image-wrapper">
              <img 
                [src]="getImageUrl()"
                [alt]="objectData.title || 'Blake Archive Object'"
                (error)="onImageError($event)"
                class="reading-image"
              />
            </div>
            <div class="image-caption">
              <h4>{{ objectData.title || 'Untitled' }}</h4>
              <p class="object-details">
                {{ objectData.full_object_id }}
                <span *ngIf="objectData.compdate"> • {{ objectData.compdate }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Controls -->
      <div class="reading-navigation" *ngIf="hasMultipleObjects()">
        <button 
          class="nav-btn nav-prev"
          [disabled]="!hasPreviousObject()"
          (click)="navigateToPrevious()">
          ← Previous
        </button>
        
        <div class="nav-info">
          Object {{ getCurrentObjectIndex() + 1 }} of {{ getTotalObjectCount() }}
        </div>
        
        <button 
          class="nav-btn nav-next"
          [disabled]="!hasNextObject()"
          (click)="navigateToNext()">
          Next →
        </button>
      </div>

      <!-- No Content Message -->
      <div class="no-content" *ngIf="!hasTranscription() && !hasNotes()">
        <div class="no-content-message">
          <h3>No Text Content Available</h3>
          <p>This object does not have transcription or notes available for reading mode.</p>
          <button 
            class="btn btn-primary"
            (click)="exitReadingMode()">
            Return to Object View
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reading-mode-container {
      min-height: 100vh;
      background: #f8f9fa;
      padding: 0;
    }

    .reading-header {
      background: white;
      padding: 20px 30px;
      border-bottom: 2px solid #dee2e6;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 10;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .reading-title h2 {
      margin: 0 0 5px 0;
      color: #2c3e50;
      font-size: 24px;
      font-weight: 600;
    }

    .reading-subtitle {
      display: flex;
      gap: 20px;
      color: #7f8c8d;
      font-size: 14px;
    }

    .copy-info::before {
      content: "Copy: ";
      font-weight: 500;
    }

    .object-info::before {
      content: "Object: ";
      font-weight: 500;
    }

    .reading-controls .btn {
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid #6c757d;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #545b62;
    }

    .btn-primary {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }

    .btn-primary:hover {
      background: #0056b3;
    }

    .reading-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      padding: 40px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .text-column {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      height: fit-content;
    }

    .text-column h3 {
      margin: 0 0 20px 0;
      color: #34495e;
      font-size: 20px;
      font-weight: 600;
      padding-bottom: 10px;
      border-bottom: 2px solid #ecf0f1;
    }

    .transcription-text {
      font-family: 'Georgia', serif;
      font-size: 16px;
      line-height: 1.8;
      color: #2c3e50;
      margin-bottom: 30px;
    }

    .notes-section {
      border-top: 1px solid #ecf0f1;
      padding-top: 30px;
      margin-top: 30px;
    }

    .note-item {
      margin-bottom: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-left: 4px solid #007bff;
      border-radius: 0 6px 6px 0;
    }

    .note-text {
      font-size: 14px;
      line-height: 1.6;
      color: #495057;
    }

    .image-column {
      position: sticky;
      top: 120px;
      height: fit-content;
    }

    .image-container {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .image-wrapper {
      text-align: center;
      margin-bottom: 20px;
    }

    .reading-image {
      max-width: 100%;
      height: auto;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .image-caption h4 {
      margin: 0 0 8px 0;
      color: #2c3e50;
      font-size: 18px;
      font-weight: 600;
      text-align: center;
    }

    .object-details {
      text-align: center;
      color: #7f8c8d;
      font-size: 13px;
      margin: 0;
      font-family: 'Courier New', monospace;
    }

    .reading-navigation {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 40px;
      background: white;
      border-top: 1px solid #dee2e6;
      position: sticky;
      bottom: 0;
      z-index: 10;
    }

    .nav-btn {
      padding: 10px 20px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .nav-btn:hover:not(:disabled) {
      background: #0056b3;
    }

    .nav-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .nav-info {
      color: #7f8c8d;
      font-size: 14px;
      font-weight: 500;
    }

    .no-content {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      padding: 40px;
    }

    .no-content-message {
      text-align: center;
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      max-width: 500px;
    }

    .no-content-message h3 {
      margin: 0 0 15px 0;
      color: #2c3e50;
      font-size: 22px;
    }

    .no-content-message p {
      margin: 0 0 25px 0;
      color: #7f8c8d;
      line-height: 1.6;
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .reading-content {
        grid-template-columns: 1fr;
        gap: 30px;
        padding: 30px;
      }

      .image-column {
        position: static;
        order: -1;
      }
    }

    @media (max-width: 768px) {
      .reading-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
        padding: 15px 20px;
      }

      .reading-subtitle {
        flex-direction: column;
        gap: 5px;
      }

      .reading-content {
        padding: 20px;
        gap: 20px;
      }

      .text-column,
      .image-container {
        padding: 20px;
      }

      .reading-navigation {
        flex-direction: column;
        gap: 15px;
        padding: 15px 20px;
      }

      .nav-info {
        order: -1;
      }
    }
  `]
})
export class ReadingModeComponent implements OnInit, OnDestroy {
  @Input() copyId: string | null = null;
  @Input() descId: string | null = null;

  copyData: any = null;
  objectData: any = null;
  allObjects: any[] = [];
  currentObjectIndex: number = 0;
  
  private destroy$ = new Subject<void>();

  constructor(
    private blakeDataService: BlakeDataService,
    private appState: ApplicationStateService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    // Get current copy and object data
    this.copyData = this.blakeDataService.getCurrentCopy();
    this.objectData = this.blakeDataService.getCurrentObject();

    // Load all objects in the copy for navigation
    if (this.copyId) {
      this.blakeDataService.getObjectsForCopy(this.copyId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (objects) => {
            this.allObjects = objects || [];
            if (this.descId) {
              this.currentObjectIndex = this.allObjects.findIndex(obj => obj.desc_id === this.descId);
              if (this.currentObjectIndex === -1) this.currentObjectIndex = 0;
            }
          },
          error: (error) => console.error('Error loading objects for copy:', error)
        });
    }
  }

  getWorkTitle(): string {
    return this.copyData?.title || this.objectData?.title || 'Blake Archive';
  }

  getCopyInfo(): string {
    if (this.copyData?.archive_copy_id) {
      return this.copyData.archive_copy_id;
    }
    return this.copyId || 'Unknown Copy';
  }

  getObjectInfo(): string {
    return this.objectData?.full_object_id || this.descId || 'Unknown Object';
  }

  hasTranscription(): boolean {
    return !!(this.objectData?.markup_text || this.objectData?.transcription);
  }

  getTranscriptionText(): string {
    return this.objectData?.markup_text || this.objectData?.transcription || '';
  }

  hasNotes(): boolean {
    return !!(this.objectData?.notes && this.objectData.notes.length > 0);
  }

  getNotes(): any[] {
    return this.objectData?.notes || [];
  }

  getImageUrl(): string {
    const dbi = this.objectData?.dbi || this.descId;
    if (!dbi) return '';
    return `/static/img/full/${dbi}.300.jpg`;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    
    // Create fallback
    const parent = img.parentElement;
    if (parent) {
      const fallback = document.createElement('div');
      fallback.className = 'image-fallback';
      fallback.innerHTML = '<p>Image not available</p>';
      fallback.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 300px;
        background: #f8f9fa;
        border: 2px dashed #dee2e6;
        color: #6c757d;
        border-radius: 6px;
      `;
      parent.appendChild(fallback);
    }
  }

  hasMultipleObjects(): boolean {
    return this.allObjects.length > 1;
  }

  hasPreviousObject(): boolean {
    return this.currentObjectIndex > 0;
  }

  hasNextObject(): boolean {
    return this.currentObjectIndex < this.allObjects.length - 1;
  }

  getCurrentObjectIndex(): number {
    return this.currentObjectIndex;
  }

  getTotalObjectCount(): number {
    return this.allObjects.length;
  }

  navigateToPrevious(): void {
    if (this.hasPreviousObject()) {
      const prevObject = this.allObjects[this.currentObjectIndex - 1];
      this.navigateToObject(prevObject);
    }
  }

  navigateToNext(): void {
    if (this.hasNextObject()) {
      const nextObject = this.allObjects[this.currentObjectIndex + 1];
      this.navigateToObject(nextObject);
    }
  }

  private navigateToObject(object: any): void {
    // Use the Blake Data Service to change the object
    this.blakeDataService.changeObject(object);
    
    // Update local data
    this.objectData = object;
    this.currentObjectIndex = this.allObjects.findIndex(obj => obj.desc_id === object.desc_id);
  }

  exitReadingMode(): void {
    // Update application state to exit reading mode
    this.appState.setPersistentMode('gallery');
    
    // Emit custom event
    this.appState.emitEvent('readingMode:exit');
  }
}