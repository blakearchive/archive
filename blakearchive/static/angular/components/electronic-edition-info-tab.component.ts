import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlakeDataService } from '../services/blake-data.service';

@Component({
  selector: 'app-electronic-edition-info-tab',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Electronic Edition Info-->
    <div role="tabpanel" class="fadeinout tab-pane active in" id="ee-info">
        <header class="page-header">
            <!--<p class="subhead">Electronic Edition Information</p>-->
        </header>
        <div class="row">
            <div class="col-xs-12">
                <div [innerHTML]="getCopyHeaderHtml()"></div>
            </div>
        </div>

        <!-- regular copies -->
        <div class="row" *ngIf="!isVirtualWork()">
            <div class="col-xs-12 text-center">
                <p>
                    <a [href]="getXmlUrl()" target="_blank">View XML</a> 
                    <small>(may not work in all browsers)</small>
                </p>
            </div>
        </div>

        <!-- virtual works (not letters/shakespeare) -->
        <div class="row" *ngIf="isVirtualWork() && !isLettersOrShakespeare()">
            <div class="col-xs-12">
                <h4>Included Objects</h4>
                <div class="well" *ngFor="let obj of getFilteredCopyObjects(); trackBy: trackByIndex">
                    <h4>{{ obj.full_object_id }}</h4>
                    <p><strong>Title:</strong> {{ obj.title }}</p>
                    <p>
                        <a [href]="getObjectXmlUrl(obj)" target="_blank">View XML</a> 
                        <small>(may not work in all browsers)</small>
                    </p>
                </div>
            </div>
        </div>

        <!-- letters/shakespeare -->
        <div class="row" *ngIf="isVirtualWork() && isLettersOrShakespeare()">
            <div class="col-xs-12">
                <h4>Included Objects</h4>
                <div class="well" *ngFor="let obj of getWorkCopies(); trackBy: trackByIndex">
                    <h4>{{ obj.object_group }}</h4>
                    <p>
                        <a [href]="getObjectXmlUrl(obj)" target="_blank">View XML</a> 
                        <small>(may not work in all browsers)</small>
                    </p>
                </div>
            </div>
        </div>
    </div>
  `
})
export class ElectronicEditionInfoTabComponent implements OnInit {
  @Input() copyId: string | null = null;
  @Input() objectId: string | null = null;

  constructor(private blakeDataService: BlakeDataService) {}

  ngOnInit(): void {
    // Component initialization
  }

  getCurrentCopy(): any {
    return this.blakeDataService.blakeData.copy;
  }

  getCurrentWork(): any {
    return this.blakeDataService.blakeData.work;
  }

  getCopyObjects(): any[] {
    return this.blakeDataService.blakeData.copyObjects || [];
  }

  getWorkCopies(): any[] {
    return this.blakeDataService.blakeData.workCopies || [];
  }

  getCopyHeaderHtml(): string {
    return this.getCurrentCopy()?.header_html || '';
  }

  isVirtualWork(): boolean {
    return this.getCurrentWork()?.virtual || false;
  }

  isLettersOrShakespeare(): boolean {
    const workBadId = this.getCurrentWork()?.bad_id;
    return workBadId === 'letters' || workBadId === 'shakespearewc';
  }

  getFilteredCopyObjects(): any[] {
    return this.getCopyObjects().filter(obj => !obj.supplemental);
  }

  getXmlUrl(): string {
    const copyBadId = this.getCurrentCopy()?.bad_id;
    return copyBadId ? `/bad/${copyBadId}.xml` : '';
  }

  getObjectXmlUrl(obj: any): string {
    const copyBadId = obj.copy_bad_id;
    return copyBadId ? `/bad/${copyBadId}.xml` : '';
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
}