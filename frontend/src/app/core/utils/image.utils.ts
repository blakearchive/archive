/**
 * Image utility functions for Blake Archive
 */

import { BlakeObject } from '../models/blake.models';

/**
 * Base path for Blake Archive images
 */
export const IMAGE_BASE_PATH = '/static/img';

/**
 * Generate full image URL for a Blake object
 * @param obj Blake object or descriptor ID
 * @returns Full image URL
 */
export function getObjectImageUrl(obj: BlakeObject | string): string {
  if (typeof obj === 'string') {
    return `${IMAGE_BASE_PATH}/${obj}.jpg`;
  }
  const id = obj.full_object_id || obj.desc_id;
  return `${IMAGE_BASE_PATH}/${id}.jpg`;
}

/**
 * Generate thumbnail image URL for a Blake object
 * @param obj Blake object or descriptor ID
 * @returns Thumbnail image URL
 */
export function getObjectThumbnailUrl(obj: BlakeObject | string): string {
  if (typeof obj === 'string') {
    return `${IMAGE_BASE_PATH}/thumbnails/${obj}.thumb.jpg`;
  }
  const id = obj.full_object_id || obj.desc_id;
  return `${IMAGE_BASE_PATH}/thumbnails/${id}.thumb.jpg`;
}

/**
 * Generate static HTML file URL
 * @param pageName Name of the HTML file (without extension)
 * @returns Static HTML URL
 */
export function getStaticHtmlUrl(pageName: string): string {
  return `/static/html/${pageName}.html`;
}

/**
 * Check if image URL is valid
 * @param url Image URL to validate
 * @returns Promise resolving to boolean
 */
export async function isImageValid(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}
