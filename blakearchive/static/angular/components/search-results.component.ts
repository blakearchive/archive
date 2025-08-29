import { Component, Input, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { SearchService } from '../services/search.service';

export interface SearchResult {
  id?: string;
  title?: string;
  content?: string;
  description?: string;
  tag?: string;
  note?: string;
  type?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="search-results-container" *ngIf="results && results.length > 0">
      <div class="results-header">
        <h3 class="results-label">{{ label }}</h3>
        <span class="results-count">({{ results.length }} result{{ results.length !== 1 ? 's' : '' }})</span>
      </div>
      
      <div class="results-body">
        <div class="object-image-container" [style]="objectImageContainerStyle">
          <div 
            class="result-item"
            *ngFor="let result of results; trackBy: trackByResult; let i = index"
            [class.selected]="selectedResultIndex === i"
            (click)="selectResult(result, i)"
          >
            <!-- Result content based on type -->
            <div class="result-content" [ngSwitch]="type">
              <!-- Title results -->
              <div *ngSwitchCase="'title'" class="title-result">
                <h4>{{ result.title || 'Untitled' }}</h4>
                <p *ngIf="result.description" class="result-description">
                  {{ result.description }}
                </p>
              </div>
              
              <!-- Text transcription results -->
              <div *ngSwitchCase="'text'" class="text-result">
                <div class="text-content" [innerHTML]="formatTextContent(result.content)">
                </div>
                <p *ngIf="result.source" class="result-source">
                  Source: {{ result.source }}
                </p>
              </div>
              
              <!-- Description results -->
              <div *ngSwitchCase="'description'" class="description-result">
                <p class="description-content">{{ result.description }}</p>
                <p *ngIf="result.object_id" class="result-object-id">
                  Object: {{ result.object_id }}
                </p>
              </div>
              
              <!-- Tag results -->
              <div *ngSwitchCase="'tag'" class="tag-result">
                <span class="tag-name">{{ result.tag }}</span>
                <p *ngIf="result.context" class="tag-context">
                  {{ result.context }}
                </p>
              </div>
              
              <!-- Notes results -->
              <div *ngSwitchCase="'notes'" class="notes-result">
                <div class="note-content" [innerHTML]="formatNoteContent(result.note)">
                </div>
                <p *ngIf="result.editor" class="result-editor">
                  Editor: {{ result.editor }}
                </p>
              </div>
              
              <!-- Copy info results -->
              <div *ngSwitchCase="'copy-info'" class="copy-info-result">
                <h5 *ngIf="result.copy_id">Copy: {{ result.copy_id }}</h5>
                <div class="copy-info-content" [innerHTML]="formatCopyInfo(result.info)">
                </div>
              </div>
              
              <!-- Source results -->
              <div *ngSwitchCase="'source'" class="source-result">
                <p class="source-content">{{ result.source }}</p>
                <p *ngIf="result.virtual_group" class="virtual-group">
                  Virtual Group: {{ result.virtual_group }}
                </p>
              </div>
              
              <!-- Work info results -->
              <div *ngSwitchCase="'work-info'" class="work-info-result">
                <h5 *ngIf="result.work_id">Work: {{ result.work_id }}</h5>
                <div class="work-info-content" [innerHTML]="formatWorkInfo(result.info)">
                </div>
              </div>
              
              <!-- Default result display -->
              <div *ngSwitchDefault class="default-result">
                <pre>{{ result | json }}</pre>
              </div>
            </div>
            
            <!-- Result metadata -->
            <div class="result-metadata" *ngIf="showMetadata">
              <small class="result-type">Type: {{ type }}</small>
              <small class="result-tree" *ngIf="tree">Tree: {{ tree }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="no-results" *ngIf="!results || results.length === 0">
      <p>No {{ label?.toLowerCase() || 'results' }} found.</p>
    </div>
  `,
  styles: [`
    .search-results-container {
      margin: 20px 0;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .results-header {
      background: rgba(0, 0, 0, 0.1);
      padding: 15px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .results-label {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #fff;
    }
    
    .results-count {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
    }
    
    .results-body {
      padding: 10px;
    }
    
    .object-image-container {
      max-height: 600px;
      overflow-y: auto;
      padding: 10px;
    }
    
    .result-item {
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid #ddd;
      border-radius: 6px;
      margin-bottom: 15px;
      padding: 15px;
      cursor: pointer;
      transition: all 0.2s ease;
      color: #333;
    }
    
    .result-item:hover {
      background: rgba(255, 255, 255, 1);
      border-color: #007bff;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .result-item.selected {
      background: #e3f2fd;
      border-color: #2196f3;
      box-shadow: 0 2px 8px rgba(33, 150, 243, 0.2);
    }
    
    .result-content h4, .result-content h5 {
      margin: 0 0 10px 0;
      color: #2c3e50;
    }
    
    .result-content p {
      margin: 5px 0;
      line-height: 1.5;
    }
    
    /* Type-specific styling */
    .title-result h4 {
      color: #e74c3c;
      font-size: 16px;
    }
    
    .text-result .text-content {
      background: #f8f9fa;
      padding: 10px;
      border-left: 3px solid #007bff;
      margin: 10px 0;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      white-space: pre-wrap;
    }
    
    .description-result .description-content {
      font-style: italic;
      color: #666;
    }
    
    .tag-result .tag-name {
      background: #28a745;
      color: white;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
    }
    
    .notes-result .note-content {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      padding: 10px;
      border-radius: 4px;
      margin: 10px 0;
    }
    
    .copy-info-result {
      border-left: 4px solid #17a2b8;
      padding-left: 15px;
    }
    
    .source-result .source-content {
      font-weight: 500;
    }
    
    .work-info-result {
      border-left: 4px solid #6f42c1;
      padding-left: 15px;
    }
    
    .default-result pre {
      background: #f8f9fa;
      padding: 10px;
      border-radius: 4px;
      font-size: 12px;
      overflow-x: auto;
    }
    
    .result-metadata {
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #eee;
      display: flex;
      gap: 15px;
    }
    
    .result-metadata small {
      color: #666;
      font-size: 11px;
    }
    
    .result-description, .result-source, .result-object-id, 
    .tag-context, .result-editor, .virtual-group {
      font-size: 13px;
      color: #666;
      margin-top: 5px;
    }
    
    .no-results {
      text-align: center;
      padding: 40px 20px;
      color: rgba(255, 255, 255, 0.7);
    }
    
    /* Scrollbar styling */
    .object-image-container::-webkit-scrollbar {
      width: 8px;
    }
    
    .object-image-container::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }
    
    .object-image-container::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 4px;
    }
    
    .object-image-container::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  `]
})
export class SearchResultsComponent implements OnInit, OnDestroy {
  @Input() results: SearchResult[] = [];
  @Input() label: string = 'Results';
  @Input() type: string = 'default';
  @Input() tree: string = '';
  @Input() showMetadata: boolean = false;

  selectedResultIndex: number = -1;
  objectImageContainerStyle: any = {};

  private destroy$ = new Subject<void>();

  constructor(private searchService: SearchService) {}

  ngOnInit(): void {
    // Set initial help state
    this.setGlobalHelpState();
    
    // Listen for window resize events
    this.setupResizeListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Set global help state for AngularJS compatibility
   */
  private setGlobalHelpState(): void {
    (window as any).$rootScope = (window as any).$rootScope || {};
    (window as any).$rootScope.help = 'search';
  }

  /**
   * Set up resize listener for responsive container height
   */
  private setupResizeListener(): void {
    fromEvent(window, 'resize')
      .pipe(
        debounceTime(100),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.updateContainerHeight();
      });

    // Initial height calculation
    this.updateContainerHeight();
  }

  /**
   * Update container height based on window size
   */
  private updateContainerHeight(): void {
    if (window.innerWidth > 992) {
      this.objectImageContainerStyle = {
        'height': (window.innerHeight - 400) + 'px'
      };
    } else {
      this.objectImageContainerStyle = {};
    }
  }

  /**
   * Select a result
   */
  selectResult(result: SearchResult, index: number): void {
    this.selectedResultIndex = index;
    
    // Emit selection event for other components
    const event = new CustomEvent('searchResultDirective::showCopies', {
      detail: { type: this.type, result: result }
    });
    window.dispatchEvent(event);
    
    // TODO: Handle result selection based on type
    console.log('Selected result:', result, 'of type:', this.type);
  }

  /**
   * Track by function for result rendering
   */
  trackByResult(index: number, result: SearchResult): any {
    return result.id || index;
  }

  /**
   * Format text content with highlighting
   */
  formatTextContent(content: string): string {
    if (!content) return '';
    
    // TODO: Implement search term highlighting
    return content.replace(/\n/g, '<br>');
  }

  /**
   * Format note content
   */
  formatNoteContent(note: string): string {
    if (!note) return '';
    
    // Basic formatting for notes
    return note.replace(/\n/g, '<br>');
  }

  /**
   * Format copy information
   */
  formatCopyInfo(info: string): string {
    if (!info) return '';
    
    return info.replace(/\n/g, '<br>');
  }

  /**
   * Format work information
   */
  formatWorkInfo(info: string): string {
    if (!info) return '';
    
    return info.replace(/\n/g, '<br>');
  }
}