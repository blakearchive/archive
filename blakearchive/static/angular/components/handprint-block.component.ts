import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface HandprintBlockData {
  link?: string;
  action?: () => void;
  header?: string;
  image?: string;
  imagePath?: string;
  title?: string;
  footer?: string;
  textmatchstrings?: string;
}

@Component({
  selector: 'handprint-block',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="handprint-block">
      <a [href]="handprint?.link || '#'" 
         (click)="handleClick()">
        <span class="handprint-header" *ngIf="handprint?.header">
          {{ handprint.header }}
        </span>
        <span class="object-img" 
              [style.background-image]="getBackgroundImage()">
          <span class="handprint-title" *ngIf="!handprint?.image && handprint?.title">
            {{ handprint.title }}
          </span>
        </span>
        <span class="description" 
              *ngIf="handprint?.footer"
              [innerHTML]="handprint.footer">
        </span>
        <span *ngIf="handprint?.textmatchstrings" 
              class="textmatchstrings" 
              [innerHTML]="handprint.textmatchstrings">
        </span>
      </a>
    </div>
  `,
  inputs: ['handprint', 'action', 'image', 'footer']
})
export class HandprintBlockComponent {
  @Input() handprint?: HandprintBlockData;
  @Input() action?: () => void;
  @Input() image?: string;
  @Input() footer?: string;

  getBackgroundImage(): string {
    if (this.image) {
      return `url(/static/img/featured/${this.image})`;
    }
    if (this.handprint?.image && this.handprint?.imagePath) {
      return `url(${this.handprint.imagePath}${this.handprint.image})`;
    }
    if (this.handprint?.image) {
      return `url(/static/img/featured/${this.handprint.image})`;
    }
    return '';
  }

  handleClick(): void {
    // Hide overlay (equivalent to $root.showOverlay = false)
    const rootScope = (window as any).$rootScope;
    if (rootScope) {
      rootScope.showOverlay = false;
    }

    // Execute action
    if (this.action) {
      this.action();
    } else if (this.handprint?.action) {
      this.handprint.action();
    }
  }
}