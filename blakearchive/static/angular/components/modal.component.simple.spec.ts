import { ModalComponent } from './modal.component';

describe('ModalComponent (Simple)', () => {
  let component: ModalComponent;

  beforeEach(() => {
    component = new ModalComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Properties', () => {
    it('should have default properties', () => {
      expect(component.isOpen).toBe(false);
      expect(component.title).toBe('');
      expect(component.bodyText).toBe('');
      expect(component.size).toBe('md');
      expect(component.showCloseButton).toBe(true);
      expect(component.showFooter).toBe(true);
      expect(component.closeOnOverlayClick).toBe(true);
      expect(component.hasFooterContent).toBe(false);
    });

    it('should accept custom properties', () => {
      component.isOpen = true;
      component.title = 'Test Modal';
      component.bodyText = 'Test body content';
      component.size = 'lg';
      component.showCloseButton = false;
      component.showFooter = false;
      component.closeOnOverlayClick = false;

      expect(component.isOpen).toBe(true);
      expect(component.title).toBe('Test Modal');
      expect(component.bodyText).toBe('Test body content');
      expect(component.size).toBe('lg');
      expect(component.showCloseButton).toBe(false);
      expect(component.showFooter).toBe(false);
      expect(component.closeOnOverlayClick).toBe(false);
    });
  });

  describe('Size Options', () => {
    it('should accept all size options', () => {
      const sizes: ('sm' | 'md' | 'lg' | 'xl')[] = ['sm', 'md', 'lg', 'xl'];
      
      sizes.forEach(size => {
        component.size = size;
        expect(component.size).toBe(size);
      });
    });
  });

  describe('ngOnInit', () => {
    it('should emit onOpen when modal is initially open', () => {
      const onOpenSpy = jest.spyOn(component.onOpen, 'emit');
      component.isOpen = true;
      
      component.ngOnInit();
      
      expect(onOpenSpy).toHaveBeenCalled();
    });

    it('should not emit onOpen when modal is initially closed', () => {
      const onOpenSpy = jest.spyOn(component.onOpen, 'emit');
      component.isOpen = false;
      
      component.ngOnInit();
      
      expect(onOpenSpy).not.toHaveBeenCalled();
    });
  });

  describe('close', () => {
    it('should set isOpen to false', () => {
      component.isOpen = true;
      component.close();
      
      expect(component.isOpen).toBe(false);
    });

    it('should emit onClose event', () => {
      const onCloseSpy = jest.spyOn(component.onClose, 'emit');
      
      component.close();
      
      expect(onCloseSpy).toHaveBeenCalled();
    });
  });

  describe('open', () => {
    it('should set isOpen to true', () => {
      component.isOpen = false;
      component.open();
      
      expect(component.isOpen).toBe(true);
    });

    it('should emit onOpen event', () => {
      const onOpenSpy = jest.spyOn(component.onOpen, 'emit');
      
      component.open();
      
      expect(onOpenSpy).toHaveBeenCalled();
    });
  });

  describe('onOverlayClick', () => {
    it('should close modal when closeOnOverlayClick is true and target equals currentTarget', () => {
      component.closeOnOverlayClick = true;
      component.isOpen = true;
      
      const targetElement = document.createElement('div');
      const mockEvent = {
        target: targetElement,
        currentTarget: targetElement
      } as unknown as MouseEvent;
      
      const closeSpy = jest.spyOn(component, 'close');
      
      component.onOverlayClick(mockEvent);
      
      expect(closeSpy).toHaveBeenCalled();
    });

    it('should not close modal when closeOnOverlayClick is false', () => {
      component.closeOnOverlayClick = false;
      component.isOpen = true;
      
      const targetElement = document.createElement('div');
      const mockEvent = {
        target: targetElement,
        currentTarget: targetElement
      } as unknown as MouseEvent;
      
      const closeSpy = jest.spyOn(component, 'close');
      
      component.onOverlayClick(mockEvent);
      
      expect(closeSpy).not.toHaveBeenCalled();
    });

    it('should not close modal when target does not equal currentTarget', () => {
      component.closeOnOverlayClick = true;
      component.isOpen = true;
      
      const mockEvent = {
        target: document.createElement('span'),
        currentTarget: document.createElement('div')
      } as unknown as MouseEvent;
      
      const closeSpy = jest.spyOn(component, 'close');
      
      component.onOverlayClick(mockEvent);
      
      expect(closeSpy).not.toHaveBeenCalled();
    });
  });

  describe('Event Emitters', () => {
    it('should have onClose event emitter', () => {
      expect(component.onClose).toBeDefined();
      expect(typeof component.onClose.emit).toBe('function');
    });

    it('should have onOpen event emitter', () => {
      expect(component.onOpen).toBeDefined();
      expect(typeof component.onOpen.emit).toBe('function');
    });
  });

  describe('Modal State Changes', () => {
    it('should toggle between open and closed states', () => {
      expect(component.isOpen).toBe(false);
      
      component.open();
      expect(component.isOpen).toBe(true);
      
      component.close();
      expect(component.isOpen).toBe(false);
    });

    it('should emit events during state changes', () => {
      const onOpenSpy = jest.spyOn(component.onOpen, 'emit');
      const onCloseSpy = jest.spyOn(component.onClose, 'emit');
      
      component.open();
      expect(onOpenSpy).toHaveBeenCalledTimes(1);
      
      component.close();
      expect(onCloseSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Configuration Options', () => {
    it('should handle different size configurations', () => {
      component.size = 'sm';
      expect(component.size).toBe('sm');
      
      component.size = 'xl';
      expect(component.size).toBe('xl');
    });

    it('should handle visibility options', () => {
      component.showCloseButton = false;
      component.showFooter = false;
      
      expect(component.showCloseButton).toBe(false);
      expect(component.showFooter).toBe(false);
    });

    it('should handle interaction options', () => {
      component.closeOnOverlayClick = false;
      expect(component.closeOnOverlayClick).toBe(false);
    });
  });
});