import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Account } from '../models/account.model';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly url = '/api/accounts';

  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<Account[]>(this.url);
  }

  create(account: Account) {
    return this.http.post<Account>(this.url, account);
  }

  update(id: number, account: Account) {
    return this.http.put<Account>(`${this.url}/${id}`, account);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
