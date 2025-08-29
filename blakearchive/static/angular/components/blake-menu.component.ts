import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LightboxService } from '../services/lightbox.service';
import { CartItem } from '../services/cart-storage.service';

@Component({
  selector: 'app-blake-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav 
      class="navbar navbar-default navbar-fixed-top"
      [class.menu-open]="worksNavState"
      [class.menu-closed]="!worksNavState"
    >
      <!-- Site Header -->
      <div class="site-header-container">
        <div class="container-fluid site-header">
          <!-- Brand/Logo -->
          <a class="navbar-brand" [routerLink]="showmePage ? null : '/'">
            <span class="name">The William Blake Archive</span>
            <span class="sig"></span>
          </a>
          
          <!-- Display Mode Indicators -->
          <span 
            *ngIf="persistentmode === 'gallery' && !showmePage" 
            class="gr-display"
          >
            GALLERY MODE
          </span>
          <span 
            *ngIf="persistentmode === 'reading' && !showmePage" 
            class="gr-display"
          >
            READING MODE
          </span>
          <span 
            *ngIf="showmePage && showmeType === 'text'" 
            class="gr-display"
          >
            DIPLOMATIC TRANSCRIPTION
          </span>
          <span 
            *ngIf="showmePage && showmeType === 'desc'" 
            class="gr-display"
          >
            ILLUSTRATION DESCRIPTION
          </span>
          <span 
            *ngIf="showmePage && showmeType === 'note'" 
            class="gr-display"
          >
            EDITORS' NOTES
          </span>
          <span 
            *ngIf="showmePage && showmeType === 'enlargement'" 
            class="gr-display"
          >
            ENLARGEMENT
          </span>
          <span 
            *ngIf="showmePage && showmeType === 'truesize'" 
            class="gr-display"
          >
            TRUE SIZE
          </span>
          
          <!-- Menu Toggle Button -->
          <button 
            type="button"
            class="collapse-archive"
            [class.hidden]="showmePage"
            [class.menu-open]="worksNavState"
            [class.menu-closed]="!worksNavState"
            [title]="worksNavState ? 'Close Table of Contents' : 'Open Table of Contents'"
            (click)="toggleWorksNav()"
          >
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          
          <!-- Lightbox/Cart -->
          <div 
            class="lightbox hidden-xs" 
            [class.hidden]="showmePage"
          >
            <a 
              class="lb-amount black-tooltip-arrow" 
              routerLink="/lightbox"
              target="_lightbox"
              title="Open Lightbox"
            >
              <span class="cart-count">{{ cartItems.length }}</span>
            </a>
            <a 
              class="clear-cart-link black-tooltip-arrow" 
              title="Clear Lightbox"
              (click)="clearCart()"
            >
              X
            </a>
          </div>
          
          <!-- Work Title (placeholder for work-title component) -->
          <div *ngIf="showWorkTitle" class="work-title-placeholder">
            <!-- TODO: Convert work-title directive -->
            <span class="work-title">{{ workTitleText }}</span>
          </div>
        </div>
      </div>
      
      <!-- Sub Navigation -->
      <nav 
        class="navbar navbar-default sub-nav" 
        role="navigation" 
        [class.hidden]="showmePage"
      >
        <div class="container-fluid">
          <!-- View Sub Menu (placeholder) -->
          <div class="view-sub-menu-placeholder" [class.hidden]="showmePage">
            <!-- TODO: Convert view-sub-menu directive -->
          </div>
          
          <!-- Search Box -->
          <app-search-box></app-search-box>
          
          <!-- Nav Menu (placeholder) -->
          <div class="nav-menu-placeholder">
            <!-- TODO: Convert nav-menu directive -->
            <ul class="nav navbar-nav">
              <li><a routerLink="/">Home</a></li>
              <li><a routerLink="/search">Search</a></li>
              <li><a routerLink="/lightbox">Lightbox</a></li>
            </ul>
          </div>
        </div>
      </nav>
      
      <!-- DPI Component (placeholder) -->
      <div 
        *ngIf="shouldShowDPI()" 
        class="dpi-placeholder"
      >
        <!-- TODO: Convert dpi directive -->
      </div>
    </nav>
  `,
  styles: [`
    .navbar-fixed-top {
      position: fixed;
      top: 0;
      right: 0;
      left: 0;
      z-index: 1030;
      transition: all 0.3s ease;
    }
    
    .site-header-container {
      background-color: #2c3e50;
      border-bottom: 1px solid #34495e;
    }
    
    .site-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 15px;
      min-height: 60px;
    }
    
    .navbar-brand {
      display: flex;
      align-items: center;
      color: #ecf0f1 !important;
      text-decoration: none;
      font-size: 18px;
      font-weight: bold;
    }
    
    .navbar-brand:hover {
      color: #fff !important;
      text-decoration: none;
    }
    
    .navbar-brand .name {
      margin-right: 10px;
    }
    
    .navbar-brand .sig {
      width: 20px;
      height: 20px;
      background: #3498db;
      border-radius: 50%;
    }
    
    .gr-display {
      color: #f39c12;
      font-weight: bold;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .collapse-archive {
      display: flex;
      flex-direction: column;
      justify-content: center;
      width: 40px;
      height: 40px;
      padding: 8px;
      background: transparent;
      border: 2px solid #34495e;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .collapse-archive:hover {
      background-color: #34495e;
      border-color: #3498db;
    }
    
    .collapse-archive.menu-open {
      background-color: #3498db;
      border-color: #3498db;
    }
    
    .icon-bar {
      display: block;
      width: 22px;
      height: 2px;
      background-color: #ecf0f1;
      margin: 2px 0;
      transition: all 0.3s ease;
    }
    
    .collapse-archive.menu-open .icon-bar:nth-child(2) {
      transform: rotate(45deg) translate(5px, 5px);
    }
    
    .collapse-archive.menu-open .icon-bar:nth-child(3) {
      opacity: 0;
    }
    
    .collapse-archive.menu-open .icon-bar:nth-child(4) {
      transform: rotate(-45deg) translate(7px, -6px);
    }
    
    .lightbox {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .lb-amount {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 35px;
      height: 35px;
      background-color: #e74c3c;
      color: white;
      text-decoration: none;
      border-radius: 50%;
      font-weight: bold;
      transition: all 0.2s ease;
    }
    
    .lb-amount:hover {
      background-color: #c0392b;
      color: white;
      text-decoration: none;
      transform: scale(1.1);
    }
    
    .cart-count {
      font-size: 14px;
    }
    
    .clear-cart-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 25px;
      height: 25px;
      background-color: #95a5a6;
      color: white;
      text-decoration: none;
      border-radius: 50%;
      font-size: 12px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .clear-cart-link:hover {
      background-color: #7f8c8d;
      color: white;
      text-decoration: none;
      transform: scale(1.1);
    }
    
    .work-title-placeholder {
      color: #ecf0f1;
      font-size: 16px;
    }
    
    .sub-nav {
      background-color: #34495e;
      border: none;
      margin: 0;
      border-radius: 0;
    }
    
    .view-sub-menu-placeholder,
    .nav-menu-placeholder {
      display: inline-block;
      margin: 0 15px;
    }
    
    .nav-menu-placeholder .nav {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
    }
    
    .nav-menu-placeholder .nav li {
      margin-right: 20px;
    }
    
    .nav-menu-placeholder .nav a {
      color: #bdc3c7;
      text-decoration: none;
      padding: 10px 0;
      display: block;
      transition: color 0.2s ease;
    }
    
    .nav-menu-placeholder .nav a:hover {
      color: #ecf0f1;
    }
    
    .hidden {
      display: none !important;
    }
    
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
      .site-header {
        padding: 5px 10px;
      }
      
      .navbar-brand {
        font-size: 16px;
      }
      
      .gr-display {
        font-size: 12px;
      }
      
      .collapse-archive {
        width: 35px;
        height: 35px;
      }
    }
    
    /* Animation classes */
    .menu-open {
      /* Add menu open animations if needed */
    }
    
    .menu-closed {
      /* Add menu closed animations if needed */
    }
    
    /* Black tooltip arrow styling */
    .black-tooltip-arrow {
      position: relative;
    }
    
    .black-tooltip-arrow:hover::after {
      content: attr(title);
      position: absolute;
      bottom: -30px;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 5px 8px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 1000;
    }
  `]
})
export class BlakeMenuComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  worksNavState: boolean = false;
  showmePage: boolean = false;
  persistentmode: string = 'gallery';
  showWorkTitle: boolean = false;
  workTitleText: string = '';
  showmeType: string = '';
  help: string = '';

  private destroy$ = new Subject<void>();

  constructor(private lightboxService: LightboxService) {}

  ngOnInit(): void {
    // Load cart items
    this.loadCartItems();
    
    // Set up global state watching
    this.watchGlobalState();
    
    // Listen for storage changes
    this.setupStorageListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load cart items from lightbox service
   */
  private loadCartItems(): void {
    this.lightboxService.listCartItems().subscribe({
      next: (items) => {
        this.cartItems = items;
        
        // Update global rootScope for AngularJS compatibility
        const $rootScope = (window as any).$rootScope || {};
        $rootScope.cartItems = items;
      },
      error: (error) => {
        console.error('Error loading cart items:', error);
      }
    });
  }

  /**
   * Watch global state for AngularJS compatibility
   */
  private watchGlobalState(): void {
    // Poll for global state changes (not ideal, but needed for hybrid)
    setInterval(() => {
      const $rootScope = (window as any).$rootScope;
      if ($rootScope) {
        this.worksNavState = $rootScope.worksNavState || false;
        this.showmePage = $rootScope.showmePage || false;
        this.persistentmode = $rootScope.persistentmode || 'gallery';
        this.showWorkTitle = $rootScope.showWorkTitle || false;
        this.showmeType = $rootScope.showmeType || '';
        this.help = $rootScope.help || '';
      }
    }, 100);
  }

  /**
   * Set up storage listener for cart changes
   */
  private setupStorageListener(): void {
    fromEvent(window, 'storage')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: any) => {
        if (event.key === 'cart-item-added') {
          // Reload cart items when new items are added
          this.loadCartItems();
        }
      });
  }

  /**
   * Toggle works navigation state
   */
  toggleWorksNav(): void {
    this.worksNavState = !this.worksNavState;
    
    // Update global state for AngularJS compatibility
    const $rootScope = (window as any).$rootScope || {};
    $rootScope.worksNavState = this.worksNavState;
  }

  /**
   * Clear the cart
   */
  clearCart(): void {
    this.lightboxService.clearCart().subscribe({
      next: () => {
        this.cartItems = [];
        
        // Update global state
        const $rootScope = (window as any).$rootScope || {};
        $rootScope.cartItems = [];
        
        console.log('Cart cleared');
      },
      error: (error) => {
        console.error('Error clearing cart:', error);
      }
    });
  }

  /**
   * Check if DPI component should be shown
   */
  shouldShowDPI(): boolean {
    return (
      this.help !== 'exhibit' &&
      this.help !== 'preview' &&
      this.help !== 'home' &&
      this.help !== 'work' &&
      this.help !== 'static' &&
      this.help !== 'search' &&
      this.showmeType !== 'text' &&
      this.showmeType !== 'desc' &&
      this.showmeType !== 'note' &&
      this.showmeType !== 'enlargement'
    );
  }
}