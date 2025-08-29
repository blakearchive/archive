import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BlakeDataService } from '../services/blake-data.service';
import { ObjectViewerService } from '../services/object-viewer.service';
import { TextTranscriptionComponent } from './text-transcription.component';

@Component({
  selector: 'app-regular-object-viewer',
  standalone: true,
  imports: [CommonModule, TextTranscriptionComponent],
  template: `
    <!-- regular object viewer -->
    <div class="item col-xs-12 col-md-8 col-md-offset-2 active" 
         [class.hidden]="isSupplementalMode() && hasSupplementalObjects()"
         (swipeLeft)="changeToNextObject()"
         (swipeRight)="changeToPreviousObject()">
        
        <div class="flex" [appAutoHeight]="270" breakpoint="992">
            <a [href]="getImageUrl()" 
               target="_blank" 
               class="object-img-container" 
               [class.hidden]="isTextView()" 
               [appOvpImage]="getCurrentObject()?.desc_id">
                <img [src]="getImageUrl()" 
                     [appMagnifyImage]="true">
            </a>
            
            <div class="reading-copy" 
                 [class.hidden]="isImageView()"
                 [appToTopOnBroadcast]="'change::selectedObject'">
                <div class="reading-copy-inner">
                    <app-text-transcription 
                        [object]="getCurrentObject()">
                    </app-text-transcription>
                </div>
            </div>
        </div>
        
        <p class="object-subtitle">
            <!-- Virtual work (not letters/shakespeare) -->
            <span *ngIf="isVirtualWork() && !isLettersOrShakespeare()">
                <span *ngIf="getCurrentObject()?.title">{{ getCurrentObject().title }}, </span>
                <span class="object-no">
                    Object {{ getCurrentObject()?.object_number }}, 
                    {{ getCompDate() }}, 
                    {{ getInstitution() }}, 
                </span>
            </span>
            
            <!-- Virtual work (letters/shakespeare) -->
            <span *ngIf="isVirtualWork() && isLettersOrShakespeare()">
                <span *ngIf="getCurrentObject()?.title">{{ getCurrentObject().title }}, </span>
                <span class="object-no">{{ getCurrentObject()?.full_object_id }}, </span>
            </span>
            
            <!-- Regular work without title -->
            <span class="object-no" *ngIf="!isVirtualWork() && !getCurrentObject()?.title">
                {{ getCurrentObject()?.full_object_id }}, 
            </span>
            
            <!-- Regular work with title (not exhibit) -->
            <span class="object-no" *ngIf="!isVirtualWork() && getCurrentObject()?.title && !isExhibit()">
                {{ getCurrentObject().title }}, {{ getCurrentObject().full_object_id }}, 
            </span>
            
            <!-- Regular work with title (exhibit) -->
            <span class="object-no" *ngIf="!isVirtualWork() && getCurrentObject()?.title && isExhibit()">
                {{ getCurrentObject().title }}
            </span>
            
            <!-- Physical description (non-exhibit) -->
            <span *ngIf="!isExhibit()">
                {{ getPhysicalDescription() }} 
            </span>
            
            <!-- Copyright link (non-exhibit) -->
            <a *ngIf="!isExhibit()" 
               style="color:#168bc1" 
               (click)="openUseRestriction()">
                &#169;
            </a>
        </p>
    </div>
  `
})
export class RegularObjectViewerComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private blakeDataService: BlakeDataService,
    private objectViewerService: ObjectViewerService
  ) {}

  ngOnInit(): void {
    // Component initialization
  }

  getCurrentObject(): any {
    return this.blakeDataService.blakeData.object;
  }

  getCurrentWork(): any {
    return this.blakeDataService.blakeData.work;
  }

  getCurrentCopy(): any {
    return this.blakeDataService.blakeData.copy;
  }

  isSupplementalMode(): boolean {
    const $rootScope = (window as any).$rootScope;
    return $rootScope?.supplemental || false;
  }

  hasSupplementalObjects(): boolean {
    return this.getCurrentObject()?.supplemental_objects?.length > 0;
  }

  isTextView(): boolean {
    const $rootScope = (window as any).$rootScope;
    return $rootScope?.view?.scope === 'text';
  }

  isImageView(): boolean {
    const $rootScope = (window as any).$rootScope;
    return $rootScope?.view?.scope === 'image';
  }

  isVirtualWork(): boolean {
    return this.getCurrentWork()?.virtual || false;
  }

  isLettersOrShakespeare(): boolean {
    const copyBadId = this.getCurrentCopy()?.bad_id;
    return copyBadId === 'letters' || copyBadId === 'shakespearewc';
  }

  isExhibit(): boolean {
    return this.getCurrentWork()?.medium === 'exhibit';
  }

  getImageUrl(): string {
    const dbi = this.getCurrentObject()?.dbi;
    const dpiValue = this.getDpiValue();
    return dbi ? `/images/${dbi}.${dpiValue}.jpg` : '';
  }

  getDpiValue(): string {
    const $rootScope = (window as any).$rootScope;
    return $rootScope?.dpivalue || '300';
  }

  getCompDate(): string {
    return this.getCurrentObject()?.source?.objdescid?.compdate?.['#text'] || '';
  }

  getInstitution(): string {
    return this.getCurrentObject()?.source?.repository?.institution?.['#text'] || '';
  }

  getPhysicalDescription(): string {
    return this.getCurrentObject()?.physical_description?.objsize?.['#text'] || '';
  }

  changeToNextObject(): void {
    const nextObject = this.objectViewerService.getNextObject();
    if (nextObject) {
      this.objectViewerService.changeObject(nextObject);
    }
  }

  changeToPreviousObject(): void {
    const previousObject = this.objectViewerService.getPreviousObject();
    if (previousObject) {
      this.objectViewerService.changeObject(previousObject);
    }
  }

  openUseRestriction(): void {
    const copy = this.getCurrentCopy();
    const object = this.getCurrentObject();
    if (this.objectViewerService.useRestrictOpen) {
      this.objectViewerService.useRestrictOpen(copy, object);
    }
  }
}