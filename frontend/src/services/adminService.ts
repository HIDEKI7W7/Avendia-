import { BACKEND_URL } from "@/config/api";

export interface FinancialKPIs {
  total_recaudado: number;
  pendiente: number;
  total_transacciones: number;
  ticket_promedio: number;
}

export interface TransactionDetail {
  id: string;
  created_at: string;
  amount: number;
  payment_method: string;
  status: string;
  user_name: string;
  user_email: string;
  user_credits: number;
  user_credits_total: number;
}

export interface DashboardResponse {
  kpis: FinancialKPIs;
  transactions: TransactionDetail[];
}

export interface UserKPIs {
  total_docentes: number;
  total_creditos_activos: number;
  total_docs_generados: number;
  costo_estimado_ia: number;
}

export interface UserDetail {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  credits: number;
  credits_total: number;
  created_at: string;
  created_by: string;
  areas: number;
  last_access: string | null;
  monto_pagado: number;
  consumo_ia_soles: number;
  docs_total: number;
  docs_hoy: number;
}

export interface UsersAnalyticsResponse {
  kpis: UserKPIs;
  users: UserDetail[];
}

function getHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function getDashboardAnalytics(startDate?: string, endDate?: string): Promise<DashboardResponse> {
  let url = `${BACKEND_URL}/api/v1/admin/analytics/dashboard`;
  const params = new URLSearchParams();
  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);
  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(errText || "Error al obtener analíticas del dashboard");
  }

  return response.json();
}

export async function getUsersAnalytics(filterType?: string): Promise<UsersAnalyticsResponse> {
  let url = `${BACKEND_URL}/api/v1/admin/analytics/users`;
  if (filterType) {
    url += `?filter=${filterType}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(errText || "Error al obtener analíticas de usuarios");
  }

  return response.json();
}

export async function adjustUserCredits(userId: string, amount: number): Promise<any> {
  const response = await fetch(`${BACKEND_URL}/api/v1/admin/users/${userId}/credits`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ amount }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(errText || "Error al ajustar créditos");
  }

  return response.json();
}

export async function toggleUserStatus(userId: string): Promise<any> {
  const response = await fetch(`${BACKEND_URL}/api/v1/admin/users/${userId}/toggle-status`, {
    method: "POST",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(errText || "Error al cambiar estado del usuario");
  }

  return response.json();
}
