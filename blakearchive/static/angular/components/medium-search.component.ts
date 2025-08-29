import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../services/search.service';

@Component({
  selector: 'app-medium-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- type -->
    <li class="dropdown" (click)="$event.stopPropagation()">
        <a class="dropdown-toggle" role="button" aria-expanded="false" 
           (click)="toggleDropdown()">
            Medium <span class="caret"></span>
        </a>
        <ul class="dropdown-menu" role="menu" [class.show]="isDropdownOpen">
            <li>
                <label>
                    <input type="checkbox" 
                           [(ngModel)]="searchConfig.searchAllTypes" 
                           (change)="onAllTypesChange()"> Any
                </label>
            </li>
            <li>
                <label>
                    <input type="checkbox" 
                           [(ngModel)]="searchConfig.searchIlluminatedBooks" 
                           (change)="onTypeChange()"> Illuminated Books
                </label>
            </li>
            <li>
                <label>
                    <input type="checkbox" 
                           [(ngModel)]="searchConfig.searchCommercialBookIllustrations" 
                           (change)="onTypeChange()"> Commercial Book Illustrations
                </label>
            </li>
            <li>
                <label>
                    <input type="checkbox" 
                           [(ngModel)]="searchConfig.searchSeparatePrints" 
                           (change)="onTypeChange()"> Separate Prints
                </label>
            </li>
            <li>
                <label>
                    <input type="checkbox" 
                           [(ngModel)]="searchConfig.searchDrawingsPaintings" 
                           (change)="onTypeChange()"> Drawings and Paintings
                </label>
            </li>
            <li>
                <label>
                    <input type="checkbox" 
                           [(ngModel)]="searchConfig.searchManuscripts" 
                           (change)="onTypeChange()"> Manuscripts and Typographic Works
                </label>
            </li>
            <li>
                <label>
                    <input type="checkbox" 
                           [(ngModel)]="searchConfig.searchRelatedMaterials" 
                           (change)="onTypeChange()"> Related Materials
                </label>
            </li>
        </ul>
    </li>
  `
})
export class MediumSearchComponent implements OnInit {
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

  onAllTypesChange(): void {
    // Will implement search trigger method later
    // this.searchService.triggerAllTypes();
  }

  onTypeChange(): void {
    // Will implement search trigger method later
    // this.searchService.triggerTypeChange();
  }
}