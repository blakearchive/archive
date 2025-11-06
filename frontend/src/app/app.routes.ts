import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then(m => m.HomeComponent)
  },
  {
    path: 'staticpage/:initialPage',
    loadComponent: () => import('./features/staticpage/staticpage').then(m => m.Staticpage)
  },
  {
    path: 'object/:descId',
    loadComponent: () => import('./features/object/object').then(m => m.Object)
  },
  {
    path: 'copy/:copyId',
    loadComponent: () => import('./features/copy/copy').then(m => m.Copy)
  },
  {
    path: 'exhibit/:exhibitId',
    loadComponent: () => import('./features/exhibit/exhibit').then(m => m.Exhibit)
  },
  {
    path: 'preview/:previewId',
    loadComponent: () => import('./features/preview/preview').then(m => m.Preview)
  },
  {
    path: 'new-window/:what/:copyId',
    loadComponent: () => import('./features/showme/showme').then(m => m.Showme)
  },
  {
    path: 'work/:workId',
    loadComponent: () => import('./features/work/work').then(m => m.Work)
  },
  {
    path: 'search',
    loadComponent: () => import('./features/search/search').then(m => m.Search)
  },
  {
    path: 'lightbox',
    loadComponent: () => import('./features/lightbox/lightbox').then(m => m.Lightbox)
  },
  {
    path: 'cropper/:imgUrl',
    loadComponent: () => import('./features/cropper/cropper').then(m => m.Cropper)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
