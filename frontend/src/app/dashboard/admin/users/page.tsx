"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "@/config/api";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════
interface SystemKPIs {
  docentes_totales: number;
  creditos_sistema: number;
  docs_generados: number;
  inversion_ia_soles: number;
}

interface UserDetail {
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

type FilterType = "" | "actives_today" | "low_credits" | "no_credits" | "critical";
type SubTab = "Docentes" | "Editores" | "Administradores" | "Consumo" | "Descargas";

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════
const fmtSoles = (n: number) =>
  "S/. " + n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtNum = (n: number) => n.toLocaleString("es-PE");

const fmtDate = (iso: string | null) => {
  if (!iso) return <span className="text-slate-300">—</span>;
  const d = new Date(iso);
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "2-digit" });
};

const timeAgo = (iso: string | null) => {
  if (!iso) return <span className="text-slate-300 text-[10px]">Sin acceso</span>;
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return <span className="text-emerald-600 text-[10px] font-semibold">{mins}m atrás</span>;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return <span className="text-emerald-600 text-[10px] font-semibold">{hrs}h atrás</span>;
  const days = Math.floor(hrs / 24);
  return <span className="text-slate-500 text-[10px] font-semibold">{days}d atrás</span>;
};

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

// ── KPI Card ───────────────────────────────────────────────────────────────
function KPICard({
  label, main, sub, accent, icon,
}: { label: string; main: string; sub?: string; accent: string; icon: string }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E8EDF3] p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${accent}`}>{icon}</div>
      </div>
      <div>
        <p className="font-extrabold text-2xl text-slate-900 leading-none tracking-tight">{main}</p>
        {sub && <p className="text-[10px] font-semibold text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ── Status Badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const active = status === "activo";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border
      ${active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-red-500"}`} />
      {active ? "Activo" : "Suspendido"}
    </span>
  );
}

