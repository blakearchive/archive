import { Injectable } from '@angular/core';
import { GenericService, GenericFactory } from './generic.service';

export interface BlakePreviewConfig {
  preview: {
    source: string | any;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface BlakePreview extends BlakePreviewConfig {
  source: any;
}

@Injectable({
  providedIn: 'root'
})
export class BlakePreviewService {
  private genericService: GenericFactory<BlakePreview>;

  constructor(genericService: GenericService) {
    this.genericService = genericService.createFactory<BlakePreview>(this.createPreview.bind(this));
  }

  /**
   * Create a BlakePreview instance from configuration
   */
  create(config: BlakePreviewConfig | BlakePreviewConfig[]): BlakePreview | BlakePreview[] {
    return this.genericService.create(config);
  }

  /**
   * Factory method for BlakePreview
   * Takes a config object and creates a BlakePreview with proper transformations
   */
  private createPreview(config: BlakePreviewConfig): BlakePreview {
    if (!config || !config.preview) {
      throw new Error('BlakePreview config with preview property is required');
    }

    // Create a deep copy of the config
    const blakePreview: BlakePreview = {
      ...JSON.parse(JSON.stringify(config)),
      source: this.parseJsonField(config.preview.source)
    };

    return blakePreview;
  }

  /**
   * Parse JSON field - handles both string and already parsed objects
   */
  private parseJsonField(field: string | any): any {
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch (error) {
        console.warn('Failed to parse JSON field:', field, error);
        return field;
      }
    }
    return field;
  }

  /**
   * Check if preview has source information
   */
  hasSource(preview: BlakePreview): boolean {
    return !!(preview.source && Object.keys(preview.source).length > 0);
  }

  /**
   * Get source field value safely
   */
  getSourceField(preview: BlakePreview, fieldName: string): any {
    if (this.hasSource(preview)) {
      return preview.source[fieldName];
    }
    return null;
  }

  /**
   * Get preview title
   */
  getPreviewTitle(preview: BlakePreview): string {
    return preview.preview?.title || 'Untitled Preview';
  }

  /**
   * Get preview description
   */
  getPreviewDescription(preview: BlakePreview): string {
    return preview.preview?.description || '';
  }
}