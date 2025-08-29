import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlakeDataService } from '../services/blake-data.service';
import { ObjectViewerService } from '../services/object-viewer.service';

@Component({
  selector: 'app-object-viewer-previous-next',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="featured-object-controls hidden-sm" 
         *ngIf="shouldShowControls()">
         
        <a *ngIf="getPreviousObject()" 
           class="left carousel-control" 
           role="button" 
           [appScrollToTop]="true"
           (click)="changeToPrevious()">
            <span class="object-thumb" 
                  [style.background-image]="'url(/images/' + getPreviousObject().dbi + '.100.jpg)'">
            </span>

            <!-- virtual -->
            <span class="object-text" *ngIf="isVirtualWork()">
                {{ getPreviousObject().title }}<br>{{ getPreviousObject().full_object_id }}
            </span>
            
            <!-- everything else without title -->
            <span class="object-text" *ngIf="!isVirtualWork() && !getPreviousObject().title">
                {{ getPreviousObject().full_object_id }}
            </span>
            
            <!-- everything else with title -->
            <span class="object-text" *ngIf="!isVirtualWork() && getPreviousObject().title">
                {{ getPreviousObject().title }}<br>{{ getPreviousObject().full_object_id }}
            </span>

            <span class="sr-only">Previous</span>
        </a>
        
        <a *ngIf="getNextObject()" 
           class="right carousel-control" 
           role="button"
           [appScrollToTop]="true" 
           (click)="changeToNext()">
            <span class="object-thumb" 
                  [style.background-image]="'url(/images/' + getNextObject().dbi + '.100.jpg)'">
            </span>

            <!-- virtual -->
            <span class="object-text" *ngIf="isVirtualWork()">
                {{ getNextObject().title }}<br>{{ getNextObject().full_object_id }}
            </span>
            
            <!-- everything else without title -->
            <span class="object-text" *ngIf="!isVirtualWork() && !getNextObject().title">
                {{ getNextObject().full_object_id }}
            </span>
            
            <!-- everything else with title -->
            <span class="object-text" *ngIf="!isVirtualWork() && getNextObject().title">
                {{ getNextObject().title }}<br>{{ getNextObject().full_object_id }}
            </span>

            <span class="sr-only">Next</span>
        </a>
    </div>
  `
})
export class ObjectViewerPreviousNextComponent implements OnInit {

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

  getCurrentWork(): any {
    return this.blakeDataService.blakeData.work;
  }

  getCopyObjects(): any[] {
    return this.blakeDataService.blakeData.copyObjects || [];
  }

  shouldShowControls(): boolean {
    const currentObject = this.getCurrentObject();
    const copyObjects = this.getCopyObjects();
    
    return (currentObject?.objectsInGroup?.length > 1) || (copyObjects.length > 1);
  }

  isVirtualWork(): boolean {
    return this.getCurrentWork()?.virtual || false;
  }

  getPreviousObject(): any {
    return this.objectViewerService.getPreviousObject();
  }

  getNextObject(): any {
    return this.objectViewerService.getNextObject();
  }

  changeToPrevious(): void {
    const previousObject = this.getPreviousObject();
    if (previousObject) {
      this.objectViewerService.changeObject(previousObject);
    }
  }

  changeToNext(): void {
    const nextObject = this.getNextObject();
    if (nextObject) {
      this.objectViewerService.changeObject(nextObject);
    }
  }
}