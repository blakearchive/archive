import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchService } from '../services/search.service';

@Component({
  selector: 'app-preview-selection',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- preview -->
    <div class="object-preview col-sm-12 text-center" 
         [appAutoWidth]="100" 
         breakpoint="992" 
         divide="3">
        <h5 *ngIf="searchState.type !== 'copy-info'" style="">Selected Object</h5>
        <h5 *ngIf="searchState.type === 'copy-info'" style="">Selected Copy/Set/Receipt/Work-in-Preview</h5>

        <br>
        <div class="object-img-container text-center" 
             [appAutoHeight]="350" 
             breakpoint="992">
            <a [href]="getPreviewHref()">
                <img [src]="getPreviewImageSrc()" alt="Preview">
                <p></p>
                <p class="object-subtitle">
                    <span *ngIf="tree === 'object' && getPreviewTitle() != null" 
                          class="object-no">
                        {{getPreviewTitle()}}<br>
                    </span>
                    <span *ngIf="isVirtualWork() && !isLettersOrShakespeare()" 
                          class="object-no">
                        {{getPreviewLabelWithoutObject1()}}
                    </span>
                    <span *ngIf="isVirtualWork() && isLettersOrShakespeare()" 
                          class="object-no">
                        {{getPreviewLabel()}}
                    </span>
                    <span *ngIf="!isVirtualWork()" 
                          class="object-no">
                        {{getPreviewLabel()}}
                    </span>
                </p>
            </a>
            <button *ngIf="searchState.type !== 'copy-info'" 
                    title="Add to Lightbox"
                    type="button" 
                    class="btn btn-default btn-gr-selection"
                    style="height:21px;line-height:0.6;background-image: url('/static/img/global/edit-icons.png');background-repeat: no-repeat;background-position:2px 3px;background-size:20px;position:absolute;top:45px;margin-left:-10px;background-color:black"
                    (click)="addToLightBox()">
            </button>
        </div>
    </div>
  `
})
export class PreviewSelectionComponent implements OnInit {
  @Input() results: any[] = [];
  @Input() type: string = '';
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

  isVirtualWork(): boolean {
    const selectedWork = this.getSelectedWork();
    return selectedWork?.[0]?.virtual || false;
  }

  isLettersOrShakespeare(): boolean {
    const selectedWork = this.getSelectedWork();
    const badId = selectedWork?.[0]?.bad_id;
    return badId === 'letters' || badId === 'shakespearewc';
  }

  getPreviewHref(): string {
    // This would need to be implemented based on SearchService methods
    // For now, return a placeholder
    return '#';
  }

  getPreviewImageSrc(): string {
    // This would need to be implemented based on SearchService methods
    // For now, return a placeholder
    return '/images/placeholder.100.jpg';
  }

  getPreviewTitle(): string | null {
    // This would need to be implemented based on SearchService methods
    return null;
  }

  getPreviewLabel(): string {
    // This would need to be implemented based on SearchService methods
    return '';
  }

  getPreviewLabelWithoutObject1(): string {
    const label = this.getPreviewLabel();
    return label.replace('Object 1', '');
  }

  addToLightBox(): void {
    // This would need to be implemented based on SearchService methods
    console.log('Add to lightbox clicked');
  }
}