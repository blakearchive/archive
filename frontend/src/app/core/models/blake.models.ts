/**
 * Core Blake Archive Data Models
 *
 * This module provides TypeScript interfaces for all Blake Archive data entities.
 * These models ensure type safety across services and components.
 *
 * @module blake.models
 *
 * @example Importing Models
 * ```typescript
 * import { BlakeObject, BlakeWork, BlakeCopy, getMediumLabel } from '@core/models/blake.models';
 * ```
 */

/**
 * Represents a single Blake Archive object (e.g., a page, plate, or illustration).
 *
 * Objects are the fundamental unit in the Blake Archive. Each object belongs to
 * a copy and is identified by a unique descriptor ID.
 *
 * @interface BlakeObject
 *
 * @example
 * ```typescript
 * const object: BlakeObject = {
 *   desc_id: 'but11.1.wc.01',
 *   title: 'Plate 1',
 *   copy_bad_id: 'but11.1',
 *   object_number: 1,
 *   full_object_id: 'but11.1.wc.01',
 *   illustration_description: 'The Ancient of Days',
 *   medium: 'wc'
 * };
 * ```
 */
export interface BlakeObject {
  /** Unique descriptor ID for this object */
  desc_id: string;

  /** Title of the object */
  title: string;

  /** BAD (Blake Archive Database) ID of the parent copy */
  copy_bad_id: string;

  /** Sequential number of this object within the copy */
  object_number: number;

  /** Full object identifier combining copy and object information */
  full_object_id: string;

  /** Description of illustrations on this object */
  illustration_description?: string;

  /** Transcribed text content of the object */
  text_transcription?: string;

  /** Additional text content */
  text?: string;

  /** Grouping identifier for related objects */
  object_group?: string;

  /** Bentley library identifier */
  bentley_id?: string;

  /** DBI (Database) identifier */
  dbi_id?: string;

  /** Additional dynamic properties from the API */
  [key: string]: any;
}

/**
 * Represents a copy of a Blake work.
 *
 * A copy is a specific instance of a work, potentially held by an institution.
 * Each copy contains multiple objects (pages/plates).
 *
 * @interface BlakeCopy
 *
 * @example
 * ```typescript
 * const copy: BlakeCopy = {
 *   bad_id: 'but11.1',
 *   title: 'Europe a Prophecy, Copy A',
 *   copy_title: 'Copy A',
 *   work_id: 'but11',
 *   institution: 'British Museum',
 *   print_date: '1794',
 *   medium: 'illbk'
 * };
 * ```
 */
export interface BlakeCopy {
  /** BAD (Blake Archive Database) ID for this copy */
  bad_id: string;

  /** Full title of the copy */
  title: string;

  /** Copy-specific title (e.g., "Copy A", "Copy B") */
  copy_title?: string;

  /** Copy identifier */
  copy_id?: string;

  /** Additional information about this copy */
  copy_information?: string;

  /** BAD ID of the parent work */
  work_id: string;

  /** Institution holding this copy */
  institution?: string;

  /** Date work was composed */
  composition_date?: string;

  /** Date this copy was printed */
  print_date?: string;

  /** Medium type code (e.g., 'illbk', 'draw', 'paint') */
  medium?: string;

  /** Additional dynamic properties from the API */
  [key: string]: any;
}

/**
 * Represents a Blake work at the highest level.
 *
 * A work is a complete artistic creation (e.g., "Songs of Innocence and of Experience").
 * Works may have multiple copies, each potentially unique.
 *
 * @interface BlakeWork
 *
 * @example
 * ```typescript
 * const work: BlakeWork = {
 *   bad_id: 'but11',
 *   title: 'Europe a Prophecy',
 *   composition_date: '1794',
 *   composition_date_string: 'c. 1794',
 *   medium: 'illbk',
 *   virtual: false
 * };
 * ```
 */
export interface BlakeWork {
  /** BAD (Blake Archive Database) ID for this work */
  bad_id: string;

  /** Title of the work */
  title: string;

  /** Additional information about the work */
  info?: string;

  /** ISO date string of composition */
  composition_date?: string;

  /** Human-readable composition date string */
  composition_date_string?: string;

  /** Medium type code (e.g., 'illbk', 'draw', 'paint') */
  medium?: string;

  /** Whether this is a virtual/composite work */
  virtual?: boolean;

