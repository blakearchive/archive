import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dpi',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="btn-group" style="position:absolute;right:0">
      <button 
        [title]="'For viewing on computer.'"
        style="margin-left:-1px;line-height:0.5;border-radius:0px;height:21px" 
        [class.active]="dpivalue === '100'"
        class="btn btn-gr-selection" 
        (click)="reloadWith100or300('100')"
      >
        <span class="gr-abbreviation" style="height:21px;font-size:14px">100 DPI</span>
        <span class="gr-title">View 100dpi images instead of 300dpi</span>
      </button>
      <button 
        [title]="'For projection purposes. Performance might be slightly reduced.'" 
        style="margin-left:-1px;line-height:0.5;border-radius:0px;height:21px" 
        [class.active]="dpivalue === '300'"
        class="btn btn-gr-selection" 
        (click)="reloadWith100or300('300')"
      >
        <span class="gr-abbreviation" style="height:21px;font-size:14px">300 DPI</span>
        <span class="gr-title">View 300dpi images instead of 100dpi</span>
      </button>
    </div>
  `,
  styles: [`
    .btn-group {
      display: flex;
    }

    .btn {
      display: inline-block;
      padding: 6px 12px;
      margin-bottom: 0;
      font-size: 14px;
      font-weight: normal;
      line-height: 1.42857143;
      text-align: center;
      white-space: nowrap;
      vertical-align: middle;
      cursor: pointer;
      border: 1px solid transparent;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .btn-gr-selection {
      background-color: #f8f9fa;
      border-color: #dee2e6;
      color: #495057;
      position: relative;
      overflow: hidden;
    }

    .btn-gr-selection:hover {
      background-color: #e9ecef;
      border-color: #adb5bd;
    }

    .btn-gr-selection.active {
      background-color: #007bff;
      border-color: #007bff;
      color: #fff;
    }

    .btn-gr-selection.active:hover {
      background-color: #0056b3;
      border-color: #004085;
    }

    .gr-abbreviation {
      display: block;
      font-weight: bold;
    }

    .gr-title {
      position: absolute;
      left: -9999px;
      opacity: 0;
      pointer-events: none;
    }

    .btn:focus {
      outline: 0;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }

    /* Tooltip-like behavior */
    .btn:hover .gr-title {
      position: static;
      left: auto;
      opacity: 1;
      font-size: 12px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      white-space: nowrap;
      z-index: 1000;
      margin-top: 5px;
    }
  `]
})
export class DpiComponent implements OnInit {
  dpivalue: string = '100';

  constructor() {}

  ngOnInit(): void {
    // Initialize DPI value from global scope or default to 100
    const $rootScope = (window as any).$rootScope;
    if ($rootScope) {
      if (!$rootScope.dpivalue) {
        $rootScope.dpivalue = '100';
      }
      this.dpivalue = $rootScope.dpivalue;
      
      // Watch for changes from global scope
      setInterval(() => {
        if ($rootScope.dpivalue !== this.dpivalue) {
          this.dpivalue = $rootScope.dpivalue;
        }
      }, 100);
    }
  }

  /**
   * Reload with specified DPI value
   */
  reloadWith100or300(dpiValue: '100' | '300'): void {
    this.dpivalue = dpiValue;
    
    // Update global scope for AngularJS compatibility
    const $rootScope = (window as any).$rootScope;
    if ($rootScope) {
      $rootScope.dpivalue = dpiValue;
      
      // Trigger digest cycle if available
      if ($rootScope.$apply && !$rootScope.$$phase) {
        try {
          $rootScope.$apply();
        } catch (error) {
          // Ignore digest cycle errors
        }
      }
    }

    // Emit custom event for other components to listen
    const event = new CustomEvent('dpi:changed', { 
      detail: { dpiValue } 
    });
    window.dispatchEvent(event);

    console.log(`DPI changed to: ${dpiValue}`);
  }

  /**
   * Get current DPI value
   */
  getCurrentDpi(): string {
    return this.dpivalue;
  }

  /**
   * Check if specific DPI is active
   */
  isActive(dpi: '100' | '300'): boolean {
    return this.dpivalue === dpi;
  }
}