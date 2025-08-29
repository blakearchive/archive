// Import Angular (modern)
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { UpgradeModule } from '@angular/upgrade/static';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

// Import AngularJS libraries
import 'script-loader!jquery';
import * as angular from 'angular';
import 'angular-route';
import 'angular-sanitize';
import 'angular-animate';
import 'angular-loading-bar';
import 'angular-rangeslider';
import 'angular-cookies';
import 'angular-touch';
import 'fabric';
import 'ng-cropperjs';
import 'dexie';
import 'ng-dexie';
import 'ng-openseadragon'
import 'openseadragon'
import 'script-loader!./js/bower_components/openseadragon/built-openseadragon/openseadragon/openseadragon.min'
import './js/angular.ngStorage';
import './js/Sortable/Sortable.min';
import './js/Sortable/ng-sortable.min';
import './js/angular-ui-bootstrap/0.12.1/ui-bootstrap.min';
import './js/angular-fullscreen/angular-fullscreen.min';
import 'script-loader!./js/angular-markdown-it/markdown-it.min';
import './js/angular-markdown-it/angular-markdown-it';
import './js/angular-fabric/fabric';
import './js/angular-bind-html-compile/angular-bind-html-compile'

// Import zone.js for Angular change detection
import 'zone.js';

let directoryPrefix = '';
let carousel = angular.module('ui.bootstrap.carousel', ['ui.bootstrap.transition']);

carousel.controller('CarouselController', function ($scope, $timeout, $transition, $q) {});
carousel.directive('carousel', function () { return {} });

let blake = angular.module('blake', ['angular-bind-html-compile','ngRoute', 'ngSanitize', 'ui-rangeSlider','ui.bootstrap', 'ng-sortable', 'FBAngular','common.fabric','common.fabric.utilities','common.fabric.constants','ngAnimate', 'ngStorage','ngCookies','ngTouch','ngCropper','markdown','angular-loading-bar','ngdexie', 'ngdexie.ui','ui.openseadragon'])
//blake.constant('dexie',window.Dexie);
blake.config(function(ngDexieProvider){

  ngDexieProvider.setOptions({name: 'lightbox_db', debug: false});
  ngDexieProvider.setConfiguration(function (db) {
      db.version(1).stores({
          cartItems: "++id,url,title,caption",
          imageToCrop: "id,url,fullCaption",
          croppedImage: "id,url,fullCaption"
      });
      db.on('error', function (err) {
          // Catch all uncatched DB-related errors and exceptions
          console.log("db error err=" + err);
      });

  });
});

blake.value("directoryPrefix", directoryPrefix);

blake.config(function ($routeProvider, $locationProvider) {
    $routeProvider.when(directoryPrefix + '/', {
        templateUrl: directoryPrefix + '/static/controllers/home/home.html',
        controller: "HomeController",
        controllerAs: 'home'
    });
    $routeProvider.when(directoryPrefix + '/staticpage/:initialPage', {
        templateUrl: directoryPrefix + '/static/controllers/staticpage/staticpage.html',
        controller: "StaticpageController",
        controllerAs: 'staticpage',
        reloadOnSearch: false
    });
    $routeProvider.when(directoryPrefix + '/object/:descId', {
        templateUrl: directoryPrefix + '/static/html/object.html',
        controller: "ObjectController"
    });
    $routeProvider.when(directoryPrefix + '/copy/:copyId', {
        templateUrl: directoryPrefix + '/static/controllers/copy/copy.html',
        controller: "CopyController",
        controllerAs: 'copyCtrl',
        reloadOnSearch: false
    });

    $routeProvider.when(directoryPrefix + '/exhibit/:exhibitId', {
        templateUrl: directoryPrefix + '/static/controllers/exhibit/exhibit.html',
        controller: "ExhibitController",
        controllerAs: 'exhibitCtrl',
        reloadOnSearch: false
    });

    $routeProvider.when(directoryPrefix + '/preview/:previewId', {
        templateUrl: directoryPrefix + '/static/controllers/preview/preview.html',
        controller: "PreviewController",
        controllerAs: 'previewCtrl',
        reloadOnSearch: false
    });

    $routeProvider.when(directoryPrefix + '/new-window/:what/:copyId', {
        templateUrl: directoryPrefix + '/static/controllers/showme/showme.html',
        controller: "ShowMeController",
        controllerAs: 'showme',
        reloadOnSearch: false
    });
    $routeProvider.when(directoryPrefix + '/work/:workId', {
        templateUrl: directoryPrefix + '/static/controllers/work/work.html',
        controller: "WorkController",
        controllerAs: 'workCtrl'
    });
    $routeProvider.when(directoryPrefix + '/search/', {
        templateUrl: directoryPrefix + '/static/controllers/search/search.html',
        controller: "SearchController",
        controllerAs: 'search'
    });
    $routeProvider.when(directoryPrefix + '/lightbox', {
        templateUrl: directoryPrefix + '/static/controllers/lightbox/lightbox.html',
        controller: "LightboxController",
        controllerAs: 'Lbc',
        reloadOnSearch: false
    });
    $routeProvider.when(directoryPrefix + '/cropper/:imgUrl', {
        templateUrl: directoryPrefix + '/static/controllers/lightbox/cropper.html',
        controller: "CropperController",
        controllerAs: 'crc',
        reloadOnSearch: false
    });

    $routeProvider.otherwise({redirectTo: directoryPrefix + '/'});
    $locationProvider.html5Mode(true);
});

