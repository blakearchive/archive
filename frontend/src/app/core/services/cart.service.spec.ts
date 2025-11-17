import { TestBed } from '@angular/core/testing';
import { CartService, CartItem } from './cart.service';

describe('CartService', () => {
  let service: CartService;
  let localStorageSpy: jasmine.SpyObj<Storage>;

  beforeEach(() => {
    // Create a spy object for localStorage
    localStorageSpy = jasmine.createSpyObj('localStorage', ['getItem', 'setItem', 'removeItem']);

    // Replace global localStorage with our spy
    Object.defineProperty(window, 'localStorage', {
      value: localStorageSpy,
      writable: true
    });

    TestBed.configureTestingModule({
      providers: [CartService]
    });

    // Mock localStorage to return empty array initially
    localStorageSpy.getItem.and.returnValue('[]');

    service = TestBed.inject(CartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with empty cart', () => {
    expect(service.cartItems().length).toBe(0);
    expect(service.itemCount()).toBe(0);
  });

  it('should add item to cart', () => {
    const item = {
      url: '/object/obj1',
      title: 'Test Object',
      caption: 'Test description',
      objectId: 'obj1'
    };

    service.addItem(item);

    expect(service.cartItems().length).toBe(1);
    expect(service.itemCount()).toBe(1);
    expect(service.cartItems()[0].objectId).toBe('obj1');
    expect(service.cartItems()[0].title).toBe('Test Object');
    expect(localStorageSpy.setItem).toHaveBeenCalled();
  });

  it('should generate unique ID for each item', () => {
    const item1 = {
      url: '/object/obj1',
      title: 'Test Object 1',
      caption: 'Caption 1',
      objectId: 'obj1'
    };

    const item2 = {
      url: '/object/obj2',
      title: 'Test Object 2',
      caption: 'Caption 2',
      objectId: 'obj2'
    };

    service.addItem(item1);
    service.addItem(item2);

    const items = service.cartItems();
    expect(items[0].id).not.toBe(items[1].id);
  });

  it('should remove item from cart', () => {
    const item = {
      url: '/object/obj1',
      title: 'Test Object',
      caption: 'Caption',
      objectId: 'obj1'
    };

    service.addItem(item);
    const cartItem = service.cartItems()[0];

    service.removeItem(cartItem.id);

    expect(service.cartItems().length).toBe(0);
    expect(service.itemCount()).toBe(0);
    expect(localStorageSpy.setItem).toHaveBeenCalled();
  });

  it('should clear all items', () => {
    service.addItem({ url: '/obj/1', title: 'Object 1', caption: 'Cap 1', objectId: 'obj1' });
    service.addItem({ url: '/obj/2', title: 'Object 2', caption: 'Cap 2', objectId: 'obj2' });

    service.clearCart();

    expect(service.cartItems().length).toBe(0);
    expect(service.itemCount()).toBe(0);
    expect(localStorageSpy.setItem).toHaveBeenCalled();
  });

  it('should get items sorted by date', () => {
    const item1 = { url: '/obj/1', title: 'Object 1', caption: 'Cap 1', objectId: 'obj1' };
    const item2 = { url: '/obj/2', title: 'Object 2', caption: 'Cap 2', objectId: 'obj2' };

    service.addItem(item1);
    setTimeout(() => service.addItem(item2), 10);

    const sorted = service.getItemsSortedByDate();
    expect(sorted.length).toBe(2);
  });

  it('should export cart as JSON', () => {
    service.addItem({ url: '/obj/1', title: 'Object 1', caption: 'Cap 1', objectId: 'obj1' });
    service.addItem({ url: '/obj/2', title: 'Object 2', caption: 'Cap 2', objectId: 'obj2' });

    const exported = service.exportCart();
    const parsed = JSON.parse(exported);

    expect(parsed.length).toBe(2);
    expect(parsed[0].objectId).toBe('obj1');
    expect(parsed[1].objectId).toBe('obj2');
  });

  it('should load cart from localStorage on initialization', () => {
    const mockCart: CartItem[] = [
      {
        id: 'cart-123',
        url: '/object/obj1',
        title: 'Stored Object',
        caption: 'Stored caption',
        objectId: 'obj1',
        addedAt: new Date()
      }
    ];

    localStorageSpy.getItem.and.returnValue(JSON.stringify(mockCart));

    // Create a new service instance to trigger initialization
    const newService = new CartService();

    expect(newService.cartItems().length).toBe(1);
    expect(newService.cartItems()[0].objectId).toBe('obj1');
  });

  it('should handle invalid localStorage data gracefully', () => {
    localStorageSpy.getItem.and.returnValue('invalid json');

    // Should not throw error and should initialize with empty cart
    const newService = new CartService();
    expect(newService.cartItems().length).toBe(0);
  });
});
