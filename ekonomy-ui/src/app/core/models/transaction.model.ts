export interface Transaction {
  id?: number;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER_OUT' | 'TRANSFER_IN';
  date: string;
  accountId: number;
  accountName?: string;
  categoryId?: number;
  categoryName?: string;
  notes?: string;
  createdAt?: string;
  transferId?: string;
}

export interface TransferRequest {
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  date: string;
  description: string;
  notes?: string;
}
