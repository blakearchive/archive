import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

export interface ViewState {
  mode: 'object' | 'compare' | 'gallery';
  scope: 'image' | 'text' | 'both';
}

export interface ApplicationState {
  // Navigation state
  worksNavState: boolean;
  showWorkTitle: string;
  showOverlay: boolean;
  
  // View state
  view: ViewState;
  persistentMode: 'gallery' | 'reading';
  
  // Image manipulation state
  zoom: boolean;
  supplemental: boolean;
  dpiValue: string;
  
  // Loading states
  doneSettingCopy: boolean;
  
  // Help state
  help: string;
  
  // Cart state
  cartItems: any[];
}

const initialState: ApplicationState = {
  worksNavState: false,
  showWorkTitle: 'copy',
  showOverlay: false,
  view: {
    mode: 'object',
    scope: 'image'
  },
  persistentMode: 'gallery',
  zoom: false,
  supplemental: false,
  dpiValue: '100',
  doneSettingCopy: false,
  help: 'copy',
  cartItems: []
};

@Injectable({
  providedIn: 'root'
})
export class ApplicationStateService {
  private stateSubject = new BehaviorSubject<ApplicationState>(initialState);
  private eventSubject = new Subject<{type: string, payload?: any}>();

  // Observable for reactive updates
  state$ = this.stateSubject.asObservable();
  events$ = this.eventSubject.asObservable();

  constructor() {
    // Initialize state from any existing global state for transition
    this.initializeFromGlobalState();
  }

  /**
   * Get current state snapshot
   */
  getCurrentState(): ApplicationState {
    return this.stateSubject.value;
  }

  /**
   * Update partial state
   */
  updateState(updates: Partial<ApplicationState>): void {
    const currentState = this.stateSubject.value;
    const newState = { ...currentState, ...updates };
    this.stateSubject.next(newState);
  }

  /**
   * Emit application events
   */
  emitEvent(type: string, payload?: any): void {
    this.eventSubject.next({ type, payload });
    
    // Also dispatch as custom events for legacy compatibility during transition
    const event = new CustomEvent(type, { detail: payload });
    window.dispatchEvent(event);
  }

  // Specific state selectors and updaters

  /**
   * Works Navigation State
   */
  get worksNavState$(): Observable<boolean> {
    return this.state$.pipe(
      map(state => state.worksNavState),
      distinctUntilChanged()
    );
  }

  setWorksNavState(value: boolean): void {
    this.updateState({ worksNavState: value });
  }

  /**
   * View State Management
   */
  get viewState$(): Observable<ViewState> {
    return this.state$.pipe(
      map(state => state.view),
      distinctUntilChanged()
    );
  }

  setViewMode(mode: 'object' | 'compare' | 'gallery'): void {
    const currentView = this.getCurrentState().view;
    this.updateState({ 
      view: { ...currentView, mode }
    });
    this.emitEvent('view:modeChanged', mode);
  }

  setViewScope(scope: 'image' | 'text' | 'both'): void {
    const currentView = this.getCurrentState().view;
    this.updateState({ 
      view: { ...currentView, scope }
    });
    this.emitEvent('view:scopeChanged', scope);
  }

  /**
   * Persistent Mode Management
   */
  get persistentMode$(): Observable<'gallery' | 'reading'> {
    return this.state$.pipe(
      map(state => state.persistentMode),
      distinctUntilChanged()
    );
  }

  setPersistentMode(mode: 'gallery' | 'reading'): void {
    this.updateState({ persistentMode: mode });
    this.emitEvent('persistentMode:changed', mode);
  }

  /**
   * Image Manipulation State
   */
  get zoom$(): Observable<boolean> {
    return this.state$.pipe(
      map(state => state.zoom),
      distinctUntilChanged()
    );
  }

  toggleZoom(): void {
    const currentZoom = this.getCurrentState().zoom;
    this.updateState({ zoom: !currentZoom });
    this.emitEvent('zoom:toggled', !currentZoom);
  }

  setZoom(value: boolean): void {
    this.updateState({ zoom: value });
    this.emitEvent('zoom:changed', value);
  }

  get supplemental$(): Observable<boolean> {
    return this.state$.pipe(
      map(state => state.supplemental),
      distinctUntilChanged()
    );
  }

