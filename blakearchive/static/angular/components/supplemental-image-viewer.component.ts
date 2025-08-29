import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlakeDataService } from '../services/blake-data.service';
import { ObjectViewerService } from '../services/object-viewer.service';
import { HandprintBlockComponent } from './handprint-block.component';

@Component({
  selector: 'app-supplemental-image-viewer',
  standalone: true,
  imports: [CommonModule, HandprintBlockComponent],
  template: `
    <!-- supplemental image viewer -->
    <div class="item col-xs-12 col-md-8 col-md-offset-2 active" 
         id="suppImages" 
         [class.hidden]="!isSupplementalMode() || !hasSupplementalObjects()">
        
        <div class="flexsupp" [appAutoHeight]="270" breakpoint="992">
            <!-- original image for supplemental view-->
            <handprint-block 
                *ngFor="let obj of getFilteredCopyObjects(); trackBy: trackByDescId"
                [action]="getChangeToOriginalAction(obj)"
                [image]="obj.dbi + '.100.jpg'"
                [footer]="obj.full_object_id">
            </handprint-block>

            <!-- original image for original view-->
            <handprint-block 
                *ngIf="!isCurrentObjectSupplemental()"
                [action]="getToggleSupplementalAction()"
                [image]="getCurrentObject()?.dbi + '.100.jpg'"
                [footer]="getCurrentObject()?.full_object_id">
            </handprint-block>

            <!-- the supplemental views with full view -->
            <div *ngFor="let obj of getSupplementalObjects(); trackBy: trackByIndex">
              <handprint-block 
                  *ngIf="isFullView(obj)"
                  [action]="getChangeToSupplementalAction(obj)"
                  [image]="obj.dbi + '.100.jpg'"
                  [footer]="getFullViewFooter(obj)">
              </handprint-block>
            </div>
            
            <!-- the supplemental views without full view -->
            <div *ngFor="let obj of getSupplementalObjects(); trackBy: trackByIndex">
              <handprint-block 
                  *ngIf="!isFullView(obj)"
                  [action]="getChangeToSupplementalAction(obj)"
                  [image]="obj.dbi + '.100.jpg'"
                  [footer]="obj.full_object_id">
              </handprint-block>
            </div>
        </div>
        
        <p class="object-subtitle" *ngIf="getCurrentObject()?.title">
            {{ getCurrentObject().title }}, {{ getCurrentObject().full_object_id }}, 
            <span>{{ getPhysicalDescription() }} </span>
            <a style="color:#168bc1" (click)="openUseRestriction()">&#169;</a>
        </p>
        
        <p class="object-subtitle" *ngIf="!getCurrentObject()?.title">
            {{ getCurrentObject()?.full_object_id }}, 
            <span>{{ getPhysicalDescription() }} </span>
            <a style="color:#168bc1" (click)="openUseRestriction()">&#169;</a>
        </p>
    </div>
  `
})
export class SupplementalImageViewerComponent implements OnInit {

  constructor(
    private blakeDataService: BlakeDataService,
    private objectViewerService: ObjectViewerService
  ) {}

  ngOnInit(): void {
    // Component initialization
  }

  getCurrentObject(): any {
    return this.blakeDataService.blakeData.object;
  }

  getCurrentCopy(): any {
    return this.blakeDataService.blakeData.copy;
  }

  getCopyObjects(): any[] {
    return this.blakeDataService.blakeData.copyObjects || [];
  }

  isSupplementalMode(): boolean {
    const $rootScope = (window as any).$rootScope;
    return $rootScope?.supplemental || false;
  }

  hasSupplementalObjects(): boolean {
    return this.getCurrentObject()?.supplemental_objects?.length > 0;
  }

  isCurrentObjectSupplemental(): boolean {
    return !!this.getCurrentObject()?.supplemental;
  }

  getSupplementalObjects(): any[] {
    return this.getCurrentObject()?.supplemental_objects || [];
  }

  getFilteredCopyObjects(): any[] {
    const currentObject = this.getCurrentObject();
    if (currentObject?.supplemental) {
      return this.getCopyObjects().filter(obj => obj.desc_id === currentObject.supplemental);
    }
    return [];
  }

  isFullView(obj: any): boolean {
    return obj.full_object_id && obj.full_object_id.includes('full view');
  }

  getFullViewFooter(obj: any): string {
    const leafSize = this.getLeafSize();
    return `${obj.full_object_id}, leaf ${leafSize}`;
  }

  getLeafSize(): string {
    const source = this.objectViewerService.getSource();
    return source?.objinfo?.leafsize?.['#text']?.trim() || '';
  }

  getPhysicalDescription(): string {
    return this.getCurrentObject()?.physical_description?.objsize?.['#text'] || '';
  }

  getChangeToOriginalAction(obj: any): () => void {
    return () => {
      this.objectViewerService.changeObject(obj);
      this.objectViewerService.toggleSupplemental();
    };
  }

  getToggleSupplementalAction(): () => void {
    return () => {
      this.objectViewerService.changeObject(this.getCurrentObject());
      this.objectViewerService.toggleSupplemental();
    };
  }

  getChangeToSupplementalAction(obj: any): () => void {
    return () => {
      this.objectViewerService.changeObject(obj);
      this.objectViewerService.toggleSupplemental();
    };
  }

  openUseRestriction(): void {
    const copy = this.getCurrentCopy();
    const object = this.getCurrentObject();
    if (this.objectViewerService.useRestrictOpen) {
      this.objectViewerService.useRestrictOpen(copy, object);
    }
  }

  trackByDescId(index: number, obj: any): string {
    return obj.desc_id;
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
}