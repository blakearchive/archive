import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlakeDataService } from '../services/blake-data.service';

@Component({
  selector: 'app-info-tray',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="info-tray-container" [class.open]="isOpen" [style.height.px]="adjustHeight">
      <div class="tray-header">
        <button 
          type="button" 
          class="btn btn-toggle tray-toggle"
          (click)="onToggle()"
          [attr.aria-expanded]="isOpen"
        >
          <span class="toggle-icon" [class.rotated]="isOpen">▼</span>
          {{ isOpen ? 'Hide Info' : 'Show Info' }}
        </button>
      </div>
      
      <div class="tray-content" *ngIf="isOpen">
        <!-- Copy Information -->
        <div class="info-section" *ngIf="copyData">
          <h3>Copy Information</h3>
          <div class="copy-details">
            <div class="info-item" *ngIf="copyData.archive_copy_id">
              <label>Archive Copy ID:</label>
              <span>{{ copyData.archive_copy_id }}</span>
            </div>
            
            <div class="info-item" *ngIf="copyData.header?.filedesc?.titlestmt?.title">
              <label>Title:</label>
              <span>{{ copyData.header.filedesc.titlestmt.title['@reg'] || copyData.header.filedesc.titlestmt.title }}</span>
            </div>
            
            <div class="info-item" *ngIf="copyData.virtual !== undefined">
              <label>Virtual Copy:</label>
              <span>{{ copyData.virtual ? 'Yes' : 'No' }}</span>
            </div>
          </div>
        </div>
        
        <!-- Object Information -->
        <div class="info-section" *ngIf="objectData">
          <h3>Object Information</h3>
          <div class="object-details">
            <div class="info-item">
              <label>Object ID:</label>
              <span>{{ objectData.desc_id }}</span>
            </div>
            
            <div class="info-item" *ngIf="objectData.object_group">
              <label>Object Group:</label>
              <span>{{ objectData.object_group }}</span>
            </div>
            
            <div class="info-item" *ngIf="objectData.supplemental">
              <label>Supplemental:</label>
              <span>{{ objectData.supplemental }}</span>
            </div>
          </div>
        </div>
        
        <!-- Use Restrictions -->
        <div class="info-section" *ngIf="getUseRestrictions()">
          <h3>Use Restrictions</h3>
          <div class="use-restrictions">
            <p>{{ getUseRestrictions() }}</p>
          </div>
        </div>
        
        <!-- Source Information -->
        <div class="info-section" *ngIf="hasSourceInfo()">
          <h3>Source</h3>
          <div class="source-info">
            <div *ngFor="let item of getSourceInfo() | keyvalue" class="source-item">
              <label>{{ item.key | titlecase }}:</label>
              <span>{{ item.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .info-tray-container {
      position: fixed;
      top: 0;
      right: 0;
      width: 350px;
      background: rgba(44, 62, 80, 0.95);
      color: white;
      z-index: 1000;
      border-left: 2px solid #3498db;
      transform: translateX(100%);
      transition: transform 0.3s ease-in-out;
      max-height: 100vh;
      overflow-y: auto;
    }
    
    .info-tray-container.open {
      transform: translateX(0);
    }
    
    .tray-header {
      padding: 15px;
      background: rgba(52, 73, 94, 0.9);
      border-bottom: 1px solid #34495e;
    }
    
    .tray-toggle {
      background: #3498db;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      transition: background-color 0.2s;
      width: 100%;
      justify-content: center;
    }
    
    .tray-toggle:hover {
      background: #2980b9;
    }
    
    .toggle-icon {
      transition: transform 0.3s;
      font-size: 12px;
    }
    
    .toggle-icon.rotated {
      transform: rotate(180deg);
    }
    
    .tray-content {
      padding: 20px;
      animation: slideDown 0.3s ease-out;
    }
    
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .info-section {
      margin-bottom: 25px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .info-section:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }
    
    .info-section h3 {
      margin: 0 0 15px 0;
      font-size: 16px;
      color: #3498db;
      font-weight: 600;
    }
    
    .info-item {
      display: flex;
      flex-direction: column;
      margin-bottom: 10px;
      gap: 4px;
    }
    
    .info-item label {
      font-weight: 600;
      font-size: 12px;
      color: #bdc3c7;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .info-item span {
      font-size: 14px;
      line-height: 1.4;
      word-wrap: break-word;
    }
    
    .source-item {
      margin-bottom: 8px;
    }
    
    .use-restrictions p {
      font-size: 13px;
      line-height: 1.5;
      color: #f39c12;
      background: rgba(243, 156, 18, 0.1);
      padding: 10px;
      border-radius: 4px;
      margin: 0;
    }
    
    .copy-details,
    .object-details,
    .source-info {
      background: rgba(255, 255, 255, 0.03);
      padding: 15px;
      border-radius: 6px;
    }
  `]
})
export class InfoTrayComponent implements OnInit {
  @Input() isOpen: boolean = false;
  @Input() adjustHeight: number = 134;
  @Output() toggle = new EventEmitter<void>();
  
  copyData: any = null;
  objectData: any = null;

  constructor(private blakeDataService: BlakeDataService) {}

  ngOnInit(): void {
    // Get current copy and object data
    this.copyData = this.blakeDataService.getCurrentCopy();
    this.objectData = this.blakeDataService.getCurrentObject();
  }

  onToggle(): void {
    this.toggle.emit();
  }

  getUseRestrictions(): string | null {
    if (this.copyData?.header?.userestrict?.['#text']) {
      return this.copyData.header.userestrict['#text'];
    }
    if (this.objectData?.header?.userestrict?.['#text']) {
      return this.objectData.header.userestrict['#text'];
    }
    return null;
  }

  hasSourceInfo(): boolean {
    const source = this.copyData?.source || this.objectData?.source;
    return source && Object.keys(source).length > 0;
  }

  getSourceInfo(): any {
    return this.copyData?.source || this.objectData?.source || {};
  }
}