blake.config(function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.parentSelector = '.loading-bar-container';
});

blake.run(function ($route, $rootScope, $location) {
    let original = $location.path;
    $location.path = function (path, reload) {
        if (reload === false) {
            let lastRoute = $route.current;
            let un = $rootScope.$on('$locationChangeSuccess', function () {
                $route.current = lastRoute;
                un();
            });
        }
        return original.apply($location, [path]);
    };
});

function requireAll(r: any) { r.keys().forEach(r); }

// Declare require.context for webpack
declare const require: {
  context(path: string, deep?: boolean, filter?: RegExp): {
    keys(): string[];
    (id: string): any;
  };
};

requireAll(require.context('./services/', true, /\.js$/));
requireAll(require.context('./controllers/', true, /\.js$/));
requireAll(require.context('./directives/', true, /\.js$/));
requireAll(require.context('./filters/', true, /\.js$/));

// Import Angular services
import { WindowSizeService } from './angular/services/window-size.service';
import { FormatService } from './angular/services/format.service';
import { AlertService } from './angular/services/alert.service';
import { ImageManipulationService } from './angular/services/image-manipulation.service';
import { WorkTitleService } from './angular/services/worktitle.service';
import { CartStorageService } from './angular/services/cart-storage.service';
import { CompareObjectsService } from './angular/services/compare-objects.service';
import { SearchService } from './angular/services/search.service';
import { GenericService } from './angular/services/generic.service';
import { LightboxService } from './angular/services/lightbox.service';
import { ObjectViewerService } from './angular/services/object-viewer.service';
import { BlakeDataService } from './angular/services/blake-data.service';
import { FabricCropService } from './angular/services/fabric-crop.service';
import { BlakeWorkService } from './angular/services/blake-work.service';
import { BlakeCopyService } from './angular/services/blake-copy.service';
import { BlakeObjectService } from './angular/services/blake-object.service';
import { BlakePreviewService } from './angular/services/blake-preview.service';
import { BlakeExhibitService } from './angular/services/blake-exhibit.service';
import { BlakeFragmentPairService } from './angular/services/blake-fragment-pair.service';
import { BlakeFeaturedWorkService } from './angular/services/blake-featured-work.service';
import { BlakeExhibitImageService } from './angular/services/blake-exhibit-image.service';
import { BlakeExhibitCaptionService } from './angular/services/blake-exhibit-caption.service';
import { BlakePreviewImageService } from './angular/services/blake-preview-image.service';
import { AlertFactoryService } from './angular/services/alert-factory.service';
import { ToTopButtonComponent } from './angular/components/to-top-button.component';
import { HomeComponent } from './angular/components/home.component';
import { SearchComponent } from './angular/components/search.component';
import { WorkComponent } from './angular/components/work.component';
import { CopyComponent } from './angular/components/copy.component';
import { LightboxComponent } from './angular/components/lightbox.component';
import { StaticpageComponent } from './angular/components/staticpage.component';
import { ExhibitComponent } from './angular/components/exhibit.component';
import { PreviewComponent } from './angular/components/preview.component';
import { ShowmeComponent } from './angular/components/showme.component';
import { CropperComponent } from './angular/components/cropper.component';
import { ModalComponent } from './angular/components/modal.component';
import { SearchBoxComponent } from './angular/components/search-box.component';
import { SearchResultsComponent } from './angular/components/search-results.component';
import { BlakeMenuComponent } from './angular/components/blake-menu.component';
import { ObjectViewerComponent } from './angular/components/object-viewer.component';
import { ScrollToTopDirective } from './angular/directives/scroll-to-top.directive';
import { AutoWidthDirective } from './angular/directives/auto-width.directive';
import { TwitterShareDirective } from './angular/directives/twitter-share.directive';
import { AffixDirective } from './angular/directives/affix.directive';
import { ResizeDirective } from './angular/directives/resize.directive';
import { WorkTitleComponent } from './angular/components/work-title.component';
import { DpiComponent } from './angular/components/dpi.component';
import { ClientPpiComponent } from './angular/components/client-ppi.component';
import { ParallaxDirective } from './angular/directives/parallax.directive';
import { ScrollToElementDirective } from './angular/directives/scroll-to-element.directive';
import { AutoHeightDirective } from './angular/directives/auto-height.directive';
import { LeftOnBroadcastDirective } from './angular/directives/left-on-broadcast.directive';
import { ToTopOnBroadcastDirective } from './angular/directives/to-top-on-broadcast.directive';
import { MagnifyImageDirective } from './angular/directives/magnify-image.directive';
import { ShowMeDirective } from './angular/directives/show-me.directive';
import { ToTopButtonDirective } from './angular/directives/to-top-button.directive';
import { OvpImageDirective } from './angular/directives/ovp-image.directive';
import { ObjectEditButtonsComponent } from './angular/components/object-edit-buttons.component';
import { ObjectsInCopyComponent } from './angular/components/objects-in-copy.component';
import { AllKnownCopiesComponent } from './angular/components/all-known-copies.component';
import { AllKnownRelatedItemsComponent } from './angular/components/all-known-related-items.component';
import { FieldSearchComponent } from './angular/components/field-search.component';
import { DateSearchComponent } from './angular/components/date-search.component';
import { MediumSearchComponent } from './angular/components/medium-search.component';
import { PreviewBoxComponent } from './angular/components/preview-box.component';
import { PreviewHeaderComponent } from './angular/components/preview-header.component';
import { PreviewSelectionComponent } from './angular/components/preview-selection.component';
import { ObjectResultHighlightComponent } from './angular/components/object-result-highlight.component';
import { PreviousNextComponent } from './angular/components/previous-next.component';
import { TextMatchTabComponent } from './angular/components/text-match-tab.component';
import { TextualReferenceTabComponent } from './angular/components/textual-reference-tab.component';
import { RegularObjectViewerComponent } from './angular/components/regular-object-viewer.component';
import { SupplementalImageViewerComponent } from './angular/components/supplemental-image-viewer.component';
import { ObjectViewerPreviousNextComponent } from './angular/components/object-viewer-previous-next.component';
import { CopiesInWorkPreviewComponent } from './angular/components/copies-in-work-preview.component';
import { ElectronicEditionInfoTabComponent } from './angular/components/electronic-edition-info-tab.component';
import { downgradeInjectable, downgradeComponent } from '@angular/upgrade/static';

