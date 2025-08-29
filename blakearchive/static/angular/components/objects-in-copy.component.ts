import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlakeDataService } from '../services/blake-data.service';
import { CompareObjectsService } from '../services/compare-objects.service';
import { ApplicationStateService } from '../services/application-state.service';
import { HandprintBlockComponent } from './handprint-block.component';

@Component({
  selector: 'app-objects-in-copy',
  standalone: true,
  imports: [CommonModule, HandprintBlockComponent],
  template: `
    <!-- OBJECTS IN COPY -->
    <div role="tabpanel" class="fadeinout tab-pane active in" id="objects-in-copy">
        <header class="page-header">
            <!--<p class="subhead">Objects In {{ getCopyOrGroup() }}</p>-->
        </header>
        <p *ngIf="shouldShowDateNote()" class="text-center">
            <em>Dates are the probable dates of {{ getWorkProbable() }}.</em>
        </p>
        <br>
        <div class="row">
            <!-- for letters and other multi object groups -->
            <div 
                *ngFor="let obj of getFilteredObjectsForGroup(); trackBy: trackByIndex" 
                class="col-sm-6 col-md-3" 
                *ngIf="isLettersOrShakespeare()">
                <handprint-block 
                    [scrollToTop]="true"
                    [action]="getChangeObjectAction(obj)"
                    [image]="obj.dbi + '.100.jpg'"
                    [footer]="obj.title + '<br>' + obj.full_object_id">
                </handprint-block>
            </div>

            <!-- for everything else -->
            <div 
                *ngFor="let obj of getFilteredObjectsRegular(); trackBy: trackByIndex" 
                class="col-sm-6 col-md-3" 
                *ngIf="!isLettersOrShakespeare()">
                <ng-container *ngIf="getWorkProbable() === 'printing'">
                    <!-- No title printing objects -->
                    <handprint-block 
                        *ngIf="!obj.title"
                        [scrollToTop]="true"
                        [action]="getChangeObjectAction(obj)"
                        [image]="obj.dbi + '.100.jpg'"
                        [footer]="obj.full_object_id">
                    </handprint-block>
                    <!-- With title printing objects (non-virtual) -->
                    <handprint-block 
                        *ngIf="obj.title && !isWorkVirtual()"
                        [scrollToTop]="true"
                        [action]="getChangeObjectAction(obj)"
                        [image]="obj.dbi + '.100.jpg'"
                        [footer]="obj.title + '<br>' + obj.full_object_id">
                    </handprint-block>
                    <!-- With title printing objects (virtual) -->
                    <handprint-block 
                        *ngIf="obj.title && isWorkVirtual()"
                        [scrollToTop]="true"
                        [action]="getChangeObjectAction(obj)"
                        [image]="obj.dbi + '.100.jpg'"
                        [footer]="obj.title + '<br>' + obj.full_object_id">
                    </handprint-block>
                </ng-container>
                <ng-container *ngIf="getWorkProbable() !== 'printing'">
                    <!-- No title non-printing objects -->
                    <handprint-block 
                        *ngIf="!obj.title"
                        [scrollToTop]="true"
                        [action]="getChangeObjectAction(obj)"
                        [image]="obj.dbi + '.100.jpg'"
                        [footer]="obj.full_object_id">
                    </handprint-block>
                    <!-- With title non-printing objects (non-virtual) -->
                    <handprint-block 
                        *ngIf="obj.title && !isWorkVirtual()"
                        [scrollToTop]="true"
                        [action]="getChangeObjectAction(obj)"
                        [image]="obj.dbi + '.100.jpg'"
                        [footer]="obj.title + '<br>' + obj.full_object_id">
                    </handprint-block>
                    <!-- With title non-printing objects (virtual) -->
                    <handprint-block 
                        *ngIf="obj.title && isWorkVirtual()"
                        [scrollToTop]="true"
                        [action]="getChangeObjectAction(obj)"
                        [image]="obj.dbi + '.100.jpg'"
                        [footer]="getVirtualObjectFooter(obj)">
                    </handprint-block>
                </ng-container>
            </div>
        </div>
    </div>
  `
})
export class ObjectsInCopyComponent implements OnInit {
  @Input() copyId: string | null = null;

  constructor(
    private blakeDataService: BlakeDataService,
    private compareObjectsService: CompareObjectsService,
    private appState: ApplicationStateService
  ) {}

  ngOnInit(): void {
    // Component initialization
  }

  changeObject(object: any): void {
    const viewState = this.appState.getCurrentState().view;
    
    if (viewState.mode === 'compare') {
      // Reset comparison mode
      this.compareObjectsService.resetComparisonObjects();
      this.appState.setViewMode('object');
      this.appState.setViewScope('image');
    }

    this.blakeDataService.changeObject(object);
  }

  getCopyOrGroup(): string {
    const copy = this.blakeDataService.blakeData.copy;
    const work = this.blakeDataService.blakeData.work;
    
    if (!copy) return '';

    if (work?.medium === 'exhibit') {
      return 'Exhibit';
    }
    
    if (work?.virtual) {
      if (work.bad_id === 'letters') {
        return 'Letter';
      } else {
        return 'Group';
      }
    } else {
      return 'Copy';
    }
  }

  shouldShowDateNote(): boolean {
    const work = this.blakeDataService.blakeData.work;
    const copy = this.blakeDataService.blakeData.copy;
    
    return work?.virtual && 
           copy?.bad_id !== 'letters' && 
           copy?.bad_id !== 'shakespearewc';
  }

  isLettersOrShakespeare(): boolean {
    const copy = this.blakeDataService.blakeData.copy;
    return copy?.bad_id === 'letters' || copy?.bad_id === 'shakespearewc';
  }

  isWorkVirtual(): boolean {
    return this.blakeDataService.blakeData.work?.virtual || false;
  }

  getWorkProbable(): string {
    return this.blakeDataService.blakeData.work?.probable || '';
  }

  getFilteredObjectsForGroup(): any[] {
    const copyObjects = this.blakeDataService.blakeData.copyObjects || [];
    const currentObject = this.blakeDataService.blakeData.object;
    
    if (!currentObject?.object_group) return [];
    
    return copyObjects.filter(obj => 
      obj.object_group === currentObject.object_group
    );
  }

  getFilteredObjectsRegular(): any[] {
    const copyObjects = this.blakeDataService.blakeData.copyObjects || [];
    return copyObjects.filter(obj => !obj.supplemental);
  }

  getVirtualObjectFooter(obj: any): string {
    const title = obj.title || '';
    const fullObjectId = obj.full_object_id || '';
    const compdate = obj.source?.objdescid?.compdate?.['#text'] || '';
    const institution = obj.source?.repository?.institution?.['#text'] || '';
    
    return `${title}<br>${fullObjectId}, ${compdate}, ${institution}`;
  }

  getChangeObjectAction(obj: any): () => void {
    return () => this.changeObject(obj);
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
}