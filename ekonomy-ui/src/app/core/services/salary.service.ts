import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Salary } from '../models/salary.model';

@Injectable({ providedIn: 'root' })
export class SalaryService {
  private readonly url = '/api/salaries';

  constructor(private http: HttpClient) {}

  list() { return this.http.get<Salary[]>(this.url); }
  create(s: Salary) { return this.http.post<Salary>(this.url, s); }
  update(id: number, s: Salary) { return this.http.put<Salary>(`${this.url}/${id}`, s); }
  delete(id: number) { return this.http.delete<void>(`${this.url}/${id}`); }
}
