import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchService } from '../services/search.service';

@Component({
  selector: 'app-object-result-highlight',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
        <div class="object-result-highlight col-sm-12" 
             *ngIf="tree !== 'work'"
             [appAutoWidth]="100" 
             breakpoint="992" 
             divide="3" 
             [appToTopOnBroadcast]="'searchCtrl::changeResult'">
             
            <div *ngIf="type === 'title'" class="text-center">
                <h5 class="text-center">Title</h5>
                <span [innerHTML]="getHighlightedTitle()"></span>
            </div>

            <div *ngIf="type === 'text'">
                <h5 class="text-center">Transcription</h5>
                <app-text-transcription 
                    [object]="selectedObject()" 
                    [highlight]="getHighlight()">
                </app-text-transcription>
            </div>

            <div *ngIf="type === 'description'">
                <h5 class="text-center">Illustration Description</h5>
                <app-illustration-description 
                    [object]="selectedObject()" 
                    [highlight]="getHighlight()" 
                    keywords="hidden">
                </app-illustration-description>
            </div>

            <div *ngIf="type === 'notes'">
                <h5 class="text-center">Editors' Notes</h5>
                <app-editor-notes 
                    [object]="selectedObject()" 
                    [highlight]="getHighlight()">
                </app-editor-notes>
            </div>

            <div *ngIf="type === 'tag'">
                <h5 class="text-center">Image Tags</h5>
                <app-illustration-description 
                    [object]="selectedObject()" 
                    [highlight]="getHighlight()" 
                    keywords="only">
                </app-illustration-description>
            </div>

            <div *ngIf="type === 'copy-info' && selectedCopy()?.objdescid?.imprint" 
                 style="margin-left:61px">
                <h5 class="text-center">Copy/Set/Receipt/Work-in-Preview Information</h5>
                <app-copy-information 
                    [copy]="selectedCopy()" 
                    [highlight]="getHighlight()">
                </app-copy-information>
            </div>
            
            <div *ngIf="type === 'copy-info' && !selectedCopy()?.objdescid?.imprint">
                <h5 class="text-center">Copy/Set/Receipt/Work-in-Preview Information</h5>
                <app-copy-information 
                    [copy]="selectedCopy()" 
                    [highlight]="getHighlight()">
                </app-copy-information>
            </div>
            
            <div *ngIf="type === 'source'">
                <h5 class="text-center">Object-in-Virtual-Group Information</h5>
                <app-copy-information 
                    [copy]="selectedObject()" 
                    [highlight]="getHighlight()">
                </app-copy-information>
            </div>
        </div>

        <div class="object-result-highlight text-center" 
             *ngIf="tree === 'work'"
             [appAutoWidth]="100" 
             breakpoint="992" 
             [appToTopOnBroadcast]="'searchCtrl::changeResult'">
            <h5 class="text-center">Work Information</h5>
            <div [innerHTML]="getHighlightedWorkInfo()"></div>
        </div>
    </div>
  `
})
export class ObjectResultHighlightComponent implements OnInit {
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

  selectedObject(): any {
    try {
      return this.results[this.searchState.selectedWork][2][this.searchState.selectedCopy][2][this.searchState.selectedObject][0];
    } catch (e) {
      return null;
    }
  }

  selectedCopy(): any {
    try {
      return this.results[this.searchState.selectedWork][2][this.searchState.selectedCopy][0];
    } catch (e) {
      return null;
    }
  }

  selectedWork(): any {
    try {
      return this.results[this.searchState.selectedWork][0];
    } catch (e) {
      return null;
    }
  }

  getHighlight(): string {
    // This would need to be implemented based on SearchService
    // For now, return empty string
    return '';
  }

  getHighlightedTitle(): string {
    const obj = this.selectedObject();
    const title = obj?.title || '';
    const highlight = this.getHighlight();
    
    // Simple highlight implementation - would need proper highlight pipe
    if (highlight && title.includes(highlight)) {
      return title.replace(new RegExp(highlight, 'gi'), `<mark>${highlight}</mark>`);
    }
    return title;
  }

  getHighlightedWorkInfo(): string {
    const work = this.selectedWork();
    const info = work?.info || '';
    const highlight = this.getHighlight();
    
    // Simple highlight implementation - would need proper highlight pipe
    if (highlight && info.includes(highlight)) {
      return info.replace(new RegExp(highlight, 'gi'), `<mark>${highlight}</mark>`);
    }
    return info;
  }
}