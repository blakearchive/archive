import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalRef } from '../services/modal.service';

export interface ClientPpiData {
  screenWidth: number;
  screenHeight: number;
  physicalWidth: number;
  physicalHeight: number;
  pixelsPerInch: number;
}

@Component({
  selector: 'app-client-ppi-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Set Display Information</h4>
      <button type="button" class="btn-close" (click)="close()" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    
    <div class="modal-body">
      <div class="alert alert-info">
        <strong>Why do we need this information?</strong><br>
        To display images at true size, we need to know your screen's physical dimensions 
        and resolution. This allows us to calculate the correct pixels-per-inch (PPI) for your display.
      </div>

      <!-- Screen Resolution Section -->
      <div class="form-section">
        <h5>Screen Resolution</h5>
        <p class="text-muted">Your current screen resolution is automatically detected:</p>
        
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label for="screenWidth">Width (pixels)</label>
              <input 
                type="number" 
                class="form-control" 
                id="screenWidth"
                [(ngModel)]="ppiData.screenWidth"
                readonly>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label for="screenHeight">Height (pixels)</label>
              <input 
                type="number" 
                class="form-control" 
                id="screenHeight"
                [(ngModel)]="ppiData.screenHeight"
                readonly>
            </div>
          </div>
        </div>
      </div>

      <!-- Physical Dimensions Section -->
      <div class="form-section">
        <h5>Physical Screen Dimensions</h5>
        <p class="text-muted">
          Measure your screen's width and height in inches. You can usually find this information 
          in your monitor's specifications or measure the viewable area with a ruler.
        </p>
        
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label for="physicalWidth">Physical Width (inches) <span class="required">*</span></label>
              <input 
                type="number" 
                class="form-control" 
                id="physicalWidth"
                [(ngModel)]="ppiData.physicalWidth"
                [class.is-invalid]="!isValidWidth()"
                step="0.1"
                min="1"
                max="100"
                placeholder="e.g., 13.3"
                required>
              <div class="invalid-feedback" *ngIf="!isValidWidth()">
                Please enter a valid width between 1 and 100 inches.
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label for="physicalHeight">Physical Height (inches) <span class="required">*</span></label>
              <input 
                type="number" 
                class="form-control" 
                id="physicalHeight"
                [(ngModel)]="ppiData.physicalHeight"
                [class.is-invalid]="!isValidHeight()"
                step="0.1"
                min="1"
                max="100"
                placeholder="e.g., 7.5"
                required>
              <div class="invalid-feedback" *ngIf="!isValidHeight()">
                Please enter a valid height between 1 and 100 inches.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Calculated PPI Section -->
      <div class="form-section" *ngIf="isValidDimensions()">
        <h5>Calculated Display Information</h5>
        <div class="ppi-result">
          <div class="row">
            <div class="col-md-4">
              <div class="metric">
                <div class="metric-label">Horizontal PPI</div>
                <div class="metric-value">{{ getHorizontalPpi() | number:'1.0-1' }}</div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="metric">
                <div class="metric-label">Vertical PPI</div>
                <div class="metric-value">{{ getVerticalPpi() | number:'1.0-1' }}</div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="metric">
                <div class="metric-label">Average PPI</div>
                <div class="metric-value">{{ getAveragePpi() | number:'1.0-1' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Help Section -->
      <div class="help-section">
        <details>
          <summary>Need help finding your screen dimensions?</summary>
          <div class="help-content">
            <h6>Common Screen Sizes:</h6>
            <ul>
              <li><strong>13" Laptop:</strong> ~11.3" × 6.4" (16:9)</li>
              <li><strong>15" Laptop:</strong> ~13.1" × 7.4" (16:9)</li>
              <li><strong>21.5" Monitor:</strong> ~18.8" × 10.6" (16:9)</li>
              <li><strong>24" Monitor:</strong> ~21.0" × 11.8" (16:9)</li>
              <li><strong>27" Monitor:</strong> ~23.5" × 13.2" (16:9)</li>
            </ul>
            <p><small>These are approximate viewable areas. Measure your actual screen for best accuracy.</small></p>
          </div>
        </details>
      </div>
    </div>
    
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="close()">
        Cancel
      </button>
      <button 
        type="button" 
        class="btn btn-primary" 
        (click)="save()"
        [disabled]="!isValidForm()">
        Save & Continue
      </button>
    </div>
  `,
  styles: [`
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #dee2e6;
      background: #f8f9fa;
    }

    .modal-title {
      margin: 0;
      color: #2c3e50;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .btn-close {
      background: transparent;
      border: none;
      font-size: 1.5rem;
      color: #6c757d;
      cursor: pointer;
      padding: 0.25rem;
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-close:hover {
      color: #000;
    }

    .modal-body {
      padding: 1.5rem;
      max-height: 70vh;
      overflow-y: auto;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid #dee2e6;
      background: #f8f9fa;
    }

    .form-section {
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #e9ecef;
    }

    .form-section:last-of-type {
      border-bottom: none;
      margin-bottom: 1rem;
    }

    .form-section h5 {
      color: #495057;
      margin-bottom: 1rem;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #495057;
    }

    .required {
      color: #dc3545;
    }

    .form-control {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ced4da;
      border-radius: 0.375rem;
      font-size: 1rem;
    }

    .form-control:focus {
      outline: none;
      border-color: #80bdff;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }

    .form-control.is-invalid {
      border-color: #dc3545;
    }

    .invalid-feedback {
      display: block;
      width: 100%;
      margin-top: 0.25rem;
      font-size: 0.875rem;
      color: #dc3545;
    }

    .alert {
      padding: 1rem;
      margin-bottom: 1.5rem;
      border: 1px solid transparent;
      border-radius: 0.375rem;
    }

    .alert-info {
      color: #0c5460;
      background-color: #d1ecf1;
      border-color: #bee5eb;
    }

    .ppi-result {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 0.375rem;
      border: 1px solid #e9ecef;
    }

    .metric {
      text-align: center;
    }

    .metric-label {
      font-size: 0.875rem;
      color: #6c757d;
      margin-bottom: 0.5rem;
    }

    .metric-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: #28a745;
    }

    .help-section {
      margin-top: 2rem;
    }

    .help-section details {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 0.375rem;
      padding: 1rem;
    }

    .help-section summary {
      cursor: pointer;
      font-weight: 500;
      color: #495057;
      margin-bottom: 0.5rem;
    }

    .help-content {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e9ecef;
    }

    .help-content h6 {
      margin-bottom: 0.5rem;
      color: #495057;
    }

    .help-content ul {
      margin-bottom: 1rem;
    }

    .help-content li {
      margin-bottom: 0.25rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      border: 1px solid transparent;
      font-size: 1rem;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      text-align: center;
      vertical-align: middle;
    }

    .btn-primary {
      background-color: #007bff;
      border-color: #007bff;
      color: #fff;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #0056b3;
      border-color: #004085;
    }

    .btn-primary:disabled {
      background-color: #6c757d;
      border-color: #6c757d;
      cursor: not-allowed;
    }

    .btn-secondary {
      background-color: #6c757d;
      border-color: #6c757d;
      color: #fff;
    }

    .btn-secondary:hover {
      background-color: #545b62;
      border-color: #4e555b;
    }

    .text-muted {
      color: #6c757d;
    }

    .row {
      display: flex;
      flex-wrap: wrap;
      margin: 0 -0.75rem;
    }

    .col-md-4, .col-md-6 {
      position: relative;
      width: 100%;
      padding: 0 0.75rem;
    }

    @media (min-width: 768px) {
      .col-md-4 {
        flex: 0 0 33.333333%;
        max-width: 33.333333%;
      }

      .col-md-6 {
        flex: 0 0 50%;
        max-width: 50%;
      }
    }
  `]
})
export class ClientPpiModalComponent implements OnInit {
  modalRef?: ModalRef;

  ppiData: ClientPpiData = {
    screenWidth: 0,
    screenHeight: 0,
    physicalWidth: 0,
    physicalHeight: 0,
    pixelsPerInch: 0
  };

  ngOnInit(): void {
    // Detect screen resolution
    this.ppiData.screenWidth = window.screen.width;
    this.ppiData.screenHeight = window.screen.height;

    // Try to load saved values
    this.loadSavedValues();
  }

  isValidWidth(): boolean {
    return this.ppiData.physicalWidth > 0 && this.ppiData.physicalWidth <= 100;
  }

  isValidHeight(): boolean {
    return this.ppiData.physicalHeight > 0 && this.ppiData.physicalHeight <= 100;
  }

  isValidDimensions(): boolean {
    return this.isValidWidth() && this.isValidHeight();
  }

  isValidForm(): boolean {
    return this.isValidDimensions();
  }

  getHorizontalPpi(): number {
    if (!this.isValidDimensions()) return 0;
    return this.ppiData.screenWidth / this.ppiData.physicalWidth;
  }

  getVerticalPpi(): number {
    if (!this.isValidDimensions()) return 0;
    return this.ppiData.screenHeight / this.ppiData.physicalHeight;
  }

  getAveragePpi(): number {
    if (!this.isValidDimensions()) return 0;
    return (this.getHorizontalPpi() + this.getVerticalPpi()) / 2;
  }

  save(): void {
    if (!this.isValidForm()) return;

    const finalPpiData = {
      ...this.ppiData,
      pixelsPerInch: this.getAveragePpi()
    };

    // Save to localStorage
    this.saveToLocalStorage(finalPpiData);

    // Save to cookie for legacy compatibility
    this.saveToCookie(finalPpiData);

    // Emit custom event
    const event = new CustomEvent('clientPpi::savedPpi', { 
      detail: finalPpiData 
    });
    window.dispatchEvent(event);

    // Close modal with result
    if (this.modalRef) {
      this.modalRef.close(finalPpiData);
    }
  }

  close(): void {
    if (this.modalRef) {
      this.modalRef.dismiss('cancelled');
    }
  }

  private loadSavedValues(): void {
    try {
      // Try localStorage first
      const saved = localStorage.getItem('blake-client-ppi');
      if (saved) {
        const data = JSON.parse(saved);
        this.ppiData.physicalWidth = data.physicalWidth || 0;
        this.ppiData.physicalHeight = data.physicalHeight || 0;
        return;
      }

      // Fallback to cookie
      const cookieValue = this.getCookie('clientPpi');
      if (cookieValue) {
        this.ppiData.physicalWidth = cookieValue.physicalWidth || 0;
        this.ppiData.physicalHeight = cookieValue.physicalHeight || 0;
      }
    } catch (e) {
      console.warn('Could not load saved PPI data:', e);
    }
  }

  private saveToLocalStorage(data: ClientPpiData): void {
    try {
      localStorage.setItem('blake-client-ppi', JSON.stringify(data));
    } catch (e) {
      console.warn('Could not save PPI data to localStorage:', e);
    }
  }

  private saveToCookie(data: ClientPpiData): void {
    try {
      const cookieValue = encodeURIComponent(JSON.stringify(data));
      const expirationDate = new Date();
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
      document.cookie = `clientPpi=${cookieValue}; expires=${expirationDate.toUTCString()}; path=/`;
    } catch (e) {
      console.warn('Could not save PPI data to cookie:', e);
    }
  }

  private getCookie(name: string): any {
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