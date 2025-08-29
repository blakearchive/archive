import { Injectable } from '@angular/core';
import { GenericService, GenericFactory } from './generic.service';

export interface BlakeExhibitCaptionConfig {
  caption_id: string;
  exhibit_id: string;
  image_id: string;
  caption_text?: string;
  author?: string;
  position?: string;
  order?: number;
  [key: string]: any;
}

export interface BlakeExhibitCaption extends BlakeExhibitCaptionConfig {
  // Inherits all properties from config
}

@Injectable({
  providedIn: 'root'
})
export class BlakeExhibitCaptionService {
  private genericService: GenericFactory<BlakeExhibitCaption>;

  constructor(genericService: GenericService) {
    this.genericService = genericService.createFactory<BlakeExhibitCaption>(this.createExhibitCaption.bind(this));
  }

  /**
   * Create a BlakeExhibitCaption instance from configuration
   */
  create(config: BlakeExhibitCaptionConfig | BlakeExhibitCaptionConfig[]): BlakeExhibitCaption | BlakeExhibitCaption[] {
    return this.genericService.create(config);
  }

  /**
   * Factory method for BlakeExhibitCaption
   * Takes a config object and creates a BlakeExhibitCaption with proper transformations
   */
  private createExhibitCaption(config: BlakeExhibitCaptionConfig): BlakeExhibitCaption {
    if (!config) {
      throw new Error('BlakeExhibitCaption config is required');
    }

    // Create a deep copy of the config
    const exhibitCaption: BlakeExhibitCaption = {
      ...JSON.parse(JSON.stringify(config))
    };

    return exhibitCaption;
  }

  /**
   * Get caption ID
   */
  getCaptionId(caption: BlakeExhibitCaption): string {
    return caption.caption_id;
  }

  /**
   * Get exhibit ID
   */
  getExhibitId(caption: BlakeExhibitCaption): string {
    return caption.exhibit_id;
  }

  /**
   * Get image ID
   */
  getImageId(caption: BlakeExhibitCaption): string {
    return caption.image_id;
  }

  /**
   * Get caption text
   */
  getCaptionText(caption: BlakeExhibitCaption): string {
    return caption.caption_text || '';
  }

  /**
   * Get caption author
   */
  getAuthor(caption: BlakeExhibitCaption): string {
    return caption.author || '';
  }

  /**
   * Get caption position
   */
  getPosition(caption: BlakeExhibitCaption): string {
    return caption.position || 'bottom';
  }

  /**
   * Get caption order
   */
  getOrder(caption: BlakeExhibitCaption): number {
    return caption.order || 0;
  }

  /**
   * Check if caption has text
   */
  hasCaptionText(caption: BlakeExhibitCaption): boolean {
    return !!(caption.caption_text && caption.caption_text.trim().length > 0);
  }

  /**
   * Check if caption has author
   */
  hasAuthor(caption: BlakeExhibitCaption): boolean {
    return !!(caption.author && caption.author.trim().length > 0);
  }

  /**
   * Get formatted caption with author
   */
  getFormattedCaption(caption: BlakeExhibitCaption): string {
    const text = this.getCaptionText(caption);
    const author = this.getAuthor(caption);
    
    if (text && author) {
      return `${text} — ${author}`;
    }
    
    return text || '';
  }

  /**
   * Sort captions by order
   */
  sortByOrder(captions: BlakeExhibitCaption[]): BlakeExhibitCaption[] {
    return captions.sort((a, b) => this.getOrder(a) - this.getOrder(b));
  }

  /**
   * Filter captions by image ID
   */
  filterByImageId(captions: BlakeExhibitCaption[], imageId: string): BlakeExhibitCaption[] {
    return captions.filter(caption => caption.image_id === imageId);
  }
}