  toggleSupplemental(): void {
    const currentSupplemental = this.getCurrentState().supplemental;
    this.updateState({ supplemental: !currentSupplemental });
    this.emitEvent('supplemental:toggled', !currentSupplemental);
  }

  setSupplemental(value: boolean): void {
    this.updateState({ supplemental: value });
    this.emitEvent('supplemental:changed', value);
  }

  /**
   * DPI Management
   */
  get dpiValue$(): Observable<string> {
    return this.state$.pipe(
      map(state => state.dpiValue),
      distinctUntilChanged()
    );
  }

  setDpiValue(value: string): void {
    this.updateState({ dpiValue: value });
    this.emitEvent('dpi:changed', value);
  }

  /**
   * Loading State Management
   */
  get doneSettingCopy$(): Observable<boolean> {
    return this.state$.pipe(
      map(state => state.doneSettingCopy),
      distinctUntilChanged()
    );
  }

  setDoneSettingCopy(value: boolean): void {
    this.updateState({ doneSettingCopy: value });
    this.emitEvent('copy:settingComplete', value);
  }

  /**
   * Cart State Management
   */
  get cartItems$(): Observable<any[]> {
    return this.state$.pipe(
      map(state => state.cartItems),
      distinctUntilChanged()
    );
  }

  setCartItems(items: any[]): void {
    this.updateState({ cartItems: items });
    this.emitEvent('cart:updated', items);
  }

  /**
   * Show Overlay Management
   */
  get showOverlay$(): Observable<boolean> {
    return this.state$.pipe(
      map(state => state.showOverlay),
      distinctUntilChanged()
    );
  }

  setShowOverlay(value: boolean): void {
    this.updateState({ showOverlay: value });
    this.emitEvent('overlay:changed', value);
  }

  /**
   * Show Work Title Management
   */
  get showWorkTitle$(): Observable<string> {
    return this.state$.pipe(
      map(state => state.showWorkTitle),
      distinctUntilChanged()
    );
  }

  setShowWorkTitle(value: string): void {
    this.updateState({ showWorkTitle: value });
    this.emitEvent('workTitle:changed', value);
  }

  /**
   * Help State Management
   */
  get help$(): Observable<string> {
    return this.state$.pipe(
      map(state => state.help),
      distinctUntilChanged()
    );
  }

  setHelp(value: string): void {
    this.updateState({ help: value });
    this.emitEvent('help:changed', value);
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    this.stateSubject.next({ ...initialState });
    this.emitEvent('state:reset');
  }

  /**
   * Initialize from existing global state for transition period
   * This helps maintain compatibility while migrating
   */
  private initializeFromGlobalState(): void {
    const globalState = (window as any).$rootScope;
    if (globalState) {
      const updates: Partial<ApplicationState> = {};
      
      if (typeof globalState.worksNavState === 'boolean') {
        updates.worksNavState = globalState.worksNavState;
      }
      
      if (typeof globalState.showWorkTitle === 'string') {
        updates.showWorkTitle = globalState.showWorkTitle;
      }
      
      if (typeof globalState.showOverlay === 'boolean') {
        updates.showOverlay = globalState.showOverlay;
      }
      
      if (globalState.view && typeof globalState.view === 'object') {
        updates.view = {
          mode: globalState.view.mode || 'object',
          scope: globalState.view.scope || 'image'
        };
      }
      
      if (typeof globalState.persistentmode === 'string') {
        updates.persistentMode = globalState.persistentmode;
      }
      
      if (typeof globalState.zoom === 'boolean') {
        updates.zoom = globalState.zoom;
      }
      
      if (typeof globalState.supplemental === 'boolean') {
        updates.supplemental = globalState.supplemental;
      }
      
      if (typeof globalState.dpivalue === 'string') {
        updates.dpiValue = globalState.dpivalue;
      }
      
      if (typeof globalState.doneSettingCopy === 'boolean') {
        updates.doneSettingCopy = globalState.doneSettingCopy;
      }
      
      if (typeof globalState.help === 'string') {
        updates.help = globalState.help;
      }
      
      if (Array.isArray(globalState.cartItems)) {
        updates.cartItems = globalState.cartItems;
      }
      
      if (Object.keys(updates).length > 0) {
        this.updateState(updates);
      }
    }
  }
}