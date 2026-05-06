import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ExportService {
  private base = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  exportData(): Observable<Blob> {
    return this.http.get(`${this.base}/export`, { responseType: 'blob' });
  }

  importData(bundle: object): Observable<void> {
    return this.http.post<void>(`${this.base}/import`, bundle);
  }
}
