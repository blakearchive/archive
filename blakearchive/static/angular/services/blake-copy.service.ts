import { Injectable } from '@angular/core';
import { GenericService, GenericFactory } from './generic.service';

export interface BlakeCopyConfig {
  archive_copy_id: string;
  bad_id?: string;
  title: string;
  header?: string | any;
  source?: string | any;
  virtual?: boolean;
  [key: string]: any;
}

export interface BlakeCopy extends BlakeCopyConfig {
  header: any;
  source: any;
  virtual: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BlakeCopyService {
  private genericService: GenericFactory<BlakeCopy>;
  private readonly virtualCopyIds = [
    'biblicalwc',
    '1780swc',
    '1780smonowash',
    'biblicaltemperas',
    'letters',
    'shakespearewc',
    'gravepd',
    'pid',
    'gravewc',
    'gravewd',
    'cpd',
    'pencil1',
    'allegropenseroso',
    'miltons'
  ];

  constructor(genericService: GenericService) {
    this.genericService = genericService.createFactory<BlakeCopy>(this.createCopy.bind(this));
  }

  /**
   * Create a BlakeCopy instance from configuration
   */
  create(config: BlakeCopyConfig | BlakeCopyConfig[]): BlakeCopy | BlakeCopy[] {
    return this.genericService.create(config);
  }

  /**
   * Factory method for BlakeCopy  
   * Takes a config object and creates a BlakeCopy with proper transformations
   */
  private createCopy(config: BlakeCopyConfig): BlakeCopy {
    // Create a deep copy of the config
    const copy: BlakeCopy = {
      ...JSON.parse(JSON.stringify(config)),
      header: this.parseJsonField(config.header),
      source: this.parseJsonField(config.source),
      virtual: false
    };

    // Handle UTF-8 encoding issue for Laocoön
    if (copy.title === 'LaocoÃ¶n') {
      copy.title = 'Laocoön';
    }

    // Set virtual property based on archive_copy_id
    copy.virtual = this.isVirtualCopy(copy.archive_copy_id);

    return copy;
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
   * Check if a copy is virtual based on its archive_copy_id
   */
  isVirtualCopy(archiveCopyId: string): boolean {
    return this.virtualCopyIds.includes(archiveCopyId);
  }

  /**
   * Get all virtual copy IDs
   */
  getVirtualCopyIds(): string[] {
    return [...this.virtualCopyIds];
  }

  /**
   * Parse header information from JSON string or object
   */
  parseHeader(headerData: string | any): any {
    return this.parseJsonField(headerData);
  }

  /**
   * Parse source information from JSON string or object
   */
  parseSource(sourceData: string | any): any {
    return this.parseJsonField(sourceData);
  }

  /**
   * Get copy display title with proper encoding
   */
  getDisplayTitle(copy: BlakeCopy): string {
    if (copy.title === 'LaocoÃ¶n') {
      return 'Laocoön';
    }
    return copy.title;
  }

  /**
   * Check if copy has header information
   */
  hasHeader(copy: BlakeCopy): boolean {
    return !!(copy.header && Object.keys(copy.header).length > 0);
  }

  /**
   * Check if copy has source information
   */
  hasSource(copy: BlakeCopy): boolean {
    return !!(copy.source && Object.keys(copy.source).length > 0);
  }

  /**
   * Get header field value safely
   */
  getHeaderField(copy: BlakeCopy, fieldName: string): any {
    if (this.hasHeader(copy)) {
      return copy.header[fieldName];
    }
    return null;
  }

  /**
   * Get source field value safely
   */
  getSourceField(copy: BlakeCopy, fieldName: string): any {
    if (this.hasSource(copy)) {
      return copy.source[fieldName];
    }
    return null;
  }
}