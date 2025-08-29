import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Alert {
  type: 'success' | 'warning' | 'info' | 'danger';
  msg: string;
  id?: string;
  timestamp?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AlertFactoryService {
  private alertsSubject = new BehaviorSubject<Alert[]>([]);
  private alertIdCounter = 0;
  
  /**
   * Observable stream of alerts
   */
  public alerts$: Observable<Alert[]> = this.alertsSubject.asObservable();

  constructor() {
    // Initialize global alerts for AngularJS compatibility
    this.initializeGlobalAlerts();
  }

  /**
   * Add a new alert that will automatically close after delay
   * @param type - Alert type: success, warning, info, danger  
   * @param msg - Alert message
   * @param delay - Auto-close delay in milliseconds (default: 3200ms)
   */
  add(type: Alert['type'], msg: string, delay: number = 3200): void {
    const alert: Alert = {
      type,
      msg,
      id: `alert_${++this.alertIdCounter}`,
      timestamp: Date.now()
    };

    // Add to alerts array
    const currentAlerts = this.alertsSubject.value;
    const updatedAlerts = [...currentAlerts, alert];
    this.alertsSubject.next(updatedAlerts);

    // Update global scope for AngularJS compatibility
    this.updateGlobalAlerts(updatedAlerts);

    // Auto-remove after delay
    setTimeout(() => {
      this.remove(alert.id!);
    }, delay);
  }

  /**
   * Remove an alert by ID
   */
  remove(alertId: string): void {
    const currentAlerts = this.alertsSubject.value;
    const filteredAlerts = currentAlerts.filter(alert => alert.id !== alertId);
    this.alertsSubject.next(filteredAlerts);
    
    // Update global scope for AngularJS compatibility
    this.updateGlobalAlerts(filteredAlerts);
  }

  /**
   * Remove an alert by reference
   */
  removeAlert(alertToRemove: Alert): void {
    const currentAlerts = this.alertsSubject.value;
    const index = currentAlerts.indexOf(alertToRemove);
    
    if (index > -1) {
      const filteredAlerts = currentAlerts.filter((_, i) => i !== index);
      this.alertsSubject.next(filteredAlerts);
      
      // Update global scope for AngularJS compatibility
      this.updateGlobalAlerts(filteredAlerts);
    }
  }

  /**
   * Clear all alerts
   */
  clearAll(): void {
    this.alertsSubject.next([]);
    this.updateGlobalAlerts([]);
  }

  /**
   * Get current alerts array
   */
  getCurrentAlerts(): Alert[] {
    return this.alertsSubject.value;
  }

  /**
   * Success alert shortcut
   */
  success(msg: string, delay?: number): void {
    this.add('success', msg, delay);
  }

  /**
   * Warning alert shortcut  
   */
  warning(msg: string, delay?: number): void {
    this.add('warning', msg, delay);
  }

  /**
   * Info alert shortcut
   */
  info(msg: string, delay?: number): void {
    this.add('info', msg, delay);
  }

  /**
   * Danger/Error alert shortcut
   */
  danger(msg: string, delay?: number): void {
    this.add('danger', msg, delay);
  }

  /**
   * Error alert alias for danger
   */
  error(msg: string, delay?: number): void {
    this.danger(msg, delay);
  }

  /**
   * Initialize global alerts array for AngularJS compatibility
   */
  private initializeGlobalAlerts(): void {
    const $rootScope = (window as any).$rootScope;
    if ($rootScope) {
      $rootScope.alerts = [];
    }
  }

  /**
   * Update global alerts for AngularJS compatibility
   */
  private updateGlobalAlerts(alerts: Alert[]): void {
    const $rootScope = (window as any).$rootScope;
    if ($rootScope) {
      $rootScope.alerts = alerts;
      
      // Trigger digest cycle if available
      if ($rootScope.$apply && !$rootScope.$$phase) {
        try {
          $rootScope.$apply();
        } catch (error) {
          // Ignore digest cycle errors
        }
      }
    }
  }

  /**
   * Get alert count by type
   */
  getAlertCountByType(type: Alert['type']): number {
    return this.alertsSubject.value.filter(alert => alert.type === type).length;
  }

  /**
   * Check if there are any alerts
   */
  hasAlerts(): boolean {
    return this.alertsSubject.value.length > 0;
  }

  /**
   * Check if there are alerts of a specific type
   */
  hasAlertsOfType(type: Alert['type']): boolean {
    return this.alertsSubject.value.some(alert => alert.type === type);
  }
}