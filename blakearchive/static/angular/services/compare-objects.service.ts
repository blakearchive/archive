import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ComparisonObject {
  object_id: string;
  [key: string]: any;
}

export interface ComparisonState {
  main: ComparisonObject | null;
  comparisonType: string;
  comparisonObjects: ComparisonObject[];
}

@Injectable({
  providedIn: 'root'
})
export class CompareObjectsService {
  private stateSubject = new BehaviorSubject<ComparisonState>({
    main: null,
    comparisonType: '',
    comparisonObjects: []
  });

  // Observable for reactive updates
  state$ = this.stateSubject.asObservable();

  constructor() {}

  /**
   * Get current state
   */
  private get currentState(): ComparisonState {
    return this.stateSubject.value;
  }

  /**
   * Update state and emit changes
   */
  private updateState(updates: Partial<ComparisonState>): void {
    const newState = { ...this.currentState, ...updates };
    this.stateSubject.next(newState);
  }

  /**
   * Get current main object
   */
  get main(): ComparisonObject | null {
    return this.currentState.main;
  }

  /**
   * Get main object (alternative method name)
   */
  getMainObject(): ComparisonObject | null {
    return this.currentState.main;
  }

  /**
   * Get current comparison type
   */
  get comparisonType(): string {
    return this.currentState.comparisonType;
  }

  /**
   * Get current comparison objects
   */
  get comparisonObjects(): ComparisonObject[] {
    return [...this.currentState.comparisonObjects];
  }

  /**
   * Set the main object for comparison
   */
  setMainObject(obj: ComparisonObject): void {
    const currentObjects = [...this.currentState.comparisonObjects];
    
    // Add to comparison objects if not already present
    if (!this.isComparisonObject(obj)) {
      currentObjects.unshift(obj);
    }

    this.updateState({
      main: obj,
      comparisonObjects: currentObjects
    });
  }

  /**
   * Reset comparison objects and main object
   */
  resetComparisonObjects(): void {
    this.updateState({
      main: null,
      comparisonObjects: [],
      comparisonType: ''
    });
  }

  /**
   * Check if object is the main object
   */
  isMain(obj: ComparisonObject): boolean {
    const main = this.currentState.main;
    return main ? obj.object_id === main.object_id : false;
  }

  /**
   * Add object to comparison list
   */
  addComparisonObject(obj: ComparisonObject): void {
    if (!this.isComparisonObject(obj)) {
      const currentObjects = [...this.currentState.comparisonObjects];
      currentObjects.push(obj);
      this.updateState({ comparisonObjects: currentObjects });
    }
  }

  /**
   * Select all objects for comparison
   */
  selectAll(objects: ComparisonObject[]): void {
    let newObjects = [...objects];
    const main = this.currentState.main;
    
    if (main && main.object_id) {
      newObjects.unshift(main);
    }

    this.updateState({ comparisonObjects: newObjects });
  }

  /**
   * Remove object from comparison list
   */
  removeComparisonObject(obj: ComparisonObject): void {
    const currentObjects = this.currentState.comparisonObjects.filter(
      item => item.object_id !== obj.object_id
    );
    
    this.updateState({ comparisonObjects: currentObjects });
  }

  /**
   * Clear all comparison objects but keep main if it exists
   */
  clearComparisonObjects(): void {
    const main = this.currentState.main;
    const newObjects: ComparisonObject[] = [];
    
    if (main && main.object_id) {
      newObjects.push(main);
    }

    this.updateState({
      comparisonObjects: newObjects,
      comparisonType: ''
    });
  }

  /**
   * Check if object is in comparison list
   */
  isComparisonObject(obj: ComparisonObject, type?: string): boolean {
    // Check type compatibility if provided
    if (type !== undefined && type !== this.currentState.comparisonType) {
      return false;
    }

    return this.currentState.comparisonObjects.some(
      item => item.object_id === obj.object_id
    );
  }

  /**
   * Check and set comparison type, clearing objects if type changes
   */
  checkCompareType(type: string): void {
    const currentType = this.currentState.comparisonType;
    
    if (currentType !== type && currentType !== '') {
      this.clearComparisonObjects();
    }
    
    this.updateState({ comparisonType: type });
  }

  /**
   * Check if there are any comparison objects
   */
  hasObjects(): boolean {
    return this.currentState.comparisonObjects.length > 0;
  }

  /**
   * Get count of comparison objects
   */
  getCount(): number {
    return this.currentState.comparisonObjects.length;
  }

  /**
   * Get comparison objects excluding main object
   */
  getComparisonObjectsOnly(): ComparisonObject[] {
    const main = this.currentState.main;
    if (!main) {
      return this.comparisonObjects;
    }

    return this.currentState.comparisonObjects.filter(
      obj => obj.object_id !== main.object_id
    );
  }

  /**
   * Toggle object in comparison list
   */
  toggleComparisonObject(obj: ComparisonObject): void {
    if (this.isComparisonObject(obj)) {
      this.removeComparisonObject(obj);
    } else {
      this.addComparisonObject(obj);
    }
  }
}