/**
 * Core Blake Archive data models
 * Shared across services and components
 */

export interface BlakeObject {
  desc_id: string;
  title: string;
  copy_bad_id: string;
  object_number: number;
  full_object_id: string;
  illustration_description?: string;
  text_transcription?: string;
  text?: string;
  object_group?: string;
  bentley_id?: string;
  dbi_id?: string;
  [key: string]: any;
}

export interface BlakeCopy {
  bad_id: string;
  title: string;
  copy_title?: string;
  copy_id?: string;
  copy_information?: string;
  work_id: string;
  institution?: string;
  composition_date?: string;
  print_date?: string;
  medium?: string;
  [key: string]: any;
}

export interface BlakeWork {
  bad_id: string;
  title: string;
  info?: string;
  composition_date?: string;
  composition_date_string?: string;
  medium?: string;
  virtual?: boolean;
  [key: string]: any;
}

export interface BlakeExhibit {
  id: string;
  title: string;
  description?: string;
  images?: BlakeExhibitImage[];
  [key: string]: any;
}

export interface BlakeExhibitImage {
  id: string;
  url: string;
  caption?: string;
  [key: string]: any;
}

export interface BlakePreview {
  id: string;
  title: string;
  description?: string;
  images?: BlakePreviewImage[];
  [key: string]: any;
}

export interface BlakePreviewImage {
  id: string;
  url: string;
  caption?: string;
  [key: string]: any;
}

export interface FeaturedWork {
  bad_id: string;
  title: string;
  column?: number;
  [key: string]: any;
}

/**
 * Medium type mapping
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
 * Get human-readable label for medium type
 */
export function getMediumLabel(medium?: string): string {
  if (!medium) return '';
  return MEDIUM_LABELS[medium] || medium;
}
