import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../services/search.service';

@Component({
  selector: 'app-field-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- search field -->
    <li class="dropdown" (click)="$event.stopPropagation()">
        <a class="dropdown-toggle" role="button" aria-expanded="false" 
           (click)="toggleDropdown()">
            Type <span class="caret"></span>
        </a>
        <ul class="dropdown-menu" role="menu" [class.show]="isDropdownOpen">
            <li>
                <label>
                    <input type="checkbox" 
                           [(ngModel)]="searchConfig.searchAllFields" 
                           (change)="onAllFieldsChange()"> Any
                </label>
            </li>
            <li>
                <label>
                    <input type="checkbox" 
                           [(ngModel)]="searchConfig.searchTitle" 
                           (change)="onFieldChange()"> Title
                </label>
            </li>
            <li>
                <label>
                    <input type="checkbox" 
                           [(ngModel)]="searchConfig.searchText" 
                           (change)="onFieldChange()"> Transcription
                </label>
            </li>
            <li>
                <label>
                    <input type="checkbox" 
                           [(ngModel)]="searchConfig.searchImageKeywords" 
                           (change)="onFieldChange()"> Image Tag
                </label>
            </li>
            <li>
                <label>
                    <input type="checkbox" 
                           [(ngModel)]="searchConfig.searchNotes" 
                           (change)="onFieldChange()"> Editors' Note
                </label>
            </li>
            <li>
                <label>
                    <input type="checkbox" 
                           [(ngModel)]="searchConfig.searchImageDescriptions" 
                           (change)="onFieldChange()"> Illustration Description
                </label>
            </li>
            <li>
                <label>
                    <input type="checkbox" 
                           [(ngModel)]="searchConfig.searchCopyInformation" 
                           (change)="onFieldChange()"> Copy/Set/Receipt/Work-in-Preview/Object-in-Virtual-Group Information
                </label>
            </li>
            <li>
                <label>
                    <input type="checkbox" 
                           [(ngModel)]="searchConfig.searchWorkInformation" 
                           (change)="onFieldChange()"> Work Information
                </label>
            </li>
        </ul>
    </li>
  `
})
export class FieldSearchComponent implements OnInit {
  isDropdownOpen = false;

  get searchConfig() {
    return this.searchService.currentState.searchConfig;
  }

  constructor(public searchService: SearchService) {}

  ngOnInit(): void {
    // Component initialization
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  onAllFieldsChange(): void {
    // Will implement search trigger method later
    // this.searchService.triggerAllFields();
  }

  onFieldChange(): void {
    // Will implement search trigger method later
    // this.searchService.triggerFieldChange();
  }
}