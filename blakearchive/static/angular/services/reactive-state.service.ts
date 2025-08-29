import { Injectable, signal, computed, effect } from '@angular/core';
import { ApplicationStateService, ApplicationState } from './application-state.service';

/**
 * Enhanced reactive state service using Angular Signals
 * This provides a more modern, performant approach to state management
 */
@Injectable({
  providedIn: 'root'
})
export class ReactiveStateService {
  // Core state signals
  private _worksNavState = signal<boolean>(false);
  private _showWorkTitle = signal<string>('copy');
  private _showOverlay = signal<boolean>(false);
  private _viewMode = signal<'object' | 'compare' | 'gallery'>('object');
  private _viewScope = signal<'image' | 'text' | 'both'>('image');
  private _persistentMode = signal<'gallery' | 'reading'>('gallery');
  private _zoom = signal<boolean>(false);
  private _supplemental = signal<boolean>(false);
  private _dpiValue = signal<string>('100');
  private _doneSettingCopy = signal<boolean>(false);
  private _help = signal<string>('copy');
  private _cartItems = signal<any[]>([]);

  // Read-only computed signals for external access
  readonly worksNavState = this._worksNavState.asReadonly();
  readonly showWorkTitle = this._showWorkTitle.asReadonly();
  readonly showOverlay = this._showOverlay.asReadonly();
  readonly viewMode = this._viewMode.asReadonly();
  readonly viewScope = this._viewScope.asReadonly();
  readonly persistentMode = this._persistentMode.asReadonly();
  readonly zoom = this._zoom.asReadonly();
  readonly supplemental = this._supplemental.asReadonly();
  readonly dpiValue = this._dpiValue.asReadonly();
  readonly doneSettingCopy = this._doneSettingCopy.asReadonly();
  readonly help = this._help.asReadonly();
  readonly cartItems = this._cartItems.asReadonly();

  // Computed state combinations
  readonly viewState = computed(() => ({
    mode: this._viewMode(),
    scope: this._viewScope()
  }));

  readonly isComparisonMode = computed(() => this._viewMode() === 'compare');
  readonly isReadingMode = computed(() => this._persistentMode() === 'reading');
  readonly isZoomEnabled = computed(() => this._zoom());
  readonly isSupplementalEnabled = computed(() => this._supplemental());
  readonly cartItemsCount = computed(() => this._cartItems().length);

  constructor(private appState: ApplicationStateService) {
    // Initialize signals from the legacy state service
    this.initializeFromLegacyState();
    
    // Set up synchronization with the legacy state service during transition
    this.setupLegacySync();

    // Set up effects for side effects
    this.setupEffects();
  }

  /**
   * State updaters with validation and side effects
   */
  setWorksNavState(value: boolean): void {
    this._worksNavState.set(value);
    this.appState.setWorksNavState(value);
  }

  setShowWorkTitle(value: string): void {
    this._showWorkTitle.set(value);
    this.appState.setShowWorkTitle(value);
  }

  setShowOverlay(value: boolean): void {
    this._showOverlay.set(value);
    this.appState.setShowOverlay(value);
  }

  setViewMode(mode: 'object' | 'compare' | 'gallery'): void {
    this._viewMode.set(mode);
    this.appState.setViewMode(mode);
  }

  setViewScope(scope: 'image' | 'text' | 'both'): void {
    this._viewScope.set(scope);
    this.appState.setViewScope(scope);
  }

  setPersistentMode(mode: 'gallery' | 'reading'): void {
    this._persistentMode.set(mode);
    this.appState.setPersistentMode(mode);
  }

  setZoom(value: boolean): void {
    this._zoom.set(value);
    this.appState.setZoom(value);
  }

  toggleZoom(): void {
    const current = this._zoom();
    this.setZoom(!current);
  }

  setSupplemental(value: boolean): void {
    this._supplemental.set(value);
    this.appState.setSupplemental(value);
  }

  toggleSupplemental(): void {
    const current = this._supplemental();
    this.setSupplemental(!current);
  }

