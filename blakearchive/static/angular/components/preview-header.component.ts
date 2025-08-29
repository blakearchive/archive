import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchService } from '../services/search.service';

@Component({
  selector: 'app-preview-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="page-header">
        <button class="close-copies" 
                (click)="closePreview()" 
                [appScrollToElement]="''" 
                [offset]="454">
            <span class="glyphicon glyphicon-remove"></span>
        </button>
        
        <h1 *ngIf="getSelectedWork()">
            <a [href]="'/work/' + getSelectedWork()[0].bad_id">
                {{getSelectedWork()[0].title}} 
                (Composed {{getSelectedWork()[0].composition_date_string}})
            </a>&nbsp;
            
            <span class="dropdown" *ngIf="shouldShowCopiesDropdown()">
                <button class="dropdown-toggle" 
                        role="button" 
                        aria-expanded="false"
                        (click)="toggleDropdown()">
                    <span>Copy {{getSelectedCopy()[0].archive_copy_id}}</span>&nbsp;
                    <span>(Printed {{getSelectedCopy()[0].print_date_string}})</span>&nbsp;
                    <span class="caret"></span>
                </button>
                
                <ul class="dropdown-menu" role="menu" [class.show]="isDropdownOpen">
                    <li *ngFor="let copy of getCopies(); trackBy: trackByIndex">
                        <a (click)="showObjects($index)">
                            Copy {{copy[0].archive_copy_id}} 
                            (Printed {{copy[0].print_date_string}}) 
                            ({{copy[1]}} Objects)
                        </a>
                    </li>
                </ul>
            </span>
        </h1>
    </header>
  `
})
export class PreviewHeaderComponent implements OnInit {
  @Input() results: any[] = [];
  @Input() tree: string = '';
  
  isDropdownOpen = false;

  get searchState() {
    return this.searchService.currentState;
  }

  constructor(public searchService: SearchService) {}

  ngOnInit(): void {
    // Component initialization
  }

  closePreview(): void {
    // Will need to implement proper state update method
    // this.searchService.setSelectedWork(-1);
  }

  getSelectedWork(): any {
    if (this.searchState.selectedWork >= 0 && this.results[this.searchState.selectedWork]) {
      return this.results[this.searchState.selectedWork];
    }
    return null;
  }

  getSelectedCopy(): any {
    const selectedWork = this.getSelectedWork();
    if (selectedWork && selectedWork[2] && selectedWork[2][this.searchState.selectedCopy]) {
      return selectedWork[2][this.searchState.selectedCopy];
    }
    return null;
  }

  getCopies(): any[] {
    const selectedWork = this.getSelectedWork();
    return selectedWork ? selectedWork[2] || [] : [];
  }

  shouldShowCopiesDropdown(): boolean {
    try {
      const selectedWork = this.getSelectedWork();
      if (!selectedWork) return false;
      
      const multipleCopies = selectedWork[2] && selectedWork[2].length > 1;
      const isVirtual = selectedWork[0]?.virtual;
      
      return multipleCopies && this.tree === 'object' && !isVirtual;
    } catch (e) {
      return false;
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  showObjects(index: number): void {
    // Will need to implement proper state update method
    // this.searchService.showObjects(index);
    this.isDropdownOpen = false;
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
}