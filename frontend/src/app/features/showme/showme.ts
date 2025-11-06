import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlakeDataService, BlakeCopy, BlakeObject, BlakeWork } from '../../core/services/blake-data.service';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';

type ShowMeType = 'objects' | 'transcription' | 'comparison' | 'info';

@Component({
  selector: 'app-showme',
  imports: [CommonModule, RouterLink, LoadingSpinner],
  templateUrl: './showme.html',
  styleUrl: './showme.scss',
})
export class Showme implements OnInit {
  private route = inject(ActivatedRoute);
  private blakeData = inject(BlakeDataService);

  what: ShowMeType = 'objects';
  copyId: string = '';
  loading = true;
  error: string | null = null;

  copy: BlakeCopy | null = null;
  objects: BlakeObject[] = [];
  work: BlakeWork | null = null;

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.what = params['what'] as ShowMeType;
      this.copyId = params['copyId'];
      this.loadContent();
    });
  }

  private loadContent() {
    this.loading = true;
    this.error = null;

    this.blakeData.getCopy(this.copyId).subscribe({
      next: (copy) => {
        this.copy = copy;
        this.loadObjects();
        this.loadWork();
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
        this.error = 'Failed to load objects.';
        this.loading = false;
        console.error('Error loading objects:', err);
      }
    });
  }

  private loadWork() {
    if (this.copy?.work_id) {
      this.blakeData.getWork(this.copy.work_id).subscribe({
        next: (work) => {
          this.work = work;
        },
        error: (err) => {
          console.error('Error loading work:', err);
        }
      });
    }
  }

  getObjectImageUrl(obj: BlakeObject): string {
    return `/static/img/${obj.full_object_id || obj.desc_id}.jpg`;
  }

  getObjectThumbnailUrl(obj: BlakeObject): string {
    return `/static/img/thumbnails/${obj.full_object_id || obj.desc_id}.thumb.jpg`;
  }
}
