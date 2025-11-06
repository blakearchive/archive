import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BlakeDataService, BlakeExhibit } from '../../core/services/blake-data.service';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-exhibit',
  imports: [CommonModule, LoadingSpinner],
  templateUrl: './exhibit.html',
  styleUrl: './exhibit.scss',
})
export class Exhibit implements OnInit {
  private route = inject(ActivatedRoute);
  private blakeData = inject(BlakeDataService);

  exhibit: BlakeExhibit | null = null;
  loading = true;
  error: string | null = null;

  ngOnInit() {
    this.route.params.subscribe(params => {
      const exhibitId = params['exhibitId'];
      this.loadExhibit(exhibitId);
    });
  }

  private loadExhibit(exhibitId: string) {
    this.loading = true;
    this.error = null;

    this.blakeData.getExhibit(exhibitId).subscribe({
      next: (exhibit) => {
        this.exhibit = exhibit;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load exhibit.';
        this.loading = false;
        console.error('Error loading exhibit:', err);
      }
    });
  }
}