// Angular Hybrid Module
// Define Angular routes (for future use)
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'search', component: SearchComponent },
  { path: 'work/:workId', component: WorkComponent },
  { path: 'copy/:copyId', component: CopyComponent },
  { path: 'lightbox', component: LightboxComponent },
  { path: 'staticpage/:initialPage', component: StaticpageComponent },
  { path: 'exhibit/:exhibitId', component: ExhibitComponent },
  { path: 'preview/:previewId', component: PreviewComponent },
  { path: 'new-window/:what/:copyId', component: ShowmeComponent },
  { path: 'cropper/:imgUrl', component: CropperComponent },
  { path: 'object/:descId', redirectTo: '/copy/object', pathMatch: 'full' }, // Redirect object route
  // Add other routes as needed
];

@NgModule({
  declarations: [
    ToTopButtonComponent,
    HomeComponent,
    SearchComponent,
    WorkComponent,
    CopyComponent,
    LightboxComponent,
    StaticpageComponent,
    ExhibitComponent,
    PreviewComponent,
    ShowmeComponent,
    CropperComponent,
    ModalComponent,
    SearchBoxComponent,
    SearchResultsComponent,
    BlakeMenuComponent,
    ObjectViewerComponent,
    ResizeDirective,
    WorkTitleComponent,
    DpiComponent,
    ClientPpiComponent,
    ParallaxDirective,
    ScrollToElementDirective,
    AutoHeightDirective,
    LeftOnBroadcastDirective,
    ToTopOnBroadcastDirective,
    MagnifyImageDirective,
    ShowMeDirective,
    ToTopButtonDirective,
    OvpImageDirective,
    ObjectEditButtonsComponent,
    ObjectsInCopyComponent,
    AllKnownCopiesComponent,
    AllKnownRelatedItemsComponent,
    FieldSearchComponent,
    DateSearchComponent,
    MediumSearchComponent,
    PreviewBoxComponent,
    PreviewHeaderComponent,
    PreviewSelectionComponent,
    ObjectResultHighlightComponent,
    PreviousNextComponent,
    TextMatchTabComponent,
    TextualReferenceTabComponent,
    RegularObjectViewerComponent,
    SupplementalImageViewerComponent,
    ObjectViewerPreviousNextComponent,
    CopiesInWorkPreviewComponent,
    ElectronicEditionInfoTabComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes, { useHash: false }),
    UpgradeModule
  ],
  providers: [
    WindowSizeService,
    FormatService,
    AlertService,
    ImageManipulationService,
    WorkTitleService,
    CartStorageService,
    CompareObjectsService,
    SearchService,
    GenericService,
    LightboxService,
    ObjectViewerService,
    BlakeDataService,
    FabricCropService,
    BlakeWorkService,
    BlakeCopyService,
    BlakeObjectService,
    BlakePreviewService,
    BlakeExhibitService,
    BlakeFragmentPairService,
    BlakeFeaturedWorkService,
    BlakeExhibitImageService,
    BlakeExhibitCaptionService,
    BlakePreviewImageService,
    AlertFactoryService
  ]
})
export class AppModule {
  constructor(private upgrade: UpgradeModule) {}
  
