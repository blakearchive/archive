import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlakeDataService } from '../services/blake-data.service';
import { ObjectsInCopyComponent } from './objects-in-copy.component';
import { TextTranscriptionComponent } from './text-transcription.component';
import { ElectronicEditionInfoTabComponent } from './electronic-edition-info-tab.component';

export interface CopyTab {
  id: string;
  label: string;
  active: boolean;
  enabled: boolean;
  content?: any;
}

@Component({
  selector: 'app-copy-tabs',
  standalone: true,
  imports: [
    CommonModule, 
    ObjectsInCopyComponent, 
    TextTranscriptionComponent, 
    ElectronicEditionInfoTabComponent
  ],
  template: `
    <div class="copy-tabs-container">
      <!-- Tab Navigation -->
      <ul class="nav nav-tabs" role="tablist">
        <li 
          *ngFor="let tab of tabs" 
          class="nav-item"
          [class.active]="tab.active"
          [class.disabled]="!tab.enabled"
        >
          <button 
            class="nav-link"
            [class.active]="tab.active"
            [disabled]="!tab.enabled"
            (click)="selectTab(tab.id)"
            [attr.aria-selected]="tab.active"
            role="tab"
          >
            {{ tab.label }}
          </button>
        </li>
      </ul>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Objects in Copy Tab -->
        <div 
          class="tab-pane"
          [class.active]="isTabActive('objects')"
          *ngIf="isTabActive('objects')"
          role="tabpanel"
        >
          <app-objects-in-copy [copyId]="getCurrentCopyId()"></app-objects-in-copy>
        </div>

        <!-- Text Transcription Tab -->
        <div 
          class="tab-pane"
          [class.active]="isTabActive('transcription')"
          *ngIf="isTabActive('transcription')"
          role="tabpanel"
        >
          <app-text-transcription [objectId]="getCurrentObjectId()"></app-text-transcription>
        </div>

        <!-- Illustration Description Tab -->
        <div 
          class="tab-pane"
          [class.active]="isTabActive('description')"
          *ngIf="isTabActive('description')"
          role="tabpanel"
        >
          <div class="tab-content-wrapper">
            <h3>Illustration Description</h3>
            <div class="description-content">
              <p *ngIf="getObjectDescription(); else noDescription">
                {{ getObjectDescription() }}
              </p>
              <ng-template #noDescription>
                <p class="no-content">No illustration description available.</p>
              </ng-template>
            </div>
          </div>
        </div>

        <!-- Electronic Edition Info Tab -->
        <div 
          class="tab-pane"
          [class.active]="isTabActive('edition')"
          *ngIf="isTabActive('edition')"
          role="tabpanel"
        >
          <app-electronic-edition-info-tab 
            [copyId]="getCurrentCopyId()"
            [objectId]="getCurrentObjectId()">
          </app-electronic-edition-info-tab>
        </div>

        <!-- Notes Tab -->
        <div 
          class="tab-pane"
          [class.active]="isTabActive('notes')"
          *ngIf="isTabActive('notes')"
          role="tabpanel"
        >
          <div class="tab-content-wrapper">
            <h3>Editor's Notes</h3>
            <div class="notes-content">
              <div *ngIf="hasNotes(); else noNotes">
                <div *ngFor="let note of getNotes()" class="note-item">
                  <div class="note-content" [innerHTML]="note.content"></div>
                </div>
              </div>
              <ng-template #noNotes>
                <p class="no-content">No editor's notes available.</p>
              </ng-template>
            </div>
          </div>
        </div>

        <!-- Virtual Group Tab -->
        <div 
          class="tab-pane"
          [class.active]="isTabActive('virtual')"
          *ngIf="isTabActive('virtual')"
          role="tabpanel"
        >
          <div class="tab-content-wrapper">
            <h3>Virtual Group Information</h3>
            <div class="virtual-group-content">
              <p *ngIf="hasVirtualGroupInfo(); else noVirtual">
                This object is part of a virtual group containing related works.
              </p>
              <ng-template #noVirtual>
                <p class="no-content">This object is not part of a virtual group.</p>
              </ng-template>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .copy-tabs-container {
      background: #fff;
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .nav-tabs {
      display: flex;
      background: #f8f9fa;
      border-bottom: 2px solid #dee2e6;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .nav-item {
      margin: 0;
    }

    .nav-link {
      display: block;
      padding: 15px 20px;
      background: transparent;
      border: none;
      color: #495057;
      font-weight: 500;
      text-decoration: none;
      border-bottom: 3px solid transparent;
      transition: all 0.2s ease;
      cursor: pointer;
      white-space: nowrap;
    }

    .nav-link:hover:not(:disabled) {
      background: rgba(0, 123, 255, 0.1);
      color: #007bff;
    }

    .nav-link.active {
      background: #fff;
      color: #007bff;
      border-bottom-color: #007bff;
    }

    .nav-link:disabled {
      color: #6c757d;
      opacity: 0.5;
      cursor: not-allowed;
    }

    .nav-item.disabled .nav-link {
      color: #6c757d;
      opacity: 0.5;
      cursor: not-allowed;
    }

    .tab-content {
      min-height: 300px;
    }

    .tab-pane {
      display: none;
      padding: 0;
    }

    .tab-pane.active {
      display: block;
      animation: fadeIn 0.3s ease-in-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .tab-content-wrapper {
      padding: 30px;
    }

    .tab-content-wrapper h3 {
      margin: 0 0 20px 0;
      color: #2c3e50;
      font-size: 20px;
      font-weight: 600;
    }

    .description-content,
    .notes-content,
    .virtual-group-content {
      line-height: 1.6;
      color: #495057;
    }

    .no-content {
      color: #6c757d;
      font-style: italic;
      text-align: center;
      padding: 40px 20px;
      margin: 0;
    }

    .note-item {
      margin-bottom: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-left: 4px solid #007bff;
      border-radius: 0 4px 4px 0;
    }

    .note-content {
      margin: 0;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .nav-tabs {
        overflow-x: auto;
        white-space: nowrap;
      }

      .nav-link {
        padding: 12px 16px;
        font-size: 14px;
      }

      .tab-content-wrapper {
        padding: 20px;
      }
    }
  `]
})
export class CopyTabsComponent implements OnInit {
  tabs: CopyTab[] = [
    { id: 'objects', label: 'Objects in Copy', active: true, enabled: true },
    { id: 'transcription', label: 'Transcription', active: false, enabled: true },
    { id: 'description', label: 'Illustration Description', active: false, enabled: true },
    { id: 'edition', label: 'Electronic Edition Info', active: false, enabled: true },
    { id: 'notes', label: 'Notes', active: false, enabled: true },
    { id: 'virtual', label: 'Virtual Group', active: false, enabled: true }
  ];

