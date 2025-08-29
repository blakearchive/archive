import { Injectable } from '@angular/core';
import { GenericService, GenericFactory } from './generic.service';

export interface BlakeExhibitConfig {
  id: string;
  title?: string;
  description?: string;
  curator?: string;
  date?: string;
  [key: string]: any;
}

export interface BlakeExhibit extends BlakeExhibitConfig {
  // Inherits all properties from config
}

@Injectable({
  providedIn: 'root'
})
export class BlakeExhibitService {
  private genericService: GenericFactory<BlakeExhibit>;

  constructor(genericService: GenericService) {
    this.genericService = genericService.createFactory<BlakeExhibit>(this.createExhibit.bind(this));
  }

  /**
   * Create a BlakeExhibit instance from configuration
   */
  create(config: BlakeExhibitConfig | BlakeExhibitConfig[]): BlakeExhibit | BlakeExhibit[] {
    return this.genericService.create(config);
  }

  /**
   * Factory method for BlakeExhibit
   * Takes a config object and creates a BlakeExhibit with proper transformations
   */
  private createExhibit(config: BlakeExhibitConfig): BlakeExhibit {
    if (!config) {
      throw new Error('BlakeExhibit config is required');
    }

    // Create a deep copy of the config
    const blakeExhibit: BlakeExhibit = {
      ...JSON.parse(JSON.stringify(config))
    };

    return blakeExhibit;
  }

  /**
   * Get exhibit title
   */
  getExhibitTitle(exhibit: BlakeExhibit): string {
    return exhibit.title || 'Untitled Exhibit';
  }

  /**
   * Get exhibit description
   */
  getExhibitDescription(exhibit: BlakeExhibit): string {
    return exhibit.description || '';
  }

  /**
   * Get exhibit curator
   */
  getExhibitCurator(exhibit: BlakeExhibit): string {
    return exhibit.curator || '';
  }

  /**
   * Get exhibit date
   */
  getExhibitDate(exhibit: BlakeExhibit): string {
    return exhibit.date || '';
  }

  /**
   * Check if exhibit has a description
   */
  hasDescription(exhibit: BlakeExhibit): boolean {
    return !!(exhibit.description && exhibit.description.trim().length > 0);
  }

  /**
   * Check if exhibit has a curator
   */
  hasCurator(exhibit: BlakeExhibit): boolean {
    return !!(exhibit.curator && exhibit.curator.trim().length > 0);
  }

  /**
   * Check if exhibit has a date
   */
  hasDate(exhibit: BlakeExhibit): boolean {
    return !!(exhibit.date && exhibit.date.trim().length > 0);
  }
}