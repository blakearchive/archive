import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlakeDataService } from '../services/blake-data.service';

@Component({
  selector: 'app-textual-reference-tab',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- TEXTUAL REFERENCES -->
    <div role="tabpanel" class="fadeinout tab-pane active in" id="text-reference">
        <!-- OBJECTS -->
        <div class="row" *ngIf="getTextRefObjects().length > 0">
            <h3>Objects</h3>
            <div *ngFor="let obj of getTextRefObjects(); trackBy: trackByIndex" 
                 class="col-sm-6 col-md-3">
                 
                <handprint-block 
                    *ngIf="obj.object_group !== null"
                    [link]="'/copy/' + obj.virtualwork_id + '?descId=' + obj.desc_id"
                    [image]="obj.dbi + '.100.jpg'"
                    [footer]="getVirtualWorkFooter(obj)">
                </handprint-block>

                <handprint-block 
                    *ngIf="obj.object_group === null && obj.is_object_for_work_in_preview == null"
                    [link]="'/copy/' + obj.copy_bad_id + '?descId=' + obj.desc_id"
                    [image]="obj.dbi + '.100.jpg'"
                    [footer]="getCopyFooter(obj)">
                </handprint-block>
                
                <handprint-block 
                    *ngIf="obj.object_group === null && obj.is_object_for_work_in_preview === true"
                    [link]="'/preview/' + obj.work_bad_id"
                    [image]="obj.dbi + '.100.jpg'"
                    [footer]="getCopyFooter(obj)">
                </handprint-block>
            </div>
        </div>

        <!-- COPIES -->
        <div class="row" *ngIf="getTextRefCopies().length > 0">
            <h3>Copies</h3>
            <div *ngFor="let cp of getTextRefCopies(); trackBy: trackByIndex" 
                 class="col-sm-6 col-md-3">
                <handprint-block 
                    [link]="'/copy/' + cp.bad_id"
                    [image]="cp.image + '.100.jpg'"
                    [footer]="getCopyDetailFooter(cp)">
                </handprint-block>
            </div>
        </div>

        <!-- WORKS -->
        <div class="row" *ngIf="getTextRefWorks().length > 0">
            <h3>Works</h3>
            <div *ngFor="let wk of getTextRefWorks(); trackBy: trackByIndex" 
                 class="col-sm-6 col-md-3">
                <handprint-block 
                    [link]="'/work/' + wk.bad_id"
                    [image]="wk.image"
                    [footer]="wk.title">
                </handprint-block>
            </div>
        </div>
    </div>
  `
})
export class TextualReferenceTabComponent implements OnInit {

  constructor(private blakeDataService: BlakeDataService) {}

  ngOnInit(): void {
    // Component initialization
  }

  getTextRefObjects(): any[] {
    return this.blakeDataService.blakeData.object?.text_ref?.objects || [];
  }

  getTextRefCopies(): any[] {
    return this.blakeDataService.blakeData.object?.text_ref?.copies || [];
  }

  getTextRefWorks(): any[] {
    return this.blakeDataService.blakeData.object?.text_ref?.works || [];
  }

  getVirtualWorkFooter(obj: any): string {
    const title = obj.virtualwork_title ? `<b>${obj.virtualwork_title}</b>` : '';
    const objectTitle = obj.title ? `${obj.title}` : '';
    const composed = obj.copy_composition_date_string ? `, Composed ${obj.copy_composition_date_string}` : '';
    const objectId = obj.full_object_id || '';
    
    return `${title}<br>${objectTitle}${composed}<br>${objectId}`;
  }

  getCopyFooter(obj: any): string {
    const title = obj.copy_title ? `<b>${obj.copy_title}</b>` : '';
    const composed = obj.copy_composition_date_string ? `, Composed ${obj.copy_composition_date_string}` : '';
    const objectId = obj.full_object_id || '';
    
    return `${title}${composed}<br>${objectId}`;
  }

  getCopyDetailFooter(cp: any): string {
    const copyId = cp.archive_copy_id ? `Copy ${cp.archive_copy_id}` : '';
    const printDate = cp.source?.objinfo?.printdate?.['#text'] || '';
    const institution = cp.institution || '';
    
    return `${copyId}, ${printDate}, ${institution}`;
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
}