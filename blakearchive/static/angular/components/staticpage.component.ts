import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-staticpage',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="staticpage-container">
      <div *ngIf="initialPage" class="page-content">
        <h1>{{ pageTitle }}</h1>
        <div class="page-body">
          <!-- Static page content would be loaded here -->
          <p>Loading page: {{ initialPage }}</p>
          <!-- TODO: Implement dynamic page content loading -->
        </div>
      </div>
      
      <div *ngIf="!initialPage" class="no-page">
        <h2>Page Not Found</h2>
        <p>The requested page could not be found.</p>
      </div>
    </div>
  `,
  styles: [`
    .staticpage-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
      min-height: 400px;
    }
    
    .page-content h1 {
      color: #333;
      margin-bottom: 30px;
      border-bottom: 2px solid #007bff;
      padding-bottom: 10px;
    }
    
    .page-body {
      line-height: 1.6;
      color: #555;
    }
    
    .no-page {
      text-align: center;
      margin-top: 100px;
    }
    
    .no-page h2 {
      color: #e74c3c;
      margin-bottom: 20px;
    }
  `]
})
export class StaticpageComponent implements OnInit, OnDestroy {
  initialPage: string | null = null;
  pageTitle: string = '';

  private destroy$ = new Subject<void>();

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Get initial page from route parameters
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.initialPage = params['initialPage'];
        this.pageTitle = this.formatPageTitle(this.initialPage);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Format page title from route parameter
   */
  private formatPageTitle(page: string | null): string {
    if (!page) return 'Page Not Found';
    
    return page
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}