import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../core/services/cart.service';

@Component({
  selector: 'app-lightbox',
  imports: [CommonModule, RouterLink],
  templateUrl: './lightbox.html',
  styleUrl: './lightbox.scss',
})
export class Lightbox implements OnInit {
  cartService = inject(CartService);

  // View modes
  viewMode: 'grid' | 'list' = 'grid';
  sortBy: 'date' | 'title' = 'date';

  // Selection for bulk operations
  selectedItems = new Set<string>();
  selectAll = false;

  ngOnInit() {
    // Component initialization
  }

  get cartItems(): CartItem[] {
    return this.sortBy === 'date'
      ? this.cartService.getItemsSortedByDate()
      : [...this.cartService.cartItems()].sort((a, b) =>
          a.title.localeCompare(b.title)
        );
  }

  get itemCount(): number {
    return this.cartService.itemCount();
  }

  get hasItems(): boolean {
    return this.itemCount > 0;
  }

  get selectedCount(): number {
    return this.selectedItems.size;
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  toggleSortBy(): void {
    this.sortBy = this.sortBy === 'date' ? 'title' : 'date';
  }

  removeItem(id: string): void {
    this.cartService.removeItem(id);
    this.selectedItems.delete(id);
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear all items from your lightbox?')) {
      this.cartService.clearCart();
      this.selectedItems.clear();
      this.selectAll = false;
    }
  }

  toggleItemSelection(id: string): void {
    if (this.selectedItems.has(id)) {
      this.selectedItems.delete(id);
    } else {
      this.selectedItems.add(id);
    }
    this.updateSelectAllState();
  }

  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
    if (this.selectAll) {
      this.cartItems.forEach(item => this.selectedItems.add(item.id));
    } else {
      this.selectedItems.clear();
    }
  }

  private updateSelectAllState(): void {
    this.selectAll = this.selectedItems.size === this.itemCount && this.itemCount > 0;
  }

  deleteSelected(): void {
    if (this.selectedCount === 0) return;

    if (confirm(`Are you sure you want to delete ${this.selectedCount} selected item(s)?`)) {
      this.selectedItems.forEach(id => this.cartService.removeItem(id));
      this.selectedItems.clear();
      this.selectAll = false;
    }
  }

  exportCart(): void {
    const data = this.cartService.exportCart();
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `blake-lightbox-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  isSelected(id: string): boolean {
    return this.selectedItems.has(id);
  }
}