  setDpiValue(value: string): void {
    // Validate DPI value
    const validDpiValues = ['75', '100', '150', '200', '300'];
    if (validDpiValues.includes(value)) {
      this._dpiValue.set(value);
      this.appState.setDpiValue(value);
    } else {
      console.warn(`Invalid DPI value: ${value}. Using default 100.`);
      this._dpiValue.set('100');
      this.appState.setDpiValue('100');
    }
  }

  setDoneSettingCopy(value: boolean): void {
    this._doneSettingCopy.set(value);
    this.appState.setDoneSettingCopy(value);
  }

  setHelp(value: string): void {
    this._help.set(value);
    this.appState.setHelp(value);
  }

  setCartItems(items: any[]): void {
    this._cartItems.set([...items]); // Immutable update
    this.appState.setCartItems(items);
  }

  addCartItem(item: any): void {
    const current = this._cartItems();
    this.setCartItems([...current, item]);
  }

  removeCartItem(itemId: string): void {
    const current = this._cartItems();
    const filtered = current.filter(item => item.id !== itemId);
    this.setCartItems(filtered);
  }

  clearCart(): void {
    this.setCartItems([]);
  }

  /**
   * Complex state operations
   */
  enterComparisonMode(mainObject?: any): void {
    this.setViewMode('compare');
    if (mainObject) {
      // Emit event for comparison service to handle
      this.appState.emitEvent('comparison:setMain', mainObject);
    }
  }

  exitComparisonMode(): void {
    this.setViewMode('object');
    this.appState.emitEvent('comparison:exit');
  }

  enterReadingMode(): void {
    this.setPersistentMode('reading');
    this.appState.emitEvent('readingMode:enter');
  }

  exitReadingMode(): void {
    this.setPersistentMode('gallery');
    this.appState.emitEvent('readingMode:exit');
  }

  toggleTranscriptionView(): void {
    const currentScope = this._viewScope();
    const newScope = currentScope === 'image' ? 'both' : 'image';
    this.setViewScope(newScope);
  }

  /**
   * Batch state updates for performance
   */
  updateMultipleStates(updates: {
    worksNavState?: boolean;
    showWorkTitle?: string;
    showOverlay?: boolean;
    viewMode?: 'object' | 'compare' | 'gallery';
    viewScope?: 'image' | 'text' | 'both';
    persistentMode?: 'gallery' | 'reading';
    zoom?: boolean;
    supplemental?: boolean;
    dpiValue?: string;
    doneSettingCopy?: boolean;
    help?: string;
  }): void {
    // Batch updates to minimize signal updates
    if (updates.worksNavState !== undefined) this._worksNavState.set(updates.worksNavState);
    if (updates.showWorkTitle !== undefined) this._showWorkTitle.set(updates.showWorkTitle);
    if (updates.showOverlay !== undefined) this._showOverlay.set(updates.showOverlay);
    if (updates.viewMode !== undefined) this._viewMode.set(updates.viewMode);
    if (updates.viewScope !== undefined) this._viewScope.set(updates.viewScope);
    if (updates.persistentMode !== undefined) this._persistentMode.set(updates.persistentMode);
    if (updates.zoom !== undefined) this._zoom.set(updates.zoom);
    if (updates.supplemental !== undefined) this._supplemental.set(updates.supplemental);
    if (updates.dpiValue !== undefined) this._dpiValue.set(updates.dpiValue);
    if (updates.doneSettingCopy !== undefined) this._doneSettingCopy.set(updates.doneSettingCopy);
    if (updates.help !== undefined) this._help.set(updates.help);

    // Sync with legacy state service
    this.appState.updateState(updates);
  }

  /**
   * Reset all state to initial values
   */
  reset(): void {
    this.updateMultipleStates({
      worksNavState: false,
      showWorkTitle: 'copy',
      showOverlay: false,
      viewMode: 'object',
      viewScope: 'image',
      persistentMode: 'gallery',
      zoom: false,
      supplemental: false,
      dpiValue: '100',
      doneSettingCopy: false,
      help: 'copy'
    });
    this.setCartItems([]);
  }

