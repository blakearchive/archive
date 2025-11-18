/**
 * Image Utility Functions for Blake Archive
 *
 * This module provides centralized utilities for generating image URLs and paths
 * throughout the Blake Archive application. Using these utilities ensures consistent
 * image path construction and makes it easy to update paths in the future.
 *
 * @module image.utils
 *
 * @example Importing Utilities
 * ```typescript
 * import { getObjectImageUrl, getObjectThumbnailUrl, IMAGE_BASE_PATH } from '@core/utils/image.utils';
 * ```
 */

import { BlakeObject } from '../models/blake.models';

/**
 * Base path for all Blake Archive image assets.
 *
 * This constant is used by all image utility functions to construct
 * full image URLs. Modify this value to change the base path for all images.
 *
 * @constant
 *
 * @example
 * ```typescript
 * const customPath = `${IMAGE_BASE_PATH}/custom/subfolder`;
 * ```
 */
export const IMAGE_BASE_PATH = '/static/img';

/**
 * Generates the full-size image URL for a Blake object.
 *
 * This function handles both BlakeObject instances and string IDs, making it
 * flexible for use in different contexts. It automatically selects the appropriate
 * ID field (full_object_id or desc_id) from the object.
 *
 * @param obj Blake object instance or descriptor ID string
 * @returns Full URL path to the object's image
 *
 * @example With BlakeObject
 * ```typescript
 * const object: BlakeObject = {
 *   desc_id: 'but11.1.wc.01',
 *   full_object_id: 'but11.1.wc.01',
 *   // ... other properties
 * };
 * const url = getObjectImageUrl(object);
 * // Returns: "/static/img/but11.1.wc.01.jpg"
 * ```
 *
 * @example With String ID
 * ```typescript
 * const url = getObjectImageUrl('but11.1.wc.01');
 * // Returns: "/static/img/but11.1.wc.01.jpg"
 * ```
 *
 * @example In a Component
 * ```typescript
 * export class ObjectViewComponent {
 *   object: BlakeObject;
 *
 *   getImageUrl(): string {
 *     return getObjectImageUrl(this.object);
 *   }
 * }
 * ```
 *
 * @example In a Template
 * ```html
 * <img [src]="getObjectImageUrl(object)" [alt]="object.title">
 * ```
 */
export function getObjectImageUrl(obj: BlakeObject | string): string {
  if (typeof obj === 'string') {
    return `${IMAGE_BASE_PATH}/${obj}.jpg`;
  }
  const id = obj.full_object_id || obj.desc_id;
  return `${IMAGE_BASE_PATH}/${id}.jpg`;
}

/**
 * Generates the thumbnail image URL for a Blake object.
 *
 * Thumbnails are smaller versions of images used in listings, search results,
 * and preview contexts. They are stored in a separate thumbnails subdirectory
 * with a .thumb.jpg extension.
 *
 * @param obj Blake object instance or descriptor ID string
 * @returns URL path to the object's thumbnail image
 *
 * @example With BlakeObject
 * ```typescript
 * const object: BlakeObject = {
 *   desc_id: 'but11.1.wc.01',
 *   full_object_id: 'but11.1.wc.01',
 *   // ... other properties
 * };
 * const thumbUrl = getObjectThumbnailUrl(object);
 * // Returns: "/static/img/thumbnails/but11.1.wc.01.thumb.jpg"
 * ```
 *
 * @example With String ID
 * ```typescript
 * const thumbUrl = getObjectThumbnailUrl('but11.1.wc.01');
 * // Returns: "/static/img/thumbnails/but11.1.wc.01.thumb.jpg"
 * ```
 *
 * @example In a Gallery Component
 * ```typescript
 * export class GalleryComponent {
 *   objects: BlakeObject[];
 *
 *   getThumbnail(object: BlakeObject): string {
 *     return getObjectThumbnailUrl(object);
 *   }
 * }
 * ```
 *
 * @example In a Search Results Template
 * ```html
 * <div *ngFor="let result of searchResults">
 *   <img [src]="getObjectThumbnailUrl(result.desc_id)"
 *        [alt]="result.title"
 *        class="thumbnail">
 * </div>
 * ```
 */
export function getObjectThumbnailUrl(obj: BlakeObject | string): string {
  if (typeof obj === 'string') {
    return `${IMAGE_BASE_PATH}/thumbnails/${obj}.thumb.jpg`;
  }
  const id = obj.full_object_id || obj.desc_id;
  return `${IMAGE_BASE_PATH}/thumbnails/${id}.thumb.jpg`;
}

/**
 * Generates the URL for static HTML content pages.
 *
 * The Blake Archive includes static HTML pages for essays, documentation,
 * and other content. This utility constructs the proper URL for these pages.
 *
 * @param pageName Name of the HTML file without the .html extension
 * @returns Full URL path to the static HTML file
 *
 * @example
 * ```typescript
 * const aboutUrl = getStaticHtmlUrl('about');
 * // Returns: "/static/html/about.html"
 *
 * const helpUrl = getStaticHtmlUrl('help/getting-started');
 * // Returns: "/static/html/help/getting-started.html"
 * ```
 *
 * @example In a Navigation Component
 * ```typescript
 * export class NavigationComponent {
 *   pages = [
 *     { title: 'About', url: getStaticHtmlUrl('about') },
 *     { title: 'Help', url: getStaticHtmlUrl('help') },
 *     { title: 'Copyright', url: getStaticHtmlUrl('copyright') }
 *   ];
 * }
 * ```
 */
export function getStaticHtmlUrl(pageName: string): string {
  return `/static/html/${pageName}.html`;
}

/**
 * Validates whether an image URL points to an accessible resource.
 *
 * This function performs a HEAD request to check if the image exists and is
 * accessible without downloading the entire image file. Useful for checking
 * image availability before displaying or for handling missing images gracefully.
 *
 * @param url The image URL to validate
 * @returns Promise that resolves to true if image is accessible, false otherwise
 *
 * @example Basic Validation
 * ```typescript
 * const url = getObjectImageUrl('but11.1.wc.01');
 * const isValid = await isImageValid(url);
 *
 * if (isValid) {
 *   console.log('Image is available');
 * } else {
 *   console.log('Image not found');
 * }
 * ```
 *
 * @example With Fallback Image
 * ```typescript
 * export class ImageComponent {
 *   async loadImage(object: BlakeObject) {
 *     const url = getObjectImageUrl(object);
 *     const isValid = await isImageValid(url);
 *
 *     this.imageUrl = isValid ? url : '/assets/placeholder.jpg';
 *   }
 * }
 * ```
 *
 * @example Checking Multiple Images
 * ```typescript
 * async validateGallery(objects: BlakeObject[]) {
 *   const validationPromises = objects.map(obj => {
 *     const url = getObjectImageUrl(obj);
 *     return isImageValid(url);
 *   });
 *
 *   const results = await Promise.all(validationPromises);
 *   const validObjects = objects.filter((_, i) => results[i]);
 *
 *   return validObjects;
 * }
 * ```
 */
export async function isImageValid(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}
