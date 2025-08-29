import { Injectable } from '@angular/core';
import { Observable, from, BehaviorSubject } from 'rxjs';
import { CartStorageService, CartItem } from './cart-storage.service';

export interface ImageToCrop {
  id?: number;
  url: string;
  title?: string;
  fullCaption?: string;
  [key: string]: any;
}

export interface CroppedImage extends ImageToCrop {
  croppedData?: string;
  cropParameters?: {
    x: number;
    y: number;
    width: number;
    height: number;
    scaleX?: number;
    scaleY?: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LightboxService {
  private readonly STORAGE_KEYS = {
    CART_ITEM_ADDED: 'cart-item-added',
    IMAGE_TO_CROP: 'image-to-crop',
    CROPPED_IMAGE: 'cropped-image'
  };

  private imageToCropSubject = new BehaviorSubject<ImageToCrop | null>(null);
  private croppedImageSubject = new BehaviorSubject<CroppedImage | null>(null);

  // Observables for reactive updates
  imageToCrop$ = this.imageToCropSubject.asObservable();
  croppedImage$ = this.croppedImageSubject.asObservable();

  constructor(private cartStorageService: CartStorageService) {
    this.loadPersistedImages();
  }

  /**
   * Load persisted images from localStorage on service init
   */
  private loadPersistedImages(): void {
    const imageToCrop = this.getImageToCropSync();
    const croppedImage = this.getCroppedImageSync();
    
    if (imageToCrop) {
      this.imageToCropSubject.next(imageToCrop);
    }
    if (croppedImage) {
      this.croppedImageSubject.next(croppedImage);
    }
  }

  /**
   * Debug greeting (for compatibility with original service)
   */
  sayHi(): void {
    console.log("==== LightboxService says: hi!!!!");
  }

  /**
   * Add item to cart and signal the addition
   */
  addToCart(cartItem: CartItem): Observable<CartItem[]> {
    return new Observable(observer => {
      this.cartStorageService.insert(cartItem).subscribe({
        next: (items) => {
          console.log("==just added this: " + JSON.stringify(cartItem));
          
          // Signal to other components that an item was added
          localStorage.setItem(this.STORAGE_KEYS.CART_ITEM_ADDED, JSON.stringify(cartItem));
          
          observer.next(items);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

  /**
   * Get cart item by ID
   */
  getCartItem(id: string): Observable<CartItem | undefined> {
    const item = this.cartStorageService.findById(id);
    return from(Promise.resolve(item));
  }

  /**
   * Clear all cart items
   */
  clearCart(): Observable<CartItem[]> {
    return this.cartStorageService.clearCart();
  }

  /**
   * List all cart items
   */
  listCartItems(): Observable<CartItem[]> {
    return this.cartStorageService.get();
  }

  /**
   * Set image to be cropped
   */
  setImageToCrop(imgToCrop: ImageToCrop): void {
    const imageWithId = { ...imgToCrop, id: 1 };
    
    try {
      localStorage.setItem(this.STORAGE_KEYS.IMAGE_TO_CROP, JSON.stringify(imageWithId));
      this.imageToCropSubject.next(imageWithId);
    } catch (error) {
      console.error('Error setting image to crop:', error);
    }
  }

  /**
   * Get image to crop
   */
  getImageToCrop(): Observable<ImageToCrop | null> {
    return from(Promise.resolve(this.getImageToCropSync()));
  }

  /**
   * Get image to crop synchronously
   */
  private getImageToCropSync(): ImageToCrop | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.IMAGE_TO_CROP);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error getting image to crop:', error);
      return null;
    }
  }

  /**
   * Set cropped image with optional window close
   */
  setCroppedImage(cropped: CroppedImage, windowRef?: Window): Observable<boolean> {
    return new Observable(observer => {
      const croppedWithId = { ...cropped, id: 1 };
      
      try {
        localStorage.setItem(this.STORAGE_KEYS.CROPPED_IMAGE, JSON.stringify(croppedWithId));
        this.croppedImageSubject.next(croppedWithId);
        
        if (windowRef) {
          windowRef.close();
        }
        
        observer.next(true);
        observer.complete();
      } catch (error) {
        console.error('Error setting cropped image:', error);
        observer.error(error);
      }
    });
  }

  /**
   * Get cropped image
   */
  getCroppedImage(): Observable<CroppedImage | null> {
    return from(Promise.resolve(this.getCroppedImageSync()));
  }

  /**
   * Get cropped image synchronously
   */
  private getCroppedImageSync(): CroppedImage | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.CROPPED_IMAGE);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error getting cropped image:', error);
      return null;
    }
  }

  /**
   * Clear image to crop
   */
  clearImageToCrop(): void {
    localStorage.removeItem(this.STORAGE_KEYS.IMAGE_TO_CROP);
    this.imageToCropSubject.next(null);
  }

  /**
   * Clear cropped image
   */
  clearCroppedImage(): void {
    localStorage.removeItem(this.STORAGE_KEYS.CROPPED_IMAGE);
    this.croppedImageSubject.next(null);
  }

  /**
   * Clear all lightbox data
   */
  clearAllData(): void {
    this.clearImageToCrop();
    this.clearCroppedImage();
    localStorage.removeItem(this.STORAGE_KEYS.CART_ITEM_ADDED);
  }

  /**
   * Get current image to crop (synchronous)
   */
  getCurrentImageToCrop(): ImageToCrop | null {
    return this.imageToCropSubject.value;
  }

  /**
   * Get current cropped image (synchronous)
   */
  getCurrentCroppedImage(): CroppedImage | null {
    return this.croppedImageSubject.value;
  }

  /**
   * Check if there's an image ready to crop
   */
  hasImageToCrop(): boolean {
    return this.imageToCropSubject.value !== null;
  }

  /**
   * Check if there's a cropped image available
   */
  hasCroppedImage(): boolean {
    return this.croppedImageSubject.value !== null;
  }

  /**
   * Listen for cart item additions (for cross-component communication)
   */
  onCartItemAdded(): Observable<CartItem | null> {
    return new Observable(observer => {
      const handleStorageChange = (event: StorageEvent) => {
        if (event.key === this.STORAGE_KEYS.CART_ITEM_ADDED && event.newValue) {
          try {
            const cartItem = JSON.parse(event.newValue);
            observer.next(cartItem);
          } catch (error) {
            console.error('Error parsing cart item from storage event:', error);
            observer.next(null);
          }
        }
      };

      window.addEventListener('storage', handleStorageChange);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    });
  }

  /**
   * Get database reference (for compatibility with original ngDexie usage)
   * Returns the cart storage service for now
   */
  getDb(): any {
    return {
      cartItems: {
        clear: () => this.cartStorageService.clearCart(),
        get: (id: string) => this.cartStorageService.findById(id),
        put: (item: CartItem) => this.cartStorageService.insert(item),
        toArray: () => this.cartStorageService.get()
      }
    };
  }
}