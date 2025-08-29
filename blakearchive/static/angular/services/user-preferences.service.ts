import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

export interface UserPreferences {
  // Display preferences
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  highContrast: boolean;
  reducedMotion: boolean;
  
  // Image viewing preferences
  defaultDpi: string;
  imageQuality: 'low' | 'medium' | 'high' | 'original';
  autoRotate: boolean;
  showImageInfo: boolean;
  enableMagnification: boolean;
  
  // Navigation preferences
  keyboardNavigation: boolean;
  showNavigationHints: boolean;
  autoAdvance: boolean;
  autoAdvanceDelay: number; // seconds
  
  // Search preferences
  searchResultsPerPage: number;
  defaultSearchSort: 'relevance' | 'date' | 'title' | 'popularity';
  saveSearchHistory: boolean;
  showSearchSuggestions: boolean;
  enableAdvancedSearch: boolean;
  
  // Reading mode preferences
  readingModeFont: 'serif' | 'sans-serif' | 'monospace';
  readingModeFontSize: number;
  readingModeLineHeight: number;
  readingModeWidth: 'narrow' | 'medium' | 'wide' | 'full';
  showTranscriptionByDefault: boolean;
  
  // Comparison preferences
  comparisonLayout: 'side-by-side' | 'stacked' | 'overlay';
  syncZoom: boolean;
  syncRotation: boolean;
  showComparisonGrid: boolean;
  
  // Export preferences
  defaultExportFormat: 'json' | 'csv' | 'xml' | 'pdf';
  includeMetadataInExport: boolean;
  exportImageQuality: 'thumbnail' | 'medium' | 'high' | 'original';
  
  // Privacy preferences
  allowAnalytics: boolean;
  saveViewingHistory: boolean;
  shareUsageData: boolean;
  
  // Advanced preferences
  enableExperimentalFeatures: boolean;
  debugMode: boolean;
  cacheSize: number; // MB
  prefetchNext: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  // Display preferences
  theme: 'auto',
  fontSize: 'medium',
  highContrast: false,
  reducedMotion: false,
  
  // Image viewing preferences
  defaultDpi: '100',
  imageQuality: 'high',
  autoRotate: false,
  showImageInfo: true,
  enableMagnification: true,
  
  // Navigation preferences
  keyboardNavigation: true,
  showNavigationHints: true,
  autoAdvance: false,
  autoAdvanceDelay: 5,
  
  // Search preferences
  searchResultsPerPage: 20,
  defaultSearchSort: 'relevance',
  saveSearchHistory: true,
  showSearchSuggestions: true,
  enableAdvancedSearch: true,
  
  // Reading mode preferences
  readingModeFont: 'serif',
  readingModeFontSize: 16,
  readingModeLineHeight: 1.6,
  readingModeWidth: 'medium',
  showTranscriptionByDefault: false,
  
  // Comparison preferences
  comparisonLayout: 'side-by-side',
  syncZoom: true,
  syncRotation: false,
  showComparisonGrid: true,
  
  // Export preferences
  defaultExportFormat: 'json',
  includeMetadataInExport: true,
  exportImageQuality: 'high',
  
  // Privacy preferences
  allowAnalytics: true,
  saveViewingHistory: true,
  shareUsageData: false,
  
  // Advanced preferences
  enableExperimentalFeatures: false,
  debugMode: false,
  cacheSize: 100,
  prefetchNext: true
};

export interface PreferenceGroup {
  id: string;
  name: string;
  icon: string;
  description: string;
  preferences: PreferenceDefinition[];
}

export interface PreferenceDefinition {
  key: keyof UserPreferences;
  name: string;
  description: string;
  type: 'boolean' | 'select' | 'range' | 'number' | 'text';
  options?: { value: any; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  requiresRestart?: boolean;
  experimental?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {
  private preferencesSubject = new BehaviorSubject<UserPreferences>(DEFAULT_PREFERENCES);
  private storageKey = 'blake-user-preferences';
  private preferenceGroups: PreferenceGroup[] = [];

  // Public observables
  preferences$ = this.preferencesSubject.asObservable();

  constructor() {
    this.initializePreferenceGroups();
    this.loadPreferences();
    this.setupMediaQueryListeners();
    this.applyTheme();
  }

  /**
   * Get current preferences
   */
  getPreferences(): UserPreferences {
    return this.preferencesSubject.value;
  }

  /**
   * Get specific preference value
   */
  getPreference<K extends keyof UserPreferences>(key: K): UserPreferences[K] {
    return this.preferencesSubject.value[key];
  }

  /**
   * Get preference as observable
   */
  getPreference$<K extends keyof UserPreferences>(key: K): Observable<UserPreferences[K]> {
    return this.preferences$.pipe(
      map(prefs => prefs[key]),
      distinctUntilChanged()
    );
  }

  /**
   * Update single preference
   */
  setPreference<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]): void {
    const currentPrefs = this.preferencesSubject.value;
    const updatedPrefs = { ...currentPrefs, [key]: value };
    this.preferencesSubject.next(updatedPrefs);
    this.savePreferences();
    this.handlePreferenceChange(key, value);
  }

