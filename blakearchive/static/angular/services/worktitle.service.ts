import { Injectable, Inject } from '@angular/core';

// Interfaces for Blake data structures
export interface BlakeWork {
  title: string;
  bad_id: string;
  virtual: boolean;
  probable: string;
  composition_date_string: string;
  medium: string;
}

export interface BlakeCopy {
  header?: {
    filedesc: {
      titlestmt: {
        title: {
          '@reg': string;
        };
      };
    };
  };
  archive_copy_id: string | null;
  print_date_string: string;
  bad_id: string;
}

export interface BlakeObject {
  object_group?: string;
  title: string;
  object_number: string;
  full_object_id: string;
  physical_description: {
    objsize: {
      '#text': string;
    };
  };
  source: {
    objdescid: {
      compdate: {
        '#text': string;
      };
    };
    repository: {
      institution: {
        '#text': string;
      };
    };
  };
}

export interface BlakeDataService {
  work: BlakeWork;
  copy: BlakeCopy;
  object: BlakeObject;
}

export interface RootScope {
  showWorkTitle: string;
  doneSettingCopy: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class WorkTitleService {
  private bds?: BlakeDataService;
  private rootScope?: RootScope;

  constructor() {
    // Dependencies will be provided later for AngularJS compatibility
  }

  /**
   * Initialize with AngularJS dependencies (for hybrid mode)
   */
  init(bds: BlakeDataService, rootScope: RootScope) {
    this.bds = bds;
    this.rootScope = rootScope;
  }

  /**
   * Get the complete formatted title including work title, copy phrase, and date
   */
  getFullTitle(): string {
    if (!this.bds || !this.rootScope) {
      console.warn('WorkTitleService not initialized with dependencies');
      return '';
    }
    return `${this.getWorkTitle()} ${this.getCopyPhrase()} ${this.getCompOrPrintDateString()}`.trim();
  }

  /**
   * Get the work title based on current context and work type
   */
  getWorkTitle(): string {
    if (!this.bds || !this.rootScope) {
      return '';
    }
    
    let title = '';

    // Work page context
    if (this.rootScope.showWorkTitle === 'work') {
      return this.bds.work.title;
    }

    // Letters handling
    if (this.bds.work.bad_id === 'letters') {
      if (this.bds.object.object_group) {
        const match = this.bds.object.object_group.match(/(to.*)/);
        if (match && match[1]) {
          return match[1].charAt(0).toUpperCase() + match[1].slice(1);
        }
      }
    }

    // Virtual groups
    if (this.bds.work.virtual) {
      return this.bds.work.title;
    }

    // Standard works with copy header
    if (this.bds.copy.header && this.rootScope.doneSettingCopy) {
      title = this.bds.copy.header.filedesc.titlestmt.title['@reg'];
    }

    // Handle "Title, The" format
    const theMatch = title.match(/(.*), The/);
    if (theMatch) {
      title = "The " + theMatch[1];
    }

    return title.trim();
  }

  /**
   * Get the composition or print date string with appropriate label
   */
  getCompOrPrintDateString(): string {
    if (this.bds.work.probable === "printing") {
      return `(Printed ${this.bds.copy.print_date_string})`;
    } else {
      return `(Composed ${this.bds.work.composition_date_string})`;
    }
  }

  /**
   * Get the copy phrase (e.g., "Copy A")
   */
  getCopyPhrase(): string {
    if (this.bds.work.virtual) {
      return '';
    } else {
      return this.bds.copy.archive_copy_id == null ? '' : `Copy ${this.bds.copy.archive_copy_id}`;
    }
  }

  /**
   * Get caption text for gallery view
   */
  getCaptionFromGallery(): string {
    let caption = "";

    if (this.bds.work.virtual) {
      caption += `${this.bds.object.title}, Object ${this.bds.object.object_number}`;
      
      if (this.bds.copy.bad_id !== 'letters') {
        const compDate = this.bds.object.source.objdescid.compdate['#text'];
        const institution = this.bds.object.source.repository.institution['#text'];
        caption += `, ${compDate}, ${institution}`;
      }
    } else {
      if (!this.bds.object.title) {
        caption += this.bds.object.full_object_id;
      } else {
        if (this.bds.work.medium !== 'exhibit') {
          caption += `${this.bds.object.title}, ${this.bds.object.full_object_id}`;
        } else {
          caption += this.bds.object.title;
        }
      }

      if (this.bds.work.medium !== 'exhibit') {
        caption += `, ${this.bds.object.physical_description.objsize['#text']}`;
      }
    }

    return caption;
  }

  /**
   * Get caption text for reading view with specific object
   */
  getCaptionFromReading(obj: BlakeObject): string {
    let caption = "";

    if (this.bds.work.virtual) {
      caption += `${obj.title}, Object ${this.bds.object.object_number}`;
      
      if (this.bds.copy.bad_id !== 'letters') {
        const compDate = obj.source.objdescid.compdate['#text'];
        const institution = obj.source.repository.institution['#text'];
        caption += `, ${compDate}, ${institution}`;
      }
    } else {
      if (!obj.title) {
        caption += obj.full_object_id;
      } else {
        if (this.bds.work.medium !== 'exhibit') {
          caption += `${obj.title}, ${obj.full_object_id}`;
        } else {
          caption += obj.title;
        }
      }

      if (this.bds.work.medium !== 'exhibit') {
        caption += `, ${obj.physical_description.objsize['#text']}`;
      }
    }

    return caption;
  }
}