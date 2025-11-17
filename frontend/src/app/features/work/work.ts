import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlakeDataService, BlakeWork, BlakeCopy } from '../../core/services/blake-data.service';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';
import { BaseComponent } from '../../core/base/base-component';
import { getMediumLabel } from '../../core/models/blake.models';

@Component({
  selector: 'app-work',
  imports: [CommonModule, RouterLink, LoadingSpinner],
  templateUrl: './work.html',
  styleUrl: './work.scss',
})
export class Work extends BaseComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private blakeData = inject(BlakeDataService);

  work: BlakeWork | null = null;
  copies: BlakeCopy[] = [];
  workId: string = '';

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.workId = params['workId'];
      this.loadWork();
    });
  }

  private loadWork() {
    this.loadData(
      this.blakeData.getWork(this.workId),
      (work) => {
        this.work = work;
        this.loadCopies();
      }
    );
  }

  private loadCopies() {
    this.blakeData.getWorkCopies(this.workId).subscribe({
      next: (copies) => {
        this.copies = copies;
        this.setLoading(false);
      },
      error: (err) => {
        this.logError(err, 'loadCopies');
        this.setLoading(false);
      }
    });
  }

  getMediumLabel(): string {
    return getMediumLabel(this.work?.medium);
  }

  getCopyCountText(): string {
    const count = this.copies.length;
    return count === 1 ? '1 copy' : `${count} copies`;
  }
}
