import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SearchService } from '../services/search.service';

@Component({
  selector: 'app-search-box',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form 
      class="navbar-form search-form" 
      role="search" 
      (ngSubmit)="onSubmitSearch()"
    >
      <div class="input-group">
        <input 
          type="text" 
          class="form-control search-input" 
          placeholder="Search titles, transcriptions, illustration descriptions, image tags, editors' notes, copy/set/receipt/work in preview information, and work information"
          [(ngModel)]="searchString"
          name="searchString"
          (click)="onSearchInputClick()"
          [title]="searchTooltip"
        />
        
        <span class="input-group-btn">
          <button 
            class="btn btn-default search-btn" 
            type="submit"
            [disabled]="!searchString || searchString.trim().length === 0"
          >
            <span class="glyphicon glyphicon-search" aria-hidden="true"></span>
          </button>
          
          <!-- Image tags placeholder - TODO: Convert image-tags directive -->
          <div class="image-tags-placeholder">
            <!-- <app-image-tags></app-image-tags> -->
          </div>
        </span>
      </div>
    </form>
  `,
  styles: [`
    .search-form {
      margin: 0;
      padding: 8px 15px;
      border: none;
    }
    
    .input-group {
      display: flex;
      width: 100%;
      max-width: 400px;
    }
    
    .search-input {
      flex: 1;
      height: 34px;
      padding: 6px 12px;
      font-size: 14px;
      line-height: 1.42857143;
      color: #555;
      background-color: #fff;
      border: 1px solid #ccc;
      border-radius: 4px 0 0 4px;
      box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
      transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;
    }
    
    .search-input:focus {
      border-color: #66afe9;
      outline: 0;
      box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6);
    }
    
    .input-group-btn {
      display: flex;
      white-space: nowrap;
      vertical-align: middle;
    }
    
    .search-btn {
      height: 34px;
      padding: 6px 12px;
      margin-left: -1px;
      font-size: 14px;
      font-weight: normal;
      line-height: 1.42857143;
      text-align: center;
      white-space: nowrap;
      vertical-align: middle;
      cursor: pointer;
      border: 1px solid #ccc;
      border-radius: 0 4px 4px 0;
      background-color: #fff;
      color: #333;
      transition: all 0.2s ease;
    }
    
    .search-btn:hover:not(:disabled) {
      background-color: #f5f5f5;
      border-color: #adadad;
    }
    
    .search-btn:disabled {
      opacity: 0.65;
      cursor: not-allowed;
      background-color: #fff;
    }
    
    .search-btn:focus {
      outline: 0;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }
    
    .glyphicon {
      position: relative;
      top: 1px;
      display: inline-block;
      font-family: 'Glyphicons Halflings';
      font-style: normal;
      font-weight: normal;
      line-height: 1;
    }
    
    .glyphicon-search:before {
      content: "\\1F50D"; /* Unicode search symbol */
    }
    
    .image-tags-placeholder {
      /* Placeholder for future image-tags component */
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
      .input-group {
        max-width: 250px;
      }
      
      .search-input {
        font-size: 16px; /* Prevent zoom on iOS */
      }
    }
    
    /* Tooltip-like styling for placeholder */
    .search-input::placeholder {
      color: #999;
      opacity: 1;
    }
  `]
})
export class SearchBoxComponent implements OnInit, OnDestroy {
  searchString: string = '';
  searchTooltip: string = "Search titles, transcriptions, illustration descriptions, image tags, editors' notes, copy/set/receipt/work in preview information, and work information";

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    // Subscribe to search service state to sync search string
    this.searchService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        if (state.searchConfig.searchString !== this.searchString) {
          this.searchString = state.searchConfig.searchString || '';
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handle search input click - clear placeholder behavior
   */
  onSearchInputClick(): void {
    // Clear search string if it's empty (placeholder behavior)
    if (!this.searchString || this.searchString.trim().length === 0) {
      this.searchString = '';
    }
  }

  /**
   * Handle search form submission
   */
  onSubmitSearch(): void {
    if (!this.searchString || this.searchString.trim().length === 0) {
      return;
    }

    // Update search service with new search string
    this.searchService.setSearchString(this.searchString.trim());
    
    // Navigate to search page with search parameter
    this.router.navigate(['/search'], { 
      queryParams: { search: this.searchString.trim() } 
    });

    // Also trigger the search
    this.searchService.removeStopWords();
    this.searchService.performSearch();
  }

  /**
   * Load search page (compatibility method)
   */
  loadSearchPage(): void {
    this.onSubmitSearch();
  }
}