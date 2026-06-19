"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "@/config/api";

interface Transaction {
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

interface KPIs {
  total_recaudado: number;
  pendiente: number;
  total_transacciones: number;
  ticket_promedio: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessGranted, setAccessGranted] = useState(false);

  // Filtros de fecha
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        window.location.href = "/login";
        return;
      }

      let url = `${BACKEND_URL}/api/v1/admin/analytics/dashboard`;
      const params = new URLSearchParams();
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          window.location.href = "/login";
          return;
        }
        throw new Error("Error al obtener los datos del dashboard analítico.");
      }

      const data = await res.json();
      setKpis(data.kpis);
      setTransactions(data.transactions);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Fallo en la comunicación con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  // ── Guardia client-side RBAC (segunda línea de defensa) ────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.replace("/login");
      return;
    }
    try {
      const userObj = JSON.parse(storedUser);
      if (userObj.role !== "ADMIN") {
        console.warn(
          `[RBAC] Acceso denegado (client): rol "${userObj.role}" intentó acceder a /dashboard/admin`
        );
        router.replace("/dashboard?acceso=denegado");
        return;
      }
    } catch {
      router.replace("/login");
      return;
    }
    setAccessGranted(true);
    fetchDashboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDashboardData();
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    const months = [
      "ene.", "feb.", "mar.", "abr.", "may.", "jun.",
      "jul.", "ago.", "sep.", "oct.", "nov.", "dic."
    ];
    return `${d.getDate().toString().padStart(2, '0')}-${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <div className="p-8 bg-bg-main min-h-screen text-slate-800 font-body">
      {/* Encabezado y Selector de Fechas */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-headings font-bold text-2xl text-slate-900 tracking-tight">
            Registro de Ingresos
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-semibold">
            Historial de transacciones y pagos recibidos
          </p>
        </div>

        {/* Formulario Filtro de Calendario Doble */}
        <form onSubmit={handleFilter} className="flex items-center gap-3 bg-white p-2 rounded-xl border border-border-custom shadow-sm flex-wrap md:flex-nowrap">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider pl-2">Desde</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent border-0 text-sm font-semibold text-slate-700 focus:ring-0 p-1 cursor-pointer outline-none"
            />
          </div>
          <span className="text-slate-300">→</span>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Hasta</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent border-0 text-sm font-semibold text-slate-700 focus:ring-0 p-1 cursor-pointer outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg font-headings font-bold text-xs bg-morado-ia hover:bg-morado-ia/90 text-white shadow-md shadow-morado-ia/20 transition-all cursor-pointer"
          >
            ⚡ Filtrar
          </button>
        </form>
      </div>

      {/* Tarjetas de Métricas (KPIS Globales Financieros) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Recaudado */}
        <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <span className="font-headings font-bold text-xs text-emerald-600 tracking-wider uppercase">
              Total Recaudado
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 text-base font-bold">
              💵
            </div>
          </div>
          <span className="font-headings font-bold text-2xl text-slate-900 tracking-tight">
            S/. {kpis?.total_recaudado !== undefined ? kpis.total_recaudado.toFixed(2) : "0.00"}
          </span>
        </div>

        {/* Pendiente */}
        <div className="bg-amber-50/40 border border-amber-100 rounded-2xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <span className="font-headings font-bold text-xs text-amber-600 tracking-wider uppercase">
              Pendiente
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 text-base font-bold">
              🕒
            </div>
          </div>
          <span className="font-headings font-bold text-2xl text-slate-900 tracking-tight">
            S/. {kpis?.pendiente !== undefined ? kpis.pendiente.toFixed(2) : "0.00"}
          </span>
        </div>

        {/* Transacciones */}
        <div className="bg-blue-50/40 border border-blue-100 rounded-2xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <span className="font-headings font-bold text-xs text-blue-600 tracking-wider uppercase">
              Transacciones
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-base font-bold">
              💳
            </div>
          </div>
          <span className="font-headings font-bold text-2xl text-slate-900 tracking-tight">
            {kpis?.total_transacciones !== undefined ? kpis.total_transacciones : "0"}
          </span>
        </div>

        {/* Promedio */}
        <div className="bg-purple-50/40 border border-purple-100 rounded-2xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <span className="font-headings font-bold text-xs text-purple-600 tracking-wider uppercase">
              Promedio
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 text-base font-bold">
              📈
            </div>
          </div>
          <span className="font-headings font-bold text-2xl text-slate-900 tracking-tight">
            S/. {kpis?.ticket_promedio !== undefined ? kpis.ticket_promedio.toFixed(2) : "0.00"}
          </span>
        </div>
      </div>

      {/* Contenido Principal / Tabla de Transacciones */}
      <div className="bg-white border border-border-custom rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-morado-ia border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-slate-500">Cargando transacciones financieras...</p>
          </div>
        ) : error ? (
          <div className="p-16 text-center">
            <div className="text-red-500 text-4xl mb-3">⚠️</div>
            <h3 className="font-headings font-bold text-lg text-slate-900 mb-1">Error de carga</h3>
            <p className="text-sm text-slate-500">{error}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-slate-300 text-5xl mb-4">📭</div>
            <h3 className="font-headings font-bold text-lg text-slate-950 mb-1">Sin transacciones</h3>
            <p className="text-sm text-slate-500">No se encontraron pagos registrados en este periodo.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-custom bg-slate-50/50">
                  <th className="px-6 py-4 font-headings font-bold text-[10px] text-slate-400 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-4 font-headings font-bold text-[10px] text-slate-400 uppercase tracking-wider">Docente</th>
                  <th className="px-6 py-4 font-headings font-bold text-[10px] text-slate-400 uppercase tracking-wider">Estado de Créditos</th>
                  <th className="px-6 py-4 font-headings font-bold text-[10px] text-slate-400 uppercase tracking-wider">Método</th>
                  <th className="px-6 py-4 font-headings font-bold text-[10px] text-slate-400 uppercase tracking-wider">Monto</th>
                  <th className="px-6 py-4 font-headings font-bold text-[10px] text-slate-400 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom text-slate-700 text-sm">
                {transactions.map((trans) => {
                  // Calcular porcentaje de créditos
                  const creditPercent = Math.min(
                    100,
                    Math.max(0, (trans.user_credits / (trans.user_credits_total || 1)) * 100)
                  );

                  return (
                    <tr key={trans.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Fecha */}
                      <td className="px-6 py-4 font-semibold text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span>📅</span>
                          <span>{formatDate(trans.created_at)}</span>
                        </div>
                      </td>

                      {/* Docente */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-morado-ia/10 flex items-center justify-center font-bold text-morado-ia text-xs">
                            {trans.user_name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="block font-headings font-bold text-slate-900 leading-tight">
                              {trans.user_name}
                            </span>
                            <span className="block text-xs text-slate-400 font-semibold mt-0.5">
                              {trans.user_email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Estado de Créditos (Barra de progreso de Tailwind v4) */}
                      <td className="px-6 py-4">
                        <div className="max-w-[200px]">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1">
                            <span>{trans.user_credits} / {trans.user_credits_total}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              style={{ width: `${creditPercent}%` }}
                              className={`h-full rounded-full transition-all duration-300 ${
                                creditPercent < 20
                                  ? "bg-red-500"
                                  : creditPercent < 50
                                  ? "bg-amber-500"
                                  : "bg-morado-ia"
                              }`}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* Método */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-600 bg-slate-100">
                          💳 {trans.payment_method}
                        </span>
                      </td>

                      {/* Monto */}
                      <td className="px-6 py-4 font-headings font-bold text-slate-900 whitespace-nowrap">
                        S/. {trans.amount.toFixed(2)}
                      </td>

                      {/* Estado */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {trans.status === "completed" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100">
                            ✔️ Completado
                          </span>
                        ) : trans.status === "pending" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100">
                            ⏳ Pendiente
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-red-700 bg-red-50 border border-red-100">
                            ❌ Fallido
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
