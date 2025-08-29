import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LightboxService } from '../services/lightbox.service';

@Component({
  selector: 'app-cropper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cropper-container">
      <div class="cropper-header">
        <h1>Image Cropper</h1>
        <button type="button" class="close-btn" (click)="closeWindow()">
          ×
        </button>
      </div>
      
      <div class="cropper-content">
        <div *ngIf="imageUrl" class="image-container">
          <img 
            [src]="imageUrl" 
            [alt]="imageCaption"
            class="crop-image"
            #cropImage
          />
        </div>
        
        <div *ngIf="!imageUrl" class="no-image">
          <p>No image selected for cropping</p>
        </div>
      </div>
      
      <div class="cropper-controls">
        <button 
          type="button" 
          class="btn btn-primary"
          [disabled]="!imageUrl"
          (click)="cropImage()"
        >
          Crop Image
        </button>
        
        <button 
          type="button" 
          class="btn btn-secondary"
          (click)="resetCrop()"
          [disabled]="!imageUrl"
        >
          Reset
        </button>
        
        <button 
          type="button" 
          class="btn btn-success"
          [disabled]="!croppedData"
          (click)="saveCroppedImage()"
        >
          Save Cropped Image
        </button>
        
        <button 
          type="button" 
          class="btn btn-light"
          (click)="closeWindow()"
        >
          Cancel
        </button>
      </div>
      
      <div class="crop-info" *ngIf="imageCaption">
        <p><strong>Image Info:</strong> {{ imageCaption }}</p>
      </div>
    </div>
  `,
  styles: [`
    .cropper-container {
      min-height: 100vh;
      background: #f8f9fa;
      display: flex;
      flex-direction: column;
    }
    
    .cropper-header {
      background: #343a40;
      color: white;
      padding: 15px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .cropper-header h1 {
      margin: 0;
      font-size: 24px;
    }
    
    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .close-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }
    
    .cropper-content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      min-height: 500px;
    }
    
    .image-container {
      max-width: 100%;
      max-height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .crop-image {
      max-width: 90%;
      max-height: 70vh;
      border: 2px solid #007bff;
      border-radius: 4px;
      cursor: crosshair;
    }
    
    .no-image {
      text-align: center;
      color: #6c757d;
      font-size: 18px;
    }
    
    .cropper-controls {
      background: white;
      border-top: 1px solid #dee2e6;
      padding: 20px;
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
    }
    
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .btn-primary {
      background-color: #007bff;
      color: white;
    }
    
    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }
    
    .btn-success {
      background-color: #28a745;
      color: white;
    }
    
    .btn-light {
      background-color: #f8f9fa;
      color: #495057;
      border: 1px solid #dee2e6;
    }
    
    .btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .crop-info {
      background: #e9ecef;
      padding: 15px 20px;
      border-top: 1px solid #dee2e6;
    }
    
    .crop-info p {
      margin: 0;
      color: #495057;
    }
  `]
})
export class CropperComponent implements OnInit, OnDestroy {
  imageUrl: string | null = null;
  imageCaption: string = '';
  croppedData: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private lightboxService: LightboxService
  ) {}

  ngOnInit(): void {
    // Load image to crop from service
    this.loadImageToCrop();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load image to crop from lightbox service
   */
  private loadImageToCrop(): void {
    this.lightboxService.getImageToCrop().subscribe({
      next: (imageToCrop) => {
        if (imageToCrop) {
          this.imageUrl = imageToCrop.url;
          this.imageCaption = imageToCrop.fullCaption || imageToCrop.title || '';
        } else {
          console.warn('No image to crop found');
        }
      },
      error: (error) => {
        console.error('Error loading image to crop:', error);
      }
    });
  }

  /**
   * Perform crop operation (simplified)
   */
  cropImage(): void {
    if (!this.imageUrl) return;

    // TODO: Implement actual cropping logic
    // For now, just simulate cropping by using the original image
    this.croppedData = this.imageUrl;
    
    console.log('Image cropped (simulated)');
  }

  /**
   * Reset crop selection
   */
  resetCrop(): void {
    this.croppedData = null;
    console.log('Crop reset');
  }

  /**
   * Save the cropped image
   */
  saveCroppedImage(): void {
    if (!this.croppedData) return;

    const croppedImage = {
      url: this.croppedData,
      fullCaption: this.imageCaption,
      title: 'Cropped Image',
      cropParameters: {
        x: 0,
        y: 0,
        width: 100,
        height: 100
      }
    };

    this.lightboxService.setCroppedImage(croppedImage, window).subscribe({
      next: () => {
        console.log('Cropped image saved successfully');
        
        // Signal that image was cropped
        localStorage.setItem('image-cropped-indicator', Date.now().toString());
        
        // Close window
        this.closeWindow();
      },
      error: (error) => {
        console.error('Error saving cropped image:', error);
      }
    });
  }

  /**
   * Close the cropper window
   */
  closeWindow(): void {
    window.close();
  }
}