import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';

// Import all components that might be used in templates
import { ToTopButtonComponent } from './components/to-top-button.component';
import { BlakeMenuComponent } from './components/blake-menu.component';
import { SearchBoxComponent } from './components/search-box.component';
import { ModalComponent } from './components/modal.component';
import { HandprintBlockComponent } from './components/handprint-block.component';
import { TextTranscriptionComponent } from './components/text-transcription.component';
import { ErrorDisplayComponent } from './components/error-display.component';

// Import directives
import { ScrollToTopDirective } from './directives/scroll-to-top.directive';
import { AutoWidthDirective } from './directives/auto-width.directive';
import { TwitterShareDirective } from './directives/twitter-share.directive';
import { AffixDirective } from './directives/affix.directive';
import { ResizeDirective } from './directives/resize.directive';
import { ParallaxDirective } from './directives/parallax.directive';
import { ScrollToElementDirective } from './directives/scroll-to-element.directive';
import { AutoHeightDirective } from './directives/auto-height.directive';
import { LeftOnBroadcastDirective } from './directives/left-on-broadcast.directive';
import { ToTopOnBroadcastDirective } from './directives/to-top-on-broadcast.directive';
import { MagnifyImageDirective } from './directives/magnify-image.directive';
import { ShowMeDirective } from './directives/show-me.directive';
import { ToTopButtonDirective } from './directives/to-top-button.directive';
import { OvpImageDirective } from './directives/ovp-image.directive';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    ToTopButtonComponent,
    BlakeMenuComponent,
    SearchBoxComponent,
    ModalComponent,
    HandprintBlockComponent,
    TextTranscriptionComponent,
    ErrorDisplayComponent,
    ScrollToTopDirective,
    AutoWidthDirective,
    TwitterShareDirective,
    AffixDirective,
    ResizeDirective,
    ParallaxDirective,
    ScrollToElementDirective,
    AutoHeightDirective,
    LeftOnBroadcastDirective,
    ToTopOnBroadcastDirective,
    MagnifyImageDirective,
    ShowMeDirective,
    ToTopButtonDirective,
    OvpImageDirective
  ],
  template: `
    <div class="blake-app">
      <!-- Main navigation -->
      <app-blake-menu></app-blake-menu>
      
      <!-- Main content area -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      
      <!-- Footer -->
      <div class="container" [class.hidden]="showmePage">
        <footer>
          <br>
          <div class="row">
            <div class="span12 text-center" style="margin-left:5px;">
              <ul class="list-unstyled list-inline" id="external-links">
                <li class="hidden-xs">|</li>
                <li><a href="https://blake-frontend-grantg.apps.cloudapps.unc.edu/" target="_blank">BIBLIOGRAPHY</a></li>
                <li class="hidden-xs">|</li>
                <li><a href="https://blog.blakearchive.org" target="_blank">BLOG</a></li>
                <li class="hidden-xs">|</li>
                <li><span style="color:rgba(233,188,71,1)">BLAKE / AN ILLUSTRATED QUARTERLY: </span><a href="https://blake.lib.rochester.edu/blakeojs/index.php/blake" target="_blank">Current</a><span style="color:rgba(233,188,71,1)">;</span> <a href="https://bq.blakearchive.org" target="_blank">Issue Archive</a></li>
                <li class="hidden-xs">|</li>
                <li><a href="https://erdman.blakearchive.org" target="_blank"><span class="hidden-xs hidden-sm">THE COMPLETE POETRY AND PROSE OF WILLIAM BLAKE, ED. </span>ERDMAN</a></li>
                <li class="hidden-xs">|</li>
              </ul>
            </div>
          </div>
          
          <br>
          
          <div class="row">
            <div class="span12 text-center">
              <ul class="nav nav-pills">
                <li><a routerLink="/staticpage/update">What's New?</a></li>
                <li><a routerLink="/staticpage/biography">About Blake</a></li>
                <li><a routerLink="/staticpage/resources" [queryParams]="{p: 'collectionlists'}">Collection Lists</a></li>
                <li><a routerLink="/staticpage/archiveataglance">About the Archive</a></li>
                <li><a routerLink="/staticpage/permissionsNEW">Copyright and Permissions</a></li>
                <li><a routerLink="/staticpage/comment">Contact the Archive</a></li>
                <li><a routerLink="/staticpage/relatedsites">Related Sites</a></li>
              </ul>
            </div>
          </div>
          
          <hr>
          
          <div class="row">
            <div class="col-sm-12 col-md-7 subscribe">
              <form class="form-inline" role="form" action="https://lists.unc.edu/subscribe/subscribe.tml" method="POST">
                <div class="form-group">
                  <div class="input-group">
                    <label class="sr-only" for="inputEmail">Subscribe</label>
                    <input type="email" class="form-control" id="inputEmail" name="email" placeholder="Enter email address.">
                    <input type="hidden" name="list" value="blake-update">
                    <input type="hidden" name="confirm" value="one">
                    <input type="hidden" name="showconfirm" value="T">
                    <input type="hidden" name="url" value="https://www.blakearchive.org/">
                  </div>
                </div>
                <button type="submit" class="btn btn-default">Subscribe</button>
                <p style="color:rgba(233,188,71,1)"> to The William Blake Archive Newsletter.</p>
              </form>
            </div>
            
            <div class="col-sm-12 col-md-5 copyright" style="text-align: right">
              <p>© Copyright 2024, The William Blake Archive<br></p>
              <p><a href="https://www.instagram.com/williamblakearchive" target="_blank" style="font-size:14px;color:rgb(98, 98, 98)"><img src="images/instagram.png" style="width:30px"> Follow us on Instagram</a></p>
            </div>
          </div>
        </footer>
      </div>
      
      <!-- Footer and utility components -->
      <app-to-top-button></app-to-top-button>
      
      <!-- Modal container -->
      <app-modal></app-modal>
      
      <!-- Global error display -->
      <app-error-display></app-error-display>
    </div>
  `,
  styles: [`
    .blake-app {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .main-content {
      flex: 1;
      padding-top: 60px; /* Account for fixed navigation */
    }
    
    @media (max-width: 768px) {
      .main-content {
        padding-top: 50px;
      }
    }
  `]
})
export class AppComponent {
  title = 'Blake Archive';
  showmePage = false; // Property to control footer visibility
}