  ngDoBootstrap() {
    this.upgrade.bootstrap(document.documentElement, ['blake'], { strictDi: true });
  }
}

// Downgrade Angular services and components for AngularJS
blake.factory('WindowSizeService', downgradeInjectable(WindowSizeService));
blake.factory('FormatServiceNew', downgradeInjectable(FormatService));
blake.factory('AlertServiceNew', downgradeInjectable(AlertService));
blake.factory('ImageManipulationServiceNew', downgradeInjectable(ImageManipulationService));
blake.factory('WorkTitleServiceNew', downgradeInjectable(WorkTitleService));
blake.factory('CartStorageServiceNew', downgradeInjectable(CartStorageService));
blake.factory('CompareObjectsServiceNew', downgradeInjectable(CompareObjectsService));
blake.factory('SearchServiceNew', downgradeInjectable(SearchService));
blake.factory('GenericServiceNew', downgradeInjectable(GenericService));
blake.factory('LightboxServiceNew', downgradeInjectable(LightboxService));
blake.factory('ObjectViewerServiceNew', downgradeInjectable(ObjectViewerService));
blake.factory('BlakeDataServiceNew', downgradeInjectable(BlakeDataService));
blake.factory('FabricCropServiceNew', downgradeInjectable(FabricCropService));
blake.factory('BlakeWorkNew', downgradeInjectable(BlakeWorkService));
blake.factory('BlakeCopyNew', downgradeInjectable(BlakeCopyService));
blake.factory('BlakeObjectNew', downgradeInjectable(BlakeObjectService));
blake.factory('BlakePreviewNew', downgradeInjectable(BlakePreviewService));
blake.factory('BlakeExhibitNew', downgradeInjectable(BlakeExhibitService));
blake.factory('BlakeFragmentPairNew', downgradeInjectable(BlakeFragmentPairService));
blake.factory('BlakeFeaturedWorkNew', downgradeInjectable(BlakeFeaturedWorkService));
blake.factory('BlakeExhibitImageNew', downgradeInjectable(BlakeExhibitImageService));
blake.factory('BlakeExhibitCaptionNew', downgradeInjectable(BlakeExhibitCaptionService));
blake.factory('BlakePreviewImageNew', downgradeInjectable(BlakePreviewImageService));
blake.factory('alertFactoryNew', downgradeInjectable(AlertFactoryService));

