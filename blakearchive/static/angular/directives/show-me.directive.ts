import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
  selector: '[appShowMe]',
  standalone: true
})
export class ShowMeDirective implements OnInit, OnDestroy {
  @Input('appShowMe') showMeValue: string = '';
  @Input() object: any;
  @Input() copyBad: string = '';

  private destroy$ = new Subject<void>();

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.setupClickListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupClickListener(): void {
    fromEvent(this.elementRef.nativeElement, 'click')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.openNewWindow();
      });
  }

  private openNewWindow(): void {
    if (this.showMeValue && this.object?.desc_id) {
      const url = `/new-window/${this.showMeValue}/${this.copyBad}?descId=${this.object.desc_id}`;
      const windowFeatures = 'width=800,height=600';
      
      window.open(url, '_blank', windowFeatures);
    }
  }

  public triggerWindow(): void {
    this.openNewWindow();
  }
}