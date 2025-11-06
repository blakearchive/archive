import { Component, OnInit, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

@Component({
  selector: 'app-cropper',
  imports: [CommonModule, LoadingSpinner],
  templateUrl: './cropper.html',
  styleUrl: './cropper.scss',
})
export class Cropper implements OnInit {
  private route = inject(ActivatedRoute);

  @ViewChild('canvas', { static: false }) canvasRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('cropCanvas', { static: false }) cropCanvasRef?: ElementRef<HTMLCanvasElement>;

  imgUrl: string = '';
  imageLoaded = false;
  loading = true;
  error: string | null = null;

  private img: HTMLImageElement | null = null;
  private isDragging = false;
  private startX = 0;
  private startY = 0;

  cropArea: CropArea = {
    x: 50,
    y: 50,
    width: 200,
    height: 200
  };

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.imgUrl = decodeURIComponent(params['imgUrl']);
      this.loadImage();
    });
  }

  private loadImage() {
    this.loading = true;
    this.error = null;

    this.img = new Image();
    this.img.crossOrigin = 'anonymous';

    this.img.onload = () => {
      this.imageLoaded = true;
      this.loading = false;
      this.drawImage();

      // Set initial crop area to center of image
      if (this.img) {
        this.cropArea = {
          x: this.img.width / 4,
          y: this.img.height / 4,
          width: this.img.width / 2,
          height: this.img.height / 2
        };
      }
    };

    this.img.onerror = () => {
      this.error = 'Failed to load image';
      this.loading = false;
    };

    this.img.src = this.imgUrl;
  }

  private drawImage() {
    if (!this.canvasRef || !this.img) return;

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = this.img.width;
    canvas.height = this.img.height;

    ctx.drawImage(this.img, 0, 0);
    this.drawCropArea(ctx);
  }

  private drawCropArea(ctx: CanvasRenderingContext2D) {
    if (!this.canvasRef) return;

    const canvas = this.canvasRef.nativeElement;

    // Draw semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear crop area
    ctx.clearRect(this.cropArea.x, this.cropArea.y, this.cropArea.width, this.cropArea.height);

    // Redraw image in crop area
    if (this.img) {
      ctx.drawImage(
        this.img,
        this.cropArea.x, this.cropArea.y, this.cropArea.width, this.cropArea.height,
        this.cropArea.x, this.cropArea.y, this.cropArea.width, this.cropArea.height
      );
    }

    // Draw crop border
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.cropArea.x, this.cropArea.y, this.cropArea.width, this.cropArea.height);
  }

  onMouseDown(event: MouseEvent) {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    this.startX = event.clientX - rect.left;
    this.startY = event.clientY - rect.top;
    this.isDragging = true;
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDragging || !this.canvasRef) return;

    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const currentX = event.clientX - rect.left;
    const currentY = event.clientY - rect.top;

    this.cropArea = {
      x: Math.min(this.startX, currentX),
      y: Math.min(this.startY, currentY),
      width: Math.abs(currentX - this.startX),
      height: Math.abs(currentY - this.startY)
    };

    this.drawImage();
  }

  onMouseUp() {
    this.isDragging = false;
  }

  cropImage() {
    if (!this.cropCanvasRef || !this.img) return;

    const cropCanvas = this.cropCanvasRef.nativeElement;
    const ctx = cropCanvas.getContext('2d');

    if (!ctx) return;

    cropCanvas.width = this.cropArea.width;
    cropCanvas.height = this.cropArea.height;

    ctx.drawImage(
      this.img,
      this.cropArea.x, this.cropArea.y, this.cropArea.width, this.cropArea.height,
      0, 0, this.cropArea.width, this.cropArea.height
    );
  }

  downloadCroppedImage() {
    if (!this.cropCanvasRef) return;

    const cropCanvas = this.cropCanvasRef.nativeElement;
    cropCanvas.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'cropped-image.png';
      link.href = url;
      link.click();

      URL.revokeObjectURL(url);
    });
  }

  resetCrop() {
    if (this.img) {
      this.cropArea = {
        x: this.img.width / 4,
        y: this.img.height / 4,
        width: this.img.width / 2,
        height: this.img.height / 2
      };
      this.drawImage();
    }
  }
}
