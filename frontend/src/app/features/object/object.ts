import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlakeDataService, BlakeObject } from '../../core/services/blake-data.service';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';
import { BaseComponent } from '../../core/base/base-component';
import { getObjectImageUrl } from '../../core/utils/image.utils';

type ViewTab = 'image' | 'transcription' | 'info' | 'notes';

@Component({
  selector: 'app-object',
  imports: [CommonModule, RouterLink, LoadingSpinner],
  templateUrl: './object.html',
  styleUrl: './object.scss',
})
export class Object extends BaseComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private blakeData = inject(BlakeDataService);

  object: BlakeObject | null = null;
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
    this.loadData(
      this.blakeData.getObject(this.descId),
      (object) => {
        this.object = object;
      }
    );
  }

  setActiveTab(tab: ViewTab) {
    this.activeTab = tab;
  }

  getImageUrl(): string {
    if (!this.object) return '';
    return getObjectImageUrl(this.object);
  }

  hasTranscription(): boolean {
    return !!this.object?.text_transcription;
  }

  hasDescription(): boolean {
    return !!this.object?.illustration_description;
  }
}
