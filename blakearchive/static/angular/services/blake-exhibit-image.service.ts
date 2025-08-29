import { Injectable } from '@angular/core';
import { GenericService, GenericFactory } from './generic.service';

export interface BlakeExhibitImageConfig {
  image_id: string;
  exhibit_id: string;
  title?: string;
  description?: string;
  url?: string;
  thumbnail_url?: string;
  order?: number;
  [key: string]: any;
}

export interface BlakeExhibitImage extends BlakeExhibitImageConfig {
  // Inherits all properties from config
}

@Injectable({
  providedIn: 'root'
})
export class BlakeExhibitImageService {
  private genericService: GenericFactory<BlakeExhibitImage>;

  constructor(genericService: GenericService) {
    this.genericService = genericService.createFactory<BlakeExhibitImage>(this.createExhibitImage.bind(this));
  }

  /**
   * Create a BlakeExhibitImage instance from configuration
   */
  create(config: BlakeExhibitImageConfig | BlakeExhibitImageConfig[]): BlakeExhibitImage | BlakeExhibitImage[] {
    return this.genericService.create(config);
  }

  /**
   * Factory method for BlakeExhibitImage
   * Takes a config object and creates a BlakeExhibitImage with proper transformations
   */
  private createExhibitImage(config: BlakeExhibitImageConfig): BlakeExhibitImage {
    if (!config) {
      throw new Error('BlakeExhibitImage config is required');
    }

    // Create a deep copy of the config
    const exhibitImage: BlakeExhibitImage = {
      ...JSON.parse(JSON.stringify(config))
    };

    return exhibitImage;
  }

  /**
   * Get image ID
   */
  getImageId(image: BlakeExhibitImage): string {
    return image.image_id;
  }

  /**
   * Get exhibit ID
   */
  getExhibitId(image: BlakeExhibitImage): string {
    return image.exhibit_id;
  }

  /**
   * Get image title
   */
  getTitle(image: BlakeExhibitImage): string {
    return image.title || 'Untitled Image';
  }

  /**
   * Get image description
   */
  getDescription(image: BlakeExhibitImage): string {
    return image.description || '';
  }

  /**
   * Get image URL
   */
  getUrl(image: BlakeExhibitImage): string {
    return image.url || '';
  }

  /**
   * Get thumbnail URL
   */
  getThumbnailUrl(image: BlakeExhibitImage): string {
    return image.thumbnail_url || image.url || '';
  }

  /**
   * Get image order
   */
  getOrder(image: BlakeExhibitImage): number {
    return image.order || 0;
  }

  /**
   * Check if image has description
   */
  hasDescription(image: BlakeExhibitImage): boolean {
    return !!(image.description && image.description.trim().length > 0);
  }

  /**
   * Check if image has URL
   */
  hasUrl(image: BlakeExhibitImage): boolean {
    return !!(image.url && image.url.trim().length > 0);
  }

  /**
   * Check if image has thumbnail URL
   */
  hasThumbnailUrl(image: BlakeExhibitImage): boolean {
    return !!(image.thumbnail_url && image.thumbnail_url.trim().length > 0);
  }

  /**
   * Sort images by order
   */
  sortByOrder(images: BlakeExhibitImage[]): BlakeExhibitImage[] {
    return images.sort((a, b) => this.getOrder(a) - this.getOrder(b));
  }
}