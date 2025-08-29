import { Injectable } from '@angular/core';
import { GenericService, GenericFactory } from './generic.service';

export interface BlakeFragmentPairConfig {
  desc_id_1: string;
  desc_id_2: string;
  relationship?: string;
  description?: string;
  [key: string]: any;
}

export interface BlakeFragmentPair extends BlakeFragmentPairConfig {
  // Inherits all properties from config
}

@Injectable({
  providedIn: 'root'
})
export class BlakeFragmentPairService {
  private genericService: GenericFactory<BlakeFragmentPair>;

  constructor(genericService: GenericService) {
    this.genericService = genericService.createFactory<BlakeFragmentPair>(this.createFragmentPair.bind(this));
  }

  /**
   * Create a BlakeFragmentPair instance from configuration
   */
  create(config: BlakeFragmentPairConfig | BlakeFragmentPairConfig[]): BlakeFragmentPair | BlakeFragmentPair[] {
    return this.genericService.create(config);
  }

  /**
   * Factory method for BlakeFragmentPair
   * Takes a config object and creates a BlakeFragmentPair with proper transformations
   */
  private createFragmentPair(config: BlakeFragmentPairConfig): BlakeFragmentPair {
    if (!config) {
      throw new Error('BlakeFragmentPair config is required');
    }

    // Create a deep copy of the config
    const fragmentPair: BlakeFragmentPair = {
      ...JSON.parse(JSON.stringify(config))
    };

    return fragmentPair;
  }

  /**
   * Get the first fragment descriptor ID
   */
  getFirstFragmentId(pair: BlakeFragmentPair): string {
    return pair.desc_id_1;
  }

  /**
   * Get the second fragment descriptor ID
   */
  getSecondFragmentId(pair: BlakeFragmentPair): string {
    return pair.desc_id_2;
  }

  /**
   * Get the relationship between fragments
   */
  getRelationship(pair: BlakeFragmentPair): string {
    return pair.relationship || '';
  }

  /**
   * Get fragment pair description
   */
  getDescription(pair: BlakeFragmentPair): string {
    return pair.description || '';
  }

  /**
   * Check if pair has a relationship defined
   */
  hasRelationship(pair: BlakeFragmentPair): boolean {
    return !!(pair.relationship && pair.relationship.trim().length > 0);
  }

  /**
   * Check if pair has a description
   */
  hasDescription(pair: BlakeFragmentPair): boolean {
    return !!(pair.description && pair.description.trim().length > 0);
  }

  /**
   * Get fragment pair as formatted string
   */
  getFragmentPairString(pair: BlakeFragmentPair): string {
    return `${pair.desc_id_1} / ${pair.desc_id_2}`;
  }

  /**
   * Check if a descriptor ID is part of this pair
   */
  includesFragment(pair: BlakeFragmentPair, descId: string): boolean {
    return pair.desc_id_1 === descId || pair.desc_id_2 === descId;
  }

  /**
   * Get the other fragment ID given one fragment ID
   */
  getOtherFragmentId(pair: BlakeFragmentPair, descId: string): string | null {
    if (pair.desc_id_1 === descId) {
      return pair.desc_id_2;
    } else if (pair.desc_id_2 === descId) {
      return pair.desc_id_1;
    }
    return null;
  }
}