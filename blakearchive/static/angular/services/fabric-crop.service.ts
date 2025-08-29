import { Injectable } from '@angular/core';
import { fabric } from 'fabric';

export interface FabricCropOptions {
  fabric?: any;
  boundingBox?: DOMRect | null;
}

export interface FabricCropInstance {
  fabric: any;
  isCropMode: boolean;
  cropObject: fabric.Object | null;
  cropBoxIsDrawn: boolean;
  cropBoxIsDrawing: boolean | Event;
  cropBox: fabric.Rect | null;
  mouseDown: any;
  removeIcon: fabric.Image | null;
  cropIcon: fabric.Image | null;
  acceptIcon: fabric.Image | null;
  cancelIcon: fabric.Image | null;
  boundingBox: DOMRect | { top: number; left: number } | null;
  
  init(): void;
  enterCropMode(): void;
  exitCropMode(): void;
  isAnIcon(obj: fabric.Object): boolean;
  handleMouseDown(evt: any): void;
  handleMouseMove(evt: any): void;
  handleMouseUp(evt: any): void;
}

@Injectable({
  providedIn: 'root'
})
export class FabricCropService {
  private readonly spacing = 28;

  constructor() {}

  /**
   * Create a new FabricCrop instance
   * This factory pattern matches the original AngularJS service structure
   */
  createFabricCrop(options: FabricCropOptions = {}): FabricCropInstance {
    const instance: FabricCropInstance = {
      fabric: options.fabric || {},
      isCropMode: false,
      cropObject: null,
      cropBoxIsDrawn: false,
      cropBoxIsDrawing: false,
      cropBox: null,
      mouseDown: null,
      removeIcon: null,
      cropIcon: null,
      acceptIcon: null,
      cancelIcon: null,
      boundingBox: options.boundingBox || null,

      init: () => this.init(instance),
      enterCropMode: () => this.enterCropMode(instance),
      exitCropMode: () => this.exitCropMode(instance),
      isAnIcon: (obj: fabric.Object) => this.isAnIcon(obj),
      handleMouseDown: (evt: any) => this.handleMouseDown(instance, evt),
      handleMouseMove: (evt: any) => this.handleMouseMove(instance, evt),
      handleMouseUp: (evt: any) => this.handleMouseUp(instance, evt)
    };

    return instance;
  }

  private init(instance: FabricCropInstance): void {
    if (!instance.boundingBox) {
      instance.boundingBox = {
        top: 0,
        left: 0
      };
    }

    // Create the cropbox and add it to the canvas
    instance.cropBox = new fabric.Rect({
      fill: 'transparent',
      stroke: '#29f',
      strokeWidth: 3,
      selectable: true,
      visible: false
    });
    instance.fabric.canvas.add(instance.cropBox);

    // Setup icons to be used as control "buttons"
    this.setupCropIcon(instance);
    this.setupRemoveIcon(instance);
    this.setupAcceptIcon(instance);
    this.setupCancelIcon(instance);

    console.log('fc canvas: ' + instance.fabric.canvas.toString());

    // Setup event handlers
    instance.fabric.canvas.on('mouse:down', instance.handleMouseDown);
    instance.fabric.canvas.on('mouse:move', instance.handleMouseMove);
    instance.fabric.canvas.on('mouse:up', instance.handleMouseUp);
  }

  private setupCropIcon(instance: FabricCropInstance): void {
    fabric.Image.fromURL('/icon/crop-symbol.png', (oImg: fabric.Image) => {
      oImg.visible = true;
      oImg.selectable = false;
      oImg.left = this.spacing * 2;

      // Handle mouse click of the crop icon
      oImg.on('mousedown', () => {
        console.log('u clicked the crop button!');
        if (!instance.isCropMode) {
          instance.enterCropMode();
        } else {
          instance.exitCropMode();
        }
      });

      instance.fabric.canvas.add(oImg);
      instance.cropIcon = oImg;
    });
  }

  private setupRemoveIcon(instance: FabricCropInstance): void {
    fabric.Image.fromURL('/icon/dustbin.png', (oImg: fabric.Image) => {
      oImg.visible = true;
      oImg.selectable = false;
      oImg.left = this.spacing * 3;
      
      oImg.on('mousedown', () => {
        console.log('yay! remove was clicked!');
        // TODO: Implement remove functionality
      });

      instance.fabric.canvas.add(oImg);
      instance.removeIcon = oImg;
    });
  }

