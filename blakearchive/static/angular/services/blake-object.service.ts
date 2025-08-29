import { Injectable } from '@angular/core';
import { GenericService, GenericFactory } from './generic.service';

export interface ObjectLine {
  indent: number;
  text: string;
  lineNum: string;
  justify: string;
  type: string;
  colnum: number;
}

export interface AlternativeSpelling {
  reg: string;
  orig: string;
}

export interface BlakeObjectConfig {
  desc_id: string;
  illustration_description?: string | any;
  text?: string | any;
  notes?: string | any;
  header?: string | any;
  source?: string | any;
  supplemental?: string;
  [key: string]: any;
}

export interface BlakeObject extends BlakeObjectConfig {
  illustration_description: any;
  text: any;
  notes: any;
  header: any;
  source: any;
  alt_spellings: AlternativeSpelling[];
}

@Injectable({
  providedIn: 'root'
})
export class BlakeObjectService {
  private genericService: GenericFactory<BlakeObject>;

  constructor(genericService: GenericService) {
    this.genericService = genericService.createFactory<BlakeObject>(this.createObject.bind(this));
  }

  /**
   * Create a BlakeObject instance from configuration
   */
  create(config: BlakeObjectConfig | BlakeObjectConfig[]): BlakeObject | BlakeObject[] {
    return this.genericService.create(config);
  }

