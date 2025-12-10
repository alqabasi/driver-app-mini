export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

export interface Transaction {
  id: string; // We convert backend number ID to string for frontend consistency
  clientName: string; // Mapped from backend 'description'
  amount: number;
  type: TransactionType;
  timestamp: number;
}

export enum DayStatus {
  OPEN = 'open',
  CLOSED = 'closed'
}

export interface DailyLog {
  id: string; // YYYY-MM-DD
  driverId: string;
  date: number; // timestamp
  status: DayStatus;
  transactions: Transaction[];
  closedAt?: number;
}

export interface Driver {
  id?: number;
  mobile: string; // mapped from mobilePhone
  name: string; // mapped from fullName
  token?: string;
}

export interface AppState {
  currentUser: Driver | null;
  currentDayId: string | null;
}