export interface Transaction {
  id?: number;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  accountId: number;
  accountName?: string;
  categoryId?: number;
  categoryName?: string;
  notes?: string;
  createdAt?: string;
}
