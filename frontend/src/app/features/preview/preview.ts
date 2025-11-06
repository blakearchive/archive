import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BlakeDataService, BlakePreview } from '../../core/services/blake-data.service';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-preview',
  imports: [CommonModule, LoadingSpinner],
  templateUrl: './preview.html',
  styleUrl: './preview.scss',
})
export class Preview implements OnInit {
  private route = inject(ActivatedRoute);
  private blakeData = inject(BlakeDataService);

  preview: BlakePreview | null = null;
  loading = true;
  error: string | null = null;

  ngOnInit() {
    this.route.params.subscribe(params => {
      const previewId = params['previewId'];
      this.loadPreview(previewId);
    });
  }

  private loadPreview(previewId: string) {
    this.loading = true;
    this.error = null;

    this.blakeData.getPreview(previewId).subscribe({
      next: (preview) => {
        this.preview = preview;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load preview.';
        this.loading = false;
        console.error('Error loading preview:', err);
      }
    });
  }
}
