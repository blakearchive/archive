import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-container" [ngClass]="containerClass">
      <!-- Text skeletons -->
      <div *ngIf="type === 'text'" class="skeleton-item skeleton-text" [ngClass]="itemClass">
        <div class="skeleton-line" 
             *ngFor="let line of lines; let i = index" 
             [ngClass]="getLineClass(i)">
        </div>
      </div>
      
      <!-- Card skeleton -->
      <div *ngIf="type === 'card'" class="skeleton-item skeleton-card" [ngClass]="itemClass">
        <div class="skeleton-card-header" *ngIf="showHeader">
          <div class="skeleton-avatar" *ngIf="showAvatar"></div>
          <div class="skeleton-card-title">
            <div class="skeleton-line"></div>
            <div class="skeleton-line short"></div>
          </div>
        </div>
        
        <div class="skeleton-card-image" *ngIf="showImage"></div>
        
        <div class="skeleton-card-body">
          <div class="skeleton-line" *ngFor="let line of lines"></div>
        </div>
        
        <div class="skeleton-card-footer" *ngIf="showFooter">
          <div class="skeleton-button"></div>
          <div class="skeleton-button secondary"></div>
        </div>
      </div>
      
      <!-- List skeleton -->
      <div *ngIf="type === 'list'" class="skeleton-item skeleton-list" [ngClass]="itemClass">
        <div class="skeleton-list-item" *ngFor="let item of items">
          <div class="skeleton-avatar" *ngIf="showAvatar"></div>
          <div class="skeleton-list-content">
            <div class="skeleton-line"></div>
            <div class="skeleton-line short"></div>
          </div>
          <div class="skeleton-action" *ngIf="showActions"></div>
        </div>
      </div>
      
      <!-- Table skeleton -->
      <div *ngIf="type === 'table'" class="skeleton-item skeleton-table" [ngClass]="itemClass">
        <div class="skeleton-table-header">
          <div class="skeleton-table-cell" *ngFor="let col of columns"></div>
        </div>
        <div class="skeleton-table-row" *ngFor="let row of rows">
          <div class="skeleton-table-cell" *ngFor="let col of columns">
            <div class="skeleton-line" [ngClass]="getCellClass(col)"></div>
          </div>
        </div>
      </div>
      
      <!-- Image skeleton -->
      <div *ngIf="type === 'image'" class="skeleton-item skeleton-image" [ngClass]="itemClass">
        <div class="skeleton-image-placeholder">
          <i class="fas fa-image skeleton-image-icon"></i>
        </div>
      </div>
      
      <!-- Button skeleton -->
      <div *ngIf="type === 'button'" class="skeleton-item skeleton-button" [ngClass]="itemClass">
      </div>
      
      <!-- Custom skeleton -->
      <div *ngIf="type === 'custom'" class="skeleton-item" [ngClass]="itemClass">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-container {
      animation: pulse 1.5s ease-in-out infinite;
    }
    
    .skeleton-container.fast {
      animation-duration: 1s;
    }
    
    .skeleton-container.slow {
      animation-duration: 2s;
    }
    
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.6; }
      100% { opacity: 1; }
    }
    
    .skeleton-item {
      background: #f8f9fa;
      border-radius: 4px;
      overflow: hidden;
      position: relative;
    }
    
    .skeleton-line {
      height: 1rem;
      background: linear-gradient(90deg, #e9ecef 25%, #f8f9fa 50%, #e9ecef 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }
    
    .skeleton-line.short {
      width: 60%;
    }
    
    .skeleton-line.medium {
      width: 80%;
    }
    
    .skeleton-line.long {
      width: 100%;
    }
    
    .skeleton-line:last-child {
      margin-bottom: 0;
    }
    
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    
    /* Text skeleton */
    .skeleton-text {
      padding: 1rem;
    }
    
    /* Card skeleton */
    .skeleton-card {
      border: 1px solid #e9ecef;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .skeleton-card-header {
      padding: 1rem;
      display: flex;
      align-items: center;
      border-bottom: 1px solid #e9ecef;
    }
    
    .skeleton-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(90deg, #e9ecef 25%, #f8f9fa 50%, #e9ecef 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      margin-right: 1rem;
      flex-shrink: 0;
    }
    
    .skeleton-card-title {
      flex: 1;
    }
    
    .skeleton-card-image {
      height: 200px;
      background: linear-gradient(90deg, #e9ecef 25%, #f8f9fa 50%, #e9ecef 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    
    .skeleton-card-body {
      padding: 1rem;
    }
    
    .skeleton-card-footer {
      padding: 1rem;
      border-top: 1px solid #e9ecef;
      display: flex;
      gap: 0.5rem;
    }
    
    .skeleton-button {
      height: 38px;
      width: 80px;
      background: linear-gradient(90deg, #e9ecef 25%, #f8f9fa 50%, #e9ecef 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    }
    
    .skeleton-button.secondary {
      width: 100px;
      opacity: 0.7;
    }
    
    /* List skeleton */
    .skeleton-list {
      border: 1px solid #e9ecef;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .skeleton-list-item {
      padding: 1rem;
      display: flex;
      align-items: center;
      border-bottom: 1px solid #e9ecef;
    }
    
    .skeleton-list-item:last-child {
      border-bottom: none;
    }
    
    .skeleton-list-content {
      flex: 1;
    }
    
    .skeleton-action {
      width: 24px;
      height: 24px;
      background: linear-gradient(90deg, #e9ecef 25%, #f8f9fa 50%, #e9ecef 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    }
    
    /* Table skeleton */
    .skeleton-table {
      border: 1px solid #e9ecef;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .skeleton-table-header {
      display: flex;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
    }
    
    .skeleton-table-row {
      display: flex;
      border-bottom: 1px solid #e9ecef;
    }
    
    .skeleton-table-row:last-child {
      border-bottom: none;
    }
    
    .skeleton-table-cell {
      flex: 1;
      padding: 1rem;
      min-width: 100px;
    }
    
    /* Image skeleton */
    .skeleton-image {
      position: relative;
      background: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 200px;
    }
    
    .skeleton-image-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, #e9ecef 25%, #f8f9fa 50%, #e9ecef 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    
    .skeleton-image-icon {
      font-size: 2rem;
      color: #6c757d;
    }
    
    /* Size variants */
    .skeleton-container.small .skeleton-line {
      height: 0.75rem;
    }
    
    .skeleton-container.small .skeleton-avatar {
      width: 32px;
      height: 32px;
    }
    
    .skeleton-container.small .skeleton-card-image {
      height: 150px;
    }
    
    .skeleton-container.large .skeleton-line {
      height: 1.25rem;
    }
    
    .skeleton-container.large .skeleton-avatar {
      width: 56px;
      height: 56px;
    }
    
    .skeleton-container.large .skeleton-card-image {
      height: 250px;
    }
    
    /* Theme variants */
    .skeleton-container.dark .skeleton-item {
      background: #343a40;
    }
    
    .skeleton-container.dark .skeleton-line {
      background: linear-gradient(90deg, #495057 25%, #343a40 50%, #495057 75%);
    }
    
    /* Responsive adjustments */
    @media (max-width: 576px) {
      .skeleton-card-header,
      .skeleton-card-body,
      .skeleton-card-footer,
      .skeleton-list-item,
      .skeleton-table-cell {
        padding: 0.75rem;
      }
    }
  `]
})
export class SkeletonLoaderComponent implements OnInit {
  @Input() type: 'text' | 'card' | 'list' | 'table' | 'image' | 'button' | 'custom' = 'text';
  @Input() lines = 3;
  @Input() items = 3;
  @Input() rows = 3;
  @Input() columns = 4;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() speed: 'fast' | 'normal' | 'slow' = 'normal';
  @Input() theme: 'light' | 'dark' = 'light';
  @Input() showHeader = true;
  @Input() showImage = true;
  @Input() showFooter = true;
  @Input() showAvatar = true;
  @Input() showActions = true;

  ngOnInit(): void {
    // Ensure minimum values
    this.lines = Math.max(1, this.lines);
    this.items = Math.max(1, this.items);
    this.rows = Math.max(1, this.rows);
    this.columns = Math.max(1, this.columns);
  }

  get containerClass(): string {
    const classes = [];
    
    if (this.size !== 'medium') {
      classes.push(this.size);
    }
    
    if (this.speed !== 'normal') {
      classes.push(this.speed);
    }
    
    if (this.theme !== 'light') {
      classes.push(this.theme);
    }
    
    return classes.join(' ');
  }

  get itemClass(): string {
    return `skeleton-${this.type}`;
  }

  getLineClass(index: number): string {
    // Vary line lengths for more realistic appearance
    if (index === this.lines - 1) {
      return 'short'; // Last line is shorter
    } else if (index % 3 === 1) {
      return 'medium';
    } else {
      return 'long';
    }
  }

  getCellClass(columnIndex: number): string {
    // Vary cell content widths
    return columnIndex % 2 === 0 ? 'medium' : 'short';
  }
}