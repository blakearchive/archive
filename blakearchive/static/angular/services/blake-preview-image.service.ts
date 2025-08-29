import { Injectable } from '@angular/core';
import { GenericService, GenericFactory } from './generic.service';

export interface BlakePreviewImageConfig {
  image_id: string;
  preview_id: string;
  title?: string;
  description?: string;
  url?: string;
  thumbnail_url?: string;
  order?: number;
  [key: string]: any;
}

export interface BlakePreviewImage extends BlakePreviewImageConfig {
  // Inherits all properties from config
}

@Injectable({
  providedIn: 'root'
})
export class BlakePreviewImageService {
  private genericService: GenericFactory<BlakePreviewImage>;

  constructor(genericService: GenericService) {
    this.genericService = genericService.createFactory<BlakePreviewImage>(this.createPreviewImage.bind(this));
  }

  /**
   * Create a BlakePreviewImage instance from configuration
   */
  create(config: BlakePreviewImageConfig | BlakePreviewImageConfig[]): BlakePreviewImage | BlakePreviewImage[] {
    return this.genericService.create(config);
  }

  /**
   * Factory method for BlakePreviewImage
   * Takes a config object and creates a BlakePreviewImage with proper transformations
   */
  private createPreviewImage(config: BlakePreviewImageConfig): BlakePreviewImage {
    if (!config) {
      throw new Error('BlakePreviewImage config is required');
    }

    // Create a deep copy of the config
    const previewImage: BlakePreviewImage = {
      ...JSON.parse(JSON.stringify(config))
    };

    return previewImage;
  }

  /**
   * Get image ID
   */
  getImageId(image: BlakePreviewImage): string {
    return image.image_id;
  }

  /**
   * Get preview ID
   */
  getPreviewId(image: BlakePreviewImage): string {
    return image.preview_id;
  }

  /**
   * Get image title
   */
  getTitle(image: BlakePreviewImage): string {
    return image.title || 'Untitled Image';
  }

  /**
   * Get image description
   */
  getDescription(image: BlakePreviewImage): string {
    return image.description || '';
  }

  /**
   * Get image URL
   */
  getUrl(image: BlakePreviewImage): string {
    return image.url || '';
  }

  /**
   * Get thumbnail URL
   */
  getThumbnailUrl(image: BlakePreviewImage): string {
    return image.thumbnail_url || image.url || '';
  }

  /**
   * Get image order
   */
  getOrder(image: BlakePreviewImage): number {
    return image.order || 0;
  }

  /**
   * Check if image has description
   */
  hasDescription(image: BlakePreviewImage): boolean {
    return !!(image.description && image.description.trim().length > 0);
  }

  /**
   * Check if image has URL
   */
  hasUrl(image: BlakePreviewImage): boolean {
    return !!(image.url && image.url.trim().length > 0);
  }

  /**
   * Check if image has thumbnail URL
   */
  hasThumbnailUrl(image: BlakePreviewImage): boolean {
    return !!(image.thumbnail_url && image.thumbnail_url.trim().length > 0);
  }

  /**
   * Sort images by order
   */
  sortByOrder(images: BlakePreviewImage[]): BlakePreviewImage[] {
    return images.sort((a, b) => this.getOrder(a) - this.getOrder(b));
  }

  /**
   * Filter images by preview ID
   */
  filterByPreviewId(images: BlakePreviewImage[], previewId: string): BlakePreviewImage[] {
    return images.filter(image => image.preview_id === previewId);
  }
}