import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Transaction } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly url = '/api/transactions';

  constructor(private http: HttpClient) {}

  list(type?: string) {
    let params = new HttpParams();
    if (type) params = params.set('type', type);
    return this.http.get<Transaction[]>(this.url, { params });
  }

  create(transaction: Transaction) {
    return this.http.post<Transaction>(this.url, transaction);
  }

  update(id: number, transaction: Transaction) {
    return this.http.put<Transaction>(`${this.url}/${id}`, transaction);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
