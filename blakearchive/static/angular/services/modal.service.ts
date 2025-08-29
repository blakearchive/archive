import { Injectable, ComponentRef, ViewContainerRef, createComponent, EnvironmentInjector, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ModalConfig {
  id: string;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  backdrop?: boolean | 'static';
  keyboard?: boolean;
  centered?: boolean;
  scrollable?: boolean;
  fullscreen?: boolean;
  data?: any;
}

export interface ModalRef<T = any> {
  id: string;
  componentRef: ComponentRef<T>;
  config: ModalConfig;
  result$: Observable<any>;
  close: (result?: any) => void;
  dismiss: (reason?: any) => void;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modals = new Map<string, ModalRef>();
  private modalContainer!: ViewContainerRef;
  private environmentInjector = inject(EnvironmentInjector);

  /**
   * Set the container where modals should be rendered
   */
  setContainer(container: ViewContainerRef): void {
    this.modalContainer = container;
  }

  /**
   * Open a modal with a component
   */
  open<T>(component: any, config: Partial<ModalConfig> = {}): ModalRef<T> {
    if (!this.modalContainer) {
      throw new Error('Modal container not set. Call setContainer() first.');
    }

    const modalConfig: ModalConfig = {
      id: this.generateId(),
      size: 'md',
      backdrop: true,
      keyboard: true,
      centered: false,
      scrollable: false,
      fullscreen: false,
      ...config
    };

    // Create component
    const componentRef = createComponent(component, {
      environmentInjector: this.environmentInjector,
      hostElement: this.createModalElement(modalConfig)
    }) as ComponentRef<T>;

    // Append to container
    this.modalContainer.element.nativeElement.appendChild(componentRef.location.nativeElement);

    // Create result observable
    const resultSubject = new BehaviorSubject<any>(undefined);

    // Create modal ref
    const modalRef: ModalRef<T> = {
      id: modalConfig.id,
      componentRef,
      config: modalConfig,
      result$: resultSubject.asObservable(),
      close: (result?: any) => {
        resultSubject.next(result);
        resultSubject.complete();
        this.destroyModal(modalConfig.id);
      },
      dismiss: (reason?: any) => {
        resultSubject.error(reason);
        this.destroyModal(modalConfig.id);
      }
    };

    // Pass modal ref to component if it has a modalRef property
    if (componentRef.instance && typeof componentRef.instance === 'object') {
      (componentRef.instance as any).modalRef = modalRef;
      
      // Pass config data if provided
      if (modalConfig.data) {
        Object.assign(componentRef.instance, modalConfig.data);
      }
    }

    // Store modal ref
    this.modals.set(modalConfig.id, modalRef);

    // Setup backdrop click handling
    this.setupBackdropHandling(modalRef);

    // Setup keyboard handling
    this.setupKeyboardHandling(modalRef);

    // Show modal
    this.showModal(modalRef);

    // Detect changes
    componentRef.changeDetectorRef.detectChanges();

    return modalRef;
  }

  /**
   * Close a modal by ID
   */
  close(id: string, result?: any): void {
    const modalRef = this.modals.get(id);
    if (modalRef) {
      modalRef.close(result);
    }
  }

  /**
   * Dismiss a modal by ID
   */
  dismiss(id: string, reason?: any): void {
    const modalRef = this.modals.get(id);
    if (modalRef) {
      modalRef.dismiss(reason);
    }
  }

  /**
   * Close all modals
   */
  closeAll(): void {
    this.modals.forEach(modalRef => modalRef.close());
  }

  /**
   * Get modal by ID
   */
  getModal(id: string): ModalRef | undefined {
    return this.modals.get(id);
  }

  /**
   * Check if any modal is open
   */
  hasOpenModals(): boolean {
    return this.modals.size > 0;
  }

  private generateId(): string {
    return 'modal-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
  }

  private createModalElement(config: ModalConfig): HTMLElement {
    const modalElement = document.createElement('div');
    modalElement.className = 'modal fade';
    modalElement.id = config.id;
    modalElement.setAttribute('tabindex', '-1');
    modalElement.setAttribute('aria-hidden', 'true');
    
    if (config.backdrop === 'static') {
      modalElement.setAttribute('data-bs-backdrop', 'static');
    }
    
    if (!config.keyboard) {
      modalElement.setAttribute('data-bs-keyboard', 'false');
    }

    const modalDialog = document.createElement('div');
    modalDialog.className = this.getModalDialogClasses(config);

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    modalDialog.appendChild(modalContent);
    modalElement.appendChild(modalDialog);

    return modalElement;
  }

  private getModalDialogClasses(config: ModalConfig): string {
    const classes = ['modal-dialog'];
    
    if (config.size && config.size !== 'md') {
      classes.push(`modal-${config.size}`);
    }
    
    if (config.centered) {
      classes.push('modal-dialog-centered');
    }
    
    if (config.scrollable) {
      classes.push('modal-dialog-scrollable');
    }
    
    if (config.fullscreen) {
      if (typeof config.fullscreen === 'string') {
        classes.push(`modal-fullscreen-${config.fullscreen}`);
      } else {
        classes.push('modal-fullscreen');
      }
    }

    return classes.join(' ');
  }

  private setupBackdropHandling(modalRef: ModalRef): void {
    if (!modalRef.config.backdrop) return;

    const modalElement = document.getElementById(modalRef.config.id);
    if (!modalElement) return;

    modalElement.addEventListener('click', (event) => {
      if (event.target === modalElement && modalRef.config.backdrop !== 'static') {
        modalRef.dismiss('backdrop-click');
      }
    });
  }

  private setupKeyboardHandling(modalRef: ModalRef): void {
    if (!modalRef.config.keyboard) return;

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        modalRef.dismiss('escape');
        document.removeEventListener('keydown', handleKeydown);
      }
    };

    document.addEventListener('keydown', handleKeydown);

    // Clean up listener when modal is closed
    modalRef.result$.subscribe({
      complete: () => document.removeEventListener('keydown', handleKeydown),
      error: () => document.removeEventListener('keydown', handleKeydown)
    });
  }

  private showModal(modalRef: ModalRef): void {
    const modalElement = document.getElementById(modalRef.config.id);
    if (!modalElement) return;

    // Add modal-open class to body
    document.body.classList.add('modal-open');

    // Show modal
    modalElement.classList.add('show');
    modalElement.style.display = 'block';
    modalElement.setAttribute('aria-hidden', 'false');

    // Focus management
    const focusableElements = modalElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
  }

  private destroyModal(id: string): void {
    const modalRef = this.modals.get(id);
    if (!modalRef) return;

    const modalElement = document.getElementById(id);
    if (modalElement) {
      // Hide modal
      modalElement.classList.remove('show');
      modalElement.style.display = 'none';
      modalElement.setAttribute('aria-hidden', 'true');
      
      // Remove from DOM
      modalElement.remove();
    }

    // Remove modal-open class from body if no more modals
    if (this.modals.size === 1) {
      document.body.classList.remove('modal-open');
    }

    // Destroy component
    modalRef.componentRef.destroy();

    // Remove from map
    this.modals.delete(id);
  }
}