  /**
   * Factory method for BlakeObject
   * Takes a config object and creates a BlakeObject with proper transformations
   */
  private createObject(config: BlakeObjectConfig): BlakeObject {
    if (!config) {
      throw new Error('BlakeObject config is required');
    }

    // Create a deep copy of the config
    const obj: BlakeObject = {
      ...JSON.parse(JSON.stringify(config)),
      illustration_description: this.parseJsonField(config.illustration_description),
      text: this.parseJsonField(config.text),
      notes: this.parseJsonField(config.notes),
      header: this.parseJsonField(config.header),
      source: this.parseJsonField(config.source),
      alt_spellings: []
    };

    // Extract alternative spellings from text
    this.extractAlternativeSpellings(obj.text, obj.alt_spellings);

    return obj;
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
   * Parse object lines from structured text data
   */
  parseObjectLines(object: any, array: ObjectLine[], type: string, colnum: number): void {
    if (Array.isArray(object)) {
      object.forEach((objectSet: any) => {
        if (Array.isArray(objectSet.l)) {
          objectSet.l.forEach((v: any) => {
            const indent = v['@indent'] !== undefined ? v['@indent'] : 0;
            array.push({
              indent: indent,
              text: v['#text'],
              lineNum: v['@n'],
              justify: v['@justify'],
              type: type,
              colnum: colnum
            });
          });
        } else {
          const indent = objectSet.l['@indent'] !== undefined ? objectSet.l['@indent'] : 0;

          if (objectSet.l.physnumber !== undefined) {
            array.push({
              indent: indent,
              text: objectSet.l.physnumber['#text'],
              lineNum: objectSet.l['@n'],
              justify: objectSet.l['@justify'],
              type: type,
              colnum: colnum
            });
          } else if (objectSet.l.catchword !== undefined) {
            array.push({
              indent: indent,
              text: objectSet.l.catchword['#text'],
              lineNum: objectSet.l['@n'],
              justify: objectSet.l['@justify'],
              type: type,
              colnum: colnum
            });
          } else {
            array.push({
              indent: indent,
              text: objectSet.l['#text'],
              lineNum: objectSet.l['@n'],
              justify: objectSet.l['@justify'],
              type: type,
              colnum: colnum
            });
          }
        }
      });
    } else if (Array.isArray(object.l)) {
      object.l.forEach((v: any) => {
        const indent = v['@indent'] !== undefined ? v['@indent'] : 0;
        array.push({
          indent: indent,
          text: v['#text'],
          lineNum: v['@n'],
          justify: v['@justify'],
          type: type,
          colnum: colnum
        });
      });
    } else {
      const indent = object.l['@indent'] !== undefined ? object.l['@indent'] : 0;

      if (object.l.physnumber !== undefined) {
        array.push({
          indent: indent,
          text: object.l.physnumber['#text'],
          lineNum: object.l['@n'],
          justify: object.l['@justify'],
          type: type,
          colnum: colnum
        });
      } else if (object.l.catchword !== undefined) {
        array.push({
          indent: indent,
          text: object.l.catchword['#text'],
          lineNum: object.l['@n'],
          justify: object.l['@justify'],
          type: type,
          colnum: colnum
        });
      } else {
        array.push({
          indent: indent,
          text: object.l['#text'],
          lineNum: object.l['@n'],
          justify: object.l['@justify'],
          type: type,
          colnum: colnum
        });
      }
    }
  }

  /**
   * Recursively extract alternative spellings from text object
   */
  private extractAlternativeSpellings(objtext: any, altspelling: AlternativeSpelling[]): void {
    if (!objtext || typeof objtext !== 'object') {
      return;
    }

    for (const k in objtext) {
      if (typeof objtext[k] === 'object' && objtext[k] !== null) {
        if (k === 'choice') {
          this.processChoiceSpellings(objtext[k], altspelling);
        } else {
          this.extractAlternativeSpellings(objtext[k], altspelling);
        }
      }
    }
  }

  /**
   * Process choice spellings (original vs regularized/corrected)
   */
  private processChoiceSpellings(choice: any, altspelling: AlternativeSpelling[]): void {
    if (Array.isArray(choice)) {
      choice.forEach((spellings: any) => {
        this.processSpellingSet(spellings, altspelling);
      });
    } else {
      this.processSpellingSet(choice, altspelling);
    }
  }

  /**
   * Process a single spelling set
   */
  private processSpellingSet(spellings: any, altspelling: AlternativeSpelling[]): void {
    if (spellings['orig'] !== undefined && spellings['orig']['#text'] !== undefined) {
      const orig = spellings['orig']['#text'];
      let reg = '';

      // Check the reg attribute
      if (spellings['reg'] !== undefined) {
        reg = spellings['reg'];
      }

      // Check the corr attribute  
      if (spellings['corr'] !== undefined) {
        reg = spellings['corr'];
      }

      if (Array.isArray(reg)) {
        reg.forEach((v: any) => {
          const alt: AlternativeSpelling = {
            reg: v['#text'].toLowerCase(),
            orig: orig.toLowerCase()
          };
          altspelling.push(alt);
        });
      } else if (reg && reg['#text']) {
        const alt: AlternativeSpelling = {
          reg: reg['#text'].toLowerCase(),
          orig: orig.toLowerCase()
        };
        altspelling.push(alt);
      }
    }
  }

  /**
   * Get alternative spellings for a Blake object
   */
  getAlternativeSpellings(obj: BlakeObject): AlternativeSpelling[] {
    return obj.alt_spellings || [];
  }

  /**
   * Check if object has text content
   */
  hasText(obj: BlakeObject): boolean {
    return !!(obj.text && Object.keys(obj.text).length > 0);
  }

  /**
   * Check if object has illustration description
   */
  hasIllustrationDescription(obj: BlakeObject): boolean {
    return !!(obj.illustration_description && Object.keys(obj.illustration_description).length > 0);
  }

  /**
   * Check if object has notes
   */
  hasNotes(obj: BlakeObject): boolean {
    return !!(obj.notes && Object.keys(obj.notes).length > 0);
  }

  /**
   * Check if object has header information
   */
  hasHeader(obj: BlakeObject): boolean {
    return !!(obj.header && Object.keys(obj.header).length > 0);
  }

  /**
   * Check if object has source information
   */
  hasSource(obj: BlakeObject): boolean {
    return !!(obj.source && Object.keys(obj.source).length > 0);
  }

  /**
   * Check if object is supplemental
   */
  isSupplemental(obj: BlakeObject): boolean {
    return !!(obj.supplemental);
  }

  /**
   * Get header field value safely
   */
  getHeaderField(obj: BlakeObject, fieldName: string): any {
    if (this.hasHeader(obj)) {
      return obj.header[fieldName];
    }
    return null;
  }

  /**
   * Get source field value safely
   */
  getSourceField(obj: BlakeObject, fieldName: string): any {
    if (this.hasSource(obj)) {
      return obj.source[fieldName];
    }
    return null;
  }
}