  private setupAcceptIcon(instance: FabricCropInstance): void {
    fabric.Image.fromURL('/icon/273-checkmark.png', (oImg: fabric.Image) => {
      oImg.visible = true;
      oImg.width = 22;
      oImg.height = 22;
      oImg.left = 0;
      oImg.selectable = false;
      
      oImg.on('mousedown', () => {
        console.log('yay! accept was clicked!');
        // TODO: Implement accept functionality
      });

      instance.fabric.canvas.add(oImg);
      instance.acceptIcon = oImg;
    });
  }

  private setupCancelIcon(instance: FabricCropInstance): void {
    fabric.Image.fromURL('/icon/272-cross.png', (oImg: fabric.Image) => {
      oImg.visible = true;
      oImg.width = 22;
      oImg.height = 22;
      oImg.selectable = false;
      oImg.left = this.spacing;
      
      oImg.on('mousedown', () => {
        console.log('yay! cancel was clicked!');
        // TODO: Implement cancel functionality
      });

      instance.fabric.canvas.add(oImg);
      instance.cancelIcon = oImg;
    });
  }

  private enterCropMode(instance: FabricCropInstance): void {
    instance.isCropMode = true;
    
    // Get reference to the object we want to crop
    instance.cropObject = instance.fabric.canvas.getActiveObject();
    console.log('crop object on entry: ' + instance.cropObject);
    
    // Make all fabric objects (if it isn't a control icon) non-selectable
    instance.fabric.canvas.forEachObject((o: fabric.Object) => {
      if (o instanceof fabric.Image && !this.isAnIcon(o)) {
        o.selectable = false;
      }
    });

    // Deselect everything
    instance.fabric.canvas.deactivateAllWithDispatch();
  }

  private exitCropMode(instance: FabricCropInstance): void {
    instance.isCropMode = false;
    
    instance.fabric.canvas.forEachObject((o: fabric.Object) => {
      if (o instanceof fabric.Image && !this.isAnIcon(o)) {
        o.selectable = true;
      }
    });
    
    console.log('crop object on exit: ' + instance.cropObject);
    
    if (instance.cropObject) {
      instance.fabric.canvas.setActiveObject(instance.cropObject);
      instance.cropObject = null;
    }
  }

  private isAnIcon(obj: fabric.Object): boolean {
    // Check if the object is an icon by examining its source URL
    // Icons have 'icon' in the URL path
    const objString = obj.toString();
    return /icon/.test(objString);
  }

  private handleMouseDown(instance: FabricCropInstance, evt: any): void {
    instance.mouseDown = evt;
    
    if (instance.isCropMode && !instance.cropBoxIsDrawn) {
      instance.cropBoxIsDrawing = evt.e;

      if (instance.cropBox && instance.boundingBox) {
        instance.cropBox.left = evt.e.pageX - (instance.boundingBox.left || 0);
        instance.cropBox.top = evt.e.pageY - (instance.boundingBox.top || 0);
        instance.cropBox.visible = true;
        instance.cropBox.selectable = true;
        instance.cropBox.lockRotation = true;
        
        instance.fabric.canvas.bringToFront(instance.cropBox);
        instance.fabric.canvas.setActiveObject(instance.cropBox);
        instance.cropBoxIsDrawn = true;
      }
    }
  }

  private handleMouseMove(instance: FabricCropInstance, evt: any): void {
    // If the mouse is down and it is in cropMode, resize the cropbox as the user is drawing it
    // NOTE: this supports dragging lr,tb... find algorithm to support arbitrary dragging!
    if (instance.isCropMode && instance.cropBoxIsDrawing && instance.mouseDown && instance.cropBox) {
      instance.cropBox.width = evt.e.pageX - instance.mouseDown.pageX;
      instance.cropBox.height = evt.e.pageY - instance.mouseDown.pageY;
      instance.fabric.canvas.bringToFront(instance.cropBox);
    }
  }

  private handleMouseUp(instance: FabricCropInstance, evt: any): void {
    instance.cropBoxIsDrawing = false;
  }

  /**
   * Helper method to get icon spacing
   */
  getIconSpacing(): number {
    return this.spacing;
  }
}