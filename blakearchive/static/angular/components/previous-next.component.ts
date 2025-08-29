import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchService } from '../services/search.service';

@Component({
  selector: 'app-previous-next',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- previous/next controls -->
    <div class="object-controls" *ngIf="results.length > 1">
        <a class="left carousel-control" 
           role="button" 
           *ngIf="showLeft()"
           (click)="previousResult()">
            <span class="glyphicon glyphicon-chevron-left"></span>
            <span class="sr-only">Previous</span>
        </a>
        <a class="right carousel-control" 
           role="button" 
           *ngIf="showRight()"
           (click)="nextResult()">
            <span class="glyphicon glyphicon-chevron-right"></span>
            <span class="sr-only">Next</span>
        </a>
    </div>
  `
})
export class PreviousNextComponent implements OnInit {
  @Input() results: any[] = [];
  @Input() type: string = '';

  get searchState() {
    return this.searchService.currentState;
  }

  constructor(private searchService: SearchService) {}

  ngOnInit(): void {
    // Component initialization
  }

  showLeft(): boolean {
    return this.searchState.selectedWork > 0;
  }

  showRight(): boolean {
    return this.searchState.selectedWork < (this.results.length - 1);
  }

  previousResult(): void {
    // Will need to implement proper navigation method
    // this.searchService.previousResult(this.type, this.results);
    console.log('Previous result clicked');
  }

  nextResult(): void {
    // Will need to implement proper navigation method
    // this.searchService.nextResult(this.type, this.results);
    console.log('Next result clicked');
  }
}