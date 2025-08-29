import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchService } from '../services/search.service';

@Component({
  selector: 'app-preview-box',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="col-xs-12 full-width copy-container-wrapper" 
         [class.hidden]="isHidden()" 
         [appAutoHeight]="175" 
         breakpoint="992">
        <div class="copy-container" [id]="type">
            <app-preview-header 
                [tree]="tree" 
                [results]="results">
            </app-preview-header>
            
            <div id="result-preview-body" 
                 class="flex-992" 
                 [appAutoHeight]="275" 
                 breakpoint="992">
                 
                <app-objects-in-virtual-work-preview 
                    *ngIf="shouldShowObjectsInVirtualWorkPreview()"
                    [tree]="tree" 
                    [results]="results">
                </app-objects-in-virtual-work-preview>
                
                <app-objects-in-copy-preview 
                    *ngIf="shouldShowObjectsInCopyPreview()"
                    [tree]="tree" 
                    [results]="results">
                </app-objects-in-copy-preview>
                
                <app-copies-in-work-preview 
                    *ngIf="shouldShowCopiesInWorkPreview()"
                    [tree]="tree" 
                    [results]="results"
                    [appToTopOnBroadcast]="'searchCtrl::changeResult'">
                </app-copies-in-work-preview>
                
                <app-preview-selection 
                    *ngIf="tree !== 'work'"
                    [tree]="tree" 
                    [results]="results">
                </app-preview-selection>
                
                <app-object-result-highlight 
                    [type]="type" 
                    [tree]="tree" 
                    [results]="results">
                </app-object-result-highlight>
                
            </div><!-- end flex results -->
            
            <app-previous-next 
                [results]="results" 
                [type]="type">
            </app-previous-next>
        </div>
    </div>
  `
})
export class PreviewBoxComponent implements OnInit {
  @Input() results: any[] = [];
  @Input() tree: string = '';
  @Input() type: string = '';

  get searchState() {
    return this.searchService.currentState;
  }

  constructor(private searchService: SearchService) {}

  ngOnInit(): void {
    // Component initialization
  }

  isHidden(): boolean {
    return this.searchState.selectedWork === -1; // || this.searchService.type !== this.type;
  }

  shouldShowObjectsInVirtualWorkPreview(): boolean {
    try {
      const selectedWork = this.results[this.searchState.selectedWork];
      if (!selectedWork) return false;
      
      const multipleObjects = selectedWork[1] > 0;
      const isVirtual = selectedWork[0]?.virtual;
      
      return multipleObjects && this.tree === 'object' && isVirtual;
    } catch (e) {
      return false;
    }
  }

  shouldShowObjectsInCopyPreview(): boolean {
    try {
      const selectedWork = this.results[this.searchState.selectedWork];
      if (!selectedWork) return false;
      
      const selectedCopyData = selectedWork[2]?.[this.searchState.selectedCopy];
      if (!selectedCopyData) return false;
      
      const multipleObjects = selectedCopyData[1] > 0;
      const isVirtual = selectedWork[0]?.virtual;
      
      return multipleObjects && this.tree === 'object' && !isVirtual;
    } catch (e) {
      return false;
    }
  }

  shouldShowCopiesInWorkPreview(): boolean {
    try {
      const selectedWork = this.results[this.searchState.selectedWork];
      if (!selectedWork) return false;
      
      const multipleObjects = selectedWork[1] > 1;
      return multipleObjects && this.tree === 'copy';
    } catch (e) {
      return false;
    }
  }
}