import { Injectable } from '@angular/core';

export type Constructor<T = {}> = new (...args: any[]) => T;

export interface GenericFactory<T = any> {
  create(config: any): T | T[];
}

@Injectable({
  providedIn: 'root'
})
export class GenericService {

  /**
   * Creates a factory function that can instantiate objects from configurations
   * @param constructor - The constructor function to use for creating instances
   */
  createFactory<T>(constructor: Constructor<T>): GenericFactory<T> {
    return {
      create: (config: any): T | T[] => {
        if (Array.isArray(config)) {
          return config.map(item => new constructor(item));
        } else {
          return new constructor(config);
        }
      }
    };
  }

  /**
   * Create single instance from configuration
   * @param constructor - The constructor function
   * @param config - Configuration object
   */
  createInstance<T>(constructor: Constructor<T>, config: any): T {
    return new constructor(config);
  }

  /**
   * Create multiple instances from array of configurations
   * @param constructor - The constructor function
   * @param configs - Array of configuration objects
   */
  createInstances<T>(constructor: Constructor<T>, configs: any[]): T[] {
    return configs.map(config => new constructor(config));
  }

  /**
   * Create instances with optional configuration (handles both single and array)
   * @param constructor - The constructor function
   * @param config - Configuration object or array of configurations
   */
  create<T>(constructor: Constructor<T>, config: any): T | T[] {
    if (Array.isArray(config)) {
      return this.createInstances(constructor, config);
    } else {
      return this.createInstance(constructor, config);
    }
  }

  /**
   * Create factory that validates configuration before instantiation
   * @param constructor - The constructor function
   * @param validator - Validation function
   */
  createValidatedFactory<T>(
    constructor: Constructor<T>, 
    validator: (config: any) => boolean
  ): GenericFactory<T> {
    return {
      create: (config: any): T | T[] => {
        if (Array.isArray(config)) {
          const validConfigs = config.filter(validator);
          return validConfigs.map(item => new constructor(item));
        } else {
          if (validator(config)) {
            return new constructor(config);
          } else {
            throw new Error('Invalid configuration provided');
          }
        }
      }
    };
  }

  /**
   * Create factory with post-processing
   * @param constructor - The constructor function
   * @param processor - Post-processing function
   */
  createProcessedFactory<T, R = T>(
    constructor: Constructor<T>, 
    processor: (instance: T) => R
  ): { create(config: any): R | R[] } {
    return {
      create: (config: any): R | R[] => {
        if (Array.isArray(config)) {
          return config.map(item => {
            const instance = new constructor(item);
            return processor(instance);
          });
        } else {
          const instance = new constructor(config);
          return processor(instance);
        }
      }
    };
  }

  /**
   * Utility to check if value is array-like configuration
   */
  isArrayConfig(config: any): boolean {
    return Array.isArray(config);
  }

  /**
   * Utility to normalize configuration to array
   */
  normalizeToArray(config: any): any[] {
    return Array.isArray(config) ? config : [config];
  }

  /**
   * Batch create with error handling
   * @param constructor - The constructor function
   * @param configs - Array of configurations
   * @param options - Options for error handling
   */
  createBatch<T>(
    constructor: Constructor<T>, 
    configs: any[], 
    options: { 
      skipErrors?: boolean, 
      onError?: (error: Error, config: any, index: number) => void 
    } = {}
  ): T[] {
    const results: T[] = [];
    
    configs.forEach((config, index) => {
      try {
        const instance = new constructor(config);
        results.push(instance);
      } catch (error) {
        if (options.onError) {
          options.onError(error as Error, config, index);
        }
        
        if (!options.skipErrors) {
          throw error;
        }
      }
    });

    return results;
  }
}