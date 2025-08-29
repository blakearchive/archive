import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Alert {
  id?: number;
  type: 'success' | 'warning' | 'info' | 'danger';
  msg: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alerts: Alert[] = [];
  private alertsSubject = new BehaviorSubject<Alert[]>([]);
  private nextId = 1;

  // Observable for components to subscribe to
  alerts$: Observable<Alert[]> = this.alertsSubject.asObservable();

  /**
   * Add a new alert with automatic removal after delay
   * @param type - Alert type (success, warning, info, danger)
   * @param msg - Alert message
   * @param delay - Auto-remove delay in ms (default: 3200ms)
   */
  add(type: Alert['type'], msg: string, delay: number = 3200): void {
    const alert: Alert = {
      id: this.nextId++,
      type,
      msg
    };

    this.alerts.push(alert);
    this.alertsSubject.next([...this.alerts]);

    // Auto-remove after delay
    setTimeout(() => {
      this.remove(alert.id!);
    }, delay);
  }

  /**
   * Remove alert by ID
   */
  remove(id: number): void {
    const index = this.alerts.findIndex(alert => alert.id === id);
    if (index > -1) {
      this.alerts.splice(index, 1);
      this.alertsSubject.next([...this.alerts]);
    }
  }

  /**
   * Remove alert by index (for AngularJS compatibility)
   */
  closeAlert(index: number): void {
    if (index >= 0 && index < this.alerts.length) {
      this.alerts.splice(index, 1);
      this.alertsSubject.next([...this.alerts]);
    }
  }

  /**
   * Get current alerts array (for AngularJS compatibility)
   */
  getAlerts(): Alert[] {
    return [...this.alerts];
  }

  /**
   * Clear all alerts
   */
  clear(): void {
    this.alerts = [];
    this.alertsSubject.next([]);
  }
}