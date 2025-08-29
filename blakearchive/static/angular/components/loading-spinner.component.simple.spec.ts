import { LoadingSpinnerComponent } from './loading-spinner.component';

describe('LoadingSpinnerComponent (Simple)', () => {
  let component: LoadingSpinnerComponent;

  beforeEach(() => {
    component = new LoadingSpinnerComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Properties', () => {
    it('should have default properties', () => {
      expect(component.visible).toBe(true);
      expect(component.type).toBe('border');
      expect(component.size).toBe('medium');
      expect(component.color).toBe('primary');
      expect(component.text).toBe('Loading...');
      expect(component.showText).toBe(true);
      expect(component.layout).toBe('inline');
    });

    it('should accept custom properties', () => {
      component.visible = false;
      component.type = 'dots';
      component.size = 'large';
      component.color = 'secondary';
      component.text = 'Custom loading...';
      component.showText = false;

      expect(component.visible).toBe(false);
      expect(component.type).toBe('dots');
      expect(component.size).toBe('large');
      expect(component.color).toBe('secondary');
      expect(component.text).toBe('Custom loading...');
      expect(component.showText).toBe(false);
    });
  });

  describe('CSS Classes', () => {
    it('should generate correct container class', () => {
      component.layout = 'fullscreen';
      expect(component.containerClass).toBe('fullscreen');

      component.layout = 'compact';
      expect(component.containerClass).toBe('compact');
    });

    it('should generate correct spinner classes', () => {
      component.type = 'dots';
      component.size = 'large';
      component.color = 'success';

      const spinnerClass = component.spinnerClass;
      expect(spinnerClass).toContain('dots');
      expect(spinnerClass).toContain('large');
      expect(spinnerClass).toContain('success');
    });

    it('should generate text class based on color', () => {
      component.color = 'primary';
      expect(component.textClass).toBe('text-primary');

      component.color = 'secondary';
      expect(component.textClass).toBe('text-secondary');
    });

    it('should generate overlay class', () => {
      component.overlayStyle = 'dark';
      expect(component.overlayClass).toBe('dark');

      component.overlayStyle = 'light';
      expect(component.overlayClass).toBe('light');
    });

    it('should generate progress class', () => {
      component.progressColor = 'success';
      expect(component.progressClass).toBe('success');
    });
  });

  describe('Progress', () => {
    it('should handle progress values', () => {
      component.progress = -1;
      component.showProgress = true;
      expect(component.progress).toBe(-1);

      component.progress = 50;
      expect(component.progress).toBe(50);

      component.progress = 100;
      expect(component.progress).toBe(100);
    });
  });

  describe('Layout Types', () => {
    it('should support different layout types', () => {
      const layouts = ['fullscreen', 'inline', 'compact'];
      
      layouts.forEach(layout => {
        component.layout = layout as any;
        expect(component.containerClass).toBe(layout);
      });
    });
  });

  describe('Spinner Types', () => {
    it('should support different spinner types', () => {
      const types = ['dots', 'border', 'grow'];
      
      types.forEach(type => {
        component.type = type as any;
        expect(component.spinnerClass).toContain(type);
      });
    });
  });

  describe('Size Variants', () => {
    it('should support different sizes', () => {
      const sizes = ['small', 'medium', 'large'];
      
      sizes.forEach(size => {
        component.size = size as any;
        if (size !== 'medium') {
          expect(component.spinnerClass).toContain(size);
        }
      });
    });
  });

  describe('Color Variants', () => {
    it('should support different colors', () => {
      const colors = ['primary', 'secondary', 'success'];
      
      colors.forEach(color => {
        component.color = color as any;
        expect(component.spinnerClass).toContain(color);
        expect(component.textClass).toBe(`text-${color}`);
      });
    });
  });
});