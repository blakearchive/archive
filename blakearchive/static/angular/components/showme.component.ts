import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-showme',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="showme-container">
      <div class="showme-content">
        <h1>Show Me: {{ what }}</h1>
        <div *ngIf="copyId" class="copy-info">
          <h3>Copy ID: {{ copyId }}</h3>
        </div>
        
        <div class="content-area">
          <div *ngIf="what === 'truesize'" class="truesize-view">
            <p>True size view for copy {{ copyId }}</p>
            <!-- TODO: Implement true size display -->
          </div>
          
          <div *ngIf="what !== 'truesize'" class="general-view">
            <p>Displaying {{ what }} for copy {{ copyId }}</p>
            <!-- TODO: Implement other view types -->
          </div>
        </div>
        
        <div class="controls">
          <button type="button" class="btn btn-secondary" (click)="closeWindow()">
            Close Window
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .showme-container {
      padding: 20px;
      min-height: 100vh;
      background: #f8f9fa;
    }
    
    .showme-content {
      max-width: 1000px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .showme-content h1 {
      color: #333;
      margin-bottom: 20px;
      text-align: center;
    }
    
    .copy-info {
      background: #e9ecef;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
    
    .copy-info h3 {
      color: #495057;
      margin: 0;
    }
    
    .content-area {
      min-height: 400px;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      padding: 20px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .truesize-view {
      text-align: center;
    }
    
    .general-view {
      text-align: center;
    }
    
    .controls {
      text-align: center;
    }
    
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    
    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }
    
    .btn:hover {
      opacity: 0.9;
    }
  `]
})
export class ShowmeComponent implements OnInit, OnDestroy {
  what: string | null = null;
  copyId: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.what = params['what'];
        this.copyId = params['copyId'];
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Close the current window
   */
  closeWindow(): void {
    window.close();
  }
}