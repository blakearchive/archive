import { Injectable, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface BlakeSource {
  [key: string]: any;
}

export interface BlakeHeader {
  userestrict?: {
    '#text': string;
  };
  filedesc?: {
    titlestmt: {
      title: {
        '@reg': string;
      };
    };
  };
}

export interface BlakeCopyForViewer {
  virtual?: boolean;
  archive_copy_id?: string;
  header?: BlakeHeader;
  source?: BlakeSource;
}

export interface BlakeObjectForViewer {
  desc_id: string;
  supplemental?: string;
  object_group?: string;
  source?: BlakeSource;
  header?: BlakeHeader;
}

export interface BlakeWorkForViewer {
  bad_id: string;
}

export interface BlakeDataForViewer {
  copy?: BlakeCopyForViewer;
  object?: BlakeObjectForViewer;
  work?: BlakeWorkForViewer;
  copyObjects?: BlakeObjectForViewer[];
}

export interface ModalOptions {
  template: string;
  controller?: string;
  size?: string;
}

export interface UseRestrictionModal {
  title: string;
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class ObjectViewerService {
  private supplementalSubject = new BehaviorSubject<boolean>(false);
  
  // Observable for supplemental state
  supplemental$ = this.supplementalSubject.asObservable();

  private bds?: BlakeDataForViewer;
  private modalService?: any;
  private rootScope?: any;

  constructor() {}

  /**
   * Initialize with dependencies for AngularJS hybrid mode
   */
  init(blakeDataService: BlakeDataForViewer, modalService?: any, rootScope?: any): void {
    this.bds = blakeDataService;
    this.modalService = modalService;
    this.rootScope = rootScope;
  }

  /**
   * Get source object - returns copy source or object source based on virtual status
   */
  getSource(): BlakeSource | undefined {
    if (!this.bds?.copy) {
      return undefined;
    }

    if (this.bds.copy.virtual) {
      return this.bds.object?.source;
    } else {
      return this.bds.copy.source;
    }
  }

  /**
   * Open use restriction modal
   */
  useRestrictOpen(copy: BlakeCopyForViewer, object: BlakeObjectForViewer): void {
    let header: string | null = null;

    try {
      if (copy.header?.userestrict) {
        header = copy.header.userestrict['#text'];
      } else if (object.header?.userestrict) {
        header = object.header.userestrict['#text'];
      }

      if (!header) {
        console.warn('No use restriction information found');
        return;
      }

      const modalData: UseRestrictionModal = {
        title: 'Use Restriction',
        content: header
      };

      // For Angular applications, emit event or use modal service
      this.showUseRestrictionModal(modalData);

      // For AngularJS hybrid mode
      if (this.modalService) {
        const template = `
          <div class="modal-header">
            <button type="button" class="close" ng-click="close()" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            <h4 class="modal-title">Use Restriction</h4>
          </div>
          <div class="modal-body">
            <div>${header}</div>
          </div>
        `;

        this.modalService.open({
          template: template,
          controller: 'ModalController',
          size: 'lg'
        });
      }
    } catch (error) {
      console.error('Error opening use restriction modal:', error);
    }
  }

  /**
   * Show use restriction modal (for Angular components to handle)
   */
  private showUseRestrictionModal(modalData: UseRestrictionModal): void {
    // In a real Angular app, this would emit an event or use a modal service
    // For now, we'll just log the data
    console.log('Use Restriction Modal:', modalData);
    
    // Could emit through a subject for Angular components to listen to
    // this.modalSubject.next({ type: 'useRestriction', data: modalData });
  }

  /**
   * Get OVP (Object Viewer Panel) title
   */
  getOvpTitle(): string {
    if (!this.bds?.copy) {
      return '';
    }

    try {
      const copyPhrase = this.bds.copy.archive_copy_id == null 
        ? '' 
        : `, Copy ${this.bds.copy.archive_copy_id}`;

      let title = '';
      if (this.bds.copy.header?.filedesc?.titlestmt?.title) {
        title = this.bds.copy.header.filedesc.titlestmt.title['@reg'];
      }

      return title + copyPhrase;
    } catch (error) {
      console.error('Error getting OVP title:', error);
      return '';
    }
  }

  /**
   * Get previous object in sequence
   */
  getPreviousObject(): BlakeObjectForViewer | false {
    if (!this.bds) {
      return false;
    }

    try {
      const list = this.getObjectList();
      const objDescId = this.getCurrentObjectDescId();

      if (!list || !objDescId) {
        return false;
      }

      for (let i = list.length - 1; i >= 0; i--) {
        if (list[i].desc_id === objDescId) {
          return i > 0 ? list[i - 1] : false;
        }
      }

      return false;
    } catch (error) {
      console.error('Error getting previous object:', error);
      return false;
    }
  }

  /**
   * Get next object in sequence
   */
  getNextObject(): BlakeObjectForViewer | false {
    if (!this.bds) {
      return false;
    }

    try {
      const list = this.getObjectList();
      const objDescId = this.getCurrentObjectDescId();

      if (!list || !objDescId) {
        return false;
      }

      for (let i = 0; i < list.length; i++) {
        if (list[i].desc_id === objDescId) {
          return i < list.length - 1 ? list[i + 1] : false;
        }
      }

      return false;
    } catch (error) {
      console.error('Error getting next object:', error);
      return false;
    }
  }

  /**
   * Get the appropriate object list based on work type
   */
  private getObjectList(): BlakeObjectForViewer[] {
    if (!this.bds?.copyObjects || !this.bds.work) {
      return [];
    }

    // Special handling for letters and shakespeare works
    if (this.bds.work.bad_id === 'letters' || this.bds.work.bad_id === 'shakespearewc') {
      const currentObjectGroup = this.bds.object?.object_group;
      if (!currentObjectGroup) {
        return this.bds.copyObjects;
      }

      return this.bds.copyObjects.filter(obj => obj.object_group === currentObjectGroup);
    }

    return this.bds.copyObjects;
  }

  /**
   * Get current object description ID
   */
  private getCurrentObjectDescId(): string | undefined {
    if (!this.bds?.object) {
      return undefined;
    }

    return this.bds.object.supplemental || this.bds.object.desc_id;
  }

  /**
   * Toggle supplemental view state
   */
  toggleSupplemental(): void {
    const newValue = !this.supplementalSubject.value;
    this.supplementalSubject.next(newValue);

    // Update rootScope for AngularJS compatibility
    if (this.rootScope) {
      this.rootScope.supplemental = newValue;
    }
  }

  /**
   * Get current supplemental state
   */
  getSupplementalState(): boolean {
    return this.supplementalSubject.value;
  }

  /**
   * Set supplemental state
   */
  setSupplementalState(supplemental: boolean): void {
    this.supplementalSubject.next(supplemental);
    
    if (this.rootScope) {
      this.rootScope.supplemental = supplemental;
    }
  }

  /**
   * Change current object (delegates to BlakeDataService)
   */
  changeObject(object: BlakeObjectForViewer): void {
    if (this.bds && typeof (this.bds as any).changeObject === 'function') {
      (this.bds as any).changeObject(object);
    } else {
      console.warn('changeObject method not available on BlakeDataService');
    }
  }

  /**
   * Check if there is a previous object
   */
  hasPreviousObject(): boolean {
    return this.getPreviousObject() !== false;
  }

  /**
   * Check if there is a next object
   */
  hasNextObject(): boolean {
    return this.getNextObject() !== false;
  }

  /**
   * Get current object index in the list
   */
  getCurrentObjectIndex(): number {
    const list = this.getObjectList();
    const objDescId = this.getCurrentObjectDescId();

    if (!list || !objDescId) {
      return -1;
    }

    return list.findIndex(obj => obj.desc_id === objDescId);
  }

  /**
   * Get total number of objects in current context
   */
  getTotalObjectCount(): number {
    return this.getObjectList().length;
  }

  /**
   * Navigate to object by index
   */
  navigateToObjectIndex(index: number): void {
    const list = this.getObjectList();
    if (index >= 0 && index < list.length) {
      this.changeObject(list[index]);
    }
  }
}