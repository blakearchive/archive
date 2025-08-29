import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FormatService {
  
  /**
   * Capitalizes 'copy' to 'Copy' in text if it's surrounded by whitespace
   * @param fullText - Text to process
   * @returns Modified text or false if no match
   */
  cap(fullText: string): string | false {
    if (/\s+copy\s+/.test(fullText)) {
      return fullText.replace(/copy/, 'Copy');
    }
    return false;
  }
}