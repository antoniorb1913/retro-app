import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  getList<T>(endpoint: string, params?: {
    search?: string;
    ordering?: string;
    page?: number;
    pageSize?: number;
    platform?: string;
  }): Observable<T[]> {
    let httpParams = new HttpParams();
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.ordering) httpParams = httpParams.set('ordering', params.ordering);
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.pageSize) httpParams = httpParams.set('page_size', params.pageSize);
    if (params?.platform) httpParams = httpParams.set('platform', params.platform);

    return this.http.get<T[]>(`${this.baseUrl}/${endpoint}/`, { params: httpParams });
  }

  getById<T>(endpoint: string, id: number): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}/${id}/`);
  }

  create<T>(endpoint: string, data: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}/`, data);
  }

  update<T>(endpoint: string, id: number, data: unknown): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}/${id}/`, data);
  }

  patch<T>(endpoint: string, id: number, data: unknown): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${endpoint}/${id}/`, data);
  }

  delete(endpoint: string, id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${endpoint}/${id}/`);
  }

  upload<T>(endpoint: string, formData: FormData): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}/`, formData);
  }
}
