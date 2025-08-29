import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-exhibit',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="exhibit-container">
      <div *ngIf="exhibitId" class="exhibit-content">
        <h1>Exhibit: {{ exhibitId }}</h1>
        <div class="exhibit-body">
          <!-- Exhibit content would be loaded here -->
          <p>Loading exhibit content...</p>
          <!-- TODO: Implement exhibit display logic -->
        </div>
      </div>
      
      <div *ngIf="!exhibitId" class="no-exhibit">
        <h2>Exhibit Not Found</h2>
        <p>The requested exhibit could not be found.</p>
      </div>
    </div>
  `,
  styles: [`
    .exhibit-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
      min-height: 400px;
    }
    
    .exhibit-content h1 {
      color: #333;
      margin-bottom: 30px;
    }
    
    .exhibit-body {
      line-height: 1.6;
      color: #555;
    }
    
    .no-exhibit {
      text-align: center;
      margin-top: 100px;
    }
    
    .no-exhibit h2 {
      color: #e74c3c;
      margin-bottom: 20px;
    }
  `]
})
export class ExhibitComponent implements OnInit, OnDestroy {
  exhibitId: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.exhibitId = params['exhibitId'];
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}