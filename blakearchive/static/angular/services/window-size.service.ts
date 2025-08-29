import { Injectable } from '@angular/core';

export interface WindowSize {
  height: number;
  width: number;
}

@Injectable({
  providedIn: 'root'
})
export class WindowSizeService {
  
  get windowSize(): WindowSize {
    return {
      height: window.innerHeight,
      width: window.innerWidth
    };
  }

  get height(): number {
    return window.innerHeight;
  }

  get width(): number {
    return window.innerWidth;
  }
}