blake.directive('toTopButtonNew', downgradeComponent({
  component: ToTopButtonComponent,
  inputs: [],
  outputs: []
}));

// Downgrade Angular components for AngularJS
blake.directive('homeComponentNew', downgradeComponent({
  component: HomeComponent,
  inputs: [],
  outputs: []
}));

blake.directive('searchComponentNew', downgradeComponent({
  component: SearchComponent,
  inputs: [],
  outputs: []
}));

blake.directive('workComponentNew', downgradeComponent({
  component: WorkComponent,
  inputs: [],
  outputs: []
}));

blake.directive('copyComponentNew', downgradeComponent({
  component: CopyComponent,
  inputs: [],
  outputs: []
}));

blake.directive('lightboxComponentNew', downgradeComponent({
  component: LightboxComponent,
  inputs: [],
  outputs: []
}));

blake.directive('staticpageComponentNew', downgradeComponent({
  component: StaticpageComponent,
  inputs: [],
  outputs: []
}));

blake.directive('exhibitComponentNew', downgradeComponent({
  component: ExhibitComponent,
  inputs: [],
  outputs: []
}));

blake.directive('previewComponentNew', downgradeComponent({
  component: PreviewComponent,
  inputs: [],
  outputs: []
}));

blake.directive('showmeComponentNew', downgradeComponent({
  component: ShowmeComponent,
  inputs: [],
  outputs: []
}));

blake.directive('cropperComponentNew', downgradeComponent({
  component: CropperComponent,
  inputs: [],
  outputs: []
}));

blake.directive('modalComponentNew', downgradeComponent({
  component: ModalComponent,
  inputs: ['isOpen', 'title', 'bodyText', 'size', 'showCloseButton', 'showFooter', 'closeOnOverlayClick'],
  outputs: ['onClose', 'onOpen']
}));

// Downgrade Angular directives for AngularJS
blake.directive('scrollToTopNew', downgradeComponent({
  component: ScrollToTopDirective,
  inputs: [],
  outputs: []
}));

blake.directive('autoWidthNew', downgradeComponent({
  component: AutoWidthDirective,
  inputs: ['adjust', 'breakpoint', 'divide', 'percent'],
  outputs: []
}));

blake.directive('twitterShareNew', downgradeComponent({
  component: TwitterShareDirective,
  inputs: [],
  outputs: []
}));

blake.directive('affixNew', downgradeComponent({
  component: AffixDirective,
  inputs: ['offsetTop', 'offsetStart', 'offsetBottom', 'minWidth'],
  outputs: []
}));

// Downgrade essential directive components for AngularJS
blake.directive('searchBoxNew', downgradeComponent({
  component: SearchBoxComponent,
  inputs: [],
  outputs: []
}));

blake.directive('searchResultsNew', downgradeComponent({
  component: SearchResultsComponent,
  inputs: ['results', 'label', 'type', 'tree', 'showMetadata'],
  outputs: []
}));

blake.directive('blakeMenuNew', downgradeComponent({
  component: BlakeMenuComponent,
  inputs: [],
  outputs: []
}));

blake.directive('objectViewerNew', downgradeComponent({
  component: ObjectViewerComponent,
  inputs: [],
  outputs: []
}));

// Additional converted directives
blake.directive('resizeNew', downgradeComponent({
  component: ResizeDirective,
  inputs: [],
  outputs: []
}));

blake.directive('workTitleNew', downgradeComponent({
  component: WorkTitleComponent,
  inputs: [],
  outputs: []
}));

blake.directive('dpiNew', downgradeComponent({
  component: DpiComponent,
  inputs: [],
  outputs: []
}));

blake.directive('clientPpiNew', downgradeComponent({
  component: ClientPpiComponent,
  inputs: [],
  outputs: []
}));

// Additional specialized directives
blake.directive('parallaxNew', downgradeComponent({
  component: ParallaxDirective,
  inputs: [],
  outputs: []
}));

blake.directive('scrollToElementNew', downgradeComponent({
  component: ScrollToElementDirective,
  inputs: ['target', 'offset', 'duration'],
  outputs: []
}));

