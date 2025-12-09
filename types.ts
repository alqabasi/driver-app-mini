export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export interface Transaction {
  id: string;
  clientName: string; // اسم العميل or Description
  amount: number;
  type: TransactionType;
  timestamp: number;
}

export enum DayStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED'
}

export interface DailyLog {
  id: string; // ISO Date string YYYY-MM-DD
  driverId: string;
  date: number; // timestamp
  status: DayStatus;
  transactions: Transaction[];
  closedAt?: number;
}

export interface Driver {
  mobile: string;
  name: string;
}

export interface AppState {
  currentUser: Driver | null;
  currentDayId: string | null; // ID of the currently viewed day
}