import axios from "axios";

// const BASE_URL = "http://localhost:3000/api/v1";
const BASE_URL = "https://driver-api-mini-production.up.railway.app/api/v1";

const http = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" }
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("alqabasi_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Types for API Responses
export interface ApiLoginResponse {
  token: string;
}

export interface ApiTransaction {
  id: number;
  driver_id: number;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  timestamp: string; // ISO
}

export interface ApiDay {
  id: number;
  driver_id: number;
  date: string;
  status: 'open' | 'closed';
  opened_at: string;
  closed_at: string | null;
}

export const authApi = {
  login: (mobilePhone: string, password: string) =>
    http.post<ApiLoginResponse>("/auth/login", { mobilePhone, password }),

  register: (fullName: string, mobilePhone: string, password: string, license_number: string) =>
    http.post("/auth/register", { fullName, mobilePhone, password, license_number })
};

export const driverApi = {
  openDay: () => http.post<ApiDay>("/driver/day/open"),
  closeDay: () => http.post<ApiDay>("/driver/day/close"),
  getCurrentDay: () => http.get<ApiDay>("/driver/day/current")
};

export const transactionApi = {
  create: (amount: number, type: string, description: string) =>
    http.post<ApiTransaction>("/transactions", { amount, type, description }),

  getAll: () => http.get<ApiTransaction[]>("/transactions")
};

export default http;