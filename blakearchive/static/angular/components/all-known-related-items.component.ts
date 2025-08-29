import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-all-known-related-items',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="section-group">
        <h3 style="font-weight:bold;">All Known Related Items</h3>
        <div class="row">
            <div class="col-xs-12">
                <div class="related-flex">
                    <div class="related-item" *ngFor="let item of getFilteredRelatedItems(); trackBy: trackByIndex">
                        <span *ngIf="item.link">
                            <a [href]="item.link" 
                               [innerHTML]="processMarkdown(item.displayTitle?.trim())"></a>
                        </span>
                        <span *ngIf="!item.link && item.displayTitle" 
                              style="font-weight:bold;" 
                              [innerHTML]="processMarkdown(item.displayTitle?.trim())"></span>
                        <span *ngFor="let info of getInfo(item.info); trackBy: trackByIndex" 
                              [innerHTML]="processMarkdown(info?.trim())"></span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  `
})
export class AllKnownRelatedItemsComponent implements OnInit {
  @Input() work: any;

  constructor() {}

  ngOnInit(): void {
    // Component initialization
  }

  getInfo(info: string): string[] {
    if (!info) return [];
    return info.split('<br />');
  }

  getFilteredRelatedItems(): any[] {
    if (!this.work?.related_works) return [];
    return this.work.related_works.filter((item: any) => item.type !== 'copy');
  }

  processMarkdown(text: string): string {
    if (!text) return '';
    
    // Basic markdown processing - can be enhanced with a proper markdown pipe
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
}