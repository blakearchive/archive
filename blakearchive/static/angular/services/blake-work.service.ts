import { Injectable } from '@angular/core';
import { GenericService, GenericFactory } from './generic.service';

export interface RelatedWork {
  title: {
    text: string;
    link?: string;
    type?: string;
  };
  info: string;
  displayTitle: string | false;
  type: string;
  link: string | false;
}

export interface BlakeWorkConfig {
  bad_id: string;
  title: string;
  medium: string;
  composition_date?: string;
  related_works?: RelatedWork[];
  [key: string]: any;
}

export interface BlakeWork extends BlakeWorkConfig {
  medium_pretty: string;
  probable: string;
  menuTitle: string;
  composition_date_string: string;
  virtual: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BlakeWorkService {
  private genericService: GenericFactory<BlakeWork>;

  constructor(genericService: GenericService) {
    this.genericService = genericService.createFactory<BlakeWork>(this.createWork.bind(this));
  }

  /**
   * Create a BlakeWork instance from configuration
   */
  create(config: BlakeWorkConfig | BlakeWorkConfig[]): BlakeWork | BlakeWork[] {
    return this.genericService.create(config);
  }

  /**
   * Factory method for BlakeWork
   * Takes a config object and creates a BlakeWork with proper transformations
   */
  private createWork(config: BlakeWorkConfig): BlakeWork {
    // Create a deep copy of the config
    const work: BlakeWork = {
      ...JSON.parse(JSON.stringify(config)),
      medium_pretty: '',
      probable: '',
      menuTitle: config.title,
      composition_date_string: config.composition_date || '',
      virtual: false
    };

    // Set medium and probable phrase based on medium type
    switch (work.medium) {
      case 'illbk':
        work.medium_pretty = 'Illuminated Books';
        work.probable = 'printing';
        break;
      case 'comb':
      case 'comdes':
      case 'comeng':
        work.medium_pretty = 'Commercial Book Illustrations';
        work.probable = 'printing';
        break;
      case 'spb':
        work.medium_pretty = 'Prints';
        if (['esviii', 'esv', 'esx', 'esvii', 'esxvi', 'esxviii', 'esi'].includes(work.bad_id)) {
          work.probable = 'composition of each state';
        } else {
          work.probable = 'composition';
        }
        break;
      case 'spdes':
      case 'speng':
      case 'cprint':
        work.medium_pretty = 'Prints';
        work.probable = 'composition';
        break;
      case 'mono':
      case 'paint':
      case 'pen':
      case 'penink':
      case 'penc':
      case 'wc':
        work.medium_pretty = 'Drawings and Paintings';
        work.probable = 'composition';
        break;
      case 'ms':
      case 'ltr':
      case 'te':
      case 'ann':
        work.medium_pretty = 'Manuscripts and Typographic Works';
        work.probable = 'composition';
        break;
      case 'exhibit':
        work.medium_pretty = 'Archive Exhibits';
        work.probable = 'composition';
        break;
      case 'preview':
        work.medium_pretty = 'Archive Previews';
        work.probable = 'composition';
        break;
      default:
        // Return false for unknown medium types (matches original behavior)
        throw new Error(`Unknown medium type: ${work.medium}`);
    }

    // Handle UTF-8 encoding issue for Laocoön
    if (work.title === 'LaocoÃ¶n') {
      work.title = 'Laocoön';
      work.menuTitle = 'Laocoön';
    }

    // Set virtual works and title overrides
    this.setVirtualWorkProperties(work);

    // Process related works
    this.processRelatedWorks(work);

    return work;
  }

  /**
   * Set virtual work properties and title overrides
   */
  private setVirtualWorkProperties(work: BlakeWork): void {
    switch (work.bad_id) {
      case 'biblicalwc':
        work.title = 'Water Color Drawings Illustrating the Bible';
        work.virtual = true;
        break;
      case 'biblicaltemperas':
        work.title = 'Paintings Illustrating the Bible';
        work.virtual = true;
        break;
      case 'pid':
        work.title = 'Pen and Ink Drawings';
        work.virtual = true;
        break;
      case 'pencil1':
        work.title = 'Pencil Sketches';
        work.virtual = true;
        break;
      case '1780swc':
        work.title = 'Water Color Drawings';
        work.virtual = true;
        break;
      case 'letters':
      case '1780smonowash':
      case 'shakespearewc':
      case 'gravepd':
      case 'gravewc':
      case 'gravewd':
      case 'cpd':
      case 'allegropenseroso':
      case 'miltons':
        work.virtual = true;
        break;
      default:
        work.virtual = false;
        break;
    }
  }

  /**
   * Process related works to set display properties and links
   */
  private processRelatedWorks(work: BlakeWork): void {
    if (!work.related_works) {
      return;
    }

    work.related_works.forEach((v: RelatedWork) => {
      v.displayTitle = v.title.text !== '' ? v.title.text : false;
      
      if (v.title.link) {
        switch (v.title.type) {
          case 'work':
            v.type = 'work';
            v.link = '/work/' + v.title.link;
            break;
          case 'copy':
            v.type = 'copy';
            v.link = '/copy/' + v.title.link;
            break;
          case 'object':
            v.type = 'object';
            v.link = v.title.link;
            break;
          default:
            v.type = 'none';
            v.link = false;
        }
      } else {
        // Determine type based on text content
        if (v.title.text.substring(0, 4).toLowerCase() === 'copy' || 
            v.info.substring(0, 4).toLowerCase() === 'copy') {
          v.type = 'copy';
        } else {
          v.type = 'none';
        }
        v.link = false;
      }
    });
  }

  /**
   * Get medium display name
   */
  getMediumDisplayName(medium: string): string {
    const work = { medium } as BlakeWorkConfig;
    try {
      const processedWork = this.createWork(work);
      return processedWork.medium_pretty;
    } catch {
      return 'Unknown Medium';
    }
  }

  /**
   * Check if a work is virtual
   */
  isVirtual(badId: string): boolean {
    const virtualWorkIds = [
      'biblicalwc', 'biblicaltemperas', 'pid', 'pencil1', '1780swc',
      'letters', '1780smonowash', 'shakespearewc', 'gravepd', 'gravewc',
      'gravewd', 'cpd', 'allegropenseroso', 'miltons'
    ];
    
    return virtualWorkIds.includes(badId);
  }
}