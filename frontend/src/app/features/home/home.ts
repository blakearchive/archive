import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BlakeDataService } from '../../core/services/blake-data.service';

interface FeaturedWork {
  bad_id: string;
  title: string;
  column?: number;
  [key: string]: any;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent implements OnInit {
  private blakeData = inject(BlakeDataService);

  featuredWorks: FeaturedWork[] = [];
  columns = {
    1: { topOffset: '-90px' },
    2: { topOffset: '-20px' },
    3: { topOffset: '-90px' },
    4: { topOffset: '-20px' },
    5: { topOffset: '-90px' },
    6: { topOffset: '-20px' },
  };

  ngOnInit() {
    this.loadFeaturedWorks();
  }

  private loadFeaturedWorks() {
    this.blakeData.getFeaturedWorks().subscribe({
      next: (results: FeaturedWork[]) => {
        let i = 0;
        let sci = 1;
        const used: string[] = [];

        results.forEach(value => {
          // Fix encoding issue
          if (value.title === 'LaocoÃ¶n') {
            value.title = 'Laocoön';
          }

          if (!used.includes(value.bad_id)) {
            used.push(value.bad_id);
            value.column = sci;
            if (++i === 3) {
              ++sci;
              i = 0;
            }
          }
        });

        this.featuredWorks = results;
      },
      error: (error) => {
        console.error('Failed to load featured works:', error);
      }
    });
  }

  // Handle parallax scrolling (to be implemented with scroll directive)
  onScroll(scrollOffset: number) {
    this.columns[1].topOffset = `${-90 - scrollOffset * 0.2}px`;
    this.columns[2].topOffset = `${-20 - scrollOffset * 0.4}px`;
    this.columns[3].topOffset = `${-90 - scrollOffset * 0.14}px`;
    this.columns[4].topOffset = `${-20 - scrollOffset * 0.4}px`;
    this.columns[5].topOffset = `${-90 - scrollOffset * 0.5}px`;
    this.columns[6].topOffset = `${-20 - scrollOffset * 0.3}px`;
  }
}
