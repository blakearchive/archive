import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="preview-container">
      <div *ngIf="previewId" class="preview-content">
        <h1>Preview: {{ previewId }}</h1>
        <div class="preview-body">
          <!-- Preview content would be loaded here -->
          <p>Loading preview content...</p>
          <!-- TODO: Implement preview display logic -->
        </div>
      </div>
      
      <div *ngIf="!previewId" class="no-preview">
        <h2>Preview Not Found</h2>
        <p>The requested preview could not be found.</p>
      </div>
    </div>
  `,
  styles: [`
    .preview-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
      min-height: 400px;
    }
    
    .preview-content h1 {
      color: #333;
      margin-bottom: 30px;
    }
    
    .preview-body {
      line-height: 1.6;
      color: #555;
    }
    
    .no-preview {
      text-align: center;
      margin-top: 100px;
    }
    
    .no-preview h2 {
      color: #e74c3c;
      margin-bottom: 20px;
    }
  `]
})
export class PreviewComponent implements OnInit, OnDestroy {
  previewId: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.previewId = params['previewId'];
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}