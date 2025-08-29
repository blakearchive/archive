import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserPreferencesService, PreferenceGroup, PreferenceDefinition, UserPreferences } from '../services/user-preferences.service';
import { ExportService } from '../services/export.service';
import { ModalRef } from '../services/modal.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-modal">
      <div class="modal-header">
        <h4 class="modal-title">Settings</h4>
        <button type="button" class="btn-close" (click)="close()" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="settings-container">
          <!-- Settings Navigation -->
          <div class="settings-nav">
            <div class="nav-list">
              <button
                *ngFor="let group of preferenceGroups"
                class="nav-item"
                [class.active]="activeGroup === group.id"
                (click)="setActiveGroup(group.id)">
                <i class="icon-{{group.icon}}"></i>
                <span>{{group.name}}</span>
              </button>
            </div>
          </div>

          <!-- Settings Content -->
          <div class="settings-content">
            <div *ngFor="let group of preferenceGroups" 
                 class="preference-group" 
                 [class.active]="activeGroup === group.id">
              
              <div class="group-header">
                <h3>{{group.name}}</h3>
                <p class="group-description">{{group.description}}</p>
                <button class="btn btn-outline-secondary btn-sm" 
                        (click)="resetGroup(group.id)">
                  Reset to Defaults
                </button>
              </div>

              <div class="preferences-list">
                <div *ngFor="let pref of group.preferences" 
                     class="preference-item"
                     [class.experimental]="pref.experimental">
                  
                  <!-- Boolean Preference -->
                  <div *ngIf="pref.type === 'boolean'" class="preference-control">
                    <div class="preference-header">
                      <label class="preference-label">
                        {{pref.name}}
                        <span *ngIf="pref.experimental" class="experimental-badge">BETA</span>
                        <span *ngIf="pref.requiresRestart" class="restart-badge">RESTART REQUIRED</span>
                      </label>
                      <div class="toggle-switch">
                        <input type="checkbox" 
                               [id]="'pref-' + pref.key"
                               [checked]="getPreferenceValue(pref.key)"
                               (change)="setPreference(pref.key, $any($event.target).checked)">
                        <label [for]="'pref-' + pref.key" class="toggle-label"></label>
                      </div>
                    </div>
                    <p class="preference-description">{{pref.description}}</p>
                  </div>

                  <!-- Select Preference -->
                  <div *ngIf="pref.type === 'select'" class="preference-control">
                    <div class="preference-header">
                      <label class="preference-label" [for]="'pref-' + pref.key">
                        {{pref.name}}
                        <span *ngIf="pref.experimental" class="experimental-badge">BETA</span>
                      </label>
                    </div>
                    <select [id]="'pref-' + pref.key"
                            class="form-select"
                            [value]="getPreferenceValue(pref.key)"
                            (change)="setPreference(pref.key, $any($event.target).value)">
                      <option *ngFor="let option of pref.options" 
                              [value]="option.value">
                        {{option.label}}
                      </option>
                    </select>
                    <p class="preference-description">{{pref.description}}</p>
                  </div>

                  <!-- Range Preference -->
                  <div *ngIf="pref.type === 'range'" class="preference-control">
                    <div class="preference-header">
                      <label class="preference-label" [for]="'pref-' + pref.key">
                        {{pref.name}}
                        <span *ngIf="pref.experimental" class="experimental-badge">BETA</span>
                      </label>
                      <span class="preference-value">
                        {{getPreferenceValue(pref.key)}}{{pref.unit ? ' ' + pref.unit : ''}}
                      </span>
                    </div>
                    <input type="range"
                           [id]="'pref-' + pref.key"
                           class="form-range"
                           [min]="pref.min"
                           [max]="pref.max"
                           [step]="pref.step"
                           [value]="getPreferenceValue(pref.key)"
                           (input)="setPreference(pref.key, Number($any($event.target).value))">
                    <p class="preference-description">{{pref.description}}</p>
                  </div>

                  <!-- Number Preference -->
                  <div *ngIf="pref.type === 'number'" class="preference-control">
                    <div class="preference-header">
                      <label class="preference-label" [for]="'pref-' + pref.key">
                        {{pref.name}}
                        <span *ngIf="pref.experimental" class="experimental-badge">BETA</span>
                      </label>
                    </div>
                    <input type="number"
                           [id]="'pref-' + pref.key"
                           class="form-control"
                           [min]="pref.min"
                           [max]="pref.max"
                           [step]="pref.step"
                           [value]="getPreferenceValue(pref.key)"
                           (input)="setPreference(pref.key, Number($any($event.target).value))">
                    <p class="preference-description">{{pref.description}}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <div class="footer-left">
          <button type="button" class="btn btn-outline-secondary" (click)="exportPreferences()">
            Export Settings
          </button>
          <button type="button" class="btn btn-outline-secondary" (click)="importPreferences()">
            Import Settings
          </button>
        </div>
        <div class="footer-right">
          <button type="button" class="btn btn-outline-danger" (click)="resetAllPreferences()">
            Reset All
          </button>
          <button type="button" class="btn btn-secondary" (click)="close()">
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Hidden file input for import -->
    <input #fileInput type="file" accept=".json" style="display: none" (change)="onFileSelected($event)">
  `,
  styles: [`
    .settings-modal {
      width: 900px;
      max-width: 90vw;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem;
      border-bottom: 1px solid #dee2e6;
      background: #f8f9fa;
    }

    .modal-title {
      margin: 0;
      color: #2c3e50;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .btn-close {
      background: transparent;
      border: none;
      font-size: 1.5rem;
      color: #6c757d;
      cursor: pointer;
      padding: 0.25rem;
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-body {
      padding: 0;
      flex: 1;
      overflow: hidden;
    }

    .settings-container {
      display: flex;
      height: 500px;
    }

    .settings-nav {
      width: 220px;
      background: #f8f9fa;
      border-right: 1px solid #dee2e6;
      overflow-y: auto;
    }

    .nav-list {
      padding: 1rem 0;
    }

    .nav-item {
      width: 100%;
      padding: 0.75rem 1.5rem;
      border: none;
      background: transparent;
      text-align: left;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #495057;
      font-size: 0.95rem;
      transition: all 0.2s ease;
    }

    .nav-item:hover {
      background: rgba(0, 123, 255, 0.1);
      color: #007bff;
    }

    .nav-item.active {
      background: #007bff;
      color: white;
    }

    .settings-content {
      flex: 1;
      overflow-y: auto;
      padding: 2rem;
    }

    .preference-group {
      display: none;
    }

    .preference-group.active {
      display: block;
    }

    .group-header {
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .group-header h3 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .group-description {
      color: #6c757d;
      margin: 0.5rem 0 0 0;
      flex-basis: 100%;
    }

    .preference-item {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: #fff;
      border: 1px solid #e9ecef;
      border-radius: 8px;
    }

    .preference-item.experimental {
      border-color: #ffc107;
      background: #fff8e1;
    }

    .preference-control {
      width: 100%;
    }

    .preference-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .preference-label {
      font-weight: 600;
      color: #2c3e50;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .preference-value {
      font-weight: 600;
      color: #007bff;
      font-size: 0.9rem;
    }

    .preference-description {
      color: #6c757d;
      font-size: 0.9rem;
      margin: 0.5rem 0 0 0;
      line-height: 1.4;
    }

    .experimental-badge {
      background: #ffc107;
      color: #000;
      font-size: 0.7rem;
      padding: 0.2rem 0.4rem;
      border-radius: 3px;
      font-weight: bold;
    }

    .restart-badge {
      background: #dc3545;
      color: white;
      font-size: 0.7rem;
      padding: 0.2rem 0.4rem;
      border-radius: 3px;
      font-weight: bold;
    }

    /* Form Controls */
    .form-select, .form-control {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ced4da;
      border-radius: 0.375rem;
      font-size: 0.95rem;
      margin-top: 0.5rem;
    }

    .form-select:focus, .form-control:focus {
      outline: none;
      border-color: #80bdff;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }

    .form-range {
      width: 100%;
      margin-top: 0.5rem;
    }

    /* Toggle Switch */
    .toggle-switch {
      position: relative;
    }

    .toggle-switch input[type="checkbox"] {
      display: none;
    }

    .toggle-label {
      display: block;
      width: 50px;
      height: 24px;
      background: #ccc;
      border-radius: 12px;
      cursor: pointer;
      position: relative;
      transition: background 0.3s ease;
    }

    .toggle-label:before {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      transition: transform 0.3s ease;
    }

    .toggle-switch input[type="checkbox"]:checked + .toggle-label {
      background: #007bff;
    }

    .toggle-switch input[type="checkbox"]:checked + .toggle-label:before {
      transform: translateX(26px);
    }

    .modal-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-top: 1px solid #dee2e6;
      background: #f8f9fa;
    }

    .footer-left, .footer-right {
      display: flex;
      gap: 0.5rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      border: 1px solid transparent;
      font-size: 0.95rem;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      text-align: center;
    }

    .btn-secondary {
      background-color: #6c757d;
      border-color: #6c757d;
      color: #fff;
    }

    .btn-outline-secondary {
      border-color: #6c757d;
      color: #6c757d;
      background: transparent;
    }

    .btn-outline-danger {
      border-color: #dc3545;
      color: #dc3545;
      background: transparent;
    }

    .btn-sm {
      padding: 0.25rem 0.5rem;
      font-size: 0.875rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .settings-modal {
        width: 100vw;
        height: 100vh;
        max-width: none;
        max-height: none;
      }

      .settings-container {
        flex-direction: column;
        height: auto;
      }

      .settings-nav {
        width: 100%;
        height: auto;
      }

      .nav-list {
        display: flex;
        overflow-x: auto;
        padding: 0.5rem;
      }

      .nav-item {
        flex-shrink: 0;
        white-space: nowrap;
      }

      .settings-content {
        padding: 1rem;
      }
    }
  `]
})
export class SettingsComponent implements OnInit {
  modalRef?: ModalRef;
  
  preferenceGroups: PreferenceGroup[] = [];
  activeGroup: string = 'display';
  preferences: UserPreferences;

  constructor(
    private userPreferencesService: UserPreferencesService,
    private exportService: ExportService
  ) {
    this.preferences = this.userPreferencesService.getPreferences();
  }

  ngOnInit(): void {
    this.preferenceGroups = this.userPreferencesService.getPreferenceGroups();
    
    // Subscribe to preference changes
    this.userPreferencesService.preferences$.subscribe(prefs => {
      this.preferences = prefs;
    });
  }

  setActiveGroup(groupId: string): void {
    this.activeGroup = groupId;
  }

  getPreferenceValue(key: keyof UserPreferences): any {
    return this.preferences[key];
  }

  setPreference(key: keyof UserPreferences, value: any): void {
    this.userPreferencesService.setPreference(key, value);
  }

  resetGroup(groupId: string): void {
    if (confirm('Reset all preferences in this group to their default values?')) {
      this.userPreferencesService.resetPreferenceGroup(groupId);
    }
  }

  resetAllPreferences(): void {
    if (confirm('Reset ALL preferences to their default values? This cannot be undone.')) {
      this.userPreferencesService.resetPreferences();
    }
  }

  exportPreferences(): void {
    const prefsJson = this.userPreferencesService.exportPreferences();
    const blob = new Blob([prefsJson], { type: 'application/json' });
    
    const filename = `blake-archive-settings-${new Date().toISOString().split('T')[0]}.json`;
    this.exportService.downloadExport(blob, filename);
  }

  importPreferences(): void {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = this.userPreferencesService.importPreferences(content);
      
      if (success) {
        alert('Settings imported successfully!');
      } else {
        alert('Error importing settings. Please check the file format.');
      }
    };
    
    reader.onerror = () => {
      alert('Error reading file.');
    };
    
    reader.readAsText(file);
    
    // Clear the input
    input.value = '';
  }

  close(): void {
    if (this.modalRef) {
      this.modalRef.close();
    }
  }
}