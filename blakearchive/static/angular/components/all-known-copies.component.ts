import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-all-known-copies',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="section-group">
        <h3 style="font-weight:bold;">All Known Copies</h3>
        <div class="row">
            <div class="col-xs-12">
                <div class="related-flex">
                    <div class="related-item" *ngFor="let copy of getFilteredCopies(); trackBy: trackByIndex">
                        <span *ngIf="copy.link">
                            <a *ngIf="!copy.link.includes('none')" 
                               [href]="copy.link" 
                               [innerHTML]="processMarkdown(copy.displayTitle?.trim())"></a>
                            <span *ngIf="copy.link.includes('none')" 
                                  [innerHTML]="processMarkdown(copy.displayTitle?.trim())"></span>
                        </span>
                        <span *ngIf="!copy.link && copy.displayTitle" 
                              style="font-weight:bold;" 
                              [innerHTML]="processMarkdown(copy.displayTitle?.trim())"></span>
                        <span *ngFor="let info of getInfo(copy.info); trackBy: trackByIndex" 
                              [innerHTML]="processMarkdown(info?.trim())"></span>
                    </div>
                    <div *ngIf="getFilteredCopies().length === 0">
                        There are no traced copies of the original work.
                    </div>
                </div>
            </div>
        </div>
    </div>
  `
})
export class AllKnownCopiesComponent implements OnInit {
  @Input() work: any;

  constructor() {}

  ngOnInit(): void {
    // Component initialization
  }

  getInfo(info: string): string[] {
    if (!info) return [];
    return info.split('<br />');
  }

  getFilteredCopies(): any[] {
    if (!this.work?.related_works) return [];
    return this.work.related_works.filter((item: any) => item.type === 'copy');
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