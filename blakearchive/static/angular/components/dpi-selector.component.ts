import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dpi-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dpi-selector">
      <label class="dpi-label">DPI:</label>
      <select 
        class="dpi-select"
        [value]="currentDpi"
        (change)="onDpiChange($event)"
      >
        <option value="75">75 DPI</option>
        <option value="100">100 DPI</option>
        <option value="150">150 DPI</option>
        <option value="200">200 DPI</option>
        <option value="300">300 DPI</option>
      </select>
    </div>
  `,
  styles: [`
    .dpi-selector {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(0, 0, 0, 0.8);
      padding: 8px 12px;
      border-radius: 4px;
      color: white;
    }
    
    .dpi-label {
      font-size: 12px;
      font-weight: 600;
      margin: 0;
    }
    
    .dpi-select {
      background: #34495e;
      color: white;
      border: 1px solid #7f8c8d;
      padding: 4px 8px;
      border-radius: 3px;
      font-size: 12px;
      cursor: pointer;
    }
    
    .dpi-select:focus {
      outline: none;
      border-color: #3498db;
    }
    
    .dpi-select option {
      background: #2c3e50;
      color: white;
    }
  `]
})
export class DpiSelectorComponent {
  @Input() currentDpi: string = '100';
  @Output() dpiChange = new EventEmitter<string>();

  onDpiChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.dpiChange.emit(target.value);
  }
}