  /**
   * Get current state as a snapshot (for debugging/testing)
   */
  getStateSnapshot(): ApplicationState {
    return {
      worksNavState: this._worksNavState(),
      showWorkTitle: this._showWorkTitle(),
      showOverlay: this._showOverlay(),
      view: {
        mode: this._viewMode(),
        scope: this._viewScope()
      },
      persistentMode: this._persistentMode(),
      zoom: this._zoom(),
      supplemental: this._supplemental(),
      dpiValue: this._dpiValue(),
      doneSettingCopy: this._doneSettingCopy(),
      help: this._help(),
      cartItems: this._cartItems()
    };
  }

  /**
   * Initialize signals from legacy state service
   */
  private initializeFromLegacyState(): void {
    const currentState = this.appState.getCurrentState();
    
    this._worksNavState.set(currentState.worksNavState);
    this._showWorkTitle.set(currentState.showWorkTitle);
    this._showOverlay.set(currentState.showOverlay);
    this._viewMode.set(currentState.view.mode);
    this._viewScope.set(currentState.view.scope);
    this._persistentMode.set(currentState.persistentMode);
    this._zoom.set(currentState.zoom);
    this._supplemental.set(currentState.supplemental);
    this._dpiValue.set(currentState.dpiValue);
    this._doneSettingCopy.set(currentState.doneSettingCopy);
    this._help.set(currentState.help);
    this._cartItems.set(currentState.cartItems);
  }

  /**
   * Set up synchronization with legacy state service during transition
   */
  private setupLegacySync(): void {
    // Subscribe to legacy state changes and sync signals
    this.appState.state$.subscribe(state => {
      // Only update if different to prevent loops
      if (this._worksNavState() !== state.worksNavState) {
        this._worksNavState.set(state.worksNavState);
      }
      if (this._showWorkTitle() !== state.showWorkTitle) {
        this._showWorkTitle.set(state.showWorkTitle);
      }
      if (this._showOverlay() !== state.showOverlay) {
        this._showOverlay.set(state.showOverlay);
      }
      if (this._viewMode() !== state.view.mode) {
        this._viewMode.set(state.view.mode);
      }
      if (this._viewScope() !== state.view.scope) {
        this._viewScope.set(state.view.scope);
      }
      if (this._persistentMode() !== state.persistentMode) {
        this._persistentMode.set(state.persistentMode);
      }
      if (this._zoom() !== state.zoom) {
        this._zoom.set(state.zoom);
      }
      if (this._supplemental() !== state.supplemental) {
        this._supplemental.set(state.supplemental);
      }
      if (this._dpiValue() !== state.dpiValue) {
        this._dpiValue.set(state.dpiValue);
      }
      if (this._doneSettingCopy() !== state.doneSettingCopy) {
        this._doneSettingCopy.set(state.doneSettingCopy);
      }
      if (this._help() !== state.help) {
        this._help.set(state.help);
      }
      if (JSON.stringify(this._cartItems()) !== JSON.stringify(state.cartItems)) {
        this._cartItems.set(state.cartItems);
      }
    });
  }

  /**
   * Set up effects for side effects and logging
   */
  private setupEffects(): void {
    // Log state changes in development
    if (typeof window !== 'undefined' && (window as any).DEBUG_BLAKE_STATE) {
      effect(() => {
        console.log('Blake State Changed:', this.getStateSnapshot());
      });
    }

    // Save important state to localStorage
    effect(() => {
      const persistentMode = this._persistentMode();
      const dpiValue = this._dpiValue();
      
      try {
        localStorage.setItem('blake-persistent-mode', persistentMode);
        localStorage.setItem('blake-dpi-value', dpiValue);
      } catch (e) {
        console.warn('Could not save state to localStorage:', e);
      }
    });

    // Load state from localStorage on initialization
    try {
      const savedPersistentMode = localStorage.getItem('blake-persistent-mode');
      const savedDpiValue = localStorage.getItem('blake-dpi-value');
      
      if (savedPersistentMode && ['gallery', 'reading'].includes(savedPersistentMode)) {
        this.setPersistentMode(savedPersistentMode as 'gallery' | 'reading');
      }
      
      if (savedDpiValue && ['75', '100', '150', '200', '300'].includes(savedDpiValue)) {
        this.setDpiValue(savedDpiValue);
      }
    } catch (e) {
      console.warn('Could not load state from localStorage:', e);
    }
  }
}