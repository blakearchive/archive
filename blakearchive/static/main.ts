// Pure Angular 17 Bootstrap
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom, ErrorHandler } from '@angular/core';

// Import the main App component
import { AppComponent } from './angular/app.component';

// Import services
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
import { LoadingService } from './angular/services/loading.service';
import { CacheService } from './angular/services/cache.service';
import { ApplicationStateService } from './angular/services/application-state.service';
import { ReactiveStateService } from './angular/services/reactive-state.service';
import { ModalService } from './angular/services/modal.service';
import { AdvancedSearchService } from './angular/services/advanced-search.service';
import { UserPreferencesService } from './angular/services/user-preferences.service';
import { ExportService } from './angular/services/export.service';
import { ErrorHandlerService } from './angular/services/error-handler.service';

// Import components for routing
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

// Define routes
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'search', component: SearchComponent },
  { path: 's', redirectTo: '/search', pathMatch: 'full' },
  { path: 'work/:workId', component: WorkComponent },
  { path: 'copy/:copyId', component: CopyComponent },
  { path: 'lightbox', component: LightboxComponent },
  { path: 'staticpage/:initialPage', component: StaticpageComponent },
  { path: 'exhibit/:exhibitId', component: ExhibitComponent },
  { path: 'preview/:previewId', component: PreviewComponent },
  { path: 'new-window/:what/:copyId', component: ShowmeComponent },
  { path: 'cropper/:imgUrl', component: CropperComponent },
  { path: 'object/:descId', redirectTo: '/copy/object', pathMatch: 'full' },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

// Bootstrap the application
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    // Service providers
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
    AlertFactoryService,
    LoadingService,
    CacheService,
    ApplicationStateService,
    ReactiveStateService,
    ModalService,
    AdvancedSearchService,
    UserPreferencesService,
    ExportService,
    { provide: ErrorHandler, useClass: ErrorHandlerService }
  ]
}).catch(err => console.error(err));