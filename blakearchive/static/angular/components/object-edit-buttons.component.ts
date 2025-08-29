import { Component, OnInit } from '@angular/core';
import { BlakeDataService } from '../services/blake-data.service';
import { WorkTitleService } from '../services/worktitle.service';
import { LightboxService } from '../services/lightbox.service';
import { CompareObjectsService } from '../services/compare-objects.service';
import { ApplicationStateService } from '../services/application-state.service';
import { ModalService } from '../services/modal.service';
import { ClientPpiModalComponent } from './client-ppi-modal.component';

@Component({
  selector: 'app-object-edit-buttons',
  standalone: true,
  template: `
    <!--Edit buttons-->
    <div id="object-tools" class="hidden-xs">
        <div id="object-tools-inner">
            <div class="btn-group edit-object" role="group">
                <button type="button" class="btn btn-default add-lightbox hidden-sm" (click)="addToLightBox()">
                    <span class="edit-icon"></span> Add To Lightbox
                </button>
                <button 
                    *ngIf="shouldShowRotateButton()" 
                    type="button" 
                    class="btn btn-default rotate" 
                    (click)="rotate()">
                    <span class="edit-icon"></span> Rotate
                </button>
                <button 
                    type="button" 
                    class="btn btn-default zoom hidden-sm" 
                    [class.hover]="isZoomEnabled()" 
                    (click)="zoom()" 
                    title="Mouse over the image">
                    <span class="edit-icon"></span> Magnify
                </button>
                <button 
                    type="button" 
                    class="btn btn-default true-size hidden-xs" 
                    (click)="trueSizeOpen()">
                    <span class="edit-icon"></span> True Size
                </button>
                <button 
                    type="button" 
                    class="btn btn-default new-window" 
                    [appShowMe]="'enlargement'" 
                    [object]="getCurrentObject()" 
                    [copyBad]="getCurrentCopyBadId()">
                    <span class="edit-icon"></span> Enlargement
                </button>
                <button 
                    type="button" 
                    class="btn btn-default show-transcription hidden-sm" 
                    (click)="toggleTranscription()">
                    <span class="edit-icon"></span> Diplomatic Transcription
                </button>
                <button 
                    type="button" 
                    class="btn btn-default show-supplemental" 
                    [class.hover]="isSupplementalEnabled()" 
                    *ngIf="shouldShowSupplementalButton()" 
                    (click)="toggleSupplemental()">
                    <span class="edit-icon"></span> Supplemental Views
                </button>
                <button 
                    type="button" 
                    class="btn btn-default compare-objects" 
                    [class.hover]="isComparisonMode()" 
                    (click)="toggleComparisonMode()">
                    <span class="edit-icon"></span> Compare Objects
                </button>
            </div>
        </div>
    </div>
  `
})
export class ObjectEditButtonsComponent implements OnInit {

  constructor(
    private blakeDataService: BlakeDataService,
    private workTitleService: WorkTitleService,
    private lightboxService: LightboxService,
    private compareObjectsService: CompareObjectsService,
    private appState: ApplicationStateService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    // Component initialization
  }

  trueSizeOpen(): void {
    const clientPpi = this.getCookie('clientPpi');
    const object = this.getCurrentObject();
    
    if (!clientPpi) {
      // Open modal for client PPI
      this.openClientPpiModal();
    } else {
      const copyBadId = this.getCurrentCopyBadId();
      if (object?.desc_id && copyBadId) {
        const url = `/new-window/truesize/${copyBadId}?descId=${object.desc_id}`;
        window.open(url, '_blank', 'width=800,height=600');
      }
    }
  }

  rotate(): void {
    const imageManipulation = (window as any).imageManipulation;
    if (imageManipulation?.rotate) {
      imageManipulation.rotate();
    }
  }

  zoom(): void {
    this.appState.toggleZoom();
  }

  toggleTranscription(): void {
    const viewState = this.appState.getCurrentState().view;
    if (viewState.scope === 'image') {
      this.appState.setViewScope('both');
    } else {
      this.appState.setViewScope('image');
    }
  }

  toggleSupplemental(): void {
    this.appState.toggleSupplemental();
  }

  addToLightBox(): void {
    const object = this.getCurrentObject();
    const copyBadId = this.getCurrentCopyBadId();
    
    if (!object?.dbi) return;

    const item = {
      url: `/images/${object.dbi}.300.jpg`,
      title: this.workTitleService.getFullTitle(),
      caption: this.workTitleService.getCaptionFromGallery()
    };

    this.lightboxService.addToCart(item);
    // Update cart items count
    this.lightboxService.listCartItems().subscribe(cartItems => {
      this.appState.setCartItems(cartItems);
    });
  }

  shouldShowRotateButton(): boolean {
    const object = this.getCurrentObject();
    const copy = this.getCurrentCopy();
    
    if (!object || !copy) return true;

    const excludedDescIds = ['bb128.c.te.01', 'bb128.c.te.02'];
    const excludedCopyIds = ['esxvi.1-1a', 'esxvi.2-2c', 'esxvi.3-3i', 'esxvi.4-4dd'];
    
    return !excludedDescIds.includes(object.desc_id) && 
           !excludedCopyIds.includes(copy.bad_id);
  }

  shouldShowSupplementalButton(): boolean {
    const viewState = this.appState.getCurrentState().view;
    const object = this.getCurrentObject();
    
    return object?.supplemental_objects?.length > 0 && 
           viewState.mode !== 'compare';
  }

  isZoomEnabled(): boolean {
    return this.appState.getCurrentState().zoom;
  }

  isSupplementalEnabled(): boolean {
    return this.appState.getCurrentState().supplemental;
  }

  isComparisonMode(): boolean {
    const viewState = this.appState.getCurrentState().view;
    return viewState.mode === 'compare';
  }

  toggleComparisonMode(): void {
    const viewState = this.appState.getCurrentState().view;
    const currentObject = this.getCurrentObject();
    
    if (viewState.mode === 'compare') {
      // Exit comparison mode
      this.appState.setViewMode('object');
      this.compareObjectsService.resetComparisonObjects();
    } else {
      // Enter comparison mode
      this.appState.setViewMode('compare');
      
      if (currentObject) {
        // Set current object as main comparison object
        this.compareObjectsService.setMainObject({
          object_id: currentObject.desc_id,
          ...currentObject
        });
        
        // Set comparison type to 'manual' by default
        this.compareObjectsService.checkCompareType('manual');
      }
    }
  }

  getCurrentObject(): any {
    return this.blakeDataService.blakeData.object;
  }

  getCurrentCopy(): any {
    return this.blakeDataService.blakeData.copy;
  }

  getCurrentCopyBadId(): string {
    return this.getCurrentCopy()?.bad_id || '';
  }

  openClientPpiModal(): void {
    const modalRef = this.modalService.open(ClientPpiModalComponent, {
      title: 'Set Display Information',
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true
    });

    modalRef.result$.subscribe({
      next: (ppiData) => {
        if (ppiData) {
          console.log('Client PPI saved:', ppiData);
          // The modal component handles saving to cookie/localStorage
          // The trueSizeOpen will be called again via the savedPpi event
        }
      },
      error: (reason) => {
        console.log('Client PPI modal dismissed:', reason);
      }
    });
  }

  private getCookie(name: string): any {
    // Simple cookie getter - can be replaced with a proper cookie service
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift();
      try {
        return JSON.parse(decodeURIComponent(cookieValue || ''));
      } catch {
        return cookieValue;
      }
    }
    return null;
  }
}