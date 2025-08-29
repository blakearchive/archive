import { Injectable } from '@angular/core';
import { Observable, of, timer } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry?: number;
}

export interface CacheConfig {
  defaultTTL?: number; // Time to live in milliseconds
  maxSize?: number;    // Maximum number of items to cache
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache = new Map<string, CacheItem<any>>();
  private readonly config: CacheConfig;

  constructor() {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes default
      maxSize: 100 // Maximum 100 items
    };

    // Clean up expired cache entries every 5 minutes
    timer(0, 5 * 60 * 1000).subscribe(() => {
      this.cleanExpiredEntries();
    });
  }

  /**
   * Get data from cache or execute source observable if not cached/expired
   */
  get<T>(key: string, source$: Observable<T>, ttl?: number): Observable<T> {
    const cached = this.cache.get(key);
    const now = Date.now();
    
    // Check if we have valid cached data
    if (cached && this.isItemValid(cached, now)) {
      return of(cached.data);
    }

    // Execute source and cache the result
    return source$.pipe(
      tap(data => {
        this.set(key, data, ttl);
      })
    );
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiry = ttl || this.config.defaultTTL || 0;
    
    // Remove oldest items if cache is full
    if (this.cache.size >= (this.config.maxSize || 100)) {
      this.removeOldestItems();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiry: expiry > 0 ? now + expiry : undefined
    });
  }

  /**
   * Get data from cache (returns null if not found or expired)
   */
  getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    const now = Date.now();
    
    if (cached && this.isItemValid(cached, now)) {
      return cached.data;
    }
    
    if (cached) {
      // Remove expired item
      this.cache.delete(key);
    }
    
    return null;
  }

  /**
   * Check if data exists in cache and is valid
   */
  has(key: string): boolean {
    const cached = this.cache.get(key);
    const now = Date.now();
    return cached ? this.isItemValid(cached, now) : false;
  }

  /**
   * Remove item from cache
   */
  remove(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Invalidate cache entries matching a pattern
   */
  invalidatePattern(pattern: RegExp): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; entries: { key: string; age: number; hasExpiry: boolean }[] } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, item]) => ({
      key,
      age: now - item.timestamp,
      hasExpiry: !!item.expiry
    }));

    return {
      size: this.cache.size,
      entries
    };
  }

  /**
   * Create a cache key from multiple parts
   */
  createKey(...parts: (string | number | boolean)[]): string {
    return parts.map(part => String(part)).join(':');
  }

  /**
   * Utility method for common search cache keys
   */
  createSearchKey(searchParams: any): string {
    const keyParts = [
      'search',
      searchParams.searchString || '',
      searchParams.queryString || '',
      searchParams.minDate || '',
      searchParams.maxDate || '',
      JSON.stringify(searchParams).slice(0, 50) // First 50 chars of JSON
    ];
    return this.createKey(...keyParts);
  }

  private isItemValid(item: CacheItem<any>, now: number): boolean {
    return !item.expiry || now < item.expiry;
  }

  private cleanExpiredEntries(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, item] of this.cache.entries()) {
      if (item.expiry && now >= item.expiry) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    
    if (keysToDelete.length > 0) {
      console.debug(`CacheService: Cleaned ${keysToDelete.length} expired entries`);
    }
  }

  private removeOldestItems(): void {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest 10% of items
    const toRemove = Math.max(1, Math.floor(entries.length * 0.1));
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }
}