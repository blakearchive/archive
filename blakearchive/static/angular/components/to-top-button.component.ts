import { Component, ElementRef, OnInit, OnDestroy, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: '[appToTopButton]',
  template: ''
})
export class ToTopButtonComponent implements OnInit, OnDestroy {
  private scrollListener?: () => void;

  constructor(
    private elementRef: ElementRef,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit() {
    this.scrollListener = () => {
      if (window.pageYOffset > 50) {
        this.elementRef.nativeElement.classList.add('scrolling');
      } else {
        this.elementRef.nativeElement.classList.remove('scrolling');
      }
    };

    window.addEventListener('scroll', this.scrollListener);
  }

  ngOnDestroy() {
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
  }
}