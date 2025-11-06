import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-staticpage',
  imports: [CommonModule, LoadingSpinner],
  templateUrl: './staticpage.html',
  styleUrl: './staticpage.scss',
})
export class Staticpage implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  content: string | null = null;
  pageTitle: string = '';
  loading = true;
  error: string | null = null;

  ngOnInit() {
    this.route.params.subscribe(params => {
      const pageName = params['initialPage'];
      this.loadStaticPage(pageName);
    });
  }

  private loadStaticPage(pageName: string) {
    this.loading = true;
    this.error = null;
    this.pageTitle = this.formatPageTitle(pageName);

    // Load static HTML content from the Flask backend
    this.http.get(`/static/html/${pageName}.html`, { responseType: 'text' }).subscribe({
      next: (html) => {
        this.content = html;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load page content.';
        this.loading = false;
        console.error('Error loading static page:', err);
      }
    });
  }

  private formatPageTitle(pageName: string): string {
    return pageName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