blake.directive('autoHeightNew', downgradeComponent({
  component: AutoHeightDirective,
  inputs: ['adjust', 'breakpoint', 'divide'],
  outputs: []
}));

blake.directive('leftOnBroadcastNew', downgradeComponent({
  component: LeftOnBroadcastDirective,
  inputs: ['eventName'],
  outputs: []
}));

blake.directive('toTopOnBroadcastNew', downgradeComponent({
  component: ToTopOnBroadcastDirective,
  inputs: ['eventName', 'target'],
  outputs: []
}));

blake.directive('magnifyImageNew', downgradeComponent({
  component: MagnifyImageDirective,
  inputs: [],
  outputs: []
}));

blake.directive('showMeNew', downgradeComponent({
  component: ShowMeDirective,
  inputs: ['showMeValue', 'object', 'copyBad'],
  outputs: []
}));

blake.directive('toTopButtonNew', downgradeComponent({
  component: ToTopButtonDirective,
  inputs: [],
  outputs: []
}));

blake.directive('ovpImageNew', downgradeComponent({
  component: OvpImageDirective,
  inputs: ['descId'],
  outputs: []
}));

// Core functional components
blake.directive('objectEditButtonsNew', downgradeComponent({
  component: ObjectEditButtonsComponent,
  inputs: [],
  outputs: []
}));

blake.directive('objectsInCopyNew', downgradeComponent({
  component: ObjectsInCopyComponent,
  inputs: [],
  outputs: []
}));

blake.directive('allKnownCopiesNew', downgradeComponent({
  component: AllKnownCopiesComponent,
  inputs: ['work'],
  outputs: []
}));

blake.directive('allKnownRelatedItemsNew', downgradeComponent({
  component: AllKnownRelatedItemsComponent,
  inputs: ['work'],
  outputs: []
}));

// Search-related components
blake.directive('fieldSearchNew', downgradeComponent({
  component: FieldSearchComponent,
  inputs: [],
  outputs: []
}));

blake.directive('dateSearchNew', downgradeComponent({
  component: DateSearchComponent,
  inputs: [],
  outputs: []
}));

blake.directive('mediumSearchNew', downgradeComponent({
  component: MediumSearchComponent,
  inputs: [],
  outputs: []
}));

blake.directive('previewBoxNew', downgradeComponent({
  component: PreviewBoxComponent,
  inputs: ['results', 'tree', 'type'],
  outputs: []
}));

blake.directive('previewHeaderNew', downgradeComponent({
  component: PreviewHeaderComponent,
  inputs: ['results', 'tree'],
  outputs: []
}));

blake.directive('previewSelectionNew', downgradeComponent({
  component: PreviewSelectionComponent,
  inputs: ['results', 'type', 'tree'],
  outputs: []
}));

blake.directive('objectResultHighlightNew', downgradeComponent({
  component: ObjectResultHighlightComponent,
  inputs: ['results', 'tree', 'type'],
  outputs: []
}));

blake.directive('previousNextNew', downgradeComponent({
  component: PreviousNextComponent,
  inputs: ['results', 'type'],
  outputs: []
}));

blake.directive('textMatchTabNew', downgradeComponent({
  component: TextMatchTabComponent,
  inputs: [],
  outputs: []
}));

blake.directive('textualReferenceTabNew', downgradeComponent({
  component: TextualReferenceTabComponent,
  inputs: [],
  outputs: []
}));

// Object Viewer components
blake.directive('regularObjectViewerNew', downgradeComponent({
  component: RegularObjectViewerComponent,
  inputs: [],
  outputs: []
}));

blake.directive('supplementalImageViewerNew', downgradeComponent({
  component: SupplementalImageViewerComponent,
  inputs: [],
  outputs: []
}));

blake.directive('objectViewerPreviousNextNew', downgradeComponent({
  component: ObjectViewerPreviousNextComponent,
  inputs: [],
  outputs: []
}));

blake.directive('copiesInWorkPreviewNew', downgradeComponent({
  component: CopiesInWorkPreviewComponent,
  inputs: ['results', 'tree'],
  outputs: []
}));

blake.directive('electronicEditionInfoTabNew', downgradeComponent({
  component: ElectronicEditionInfoTabComponent,
  inputs: [],
  outputs: []
}));

// Bootstrap the hybrid application
platformBrowserDynamic().bootstrapModule(AppModule).catch(err => console.error(err));
