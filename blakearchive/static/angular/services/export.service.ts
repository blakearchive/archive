import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { UserPreferencesService } from './user-preferences.service';

export interface ExportOptions {
  format: 'json' | 'csv' | 'xml' | 'pdf' | 'zip' | 'bibtex' | 'mla' | 'chicago';
  includeImages?: boolean;
  imageQuality?: 'thumbnail' | 'medium' | 'high' | 'original';
  includeMetadata?: boolean;
  includeTranscriptions?: boolean;
  includeNotes?: boolean;
  includeBibliography?: boolean;
  customFilename?: string;
  dateRange?: { start: Date; end: Date };
  maxItems?: number;
}

export interface ExportJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  options: ExportOptions;
  createdAt: Date;
  completedAt?: Date;
  downloadUrl?: string;
  fileSize?: number;
  error?: string;
}

export interface CitationFormat {
  format: 'mla' | 'chicago' | 'apa' | 'bibtex' | 'custom';
  style?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private exportJobs = new Map<string, ExportJob>();
  
  constructor(
    private http: HttpClient,
    private userPreferences: UserPreferencesService
  ) {}

  /**
   * Export search results or object collection
   */
  exportData(data: any[], options: ExportOptions): Observable<ExportJob> {
    const job: ExportJob = {
      id: this.generateJobId(),
      status: 'pending',
      progress: 0,
      options,
      createdAt: new Date()
    };

    this.exportJobs.set(job.id, job);

    // Start export process
    return this.processExport(job, data);
  }

