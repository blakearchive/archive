import { Directive, ElementRef, OnInit, Inject } from '@angular/core';
import { Location } from '@angular/common';

@Directive({
  selector: '[twitterShare]',
  standalone: true
})
export class TwitterShareDirective implements OnInit {
  
  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private location: Location
  ) {}

  ngOnInit(): void {
    // Make current location available for sharing
    const element = this.elementRef.nativeElement;
    const currentPath = this.location.path();
    
    // Add data attribute for current location
    element.setAttribute('data-current-path', currentPath);
    
    // If element doesn't have specific sharing logic, we can add it here
    // For now, just store the current path for Twitter sharing functionality
  }

  /**
   * Get current location path for Twitter sharing
   * @returns Current route path
   */
  getCurrentLocation(): string {
    return this.location.path();
  }

  /**
   * Generate Twitter share URL
   * @param text - Tweet text
   * @param url - URL to share (optional, defaults to current location)
   * @returns Twitter share URL
   */
  generateTwitterShareUrl(text: string, url?: string): string {
    const shareUrl = url || `${window.location.origin}${this.location.path()}`;
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(shareUrl);
    
    return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
  }

  /**
   * Open Twitter share dialog
   * @param text - Tweet text
   * @param url - URL to share (optional)
   */
  shareOnTwitter(text: string, url?: string): void {
    const twitterUrl = this.generateTwitterShareUrl(text, url);
    const width = 550;
    const height = 420;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    window.open(
      twitterUrl,
      'TwitterShare',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  }
}