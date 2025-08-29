import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../services/search.service';

@Component({
  selector: 'app-date-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- date -->
    <li class="dropdown" (click)="$event.stopPropagation()">
        <a class="dropdown-toggle" role="button" aria-expanded="false" 
           (click)="toggleDropdown()">
            Date <span class="caret"></span>
        </a>
        <ul class="dropdown-menu" role="menu" [class.show]="isDropdownOpen" 
            (click)="$event.stopPropagation()">
            <li class="list-header">Restrict Date Range:</li>
            <li>
                <div class="range-slider-container">
                    <div class="range-slider">
                        <input type="range" 
                               [min]="minYear" 
                               [max]="maxYear" 
                               [(ngModel)]="searchConfig.minDate"
                               (change)="onDateRangeChange()"
                               class="slider min-slider">
                        <input type="range" 
                               [min]="minYear" 
                               [max]="maxYear" 
                               [(ngModel)]="searchConfig.maxDate"
                               (change)="onDateRangeChange()"
                               class="slider max-slider">
                        <div class="range-values">
                            <span>{{searchConfig.minDate}}</span>
                            <span>{{searchConfig.maxDate}}</span>
                        </div>
                    </div>
                </div>
            </li>
            <li class="divider" role="separator"></li>
            <li>
                <label>
                    <input type="checkbox" 
                           [(ngModel)]="searchConfig.useCompDate" 
                           (change)="onDateTypeChange()"> Composition Date
                </label>
            </li>
            <li>
                <label>
                    <input type="checkbox" 
                           [(ngModel)]="searchConfig.usePrintDate" 
                           (change)="onDateTypeChange()"> Printing Date
                </label>
            </li>
        </ul>
    </li>
  `,
  styles: [`
    .range-slider-container {
      padding: 10px;
      min-width: 200px;
    }
    
    .range-slider {
      position: relative;
      height: 40px;
    }
    
    .slider {
      position: absolute;
      width: 100%;
      height: 5px;
      outline: none;
      background: transparent;
      pointer-events: none;
    }
    
    .slider::-webkit-slider-thumb {
      appearance: none;
      height: 15px;
      width: 15px;
      background: #04AA6D;
      cursor: pointer;
      border-radius: 50%;
      pointer-events: all;
    }
    
    .slider::-moz-range-thumb {
      height: 15px;
      width: 15px;
      background: #04AA6D;
      cursor: pointer;
      border-radius: 50%;
      border: none;
      pointer-events: all;
    }
    
    .range-values {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
      font-size: 12px;
    }
  `]
})
export class DateSearchComponent implements OnInit {
  isDropdownOpen = false;
  minYear = 1772;
  maxYear = 1827;

  get searchConfig() {
    return this.searchService.currentState.searchConfig;
  }

  constructor(public searchService: SearchService) {}

  ngOnInit(): void {
    // Initialize default date range if not set
    if (!this.searchConfig.minDate) {
      this.searchConfig.minDate = this.minYear;
    }
    if (!this.searchConfig.maxDate) {
      this.searchConfig.maxDate = this.maxYear;
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  onDateRangeChange(): void {
    // Ensure min is not greater than max
    if (this.searchConfig.minDate > this.searchConfig.maxDate) {
      this.searchConfig.minDate = this.searchConfig.maxDate;
    }
    
    // Need to call a method to trigger search - will implement later
    // this.searchService.triggerSearch();
  }

  onDateTypeChange(): void {
    // Need to call a method to trigger search - will implement later  
    // this.searchService.triggerSearch();
  }
}