  /**
   * Update multiple preferences
   */
  setPreferences(updates: Partial<UserPreferences>): void {
    const currentPrefs = this.preferencesSubject.value;
    const updatedPrefs = { ...currentPrefs, ...updates };
    this.preferencesSubject.next(updatedPrefs);
    this.savePreferences();
    
    // Handle changes for each updated preference
    Object.keys(updates).forEach(key => {
      this.handlePreferenceChange(key as keyof UserPreferences, updates[key as keyof UserPreferences]);
    });
  }

  /**
   * Reset preferences to defaults
   */
  resetPreferences(): void {
    this.preferencesSubject.next({ ...DEFAULT_PREFERENCES });
    this.savePreferences();
    this.applyAllPreferences();
  }

  /**
   * Reset specific preference group
   */
  resetPreferenceGroup(groupId: string): void {
    const group = this.preferenceGroups.find(g => g.id === groupId);
    if (!group) return;

    const updates: Partial<UserPreferences> = {};
    group.preferences.forEach(pref => {
      (updates as any)[pref.key] = (DEFAULT_PREFERENCES as any)[pref.key];
    });

    this.setPreferences(updates);
  }

  /**
   * Get preference groups for settings UI
   */
  getPreferenceGroups(): PreferenceGroup[] {
    return this.preferenceGroups;
  }

  /**
   * Import preferences from file
   */
  importPreferences(preferencesData: string): boolean {
    try {
      const imported = JSON.parse(preferencesData);
      
      // Validate imported preferences
      const validatedPrefs = this.validatePreferences(imported);
      this.preferencesSubject.next(validatedPrefs);
      this.savePreferences();
      this.applyAllPreferences();
      
      return true;
    } catch (e) {
      console.error('Error importing preferences:', e);
      return false;
    }
  }

  /**
   * Export preferences to JSON string
   */
  exportPreferences(): string {
    return JSON.stringify(this.preferencesSubject.value, null, 2);
  }

  /**
   * Check if user has customized preferences
   */
  hasCustomPreferences(): boolean {
    const current = this.preferencesSubject.value;
    return JSON.stringify(current) !== JSON.stringify(DEFAULT_PREFERENCES);
  }

  /**
   * Get preferences that differ from defaults
   */
  getCustomizedPreferences(): Partial<UserPreferences> {
    const current = this.preferencesSubject.value;
    const customized: Partial<UserPreferences> = {};
    
    Object.keys(current).forEach(key => {
      const k = key as keyof UserPreferences;
      if (current[k] !== DEFAULT_PREFERENCES[k]) {
        (customized as any)[k] = current[k];
      }
    });
    
    return customized;
  }

