import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Category } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly url = '/api/categories';

  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<Category[]>(this.url);
  }

  create(category: Category) {
    return this.http.post<Category>(this.url, category);
  }

  update(id: number, category: Category) {
    return this.http.put<Category>(`${this.url}/${id}`, category);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
