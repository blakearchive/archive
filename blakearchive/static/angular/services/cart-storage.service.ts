import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';

export interface CartItem {
  id?: string;
  url?: string;
  title?: string;
  caption?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class CartStorageService {
  private readonly STORAGE_ID = 'cart-items-angularjs';
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  
  // Observable for reactive updates
  cartItems$ = this.cartItemsSubject.asObservable();

  constructor() {
    // Load initial data from localStorage
    this.loadFromStorage();
  }

  /**
   * Get cart items from localStorage
   */
  private getFromLocalStorage(): CartItem[] {
    try {
      const data = localStorage.getItem(this.STORAGE_ID);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  }

  /**
   * Save cart items to localStorage
   */
  private saveToLocalStorage(cartItems: CartItem[]): void {
    try {
      localStorage.setItem(this.STORAGE_ID, JSON.stringify(cartItems));
      this.cartItemsSubject.next([...cartItems]);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  /**
   * Load cart items from storage
   */
  private loadFromStorage(): void {
    const items = this.getFromLocalStorage();
    this.cartItemsSubject.next(items);
  }

  /**
   * Get all cart items (returns Observable)
   */
  get(): Observable<CartItem[]> {
    const items = this.getFromLocalStorage();
    this.cartItemsSubject.next(items);
    return of([...items]);
  }

  /**
   * Get all cart items synchronously
   */
  getSync(): CartItem[] {
    return this.getFromLocalStorage();
  }

  /**
   * Get current cart items from subject
   */
  getCurrentItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  /**
   * Insert a new cart item
   */
  insert(cartItem: CartItem): Observable<CartItem[]> {
    const currentItems = this.getFromLocalStorage();
    
    // Add unique ID if not provided
    if (!cartItem.id) {
      cartItem.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }
    
    currentItems.push(cartItem);
    this.saveToLocalStorage(currentItems);
    
    return of([...currentItems]);
  }

  /**
   * Update cart item at specific index
   */
  put(cartItem: CartItem, index: number): Observable<CartItem[]> {
    const currentItems = this.getFromLocalStorage();
    
    if (index >= 0 && index < currentItems.length) {
      currentItems[index] = cartItem;
      this.saveToLocalStorage(currentItems);
    }
    
    return of([...currentItems]);
  }

  /**
   * Delete a specific cart item
   */
  delete(cartItem: CartItem): Observable<CartItem[]> {
    const currentItems = this.getFromLocalStorage();
    const index = currentItems.findIndex(item => 
      item.id ? item.id === cartItem.id : item === cartItem
    );
    
    if (index > -1) {
      currentItems.splice(index, 1);
      this.saveToLocalStorage(currentItems);
    }
    
    return of([...currentItems]);
  }

  /**
   * Delete cart item by ID
   */
  deleteById(id: string): Observable<CartItem[]> {
    const currentItems = this.getFromLocalStorage();
    const index = currentItems.findIndex(item => item.id === id);
    
    if (index > -1) {
      currentItems.splice(index, 1);
      this.saveToLocalStorage(currentItems);
    }
    
    return of([...currentItems]);
  }

  /**
   * Delete cart item by index
   */
  deleteByIndex(index: number): Observable<CartItem[]> {
    const currentItems = this.getFromLocalStorage();
    
    if (index >= 0 && index < currentItems.length) {
      currentItems.splice(index, 1);
      this.saveToLocalStorage(currentItems);
    }
    
    return of([...currentItems]);
  }

  /**
   * Clear all cart items
   */
  clearCart(): Observable<CartItem[]> {
    this.saveToLocalStorage([]);
    return of([]);
  }

  /**
   * Get count of cart items
   */
  count(): Observable<number> {
    const items = this.getFromLocalStorage();
    return of(items.length);
  }

  /**
   * Get count of cart items synchronously
   */
  countSync(): number {
    return this.getFromLocalStorage().length;
  }

  /**
   * Check if item exists in cart
   */
  exists(cartItem: CartItem): boolean {
    const currentItems = this.getFromLocalStorage();
    return currentItems.some(item => 
      item.id ? item.id === cartItem.id : 
      item.url === cartItem.url || item.title === cartItem.title
    );
  }

  /**
   * Find cart item by ID
   */
  findById(id: string): CartItem | undefined {
    const currentItems = this.getFromLocalStorage();
    return currentItems.find(item => item.id === id);
  }

  /**
   * Update cart item by ID
   */
  updateById(id: string, updates: Partial<CartItem>): Observable<CartItem[]> {
    const currentItems = this.getFromLocalStorage();
    const index = currentItems.findIndex(item => item.id === id);
    
    if (index > -1) {
      currentItems[index] = { ...currentItems[index], ...updates };
      this.saveToLocalStorage(currentItems);
    }
    
    return of([...currentItems]);
  }
}