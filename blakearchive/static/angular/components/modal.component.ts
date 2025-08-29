import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="onOverlayClick($event)">
      <div class="modal-dialog" [class]="'modal-' + size">
        <div class="modal-content">
          <!-- Header -->
          <div class="modal-header" *ngIf="title || showCloseButton">
            <h4 class="modal-title" *ngIf="title">{{ title }}</h4>
            <button 
              type="button" 
              class="close-button"
              *ngIf="showCloseButton"
              (click)="close()"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          
          <!-- Body -->
          <div class="modal-body">
            <ng-content></ng-content>
            <div *ngIf="bodyText" [innerHTML]="bodyText"></div>
          </div>
          
          <!-- Footer -->
          <div class="modal-footer" *ngIf="showFooter">
            <ng-content select="[slot=footer]"></ng-content>
            <div class="default-footer" *ngIf="!hasFooterContent">
              <button 
                type="button" 
                class="btn btn-secondary" 
                (click)="close()"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
      animation: fadeIn 0.2s ease-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .modal-dialog {
      max-width: 90%;
      max-height: 90%;
      margin: 20px;
      animation: slideIn 0.2s ease-out;
    }
    
    @keyframes slideIn {
      from { 
        transform: translateY(-30px);
        opacity: 0;
      }
      to { 
        transform: translateY(0);
        opacity: 1;
      }
    }
    
    .modal-sm {
      max-width: 400px;
    }
    
    .modal-md {
      max-width: 600px;
    }
    
    .modal-lg {
      max-width: 900px;
    }
    
    .modal-xl {
      max-width: 1200px;
    }
    
    .modal-content {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      display: flex;
      flex-direction: column;
      max-height: 100%;
    }
    
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px 0 24px;
      border-bottom: 1px solid #e9ecef;
      margin-bottom: 0;
    }
    
    .modal-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 500;
      color: #333;
    }
    
    .close-button {
      background: none;
      border: none;
      font-size: 24px;
      color: #666;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: all 0.2s ease;
    }
    
    .close-button:hover {
      background-color: #f8f9fa;
      color: #333;
    }
    
    .modal-body {
      padding: 24px;
      flex: 1;
      overflow-y: auto;
    }
    
    .modal-footer {
      padding: 16px 24px 24px 24px;
      border-top: 1px solid #e9ecef;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    
    .btn {
      padding: 8px 16px;
      border: 1px solid transparent;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 400;
      text-align: center;
      transition: all 0.2s ease;
    }
    
    .btn-secondary {
      background-color: #6c757d;
      border-color: #6c757d;
      color: white;
    }
    
    .btn-secondary:hover {
      background-color: #5a6268;
      border-color: #545b62;
    }
  `]
})
export class ModalComponent implements OnInit {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() bodyText: string = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() showCloseButton: boolean = true;
  @Input() showFooter: boolean = true;
  @Input() closeOnOverlayClick: boolean = true;

  @Output() onClose = new EventEmitter<void>();
  @Output() onOpen = new EventEmitter<void>();

  hasFooterContent: boolean = false;

  ngOnInit(): void {
    if (this.isOpen) {
      this.onOpen.emit();
    }
  }

  /**
   * Close the modal
   */
  close(): void {
    this.isOpen = false;
    this.onClose.emit();
  }

  /**
   * Open the modal
   */
  open(): void {
    this.isOpen = true;
    this.onOpen.emit();
  }

  /**
   * Handle overlay click
   */
  onOverlayClick(event: MouseEvent): void {
    if (this.closeOnOverlayClick && event.target === event.currentTarget) {
      this.close();
    }
  }
}