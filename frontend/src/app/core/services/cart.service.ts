import { Injectable, signal } from '@angular/core';

export interface CartItem {
  id: string;
  url: string;
  title: string;
  caption: string;
  objectId?: string;
  copyId?: string;
  addedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly STORAGE_KEY = 'blake-cart-items';

  // Reactive cart state using signals
  cartItems = signal<CartItem[]>([]);
  itemCount = signal<number>(0);

  constructor() {
    this.loadCart();
  }

  /**
   * Load cart items from localStorage
   */
  private loadCart(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const items = JSON.parse(stored);
        // Convert date strings back to Date objects
        const parsedItems = items.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        }));
        this.cartItems.set(parsedItems);
        this.itemCount.set(parsedItems.length);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  }

  /**
   * Save cart items to localStorage
   */
  private saveCart(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.cartItems()));

      // Emit storage event for cross-tab communication
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'cart-item-added',
        newValue: String(this.cartItems().length),
        storageArea: localStorage
      }));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }

  /**
   * Add an item to the cart
   */
  addItem(item: Omit<CartItem, 'id' | 'addedAt'>): void {
    const newItem: CartItem = {
      ...item,
      id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      addedAt: new Date()
    };

    const current = this.cartItems();
    this.cartItems.set([...current, newItem]);
    this.itemCount.set(this.cartItems().length);
    this.saveCart();
  }

  /**
   * Remove an item from the cart
   */
  removeItem(id: string): void {
    const current = this.cartItems();
    const filtered = current.filter(item => item.id !== id);
    this.cartItems.set(filtered);
    this.itemCount.set(filtered.length);
    this.saveCart();
  }

  /**
   * Clear all items from the cart
   */
  clearCart(): void {
    this.cartItems.set([]);
    this.itemCount.set(0);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Get a specific cart item by ID
   */
  getItem(id: string): CartItem | undefined {
    return this.cartItems().find(item => item.id === id);
  }

  /**
   * Check if an object is already in the cart
   */
  isInCart(objectId: string): boolean {
    return this.cartItems().some(item => item.objectId === objectId);
  }

  /**
   * Export cart items as JSON
   */
  exportCart(): string {
    return JSON.stringify(this.cartItems(), null, 2);
  }

  /**
   * Get cart items sorted by date (newest first)
   */
  getItemsSortedByDate(): CartItem[] {
    return [...this.cartItems()].sort((a, b) =>
      b.addedAt.getTime() - a.addedAt.getTime()
    );
  }
}
