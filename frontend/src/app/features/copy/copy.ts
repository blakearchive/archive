import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlakeDataService, BlakeCopy, BlakeObject } from '../../core/services/blake-data.service';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-copy',
  imports: [CommonModule, RouterLink, LoadingSpinner],
  templateUrl: './copy.html',
  styleUrl: './copy.scss',
})
export class Copy implements OnInit {
  private route = inject(ActivatedRoute);
  private blakeData = inject(BlakeDataService);

  copy: BlakeCopy | null = null;
  objects: BlakeObject[] = [];
  loading = true;
  error: string | null = null;
  copyId: string = '';

  // View mode for objects display
  viewMode: 'grid' | 'list' = 'grid';

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.copyId = params['copyId'];
      this.loadCopy();
    });
  }

  private loadCopy() {
    this.loading = true;
    this.error = null;

    this.blakeData.getCopy(this.copyId).subscribe({
      next: (copy) => {
        this.copy = copy;
        this.loadObjects();
      },
      error: (err) => {
        this.error = 'Failed to load copy information.';
        this.loading = false;
        console.error('Error loading copy:', err);
      }
    });
  }

  private loadObjects() {
    this.blakeData.getCopyObjects(this.copyId).subscribe({
      next: (objects) => {
        this.objects = objects;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading objects:', err);
        this.loading = false;
      }
    });
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  getObjectCountText(): string {
    const count = this.objects.length;
    return count === 1 ? '1 object' : `${count} objects`;
  }
}
