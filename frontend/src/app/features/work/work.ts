import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlakeDataService, BlakeWork, BlakeCopy } from '../../core/services/blake-data.service';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-work',
  imports: [CommonModule, RouterLink, LoadingSpinner],
  templateUrl: './work.html',
  styleUrl: './work.scss',
})
export class Work implements OnInit {
  private route = inject(ActivatedRoute);
  private blakeData = inject(BlakeDataService);

  work: BlakeWork | null = null;
  copies: BlakeCopy[] = [];
  loading = true;
  error: string | null = null;
  workId: string = '';

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.workId = params['workId'];
      this.loadWork();
    });
  }

  private loadWork() {
    this.loading = true;
    this.error = null;

    this.blakeData.getWork(this.workId).subscribe({
      next: (work) => {
        this.work = work;
        this.loadCopies();
      },
      error: (err) => {
        this.error = 'Failed to load work information.';
        this.loading = false;
        console.error('Error loading work:', err);
      }
    });
  }

  private loadCopies() {
    this.blakeData.getWorkCopies(this.workId).subscribe({
      next: (copies) => {
        this.copies = copies;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading copies:', err);
        this.loading = false;
      }
    });
  }

  getMediumLabel(): string {
    if (!this.work?.medium) return '';

    const mediumMap: { [key: string]: string } = {
      'illbk': 'Illuminated Book',
      'cbi': 'Commercial Book Illustration',
      'spri': 'Separate Print',
      'mono': 'Monotype',
      'draw': 'Drawing',
      'paint': 'Painting',
      'ms': 'Manuscript',
      'rmpage': 'Related Material'
    };

    return mediumMap[this.work.medium] || this.work.medium;
  }

  getCopyCountText(): string {
    const count = this.copies.length;
    return count === 1 ? '1 copy' : `${count} copies`;
  }
}