// ── Credit Bar ─────────────────────────────────────────────────────────────
function CreditBar({ used, total }: { used: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const color = pct < 20 ? "bg-red-400" : pct < 50 ? "bg-amber-400" : "bg-[#7C6CF2]";
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-700">🪙 {fmtNum(used)}</span>
        <span className="text-[9px] text-slate-400">/{fmtNum(total)}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden w-24">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Adjust Credits Modal ────────────────────────────────────────────────────
function AdjustModal({
  user, onClose, onSuccess,
}: {
  user: UserDetail;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [amount, setAmount]   = useState(500);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount === 0) return;
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/admin/users/${user.id}/adjust-credits`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail || "Error al ajustar créditos.");
      }
      onSuccess();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">Ajustar Créditos</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Docente: <strong>{user.full_name}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        {/* Info actual */}
        <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between border border-slate-100">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Saldo actual</p>
            <p className="font-extrabold text-2xl text-slate-900 mt-0.5">🪙 {fmtNum(user.credits)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total adquirido</p>
            <p className="font-bold text-lg text-slate-600 mt-0.5">{fmtNum(user.credits_total)}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Cantidad a ajustar <span className="text-slate-400 font-normal">(positivo = añadir, negativo = reducir)</span>
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-[#E8EDF3] text-slate-900 font-bold text-lg outline-none focus:border-[#7C6CF2] transition-colors"
              placeholder="Ej: 500 o -200"
            />
            {/* Atajos rápidos */}
            <div className="flex gap-2 mt-2 flex-wrap">
              {[500, 1000, 2000, 5000, -500].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAmount(v)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#7C6CF2]/10 hover:text-[#7C6CF2] text-[11px] font-bold text-slate-600 transition-colors cursor-pointer"
                >
                  {v > 0 ? "+" : ""}{fmtNum(v)}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {amount !== 0 && (
            <div className={`rounded-xl p-3 text-sm font-semibold ${amount > 0 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
              {amount > 0 ? "✅" : "⚠️"} Nuevo saldo estimado:{" "}
              <strong>🪙 {fmtNum(Math.max(0, user.credits + amount))}</strong>
            </div>
          )}

          {error && (
            <p className="text-red-600 text-xs font-semibold bg-red-50 px-3 py-2 rounded-xl border border-red-200">
              ⚠️ {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-[#E8EDF3] text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || amount === 0}
              className="flex-1 py-3 rounded-xl bg-[#7C6CF2] hover:bg-[#6B5CE7] text-white text-sm font-bold transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Guardando..." : "Confirmar Ajuste"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════
const FILTER_PILLS: { label: string; value: FilterType }[] = [
  { label: "Todos",            value: "" },
  { label: "Activos Hoy",      value: "actives_today" },
  { label: "Créditos Bajos",   value: "low_credits" },
  { label: "Sin Créditos",     value: "no_credits" },
  { label: "Consumo Crítico",  value: "critical" },
];

const SUB_TABS: SubTab[] = ["Docentes", "Editores", "Administradores", "Consumo", "Descargas"];

export default function AdminUsersPage() {
  const router = useRouter();

  const [kpis, setKpis]         = useState<SystemKPIs | null>(null);
  const [users, setUsers]       = useState<UserDetail[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const [filter, setFilter]     = useState<FilterType>("");
  const [search, setSearch]     = useState("");
  const [subTab, setSubTab]     = useState<SubTab>("Docentes");

  // Modal ajuste créditos
  const [editUser, setEditUser]   = useState<UserDetail | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (f: FilterType = filter, q: string = search) => {
    setLoading(true);
    setError(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) { router.replace("/login"); return; }

    try {
      const params = new URLSearchParams();
      if (f)      params.append("filter", f);
      if (q.trim()) params.append("q", q.trim());

      const res = await fetch(
        `${BACKEND_URL}/api/v1/admin/users/dashboard${params.toString() ? "?" + params : ""}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 401 || res.status === 403) {
        router.replace(res.status === 401 ? "/login" : "/dashboard?acceso=denegado");
        return;
      }
      if (!res.ok) throw new Error("Error al obtener datos de usuarios.");

      const data = await res.json();
      setKpis(data.kpis);
      setUsers(data.users);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  }, [router, filter, search]);

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePill = (f: FilterType) => {
    setFilter(f);
    fetchData(f, search);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(filter, search);
  };

  // ── Filtered list (client-side instant search) ─────────────────────────
  const displayUsers = useMemo(() => {
    if (!search.trim()) return users;
    const t = search.toLowerCase();
    return users.filter(
      (u) =>
        u.full_name.toLowerCase().includes(t) ||
        u.email.toLowerCase().includes(t) ||
        u.phone.includes(t)
    );
  }, [users, search]);

  return (
    <>
      {/* ── Adjust Modal ─────────────────────────────────────────────── */}
      {editUser && (
        <AdjustModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSuccess={() => fetchData(filter, search)}
        />
      )}

      <div className="p-8 flex flex-col gap-6 min-h-full">
        {/* ── Page Header ───────────────────────────────────────────── */}
        <div>
          <h1 className="font-extrabold text-2xl text-slate-900 tracking-tight">Gestión de Usuarios</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Supervisión de docentes, créditos y consumo de IA en tiempo real.
          </p>
        </div>

        {/* ── KPI Cards ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Docentes Totales"
            main={kpis ? fmtNum(kpis.docentes_totales) : "—"}
            sub="Usuarios activos"
            accent="bg-blue-50 text-blue-600"
            icon="👩‍🏫"
          />
          <KPICard
            label="Créditos en Sistema"
            main={kpis ? fmtNum(kpis.creditos_sistema) : "—"}
            sub="Créditos disponibles"
            accent="bg-violet-50 text-violet-600"
            icon="🪙"
          />
          <KPICard
            label="Documentos Generados"
            main={kpis ? fmtNum(kpis.docs_generados) : "—"}
            sub="Con IA pedagógica"
            accent="bg-emerald-50 text-emerald-600"
            icon="📄"
          />
          <KPICard
            label="Inversión en IA"
            main={kpis ? fmtSoles(kpis.inversion_ia_soles) : "—"}
            sub={kpis ? `≈ $ ${(kpis.inversion_ia_soles / 3.8).toFixed(2)} USD` : undefined}
            accent="bg-amber-50 text-amber-600"
            icon="🤖"
          />
        </div>

        {/* ── Sub-tabs ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-0.5 border-b border-[#E8EDF3]">
          {SUB_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setSubTab(t)}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer -mb-px
                ${subTab === t
                  ? "border-[#7C6CF2] text-[#7C6CF2]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Toolbar: Search + Pills ────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-1 bg-white border border-[#E8EDF3] rounded-xl px-4 py-2.5 focus-within:border-[#7C6CF2] transition-colors">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, email o teléfono..."
                className="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder-slate-400"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-[#7C6CF2] hover:bg-[#6B5CE7] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Buscar
            </button>
          </form>

          {/* Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {FILTER_PILLS.map((p) => (
              <button
                key={p.value}
                onClick={() => handlePill(p.value)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer border
                  ${filter === p.value
                    ? "bg-[#7C6CF2] text-white border-[#7C6CF2] shadow-sm"
                    : "bg-white text-slate-600 border-[#E8EDF3] hover:border-[#7C6CF2]/50 hover:text-[#7C6CF2]"
                  }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Error ─────────────────────────────────────────────────── */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-semibold">
            ⚠️ {error}
          </div>
        )}

        {/* ── Users Table ───────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#E8EDF3] overflow-hidden">
          {/* Table toolbar */}
          <div className="px-6 py-4 border-b border-[#E8EDF3] flex items-center justify-between">
            <div>
              <h2 className="font-bold text-sm text-slate-900">Lista de Docentes</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {loading ? "Cargando..." : `${displayUsers.length} docentes encontrados`}
                {filter && <span className="ml-2 text-[#7C6CF2]">• Filtro activo: {FILTER_PILLS.find(p => p.value === filter)?.label}</span>}
              </p>
            </div>
            <button
              onClick={() => fetchData(filter, search)}
              className="px-3 py-1.5 text-[11px] font-bold text-slate-500 hover:text-[#7C6CF2] hover:bg-violet-50 rounded-xl transition-colors cursor-pointer border border-[#E8EDF3]"
            >
              ↺ Actualizar
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <div className="w-8 h-8 border-2 border-[#7C6CF2] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-semibold">Cargando usuarios...</span>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#F8F9FC] border-b border-[#E8EDF3]">
                    {[
                      "Docente", "Contacto", "Monto Pagado",
                      "Consumo IA", "Estado", "Créditos",
                      "Registro", "Creado por", "Áreas",
                      "Docs", "Último Acceso", "Acciones",
                    ].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F3F8]">
                  {displayUsers.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="text-center py-16 text-slate-400 font-semibold text-sm">
                        No se encontraron docentes con los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    displayUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/60 transition-colors group">
                        {/* Docente */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#7C6CF2]/10 flex items-center justify-center font-bold text-[#7C6CF2] text-xs shrink-0">
                              {u.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-[12px] leading-tight">{u.full_name}</p>
                              <p className="text-slate-400 text-[10px] mt-0.5">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        {/* Contacto */}
                        <td className="px-4 py-3.5 text-slate-600 font-medium whitespace-nowrap">{u.phone}</td>
                        {/* Monto Pagado */}
                        <td className="px-4 py-3.5 font-extrabold text-slate-900 whitespace-nowrap">
                          {fmtSoles(u.monto_pagado)}
                        </td>
                        {/* Consumo IA */}
                        <td className="px-4 py-3.5">
                          <p className="font-bold text-slate-800 text-[11px]">{fmtSoles(u.consumo_ia_soles)}</p>
                          <p className="text-slate-400 text-[9px] mt-0.5">tokens consumidos</p>
                        </td>
                        {/* Estado */}
                        <td className="px-4 py-3.5">
                          <StatusBadge status={u.status} />
                        </td>
                        {/* Créditos */}
                        <td className="px-4 py-3.5">
                          <CreditBar used={u.credits} total={u.credits_total} />
                        </td>
                        {/* Registro */}
                        <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                          {fmtDate(u.created_at)}
                        </td>
                        {/* Creado por */}
                        <td className="px-4 py-3.5 text-slate-500 max-w-[100px] truncate" title={u.created_by}>
                          {u.created_by}
                        </td>
                        {/* Áreas */}
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px]">
                            {u.areas}
                          </span>
                        </td>
                        {/* Docs */}
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-slate-800 text-[12px]">{u.docs_total}</span>
                            {u.docs_hoy > 0 && (
                              <span className="text-[9px] text-emerald-600 font-bold">+{u.docs_hoy} hoy</span>
                            )}
                          </div>
                        </td>
                        {/* Último Acceso */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {timeAgo(u.last_access)}
                        </td>
                        {/* Acciones */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                            {/* Descarga */}
                            <button
                              title="Descargar reporte"
                              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                            </button>
                            {/* Enlace */}
                            <button
                              title="Ver perfil"
                              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-violet-100 hover:text-violet-700 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                              </svg>
                            </button>
                            {/* Editar créditos */}
                            <button
                              title="Ajustar créditos"
                              onClick={() => setEditUser(u)}
                              className="w-7 h-7 rounded-lg bg-[#7C6CF2]/10 hover:bg-[#7C6CF2] hover:text-white text-[#7C6CF2] flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                          </div>
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
    </>
  );
}
