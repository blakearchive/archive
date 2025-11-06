import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlakeDataService, BlakeObject } from '../../core/services/blake-data.service';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';

type ViewTab = 'image' | 'transcription' | 'info' | 'notes';

@Component({
  selector: 'app-object',
  imports: [CommonModule, RouterLink, LoadingSpinner],
  templateUrl: './object.html',
  styleUrl: './object.scss',
})
export class Object implements OnInit {
  private route = inject(ActivatedRoute);
  private blakeData = inject(BlakeDataService);

  object: BlakeObject | null = null;
  loading = true;
  error: string | null = null;
  descId: string = '';

  // View state
  activeTab: ViewTab = 'image';

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.descId = params['descId'];
      this.loadObject();
    });
  }

  private loadObject() {
    this.loading = true;
    this.error = null;

    this.blakeData.getObject(this.descId).subscribe({
      next: (object) => {
        this.object = object;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load object information.';
        this.loading = false;
        console.error('Error loading object:', err);
      }
    });
  }

  setActiveTab(tab: ViewTab) {
    this.activeTab = tab;
  }

  getImageUrl(): string {
    if (!this.object) return '';
    // This would need to be configured based on your image storage
    // For now, return a placeholder
    return `/static/img/${this.object.full_object_id || this.descId}.jpg`;
  }

  hasTranscription(): boolean {
    return !!this.object?.text_transcription;
  }

  hasDescription(): boolean {
    return !!this.object?.illustration_description;
  }
}
