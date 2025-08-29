import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { WindowSizeService } from '../services/window-size.service';
import { FormatService } from '../services/format.service';
import { AlertService } from '../services/alert.service';
import { ImageManipulationService } from '../services/image-manipulation.service';

@Component({
  selector: 'app-service-demo',
  template: `
    <div class="service-demo">
      <h3>Angular Services Demo</h3>
      
      <div class="demo-section">
        <h4>Window Size Service</h4>
        <p>Current size: {{windowSize.width}}x{{windowSize.height}}</p>
      </div>

      <div class="demo-section">
        <h4>Format Service</h4>
        <input #textInput (input)="testFormat(textInput.value)" placeholder="Type text with 'copy'">
        <p>Formatted: {{formattedText || 'No match'}}</p>
      </div>

      <div class="demo-section">
        <h4>Alert Service</h4>
        <button (click)="showAlert('success', 'Success message!')">Success Alert</button>
        <button (click)="showAlert('danger', 'Error message!')">Error Alert</button>
        <button (click)="showAlert('info', 'Info message!')">Info Alert</button>
      </div>

      <div class="demo-section">
        <h4>Image Manipulation Service</h4>
        <div 
          class="demo-image" 
          [style.transform]="imageTransform.getCSSTransform()"
          [style.background]="'#ddd'"
          [style.width]="'100px'"
          [style.height]="'100px'"
          [style.display]="'inline-block'"
          [style.margin]="'10px'">
          📷 Image
        </div>
        <br>
        <button (click)="rotateImage()">Rotate</button>
        <button (click)="resetImage()">Reset</button>
        <p>Rotation: {{transform.rotate}}°, Orientation: {{transform.orientation}}</p>
      </div>
    </div>
  `,
  styles: [`
    .service-demo {
      padding: 20px;
      font-family: Arial, sans-serif;
    }
    .demo-section {
      margin: 20px 0;
      padding: 15px;
      border: 1px solid #ccc;
      border-radius: 5px;
    }
    button {
      margin: 5px;
      padding: 8px 12px;
      border: none;
      border-radius: 3px;
      cursor: pointer;
    }
    button:first-of-type { background: #28a745; color: white; }
    button:nth-of-type(2) { background: #dc3545; color: white; }
    button:nth-of-type(3) { background: #17a2b8; color: white; }
    .demo-image {
      transition: transform 0.3s ease;
      text-align: center;
      line-height: 100px;
    }
  `]
})
export class ServiceDemoComponent implements OnInit, OnDestroy {
  windowSize = this.windowSizeService.windowSize;
  formattedText: string | false = false;
  transform = this.imageManipulationService.transform;
  
  private subscriptions = new Subscription();

  constructor(
    private windowSizeService: WindowSizeService,
    private formatService: FormatService,
    private alertService: AlertService,
    private imageManipulationService: ImageManipulationService
  ) {}

  ngOnInit() {
    // Subscribe to image transformation changes
    this.subscriptions.add(
      this.imageManipulationService.transform$.subscribe(transform => {
        this.transform = transform;
      })
    );

    // Update window size periodically for demo
    setInterval(() => {
      this.windowSize = this.windowSizeService.windowSize;
    }, 1000);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  testFormat(text: string) {
    this.formattedText = this.formatService.cap(text);
  }

  showAlert(type: 'success' | 'danger' | 'info', message: string) {
    this.alertService.add(type, message);
  }

  rotateImage() {
    this.imageManipulationService.rotate();
  }

  resetImage() {
    this.imageManipulationService.reset();
  }
}