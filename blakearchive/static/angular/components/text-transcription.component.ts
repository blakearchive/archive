import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-text-transcription',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="hasMarkupText() && object?.copy_bad_id === 'bb49.a'" 
         class="tei-wrapper" 
         [innerHTML]="getHighlightedText()" 
         style="width:790px">
    </div>
    <div *ngIf="hasMarkupText() && object?.copy_bad_id !== 'bb49.a'" 
         class="tei-wrapper" 
         [innerHTML]="getHighlightedText()">
    </div>
    <div *ngIf="!hasMarkupText()" class="tei-wrapper">
      [There is no transcription for this object.]
    </div>
    <p *ngIf="hasColorKeyMarkup(object?.markup_text)">
      <a href="#" (click)="colorKeyOpen('lg')">Color key for transcriptions</a>
    </p>
  `
})
export class TextTranscriptionComponent implements OnInit {
  @Input() object: any;
  @Input() objectId: string | null = null;
  @Input() highlight?: string;

  ngOnInit(): void {
    // Component initialization
  }

  hasMarkupText(): boolean {
    return !!(this.object?.markup_text && this.object.markup_text.trim());
  }

  getHighlightedText(): string {
    if (!this.object?.markup_text) {
      return '';
    }

    let text = this.object.markup_text;
    
    // Apply highlight filter (simplified version)
    if (this.highlight && this.highlight.trim()) {
      const highlightTerms = this.highlight.split(' ').filter(term => term.trim());
      highlightTerms.forEach(term => {
        const regex = new RegExp(`(${this.escapeRegExp(term)})`, 'gi');
        text = text.replace(regex, '<mark>$1</mark>');
      });
    }
    
    return text;
  }

  hasColorKeyMarkup(markupText?: string): boolean {
    if (!markupText) return false;
    
    // Check for color key indicators in markup
    const colorKeyIndicators = [
      'class="add"',
      'class="del"', 
      'class="hi"',
      'class="unclear"',
      'class="gap"'
    ];
    
    return colorKeyIndicators.some(indicator => markupText.includes(indicator));
  }

  colorKeyOpen(size: string): void {
    // Open color key modal
    // This would integrate with your modal service
    console.log(`Opening color key modal with size: ${size}`);
    
    // For now, just log - you'd implement modal opening here
    // Example: this.modalService.open(ColorKeyModalComponent, { size });
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}