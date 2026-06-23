"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "@/config/api";

// ── Types ──────────────────────────────────────────────────────────────────
interface FinanceKPIs {
  total_recaudado: number;
  pendiente: number;
  transacciones: number;
  promedio: number;
}

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

// ── Helpers ────────────────────────────────────────────────────────────────
const fmtSoles = (n: number) =>
  "S/. " + n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" }) +
    " " + d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
};

// ── KPI Card ───────────────────────────────────────────────────────────────
function KPICard({
  label, value, sub, accent, icon,
}: {
  label: string; value: string; sub?: string; accent: string; icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#E8EDF3] p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${accent}`}>
          {icon}
        </div>
      </div>
      <p className="font-extrabold text-2xl text-slate-900 leading-none tracking-tight">{value}</p>
      {sub && <p className="text-[10px] font-semibold text-slate-400">{sub}</p>}
    </div>
  );
}

// ── Credit Progress Bar ────────────────────────────────────────────────────
function CreditBar({ used, total }: { used: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#7C6CF2] rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap">
        {used.toLocaleString()} / {total.toLocaleString()}
      </span>
    </div>
  );
}

// ── Badge ──────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const isCompleted = status === "COMPLETED";
  const isPending   = status === "PENDING";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border
        ${isCompleted ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : isPending   ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-red-50 text-red-700 border-red-200"}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? "bg-emerald-500" : isPending ? "bg-amber-500" : "bg-red-500"}`} />
      {isCompleted ? "Completado" : isPending ? "Pendiente" : "Fallido"}
    </span>
  );
}

// ── Method Badge ───────────────────────────────────────────────────────────
const methodColors: Record<string, string> = {
  YAPE:          "bg-purple-50 text-purple-700 border-purple-200",
  PLIN:          "bg-green-50  text-green-700  border-green-200",
  TRANSFERENCIA: "bg-blue-50   text-blue-700   border-blue-200",
  SIN_ESPECIFICAR: "bg-slate-50 text-slate-600 border-slate-200",
};

function MethodBadge({ method }: { method: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold border ${methodColors[method] ?? methodColors.SIN_ESPECIFICAR}`}>
      {method === "SIN_ESPECIFICAR" ? "—" : method}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════
export default function AdminFinancePage() {
  const router = useRouter();
  const [kpis, setKpis]             = useState<FinanceKPIs | null>(null);
  const [transactions, setTxs]      = useState<Transaction[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [startDate, setStartDate]   = useState("");
  const [endDate, setEndDate]       = useState("");

  const fetchData = useCallback(async (sd = startDate, ed = endDate) => {
    setLoading(true);
    setError(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) { router.replace("/login"); return; }

    try {
      const params = new URLSearchParams();
      if (sd) params.append("start_date", sd);
      if (ed) params.append("end_date", ed);
      const url = `${BACKEND_URL}/api/v1/admin/finance/dashboard${params.toString() ? "?" + params : ""}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        router.replace(res.status === 401 ? "/login" : "/dashboard?acceso=denegado");
        return;
      }
      if (!res.ok) throw new Error("Error al obtener datos financieros.");

      const data = await res.json();
      setKpis(data.kpis);
      setTxs(data.transactions);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  }, [router, startDate, endDate]);

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(startDate, endDate);
  };

  return (
    <div className="p-8 flex flex-col gap-6 min-h-full">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-extrabold text-2xl text-slate-900 tracking-tight">Registro de Ingresos</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Visualiza y filtra todas las transacciones económicas del sistema AVENDIA.
          </p>
        </div>

        {/* Filtro de fechas */}
        <form onSubmit={handleFilter} className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-white border border-[#E8EDF3] rounded-xl px-3 py-2 text-xs">
            <span className="text-slate-400">📅</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="outline-none text-slate-700 bg-transparent text-xs"
            />
          </div>
          <span className="text-slate-400 text-xs font-bold">—</span>
          <div className="flex items-center gap-1.5 bg-white border border-[#E8EDF3] rounded-xl px-3 py-2 text-xs">
            <span className="text-slate-400">📅</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="outline-none text-slate-700 bg-transparent text-xs"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#7C6CF2] hover:bg-[#6B5CE7] text-white text-xs font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            Filtrar
          </button>
          {(startDate || endDate) && (
            <button
              type="button"
              onClick={() => { setStartDate(""); setEndDate(""); fetchData("", ""); }}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Limpiar
            </button>
          )}
        </form>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Recaudado"
          value={kpis ? fmtSoles(kpis.total_recaudado) : "—"}
          sub="Pagos completados"
          accent="bg-emerald-50 text-emerald-600"
          icon="💰"
        />
        <KPICard
          label="Pendiente"
          value={kpis ? fmtSoles(kpis.pendiente) : "—"}
          sub="En proceso de pago"
          accent="bg-amber-50 text-amber-600"
          icon="⏳"
        />
        <KPICard
          label="Transacciones"
          value={kpis ? kpis.transacciones.toLocaleString() : "—"}
          sub="Total de operaciones"
          accent="bg-blue-50 text-blue-600"
          icon="🔄"
        />
        <KPICard
          label="Ticket Promedio"
          value={kpis ? fmtSoles(kpis.promedio) : "—"}
          sub="Por transacción completada"
          accent="bg-violet-50 text-violet-600"
          icon="📊"
        />
      </div>

      {/* ── Error ──────────────────────────────────────────────────────── */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-semibold">
          ⚠️ {error}
        </div>
      )}

      {/* ── Tabla de Transacciones ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E8EDF3] overflow-hidden flex flex-col">
        {/* Table header */}
        <div className="px-6 py-4 border-b border-[#E8EDF3] flex items-center justify-between">
          <div>
            <h2 className="font-bold text-sm text-slate-900">Historial de Transacciones</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {loading ? "Cargando..." : `${transactions.length} registros encontrados`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[#7C6CF2] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-semibold">Cargando datos financieros...</span>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#F8F9FC] border-b border-[#E8EDF3]">
                  {["Fecha", "Docente", "Estado de Créditos", "Método", "Monto", "Estado"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F3F8]">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-slate-400 font-semibold text-sm">
                      No hay transacciones para este período.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Fecha */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-600 font-medium">
                        {fmtDate(tx.created_at)}
                      </td>
                      {/* Docente */}
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="font-bold text-slate-800 text-[12px]">{tx.user_name}</p>
                          <p className="text-slate-400 text-[10px] mt-0.5">{tx.user_email}</p>
                        </div>
                      </td>
                      {/* Estado de Créditos */}
                      <td className="px-5 py-3.5">
                        <CreditBar used={tx.user_credits} total={tx.user_credits_total} />
                      </td>
                      {/* Método */}
                      <td className="px-5 py-3.5">
                        <MethodBadge method={tx.payment_method} />
                      </td>
                      {/* Monto */}
                      <td className="px-5 py-3.5 font-extrabold text-slate-900 whitespace-nowrap">
                        {fmtSoles(tx.amount)}
                      </td>
                      {/* Estado */}
                      <td className="px-5 py-3.5">
                        <StatusBadge status={tx.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
