import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LightboxService } from '../services/lightbox.service';

export interface LightboxImage {
  id?: number;
  url: string;
  title?: string;
  caption?: string;
  alt?: string;
}

@Component({
  selector: 'app-lightbox',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="lightbox-container">
      <!-- Canvas area -->
      <div class="canvas-container">
        <canvas 
          #fabricCanvas
          class="fabric-canvas"
          width="800" 
          height="600"
        ></canvas>
        
        <!-- Loading indicator -->
        <div *ngIf="loading" class="loading-overlay">
          <p>Loading images...</p>
        </div>
      </div>

      <!-- Control toolbar -->
      <div class="toolbar">
        <button 
          type="button"
          class="btn btn-primary"
          [disabled]="!hasSelectedImage"
          (click)="cropImage()"
          id="lb-crop-btn"
        >
          Crop
        </button>
        
        <button 
          type="button"
          class="btn btn-danger"
          [disabled]="!hasSelectedImage"
          (click)="deleteImage()"
          id="lb-trash-btn"
        >
          Delete
        </button>
        
        <button 
          type="button"
          class="btn btn-info"
          (click)="toggleCaption()"
          id="lb-info-btn"
        >
          {{ showCaption ? 'Hide' : 'Show' }} Caption
        </button>
        
        <button 
          type="button"
          class="btn btn-success"
          (click)="saveLayout()"
          id="lb-save-btn"
        >
          Save
        </button>
        
        <button 
          type="button"
          class="btn btn-secondary"
          (click)="loadLayout()"
          id="lb-load-btn"
        >
          Load
        </button>
        
        <button 
          type="button"
          class="btn btn-warning"
          (click)="clearCanvas()"
          id="lb-clear-btn"
        >
          Clear
        </button>
        
        <button 
          type="button"
          class="btn btn-light"
          (click)="showHelp()"
          id="lb-help"
        >
          Help
        </button>
      </div>

      <!-- Image gallery -->
      <div class="image-gallery" *ngIf="images.length > 0">
        <h3>Cart Items ({{ images.length }})</h3>
        <div class="image-grid">
          <div 
            class="image-item"
            *ngFor="let image of images; trackBy: trackByImage"
            (click)="selectImage(image)"
            [class.selected]="selectedImage?.id === image.id"
          >
            <img [src]="image.url" [alt]="image.alt || image.title" />
            <div class="image-info" *ngIf="showCaption">
              <p>{{ image.title }}</p>
              <small>{{ image.caption }}</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Caption display -->
      <div id="caption" class="caption" [style.display]="showCaption && focusedImage ? 'block' : 'none'">
        {{ focusedImage?.alt }}
      </div>

      <!-- Hidden file input for loading -->
      <input 
        type="file" 
        id="loadfile" 
        style="display: none" 
        accept=".json"
        (change)="onFileSelected($event)"
      />
      
      <!-- Hidden download anchor -->
      <a id="saver" style="display: none"></a>
    </div>
  `,
  styles: [`
    .lightbox-container {
      position: relative;
      min-height: 100vh;
      background: #2c3e50;
      color: white;
      overflow: hidden;
    }
    
    .canvas-container {
      position: relative;
      width: 100%;
      height: 70vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .fabric-canvas {
      border: 1px solid #34495e;
      background: white;
      cursor: crosshair;
    }
    
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
    }
    
    .toolbar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.9);
      padding: 15px;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: center;
    }
    
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      transition: all 0.2s ease;
    }
    
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .btn-primary { background: #3498db; color: white; }
    .btn-danger { background: #e74c3c; color: white; }
    .btn-info { background: #17a2b8; color: white; }
    .btn-success { background: #28a745; color: white; }
    .btn-secondary { background: #6c757d; color: white; }
    .btn-warning { background: #ffc107; color: black; }
    .btn-light { background: #f8f9fa; color: black; }
    
    .image-gallery {
      position: fixed;
      right: 0;
      top: 0;
      width: 300px;
      height: 100vh;
      background: rgba(0, 0, 0, 0.9);
      padding: 20px;
      overflow-y: auto;
      z-index: 1000;
    }
    
    .image-gallery h3 {
      margin-bottom: 20px;
      color: #ecf0f1;
    }
    
    .image-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 15px;
    }
    
    .image-item {
      background: #34495e;
      border-radius: 8px;
      padding: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .image-item:hover {
      background: #4a5f7a;
      transform: translateY(-2px);
    }
    
    .image-item.selected {
      border: 2px solid #3498db;
      background: #4a5f7a;
    }
    
    .image-item img {
      width: 100%;
      height: 120px;
      object-fit: cover;
      border-radius: 4px;
    }
    
    .image-info {
      margin-top: 10px;
    }
    
    .image-info p {
      font-size: 14px;
      margin: 5px 0;
      font-weight: bold;
    }
    
    .image-info small {
      font-size: 12px;
      color: #bdc3c7;
    }
    
    .caption {
      position: fixed;
      bottom: 100px;
      left: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      max-width: 300px;
      font-size: 14px;
      z-index: 1001;
    }
  `]
})
export class LightboxComponent implements OnInit, OnDestroy {
  @ViewChild('fabricCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  images: LightboxImage[] = [];
  selectedImage: LightboxImage | null = null;
  focusedImage: LightboxImage | null = null;
  showCaption: boolean = true;
  loading: boolean = false;
  hasSelectedImage: boolean = false;

  private destroy$ = new Subject<void>();
  private canvas?: HTMLCanvasElement;
  private ctx?: CanvasRenderingContext2D;

  constructor(private lightboxService: LightboxService) {}

  ngOnInit(): void {
    this.initializeCanvas();
    this.loadCartItems();
    this.setupStorageListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize canvas
   */
  private initializeCanvas(): void {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;
    
    // Set canvas size to window size
    this.resizeCanvas();
    
    // Listen for window resize
    fromEvent(window, 'resize')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.resizeCanvas());
  }

  /**
   * Resize canvas to fit window
   */
  private resizeCanvas(): void {
    if (!this.canvas) return;
    
    const container = this.canvas.parentElement!;
    this.canvas.width = container.clientWidth - 40;
    this.canvas.height = container.clientHeight - 40;
  }

  /**
   * Load items from cart
   */
  private loadCartItems(): void {
    this.loading = true;
    
    this.lightboxService.listCartItems().subscribe({
      next: (items) => {
        this.images = items.map((item, index) => ({
          id: index,
          url: item.url,
          title: item.title,
          caption: item.caption,
          alt: `${item.title}: ${item.caption}`
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading cart items:', error);
        this.loading = false;
      }
    });
  }

  /**
   * Set up storage listener for new cart items
   */
  private setupStorageListener(): void {
    fromEvent(window, 'storage')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: any) => {
        if (event.key === 'cart-item-added' && event.newValue) {
          console.log('New item added to cart:', event.newValue);
          this.loadCartItems(); // Reload cart items
        } else if (event.key === 'image-cropped-indicator' && event.newValue !== event.oldValue) {
          console.log('Image was cropped');
          this.handleCroppedImage();
        }
      });
  }

  /**
   * Handle cropped image
   */
  private handleCroppedImage(): void {
    this.lightboxService.getCroppedImage().subscribe({
      next: (cropped) => {
        if (cropped) {
          const newImage: LightboxImage = {
            id: this.images.length,
            url: cropped.url || '',
            title: 'Cropped Image',
            caption: cropped.fullCaption || '',
            alt: cropped.fullCaption || 'Cropped image'
          };
          this.addImageToCanvas(newImage);
        }
      },
      error: (error) => console.error('Error getting cropped image:', error)
    });
  }

  /**
   * Add image to canvas
   */
  private addImageToCanvas(image: LightboxImage): void {
    if (!this.canvas || !this.ctx) return;

    const img = new Image();
    img.onload = () => {
      const maxWidth = this.canvas!.width / 3;
      const scale = maxWidth / img.width;
      const scaledHeight = img.height * scale;

      // Simple placement - center the image
      const x = (this.canvas!.width - maxWidth) / 2;
      const y = (this.canvas!.height - scaledHeight) / 2;

      this.ctx!.drawImage(img, x, y, maxWidth, scaledHeight);
    };
    img.src = image.url;
  }

  /**
   * Select an image
   */
  selectImage(image: LightboxImage): void {
    this.selectedImage = image;
    this.hasSelectedImage = true;
    this.focusedImage = image;
    
    // Add to canvas
    this.addImageToCanvas(image);
  }

  /**
   * Crop selected image
   */
  cropImage(): void {
    if (!this.selectedImage) return;

    this.lightboxService.setImageToCrop({
      url: this.selectedImage.url,
      fullCaption: this.selectedImage.alt || this.selectedImage.title || ''
    });

    // Open cropper window
    window.open('/cropper/crop', '_blank', 'toolbar=no,scrollbars=yes,resizable=yes,width=1200,height=800');
  }

  /**
   * Delete selected image
   */
  deleteImage(): void {
    if (!this.selectedImage) return;

    // Remove from images array
    const index = this.images.findIndex(img => img.id === this.selectedImage!.id);
    if (index > -1) {
      this.images.splice(index, 1);
    }

    // Clear selection
    this.selectedImage = null;
    this.hasSelectedImage = false;
    this.focusedImage = null;

    // Clear canvas area where image was
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas!.width, this.canvas!.height);
    }
  }

  /**
   * Toggle caption display
   */
  toggleCaption(): void {
    this.showCaption = !this.showCaption;
  }

  /**
   * Save canvas layout
   */
  saveLayout(): void {
    if (!this.canvas) return;

    // Create download data
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      images: this.images,
      canvasSize: { width: this.canvas.width, height: this.canvas.height },
      timestamp: new Date().toISOString()
    }));

    const downloadAnchor = document.getElementById('saver') as HTMLAnchorElement;
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "lightbox.json");
    downloadAnchor.click();
  }

  /**
   * Load canvas layout
   */
  loadLayout(): void {
    const fileInput = document.getElementById('loadfile') as HTMLInputElement;
    fileInput.click();
  }

  /**
   * Handle file selection
   */
  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.images) {
          this.images = data.images;
        }
      } catch (error) {
        console.error('Error loading layout:', error);
      }
    };
    reader.readAsText(file);
  }

  /**
   * Clear canvas
   */
  clearCanvas(): void {
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas!.width, this.canvas!.height);
    }
    this.selectedImage = null;
    this.hasSelectedImage = false;
    this.focusedImage = null;
  }

  /**
   * Show help modal
   */
  showHelp(): void {
    // TODO: Implement help modal
    alert('Lightbox Help:\n\n1. Select images from the cart panel\n2. Use toolbar to crop, delete, or manipulate images\n3. Save/load your canvas layouts\n4. Toggle captions on/off');
  }

  /**
   * Track by function for image rendering
   */
  trackByImage(index: number, image: LightboxImage): any {
    return image.id || index;
  }
}