  /**
   * Export single work or object
   */
  exportItem(item: any, options: ExportOptions): Observable<Blob> {
    switch (options.format) {
      case 'json':
        return of(this.exportAsJSON([item], options));
      case 'csv':
        return of(this.exportAsCSV([item], options));
      case 'xml':
        return of(this.exportAsXML([item], options));
      case 'pdf':
        return this.exportAsPDF([item], options);
      case 'bibtex':
        return of(this.exportAsBibTeX([item], options));
      case 'mla':
        return of(this.exportAsCitation([item], 'mla'));
      case 'chicago':
        return of(this.exportAsCitation([item], 'chicago'));
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  /**
   * Generate citation for a work or object
   */
  generateCitation(item: any, format: CitationFormat): string {
    switch (format.format) {
      case 'mla':
        return this.generateMLACitation(item);
      case 'chicago':
        return this.generateChicagoCitation(item);
      case 'apa':
        return this.generateAPACitation(item);
      case 'bibtex':
        return this.generateBibTeXEntry(item);
      default:
        return this.generateGenericCitation(item);
    }
  }

  /**
   * Create a bibliography from multiple items
   */
  generateBibliography(items: any[], format: CitationFormat): string {
    const citations = items.map(item => this.generateCitation(item, format));
    
    switch (format.format) {
      case 'bibtex':
        return citations.join('\n\n');
      default:
        return citations
          .sort()
          .map((citation, index) => `${index + 1}. ${citation}`)
          .join('\n\n');
    }
  }

  /**
   * Export user's lightbox/cart
   */
  exportLightbox(options: ExportOptions): Observable<ExportJob> {
    // This would typically get items from a lightbox service
    const lightboxItems: any[] = []; // TODO: Get from lightbox service
    return this.exportData(lightboxItems, options);
  }

  /**
   * Get export job status
   */
  getExportJob(jobId: string): ExportJob | undefined {
    return this.exportJobs.get(jobId);
  }

  /**
   * Cancel export job
   */
  cancelExport(jobId: string): boolean {
    const job = this.exportJobs.get(jobId);
    if (job && job.status === 'processing') {
      job.status = 'failed';
      job.error = 'Cancelled by user';
      return true;
    }
    return false;
  }

  /**
   * Download exported file
   */
  downloadExport(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Get supported export formats
   */
  getSupportedFormats(): { value: string; label: string; description: string }[] {
    return [
      {
        value: 'json',
        label: 'JSON',
        description: 'Machine-readable data format'
      },
      {
        value: 'csv',
        label: 'CSV',
        description: 'Spreadsheet-compatible format'
      },
      {
        value: 'xml',
        label: 'XML',
        description: 'Structured markup format'
      },
      {
        value: 'pdf',
        label: 'PDF',
        description: 'Formatted document with images'
      },
      {
        value: 'bibtex',
        label: 'BibTeX',
        description: 'Academic citation format'
      },
      {
        value: 'mla',
        label: 'MLA Citation',
        description: 'Modern Language Association format'
      },
      {
        value: 'chicago',
        label: 'Chicago Citation',
        description: 'Chicago Manual of Style format'
      }
    ];
  }

  private processExport(job: ExportJob, data: any[]): Observable<ExportJob> {
    job.status = 'processing';
    job.progress = 10;

    try {
      let blob: Blob;
      
      switch (job.options.format) {
        case 'json':
          blob = this.exportAsJSON(data, job.options);
          break;
        case 'csv':
          blob = this.exportAsCSV(data, job.options);
          break;
        case 'xml':
          blob = this.exportAsXML(data, job.options);
          break;
        case 'pdf':
          return this.exportAsPDF(data, job.options).pipe(
            map(pdfBlob => {
              job.status = 'completed';
              job.progress = 100;
              job.completedAt = new Date();
              job.downloadUrl = window.URL.createObjectURL(pdfBlob);
              job.fileSize = pdfBlob.size;
              return job;
            }),
            catchError(error => {
              job.status = 'failed';
              job.error = error.message;
              return of(job);
            })
          );
        default:
          throw new Error(`Unsupported format: ${job.options.format}`);
      }

      job.status = 'completed';
      job.progress = 100;
      job.completedAt = new Date();
      job.downloadUrl = window.URL.createObjectURL(blob);
      job.fileSize = blob.size;

      return of(job);
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      return of(job);
    }
  }

  private exportAsJSON(data: any[], options: ExportOptions): Blob {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        format: 'json',
        itemCount: data.length,
        options: options
      },
      items: data.map(item => this.prepareItemForExport(item, options))
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    return new Blob([jsonString], { type: 'application/json' });
  }

  private exportAsCSV(data: any[], options: ExportOptions): Blob {
    if (data.length === 0) {
      return new Blob(['No data to export'], { type: 'text/csv' });
    }

    // Define CSV headers based on common fields
    const headers = [
      'Title',
      'Work ID',
      'Object ID',
      'Date',
      'Medium',
      'Institution',
      'Repository',
      'URL'
    ];

    if (options.includeTranscriptions) {
      headers.push('Transcription');
    }

    if (options.includeNotes) {
      headers.push('Notes');
    }

    // Create CSV rows
    const rows = [headers];
    
    data.forEach(item => {
      const row = [
        this.csvEscape(item.title || ''),
        this.csvEscape(item.work_id || ''),
        this.csvEscape(item.object_id || item.desc_id || ''),
        this.csvEscape(item.composition_date || item.date || ''),
        this.csvEscape(item.medium || ''),
        this.csvEscape(item.institution || ''),
        this.csvEscape(item.repository || ''),
        this.csvEscape(this.getItemUrl(item))
      ];

      if (options.includeTranscriptions) {
        row.push(this.csvEscape(item.transcription || ''));
      }

      if (options.includeNotes) {
        row.push(this.csvEscape(item.notes || ''));
      }

      rows.push(row);
    });

    const csvContent = rows.map(row => row.join(',')).join('\n');
    return new Blob([csvContent], { type: 'text/csv' });
  }

  private exportAsXML(data: any[], options: ExportOptions): Blob {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<blake_archive_export>\n';
    xml += `  <metadata>\n`;
    xml += `    <export_date>${new Date().toISOString()}</export_date>\n`;
    xml += `    <format>xml</format>\n`;
    xml += `    <item_count>${data.length}</item_count>\n`;
    xml += `  </metadata>\n`;
    xml += '  <items>\n';

    data.forEach(item => {
      xml += '    <item>\n';
      Object.keys(item).forEach(key => {
        if (this.shouldIncludeField(key, options)) {
          xml += `      <${key}>${this.xmlEscape(String(item[key]))}</${key}>\n`;
        }
      });
      xml += '    </item>\n';
    });

    xml += '  </items>\n';
    xml += '</blake_archive_export>';

    return new Blob([xml], { type: 'application/xml' });
  }

  private exportAsPDF(data: any[], options: ExportOptions): Observable<Blob> {
    // This would typically use a PDF library like jsPDF or call a server endpoint
    const pdfContent = this.generatePDFContent(data, options);
    
    return this.http.post('/api/generate-pdf', {
      content: pdfContent,
      options: options
    }, { responseType: 'blob' }).pipe(
      catchError(() => {
        // Fallback: create a simple text PDF
        return of(new Blob([pdfContent], { type: 'application/pdf' }));
      })
    );
  }

  private exportAsBibTeX(data: any[], options: ExportOptions): Blob {
    const bibtexEntries = data.map(item => this.generateBibTeXEntry(item));
    const content = bibtexEntries.join('\n\n');
    return new Blob([content], { type: 'text/plain' });
  }

  private exportAsCitation(data: any[], format: string): Blob {
    const citations = data.map(item => {
      switch (format) {
        case 'mla':
          return this.generateMLACitation(item);
        case 'chicago':
          return this.generateChicagoCitation(item);
        default:
          return this.generateGenericCitation(item);
      }
    });

    const content = citations.join('\n\n');
    return new Blob([content], { type: 'text/plain' });
  }

  private prepareItemForExport(item: any, options: ExportOptions): any {
    const exportItem: any = { ...item };

    if (!options.includeMetadata) {
      // Remove metadata fields
      delete exportItem.metadata;
      delete exportItem._source;
    }

    if (!options.includeTranscriptions) {
      delete exportItem.transcription;
      delete exportItem.markup_text;
    }

    if (!options.includeNotes) {
      delete exportItem.notes;
      delete exportItem.editor_notes;
    }

    // Add export-specific fields
    exportItem.archive_url = this.getItemUrl(item);
    exportItem.citation = this.generateGenericCitation(item);

    return exportItem;
  }

  private generateMLACitation(item: any): string {
    const title = item.title || 'Untitled';
    const date = item.composition_date || item.date || 'n.d.';
    const medium = item.medium || '';
    const institution = item.institution || '';
    
    return `Blake, William. "${title}." ${date}. ${medium}. ${institution}. Blake Archive. Web. ${new Date().toDateString()}.`;
  }

  private generateChicagoCitation(item: any): string {
    const title = item.title || 'Untitled';
    const date = item.composition_date || item.date || 'n.d.';
    const institution = item.institution || '';
    
    return `Blake, William. "${title}." ${date}. ${institution}. Blake Archive. Accessed ${new Date().toDateString()}.`;
  }

  private generateAPACitation(item: any): string {
    const title = item.title || 'Untitled';
    const date = item.composition_date || item.date || 'n.d.';
    const institution = item.institution || '';
    
    return `Blake, W. (${date}). ${title}. ${institution}. Retrieved from Blake Archive.`;
  }

  private generateBibTeXEntry(item: any): string {
    const id = (item.work_id || item.object_id || 'blake_item').replace(/[^a-zA-Z0-9_]/g, '_');
    const title = item.title || 'Untitled';
    const date = item.composition_date || item.date || '';
    const institution = item.institution || '';
    
    return `@misc{${id},
  author = {Blake, William},
  title = {${title}},
  year = {${date}},
  institution = {${institution}},
  url = {${this.getItemUrl(item)}},
  note = {Blake Archive}
}`;
  }

  private generateGenericCitation(item: any): string {
    const title = item.title || 'Untitled';
    const date = item.composition_date || item.date || 'n.d.';
    return `Blake, William. "${title}" (${date}). Blake Archive.`;
  }

  private generatePDFContent(data: any[], options: ExportOptions): string {
    let content = 'Blake Archive Export\n';
    content += '==================\n\n';
    content += `Generated: ${new Date().toLocaleString()}\n`;
    content += `Items: ${data.length}\n\n`;

    data.forEach((item, index) => {
      content += `${index + 1}. ${item.title || 'Untitled'}\n`;
      if (item.composition_date) content += `Date: ${item.composition_date}\n`;
      if (item.medium) content += `Medium: ${item.medium}\n`;
      if (item.institution) content += `Institution: ${item.institution}\n`;
      if (options.includeTranscriptions && item.transcription) {
        content += `Transcription: ${item.transcription}\n`;
      }
      content += '\n';
    });

    return content;
  }

  private getItemUrl(item: any): string {
    const baseUrl = window.location.origin;
    if (item.work_id && item.object_id) {
      return `${baseUrl}/copy/${item.work_id}?object=${item.object_id}`;
    } else if (item.work_id) {
      return `${baseUrl}/work/${item.work_id}`;
    }
    return baseUrl;
  }

  private csvEscape(value: string): string {
    if (!value) return '';
    const escaped = value.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  private xmlEscape(value: string): string {
    if (!value) return '';
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private shouldIncludeField(field: string, options: ExportOptions): boolean {
    if (!options.includeMetadata && field.startsWith('_')) return false;
    if (!options.includeTranscriptions && (field === 'transcription' || field === 'markup_text')) return false;
    if (!options.includeNotes && (field === 'notes' || field === 'editor_notes')) return false;
    return true;
  }

  private generateJobId(): string {
    return 'export-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
  }
}