  private initializePreferenceGroups(): void {
    this.preferenceGroups = [
      {
        id: 'display',
        name: 'Display',
        icon: 'monitor',
        description: 'Customize the appearance and visual settings',
        preferences: [
          {
            key: 'theme',
            name: 'Theme',
            description: 'Choose your preferred color scheme',
            type: 'select',
            options: [
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'auto', label: 'Auto (System)' }
            ]
          },
          {
            key: 'fontSize',
            name: 'Font Size',
            description: 'Adjust the base font size for better readability',
            type: 'select',
            options: [
              { value: 'small', label: 'Small' },
              { value: 'medium', label: 'Medium' },
              { value: 'large', label: 'Large' },
              { value: 'extra-large', label: 'Extra Large' }
            ]
          },
          {
            key: 'highContrast',
            name: 'High Contrast',
            description: 'Increase contrast for better visibility',
            type: 'boolean'
          },
          {
            key: 'reducedMotion',
            name: 'Reduced Motion',
            description: 'Minimize animations and transitions',
            type: 'boolean'
          }
        ]
      },
      {
        id: 'images',
        name: 'Image Viewing',
        icon: 'image',
        description: 'Configure how images are displayed and manipulated',
        preferences: [
          {
            key: 'defaultDpi',
            name: 'Default DPI',
            description: 'Default resolution for image display',
            type: 'select',
            options: [
              { value: '75', label: '75 DPI' },
              { value: '100', label: '100 DPI' },
              { value: '150', label: '150 DPI' },
              { value: '200', label: '200 DPI' },
              { value: '300', label: '300 DPI' }
            ]
          },
          {
            key: 'imageQuality',
            name: 'Image Quality',
            description: 'Balance between quality and loading speed',
            type: 'select',
            options: [
              { value: 'low', label: 'Low (Faster)' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'original', label: 'Original (Slower)' }
            ]
          },
          {
            key: 'enableMagnification',
            name: 'Enable Magnification',
            description: 'Allow zooming in on images with mouse hover',
            type: 'boolean'
          },
          {
            key: 'showImageInfo',
            name: 'Show Image Information',
            description: 'Display image metadata and details',
            type: 'boolean'
          }
        ]
      },
      {
        id: 'navigation',
        name: 'Navigation',
        icon: 'navigation',
        description: 'Control how you move through the archive',
        preferences: [
          {
            key: 'keyboardNavigation',
            name: 'Keyboard Navigation',
            description: 'Enable keyboard shortcuts for navigation',
            type: 'boolean'
          },
          {
            key: 'showNavigationHints',
            name: 'Show Navigation Hints',
            description: 'Display keyboard shortcuts and navigation tips',
            type: 'boolean'
          },
          {
            key: 'autoAdvance',
            name: 'Auto Advance',
            description: 'Automatically move to next image after a delay',
            type: 'boolean'
          },
          {
            key: 'autoAdvanceDelay',
            name: 'Auto Advance Delay',
            description: 'Seconds to wait before advancing',
            type: 'range',
            min: 1,
            max: 30,
            step: 1,
            unit: 'seconds'
          }
        ]
      },
      {
        id: 'search',
        name: 'Search',
        icon: 'search',
        description: 'Customize search behavior and results',
        preferences: [
          {
            key: 'searchResultsPerPage',
            name: 'Results Per Page',
            description: 'Number of search results to display per page',
            type: 'select',
            options: [
              { value: 10, label: '10' },
              { value: 20, label: '20' },
              { value: 50, label: '50' },
              { value: 100, label: '100' }
            ]
          },
          {
            key: 'defaultSearchSort',
            name: 'Default Sort Order',
            description: 'How search results should be sorted by default',
            type: 'select',
            options: [
              { value: 'relevance', label: 'Relevance' },
              { value: 'date', label: 'Date' },
              { value: 'title', label: 'Title' },
              { value: 'popularity', label: 'Popularity' }
            ]
          },
          {
            key: 'saveSearchHistory',
            name: 'Save Search History',
            description: 'Keep track of your previous searches',
            type: 'boolean'
          },
          {
            key: 'showSearchSuggestions',
            name: 'Show Search Suggestions',
            description: 'Display suggested search terms as you type',
            type: 'boolean'
          }
        ]
      },
      {
        id: 'reading',
        name: 'Reading Mode',
        icon: 'book-open',
        description: 'Optimize the reading experience for transcriptions',
        preferences: [
          {
            key: 'readingModeFont',
            name: 'Reading Font',
            description: 'Font family for reading transcriptions',
            type: 'select',
            options: [
              { value: 'serif', label: 'Serif (Traditional)' },
              { value: 'sans-serif', label: 'Sans-serif (Modern)' },
              { value: 'monospace', label: 'Monospace (Code-like)' }
            ]
          },
          {
            key: 'readingModeFontSize',
            name: 'Reading Font Size',
            description: 'Font size for transcription text',
            type: 'range',
            min: 12,
            max: 24,
            step: 1,
            unit: 'px'
          },
          {
            key: 'readingModeLineHeight',
            name: 'Line Height',
            description: 'Space between lines for better readability',
            type: 'range',
            min: 1.0,
            max: 2.0,
            step: 0.1
          },
          {
            key: 'readingModeWidth',
            name: 'Content Width',
            description: 'Maximum width of reading content',
            type: 'select',
            options: [
              { value: 'narrow', label: 'Narrow (Focused)' },
              { value: 'medium', label: 'Medium' },
              { value: 'wide', label: 'Wide' },
              { value: 'full', label: 'Full Width' }
            ]
          }
        ]
      },
      {
        id: 'privacy',
        name: 'Privacy',
        icon: 'shield',
        description: 'Control your data and privacy settings',
        preferences: [
          {
            key: 'allowAnalytics',
            name: 'Allow Analytics',
            description: 'Help improve the archive by sharing anonymous usage data',
            type: 'boolean'
          },
          {
            key: 'saveViewingHistory',
            name: 'Save Viewing History',
            description: 'Keep track of works and objects you have viewed',
            type: 'boolean'
          },
          {
            key: 'shareUsageData',
            name: 'Share Usage Data',
            description: 'Share aggregated usage statistics with researchers',
            type: 'boolean'
          }
        ]
      },
      {
        id: 'advanced',
        name: 'Advanced',
        icon: 'settings',
        description: 'Technical and experimental settings',
        preferences: [
          {
            key: 'enableExperimentalFeatures',
            name: 'Experimental Features',
            description: 'Enable new features that are still in development',
            type: 'boolean',
            experimental: true
          },
          {
            key: 'debugMode',
            name: 'Debug Mode',
            description: 'Show additional debugging information',
            type: 'boolean',
            experimental: true
          },
          {
            key: 'cacheSize',
            name: 'Cache Size',
            description: 'Maximum amount of data to cache locally',
            type: 'range',
            min: 10,
            max: 500,
            step: 10,
            unit: 'MB'
          },
          {
            key: 'prefetchNext',
            name: 'Prefetch Next Images',
            description: 'Load upcoming images in the background for faster navigation',
            type: 'boolean'
          }
        ]
      }
    ];
  }

  private loadPreferences(): void {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        const validated = this.validatePreferences(parsed);
        this.preferencesSubject.next(validated);
      }
    } catch (e) {
      console.warn('Error loading preferences, using defaults:', e);
    }
  }

  private savePreferences(): void {
    try {
      const prefs = this.preferencesSubject.value;
      localStorage.setItem(this.storageKey, JSON.stringify(prefs));
    } catch (e) {
      console.error('Error saving preferences:', e);
    }
  }

  private validatePreferences(prefs: any): UserPreferences {
    const validated = { ...DEFAULT_PREFERENCES };
    
    Object.keys(DEFAULT_PREFERENCES).forEach(key => {
      const k = key as keyof UserPreferences;
      if (prefs[k] !== undefined && typeof prefs[k] === typeof DEFAULT_PREFERENCES[k]) {
        (validated as any)[k] = prefs[k];
      }
    });
    
    return validated;
  }

  private handlePreferenceChange<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]): void {
    switch (key) {
      case 'theme':
        this.applyTheme();
        break;
      case 'fontSize':
        this.applyFontSize();
        break;
      case 'highContrast':
        this.applyHighContrast();
        break;
      case 'reducedMotion':
        this.applyReducedMotion();
        break;
      default:
        // Other preferences might be handled by specific components
        break;
    }
  }

  private applyAllPreferences(): void {
    this.applyTheme();
    this.applyFontSize();
    this.applyHighContrast();
    this.applyReducedMotion();
  }

  private applyTheme(): void {
    const theme = this.getPreference('theme');
    const body = document.body;
    
    body.classList.remove('theme-light', 'theme-dark', 'theme-auto');
    
    if (theme === 'auto') {
      body.classList.add('theme-auto');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      body.classList.toggle('dark-mode', prefersDark);
    } else {
      body.classList.add(`theme-${theme}`);
      body.classList.toggle('dark-mode', theme === 'dark');
    }
  }

  private applyFontSize(): void {
    const fontSize = this.getPreference('fontSize');
    const body = document.body;
    
    body.classList.remove('font-small', 'font-medium', 'font-large', 'font-extra-large');
    body.classList.add(`font-${fontSize}`);
  }

  private applyHighContrast(): void {
    const highContrast = this.getPreference('highContrast');
    document.body.classList.toggle('high-contrast', highContrast);
  }

  private applyReducedMotion(): void {
    const reducedMotion = this.getPreference('reducedMotion');
    document.body.classList.toggle('reduced-motion', reducedMotion);
  }

  private setupMediaQueryListeners(): void {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      if (this.getPreference('theme') === 'auto') {
        this.applyTheme();
      }
    });

    // Listen for reduced motion preference changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', (e) => {
      if (!this.hasCustomPreferences()) {
        this.setPreference('reducedMotion', e.matches);
      }
    });
  }
}