  constructor(private blakeDataService: BlakeDataService) {}

  ngOnInit(): void {
    // Initialize tab states based on available data
    this.updateTabStates();
  }

  selectTab(tabId: string): void {
    const targetTab = this.tabs.find(tab => tab.id === tabId);
    if (!targetTab || !targetTab.enabled) return;

    // Deactivate all tabs
    this.tabs.forEach(tab => tab.active = false);
    
    // Activate selected tab
    targetTab.active = true;
  }

  isTabActive(tabId: string): boolean {
    const tab = this.tabs.find(t => t.id === tabId);
    return tab ? tab.active : false;
  }

  getCurrentCopyId(): string | null {
    const copy = this.blakeDataService.getCurrentCopy();
    return copy?.archive_copy_id || null;
  }

  getCurrentObjectId(): string | null {
    const object = this.blakeDataService.getCurrentObject();
    return object?.desc_id || null;
  }

  getObjectDescription(): string | null {
    const object = this.blakeDataService.getCurrentObject();
    return object?.description || null;
  }

  hasNotes(): boolean {
    const object = this.blakeDataService.getCurrentObject();
    return !!(object?.notes && object.notes.length > 0);
  }

  getNotes(): any[] {
    const object = this.blakeDataService.getCurrentObject();
    return object?.notes || [];
  }

  hasVirtualGroupInfo(): boolean {
    const copy = this.blakeDataService.getCurrentCopy();
    return !!copy?.virtual;
  }

  private updateTabStates(): void {
    // Enable/disable tabs based on available data
    const copy = this.blakeDataService.getCurrentCopy();
    const object = this.blakeDataService.getCurrentObject();

    // Update transcription tab
    const transcriptionTab = this.tabs.find(t => t.id === 'transcription');
    if (transcriptionTab) {
      transcriptionTab.enabled = !!(object?.desc_id);
    }

    // Update notes tab
    const notesTab = this.tabs.find(t => t.id === 'notes');
    if (notesTab) {
      notesTab.enabled = this.hasNotes();
    }

    // Update virtual group tab
    const virtualTab = this.tabs.find(t => t.id === 'virtual');
    if (virtualTab) {
      virtualTab.enabled = this.hasVirtualGroupInfo();
    }
  }
}