  /** Additional dynamic properties from the API */
  [key: string]: any;
}

/**
 * Represents a virtual exhibit in the Blake Archive.
 *
 * Exhibits are curated collections of Blake objects organized around
 * specific themes or topics.
 *
 * @interface BlakeExhibit
 */
export interface BlakeExhibit {
  /** Unique identifier for the exhibit */
  id: string;

  /** Title of the exhibit */
  title: string;

  /** Description of the exhibit theme and contents */
  description?: string;

  /** Array of images featured in this exhibit */
  images?: BlakeExhibitImage[];

  /** Additional dynamic properties from the API */
  [key: string]: any;
}

/**
 * Represents an image within a Blake exhibit.
 *
 * @interface BlakeExhibitImage
 */
export interface BlakeExhibitImage {
  /** Unique identifier for the image */
  id: string;

  /** URL to the image file */
  url: string;

  /** Optional caption describing the image */
  caption?: string;

  /** Additional dynamic properties from the API */
  [key: string]: any;
}

/**
 * Represents a lightweight preview of Blake content.
 *
 * Used for thumbnails, search results, and listing views where
 * full object details are not needed.
 *
 * @interface BlakePreview
 */
export interface BlakePreview {
  /** Unique identifier */
  id: string;

  /** Title of the content */
  title: string;

  /** Brief description for preview */
  description?: string;

  /** Preview images */
  images?: BlakePreviewImage[];

  /** Additional dynamic properties from the API */
  [key: string]: any;
}

/**
 * Represents a preview image thumbnail.
 *
 * @interface BlakePreviewImage
 */
export interface BlakePreviewImage {
  /** Unique identifier for the image */
  id: string;

  /** URL to the thumbnail image */
  url: string;

  /** Optional caption */
  caption?: string;

  /** Additional dynamic properties from the API */
  [key: string]: any;
}

/**
 * Represents a featured work displayed on the homepage.
 *
 * Featured works are specially selected works highlighted to users
 * with accompanying thumbnails.
 *
 * @interface FeaturedWork
 *
 * @example
 * ```typescript
 * const featured: FeaturedWork = {
 *   bad_id: 'but11',
 *   title: 'Europe a Prophecy',
 *   column: 1
 * };
 * ```
 */
export interface FeaturedWork {
  /** BAD ID of the featured work */
  bad_id: string;

  /** Title of the work */
  title: string;

  /** Display column number for layout (1, 2, or 3) */
  column?: number;

  /** Additional dynamic properties from the API */
  [key: string]: any;
}

/**
 * Mapping of medium type codes to human-readable labels.
 *
 * Blake Archive uses short codes to identify different artistic media.
 * This constant provides the full descriptive names.
 *
 * @constant
 *
 * @example
 * ```typescript
 * console.log(MEDIUM_LABELS['illbk']); // "Illuminated Book"
 * console.log(MEDIUM_LABELS['draw']); // "Drawing"
 * ```
 */
export const MEDIUM_LABELS: Record<string, string> = {
  'illbk': 'Illuminated Book',
  'cbi': 'Commercial Book Illustration',
  'spri': 'Separate Print',
  'mono': 'Monotype',
  'draw': 'Drawing',
  'paint': 'Painting',
  'ms': 'Manuscript',
  'rmpage': 'Related Material'
};

/**
 * Converts a medium type code to its human-readable label.
 *
 * If the code is not recognized, returns the code as-is.
 * If no medium is provided, returns an empty string.
 *
 * @param medium Optional medium type code
 * @returns Human-readable medium label
 *
 * @example Basic Usage
 * ```typescript
 * getMediumLabel('illbk'); // Returns "Illuminated Book"
 * getMediumLabel('draw'); // Returns "Drawing"
 * getMediumLabel('unknown'); // Returns "unknown"
 * getMediumLabel(); // Returns ""
 * ```
 *
 * @example In a Component
 * ```typescript
 * export class WorkComponent {
 *   work: BlakeWork;
 *
 *   get mediumDisplay(): string {
 *     return getMediumLabel(this.work.medium);
 *   }
 * }
 * ```
 *
 * @example In a Template
 * ```html
 * <p>Medium: {{ getMediumLabel(work.medium) }}</p>
 * ```
 */
export function getMediumLabel(medium?: string): string {
  if (!medium) return '';
  return MEDIUM_LABELS[medium] || medium;
}
