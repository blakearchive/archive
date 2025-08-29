import { Injectable } from '@angular/core';
import { GenericService, GenericFactory } from './generic.service';

export interface BlakeFeaturedWorkConfig {
  work_id: string;
  title?: string;
  description?: string;
  image?: string;
  featured_date?: string;
  [key: string]: any;
}

export interface BlakeFeaturedWork extends BlakeFeaturedWorkConfig {
  // Inherits all properties from config
}

@Injectable({
  providedIn: 'root'
})
export class BlakeFeaturedWorkService {
  private genericService: GenericFactory<BlakeFeaturedWork>;

  constructor(genericService: GenericService) {
    this.genericService = genericService.createFactory<BlakeFeaturedWork>(this.createFeaturedWork.bind(this));
  }

  /**
   * Create a BlakeFeaturedWork instance from configuration
   */
  create(config: BlakeFeaturedWorkConfig | BlakeFeaturedWorkConfig[]): BlakeFeaturedWork | BlakeFeaturedWork[] {
    return this.genericService.create(config);
  }

  /**
   * Factory method for BlakeFeaturedWork
   * Takes a config object and creates a BlakeFeaturedWork with proper transformations
   */
  private createFeaturedWork(config: BlakeFeaturedWorkConfig): BlakeFeaturedWork {
    if (!config) {
      throw new Error('BlakeFeaturedWork config is required');
    }

    // Create a deep copy of the config
    const featuredWork: BlakeFeaturedWork = {
      ...JSON.parse(JSON.stringify(config))
    };

    return featuredWork;
  }

  /**
   * Get featured work ID
   */
  getWorkId(work: BlakeFeaturedWork): string {
    return work.work_id;
  }

  /**
   * Get featured work title
   */
  getTitle(work: BlakeFeaturedWork): string {
    return work.title || 'Untitled Work';
  }

  /**
   * Get featured work description
   */
  getDescription(work: BlakeFeaturedWork): string {
    return work.description || '';
  }

  /**
   * Get featured work image
   */
  getImage(work: BlakeFeaturedWork): string {
    return work.image || '';
  }

  /**
   * Get featured date
   */
  getFeaturedDate(work: BlakeFeaturedWork): string {
    return work.featured_date || '';
  }

  /**
   * Check if work has description
   */
  hasDescription(work: BlakeFeaturedWork): boolean {
    return !!(work.description && work.description.trim().length > 0);
  }

  /**
   * Check if work has image
   */
  hasImage(work: BlakeFeaturedWork): boolean {
    return !!(work.image && work.image.trim().length > 0);
  }

  /**
   * Check if work has featured date
   */
  hasFeaturedDate(work: BlakeFeaturedWork): boolean {
    return !!(work.featured_date && work.featured_date.trim().length > 0);
  }

  /**
   * Get work URL
   */
  getWorkUrl(work: BlakeFeaturedWork): string {
    return `/work/${work.work_id}`;
  }
}