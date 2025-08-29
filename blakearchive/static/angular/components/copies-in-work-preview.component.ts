import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchService } from '../services/search.service';

@Component({
  selector: 'app-copies-in-work-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- copies in work -->
    <div>
        <div class="copies-in-work col-sm-12 text-center" 
             [appAutoWidth]="200" 
             breakpoint="992" 
             divide="3">
            <h5>Matching Copies/Sets/Receipts</h5>
            <br>
            <div class="flex-wrap">
                <div class="handprint-block-small"
                     *ngFor="let copy of getCopiesInWork(); let i = index; trackBy: trackByIndex"
                     [class.selected]="isSelected(i)">
                    <a (click)="showHighlight(i)">
                        <span class="object-img" 
                              [style.background-image]="'url(/images/' + copy[0].image + '.100.jpg)'">
                        </span>
                        <span *ngIf="!isReceiptWork()" class="description">
                            Copy {{ copy[0].archive_copy_id }}
                        </span>
                        <span *ngIf="isReceiptWork()" class="description">
                            Receipt {{ copy[0].archive_copy_id }}
                        </span>
                    </a>
                </div>
            </div>
        </div>
    </div>
  `
})
export class CopiesInWorkPreviewComponent implements OnInit {
  @Input() results: any[] = [];
  @Input() tree: string = '';

  get searchState() {
    return this.searchService.currentState;
  }

  constructor(private searchService: SearchService) {}

  ngOnInit(): void {
    // Component initialization
  }

  getSelectedWork(): any {
    if (this.searchState.selectedWork >= 0 && this.results[this.searchState.selectedWork]) {
      return this.results[this.searchState.selectedWork];
    }
    return null;
  }

  getCopiesInWork(): any[] {
    const selectedWork = this.getSelectedWork();
    return selectedWork ? selectedWork[2] || [] : [];
  }

  isSelected(index: number): boolean {
    return this.searchState.selectedCopy === index;
  }

  isReceiptWork(): boolean {
    const selectedWork = this.getSelectedWork();
    return selectedWork?.[0]?.bad_id === 'bb134';
  }

  showHighlight(index: number): void {
    // Will need to implement proper highlight method
    // this.searchService.showHighlight(this.tree, index);
    console.log('Show highlight clicked for index:', index);
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
}