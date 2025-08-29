import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlakeDataService } from '../services/blake-data.service';

@Component({
  selector: 'app-text-match-tab',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div role="tabpanel" class="fadeinout tab-pane active in" id="text-match">
        <!-- OBJECTS -->
        <div class="row" *ngIf="getTextMatchObjects().length > 0">
            <h3>Objects</h3>
            <div *ngFor="let obj of getTextMatchObjects(); trackBy: trackByIndex" 
                 class="col-sm-6 col-md-3">
                <handprint-block 
                    *ngIf="obj.object_group !== null"
                    [link]="'/copy/letters?descId=' + obj.desc_id"
                    [image]="obj.dbi + '.100.jpg'"
                    [footer]="obj.object_group">
                </handprint-block>
            </div>
        </div>
    </div>
  `
})
export class TextMatchTabComponent implements OnInit {

  constructor(private blakeDataService: BlakeDataService) {}

  ngOnInit(): void {
    // Component initialization
  }

  getTextMatchObjects(): any[] {
    return this.blakeDataService.blakeData.object?.text_match?.objects || [];
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
}