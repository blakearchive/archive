import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SearchService, SearchResults } from '../../core/services/search.service';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-search',
  imports: [CommonModule, FormsModule, RouterLink, LoadingSpinner],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search implements OnInit {
  searchService = inject(SearchService);

  searchQuery = '';
  showFilters = false;
  results: SearchResults | null = null;
  error: string | null = null;

  // Expose service signals as properties for template
  get searching() {
    return this.searchService.searching();
  }

  get searchConfig() {
    return this.searchService.searchConfig();
  }

  // Medium types for filter UI
  mediumTypes = [
    { key: 'searchIlluminatedBooks', label: 'Illuminated Books' },
    { key: 'searchCommercialBookIllustrations', label: 'Commercial Book Illustrations' },
    { key: 'searchSeparatePrints', label: 'Separate Prints' },
    { key: 'searchDrawingsPaintings', label: 'Drawings & Paintings' },
    { key: 'searchManuscripts', label: 'Manuscripts' },
    { key: 'searchRelatedMaterials', label: 'Related Materials' }
  ];

  // Search fields for filter UI
  searchFields = [
    { key: 'searchTitle', label: 'Titles' },
    { key: 'searchText', label: 'Text' },
    { key: 'searchNotes', label: 'Notes' },
    { key: 'searchImageDescriptions', label: 'Image Descriptions' },
    { key: 'searchImageKeywords', label: 'Image Keywords' }
  ];

  ngOnInit() {
    // Initialize if needed
  }

  onSearch() {
    if (!this.searchQuery.trim()) {
      return;
    }

    this.error = null;
    this.searchService.search(this.searchQuery).subscribe({
      next: (results) => {
        this.results = results;
      },
      error: (err) => {
        this.error = 'Search failed. Please try again.';
        console.error('Search error:', err);
      }
    });
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  toggleType(type: string) {
    this.searchService.toggleType(type);
  }

  toggleField(field: string) {
    this.searchService.toggleField(field);
  }

  resetFilters() {
    this.searchService.resetFilters();
  }

  updateDateRange(min: number, max: number) {
    this.searchService.updateConfig({ minDate: min, maxDate: max });
  }

  // Helper methods for template
  getObjectCount(): number {
    return this.results?.objects?.length || 0;
  }

  getCopyCount(): number {
    return this.results?.copies?.length || 0;
  }

  getWorkCount(): number {
    return this.results?.works?.length || 0;
  }

  getTotalCount(): number {
    return this.getObjectCount() + this.getCopyCount() + this.getWorkCount();
  }

  // Helper methods to check filter state
  isFieldChecked(key: string): boolean {
    const config = this.searchConfig as any;
    return config[key] === true;
  }

  isTypeChecked(key: string): boolean {
    const config = this.searchConfig as any;
    return config[key] === true;
  }
}
