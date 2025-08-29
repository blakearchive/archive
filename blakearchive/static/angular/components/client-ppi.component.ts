import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface Resolution {
  x: number;
  y: number;
}

export interface PPIConfig {
  x: number;
  y: number;
  d: number;
  ppi: number;
}

export interface Screen {
  name: string;
  x: number;
  y: number;
  d: number;
  [key: string]: any;
}

@Component({
  selector: 'app-client-ppi',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="client-ppi-container">
      <div class="ppi-calculator">
        <h4>PPI Calculator</h4>
        
        <div class="config-section">
          <div class="input-group">
            <label for="resolution-x">Width (pixels):</label>
            <input 
              id="resolution-x"
              type="number" 
              [(ngModel)]="config.x" 
              (ngModelChange)="updateConfig(config.x, config.y, config.d)"
              class="form-control"
            >
          </div>
          
          <div class="input-group">
            <label for="resolution-y">Height (pixels):</label>
            <input 
              id="resolution-y"
              type="number" 
              [(ngModel)]="config.y" 
              (ngModelChange)="updateConfig(config.x, config.y, config.d)"
              class="form-control"
            >
          </div>
          
          <div class="input-group">
            <label for="diagonal">Diagonal (inches):</label>
            <input 
              id="diagonal"
              type="number" 
              step="0.1" 
              [(ngModel)]="config.d" 
              (ngModelChange)="updateConfig(config.x, config.y, config.d)"
              class="form-control"
            >
          </div>
        </div>

        <div class="common-resolutions">
          <h5>Common Resolutions:</h5>
          <div class="resolution-buttons">
            <button 
              *ngFor="let resolution of common.resolutions"
              (click)="updateConfig(resolution.x, resolution.y, config.d)"
              class="btn btn-sm btn-secondary resolution-btn"
            >
              {{ resolution.x }} x {{ resolution.y }}
            </button>
          </div>
        </div>

        <div class="common-diagonals">
          <h5>Common Diagonals:</h5>
          <div class="diagonal-buttons">
            <button 
              *ngFor="let diagonal of common.diagonals"
              (click)="updateConfig(config.x, config.y, diagonal)"
              class="btn btn-sm btn-secondary diagonal-btn"
            >
              {{ diagonal }}"
            </button>
          </div>
        </div>

        <div class="ppi-result">
          <h5>Calculated PPI: {{ calculatePpi() }}</h5>
          <div class="test-line" [ngStyle]="testLineStyle"></div>
          <small>This red line should be exactly 1 inch wide when displayed correctly.</small>
        </div>

        <div class="screen-search" *ngIf="screens.length > 0">
          <h5>Search Screens:</h5>
          <input 
            type="text" 
            [(ngModel)]="screenQuery" 
            placeholder="Search for your screen..."
            class="form-control screen-search-input"
          >
          <div class="screen-results" *ngIf="screenQuery">
            <div 
              *ngFor="let screen of getFilteredScreens()" 
              class="screen-item"
              (click)="selectScreen(screen)"
            >
              {{ screen.name }} - {{ screen.x }}x{{ screen.y }} @ {{ screen.d }}"
            </div>
          </div>
        </div>

        <div class="actions">
          <button 
            (click)="savePpi()" 
            class="btn btn-primary"
          >
            Save PPI Configuration
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .client-ppi-container {
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      max-width: 600px;
    }

    .ppi-calculator h4 {
      margin-bottom: 20px;
      color: #333;
    }

    .config-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }

    .input-group {
      display: flex;
      flex-direction: column;
    }

    .input-group label {
      margin-bottom: 5px;
      font-weight: 500;
      color: #555;
    }

    .form-control {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .form-control:focus {
      outline: 0;
      border-color: #007bff;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }

    .common-resolutions,
    .common-diagonals {
      margin-bottom: 20px;
    }

    .common-resolutions h5,
    .common-diagonals h5,
    .screen-search h5 {
      margin-bottom: 10px;
      color: #666;
      font-size: 16px;
    }

    .resolution-buttons,
    .diagonal-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .btn {
      padding: 6px 12px;
      border: 1px solid transparent;
      border-radius: 4px;
      cursor: pointer;
      text-align: center;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .btn-sm {
      padding: 4px 8px;
      font-size: 12px;
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

    .btn-primary {
      background-color: #007bff;
      border-color: #007bff;
      color: #fff;
    }

    .btn-primary:hover {
      background-color: #0056b3;
      border-color: #004085;
    }

    .ppi-result {
      margin-bottom: 20px;
      padding: 15px;
      background: white;
      border-radius: 6px;
      border: 1px solid #dee2e6;
    }

    .ppi-result h5 {
      margin-bottom: 10px;
      color: #28a745;
      font-size: 18px;
    }

    .test-line {
      margin: 10px 0;
    }

    .screen-search {
      margin-bottom: 20px;
    }

    .screen-search-input {
      margin-bottom: 10px;
    }

    .screen-results {
      max-height: 200px;
      overflow-y: auto;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
    }

    .screen-item {
      padding: 8px 12px;
      cursor: pointer;
      border-bottom: 1px solid #eee;
      transition: background-color 0.2s ease;
    }

    .screen-item:hover {
      background-color: #f1f3f4;
    }

    .screen-item:last-child {
      border-bottom: none;
    }

    .actions {
      text-align: center;
    }

    /* Responsive adjustments */
    @media (max-width: 576px) {
      .config-section {
        grid-template-columns: 1fr;
      }
      
      .resolution-buttons,
      .diagonal-buttons {
        justify-content: center;
      }
    }
  `]
})
export class ClientPpiComponent implements OnInit {
  config: PPIConfig = {
    x: 1680,
    y: 1050,
    d: 13.3,
    ppi: 0
  };

  common = {
    resolutions: [
      { x: 1920, y: 1080 },
      { x: 1680, y: 1050 },
      { x: 1440, y: 900 },
      { x: 1366, y: 768 },
      { x: 1280, y: 800 },
      { x: 1386, y: 768 },
      { x: 1024, y: 768 },
      { x: 800, y: 600 }
    ],
    diagonals: [7, 11.6, 13.3, 14, 15.6, 17.3, 21, 27]
  };

  screens: Screen[] = [];
  screenQuery: string = '';
  testLineStyle: any = {};

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Load saved configuration from localStorage
    this.loadSavedConfig();
    
    // Load screens data
    this.loadScreensData();
    
    // Update test line style
    this.updateTestLineStyle();
  }

  /**
   * Load saved PPI configuration from localStorage
   */
  private loadSavedConfig(): void {
    try {
      const saved = localStorage.getItem('clientPpi');
      if (saved) {
        this.config = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Could not load saved PPI config:', error);
    }
  }

  /**
   * Load screens data from JSON file
   */
  private loadScreensData(): void {
    this.http.get<Screen[]>('/static/directives/client-ppi/screens.json')
      .subscribe({
        next: (data) => {
          this.screens = data;
        },
        error: (error) => {
          console.warn('Could not load screens data:', error);
        }
      });
  }

  /**
   * Calculate PPI based on resolution and diagonal
   */
  calculatePpi(): number {
    const { x, y, d } = this.config;
    
    if (d <= 0) return 0;
    
    // Calculate PPI using Pythagorean theorem
    const ppi = Math.sqrt(x * x + y * y) / d;
    return ppi > 0 ? Math.round(ppi) : 0;
  }

  /**
   * Update configuration and recalculate
   */
  updateConfig(x?: number, y?: number, d?: number): void {
    if (x && x > 0) this.config.x = x;
    if (y && y > 0) this.config.y = y;
    if (d && d > 0) this.config.d = d;
    
    this.updateTestLineStyle();
  }

  /**
   * Update test line style for visual verification
   */
  private updateTestLineStyle(): void {
    this.testLineStyle = {
      'background-color': 'red',
      'height': '5px',
      'width': this.calculatePpi() + 'px'
    };
  }

  /**
   * Save PPI configuration
   */
  savePpi(): void {
    this.config.ppi = this.calculatePpi();
    
    try {
      localStorage.setItem('clientPpi', JSON.stringify(this.config));
      
      // Broadcast event for AngularJS compatibility
      const $rootScope = (window as any).$rootScope;
      if ($rootScope && $rootScope.$broadcast) {
        $rootScope.$broadcast('clientPpi::savedPpi');
      }
      
      // Emit custom DOM event
      const event = new CustomEvent('clientPpi:savedPpi', {
        detail: { config: this.config }
      });
      window.dispatchEvent(event);
      
      console.log('PPI configuration saved:', this.config);
    } catch (error) {
      console.error('Could not save PPI configuration:', error);
    }
  }

  /**
   * Select a screen from the search results
   */
  selectScreen(screen: Screen): void {
    this.updateConfig(screen.x, screen.y, screen.d);
    this.screenQuery = '';
  }

  /**
   * Get filtered screens based on search query
   */
  getFilteredScreens(): Screen[] {
    if (!this.screenQuery.trim()) {
      return [];
    }
    
    const query = this.screenQuery.toLowerCase();
    return this.screens.filter(screen =>
      screen.name.toLowerCase().includes(query)
    ).slice(0, 10); // Limit to 10 results
  }

  /**
   * Get current PPI configuration
   */
  getCurrentConfig(): PPIConfig {
    return { ...this.config };
  }
}