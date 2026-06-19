"use client";

import React, { useState, useEffect } from "react";
import { BACKEND_URL } from "@/config/api";

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

interface UserKPIs {
  total_docentes: number;
  total_creditos_activos: number;
  total_docs_generados: number;
  costo_estimado_ia: number;
}

interface ActivityDoc {
  id: string;
  title: string;
  document_type: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const [kpis, setKpis] = useState<UserKPIs | null>(null);
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros y Buscador
  const [filterType, setFilterType] = useState<string>(""); // "" (Todos), "actives_today", "low_credits", "critical_consumption"
  const [searchQuery, setSearchQuery] = useState("");

  // Modales
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [activityDocs, setActivityDocs] = useState<ActivityDoc[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState<number>(500);
  const [adjusting, setAdjusting] = useState(false);

  const fetchUsersData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        window.location.href = "/login";
        return;
      }

      let url = `${BACKEND_URL}/api/v1/admin/analytics/users`;
      if (filterType) {
        url += `?filter=${filterType}`;
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
        throw new Error("Error al obtener los datos analíticos de usuarios.");
      }

      const data = await res.json();
      setKpis(data.kpis);
      setUsers(data.users);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Fallo en la comunicación con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersData();
  }, [filterType]);

  // Buscar historial del docente
  const handleViewHistory = async (user: UserDetail) => {
    setSelectedUser(user);
    setIsActivityOpen(true);
    setLoadingActivity(true);
    setActivityDocs([]);
    
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${BACKEND_URL}/api/v1/admin/users/${user.id}/activity`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Error al consultar la actividad.");
      const docs = await res.json();
      setActivityDocs(docs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingActivity(false);
    }
  };

  // Ajustar créditos de forma atómica
  const handleAdjustCredits = async () => {
    if (!selectedUser) return;
    setAdjusting(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${BACKEND_URL}/api/v1/admin/users/${selectedUser.id}/credits`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: adjustAmount }),
      });

      if (!res.ok) throw new Error("Error al actualizar créditos.");

      const data = await res.json();
      
      // Actualizar estado local
      setUsers(prev => prev.map(u => {
        if (u.id === selectedUser.id) {
          return {
            ...u,
            credits: data.credits,
            credits_total: data.credits_total
          };
        }
        return u;
      }));

      setIsAdjustOpen(false);
    } catch (err) {
      console.error(err);
      alert("Hubo un error al ajustar los créditos.");
    } finally {
      setAdjusting(false);
    }
  };

  // Cambiar estado (Activar/Suspender)
  const handleToggleStatus = async (user: UserDetail) => {
    if (!confirm(`¿Estás seguro de que deseas cambiar el estado de ${user.full_name}?`)) return;
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${BACKEND_URL}/api/v1/admin/users/${user.id}/toggle-status`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Error al cambiar de estado.");
      
      const data = await res.json();
      
      // Actualizar estado local
      setUsers(prev => prev.map(u => {
        if (u.id === user.id) {
          return { ...u, status: data.new_status };
        }
        return u;
      }));
    } catch (err) {
      console.error(err);
      alert("Error al cambiar el estado del usuario.");
    }
  };

  // Filtrar lista en memoria por buscador
  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    return (
      u.full_name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.phone.includes(query)
    );
  });

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'p. m.' : 'a. m.';
    hours = hours % 12;
    hours = hours ? hours : 12; // la hora '0' debe ser '12'
    return `${hours}:${minutes} ${ampm}`;
  };

  return (
    <div className="p-8 bg-bg-main min-h-screen text-slate-800 font-body relative">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="font-headings font-bold text-2xl text-slate-900 tracking-tight">
          Gestión de Usuarios / Docentes
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-semibold">
          Administración de balances, telemetría de IA y estado de cuentas
        </p>
      </div>

      {/* Tarjetas de KPIs Globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Docentes Totales */}
        <div className="bg-white border border-border-custom rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-xl font-bold">
            👥
          </div>
          <div>
            <span className="block text-slate-400 text-xs font-bold uppercase tracking-wider">
              Docentes Totales
            </span>
            <span className="block font-headings font-bold text-xl text-slate-900 mt-0.5">
              {kpis?.total_docentes !== undefined ? kpis.total_docentes : "Cargando..."}
            </span>
          </div>
        </div>

        {/* Créditos en Sistema */}
        <div className="bg-white border border-border-custom rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 text-xl font-bold">
            🪙
          </div>
          <div>
            <span className="block text-slate-400 text-xs font-bold uppercase tracking-wider">
              Créditos en Sistema
            </span>
            <span className="block font-headings font-bold text-xl text-slate-900 mt-0.5">
              {kpis?.total_creditos_activos !== undefined ? kpis.total_creditos_activos : "Cargando..."}
            </span>
          </div>
        </div>

        {/* Documentos Generados */}
        <div className="bg-white border border-border-custom rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 text-xl font-bold">
            📄
          </div>
          <div>
            <span className="block text-slate-400 text-xs font-bold uppercase tracking-wider">
              Docs. Generados
            </span>
            <span className="block font-headings font-bold text-xl text-slate-900 mt-0.5">
              {kpis?.total_docs_generados !== undefined ? kpis.total_docs_generados : "Cargando..."}
            </span>
          </div>
        </div>

        {/* Costo IA Estimado */}
        <div className="bg-white border border-border-custom rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 text-xl font-bold">
            💵
          </div>
          <div>
            <span className="block text-slate-400 text-xs font-bold uppercase tracking-wider">
              Inversión Est. (IA)
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-headings font-bold text-xl text-slate-900 mt-0.5">
                S/. {kpis?.costo_estimado_ia !== undefined ? kpis.costo_estimado_ia.toFixed(2) : "0.00"}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                USD ${(kpis?.costo_estimado_ia ? kpis.costo_estimado_ia / 3.80 : 0.00).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros rápidos horizontales y Buscador */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-white p-4 rounded-2xl border border-border-custom shadow-sm">
        {/* Botonera de Filtros */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Todos", value: "" },
            { label: "🟢 Activos Hoy", value: "actives_today" },
            { label: "🍊 Créditos Bajos", value: "low_credits" },
            { label: "🔥 Consumo Crítico (7d)", value: "critical_consumption" }
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setFilterType(item.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === item.value
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Input Buscador */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none focus:bg-white focus:border-morado-ia focus:ring-1 focus:ring-morado-ia transition-all"
          />
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-white border border-border-custom rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-morado-ia border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-slate-500">Cargando docentes del sistema...</p>
          </div>
        ) : error ? (
          <div className="p-16 text-center">
            <div className="text-red-500 text-4xl mb-3">⚠️</div>
            <h3 className="font-headings font-bold text-lg text-slate-900 mb-1">Error al cargar</h3>
            <p className="text-sm text-slate-500">{error}</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-slate-300 text-5xl mb-4">📭</div>
            <h3 className="font-headings font-bold text-lg text-slate-950 mb-1">Sin docentes</h3>
            <p className="text-sm text-slate-500">No se encontraron docentes bajo este filtro.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-custom bg-slate-50/50">
                  <th className="px-5 py-4 font-headings font-bold text-[10px] text-slate-400 uppercase tracking-wider">Docente</th>
                  <th className="px-5 py-4 font-headings font-bold text-[10px] text-slate-400 uppercase tracking-wider">Contacto</th>
                  <th className="px-5 py-4 font-headings font-bold text-[10px] text-slate-400 uppercase tracking-wider">Monto Pagado</th>
                  <th className="px-5 py-4 font-headings font-bold text-[10px] text-slate-400 uppercase tracking-wider">Consumo (S/.)</th>
                  <th className="px-5 py-4 font-headings font-bold text-[10px] text-slate-400 uppercase tracking-wider">Estado</th>
                  <th className="px-5 py-4 font-headings font-bold text-[10px] text-slate-400 uppercase tracking-wider">Créditos</th>
                  <th className="px-5 py-4 font-headings font-bold text-[10px] text-slate-400 uppercase tracking-wider">Registro</th>
                  <th className="px-5 py-4 font-headings font-bold text-[10px] text-slate-400 uppercase tracking-wider">Creado por</th>
                  <th className="px-5 py-4 font-headings font-bold text-[10px] text-slate-400 uppercase tracking-wider">Áreas</th>
                  <th className="px-5 py-4 font-headings font-bold text-[10px] text-slate-400 uppercase tracking-wider">Documentos</th>
                  <th className="px-5 py-4 font-headings font-bold text-[10px] text-slate-400 uppercase tracking-wider">Último Acceso</th>
                  <th className="px-5 py-4 font-headings font-bold text-[10px] text-slate-400 uppercase tracking-wider text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom text-slate-700 text-xs">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/30 transition-colors">
                    {/* Docente */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-azul-educativo/10 flex items-center justify-center font-bold text-azul-educativo text-[11px]">
                          {user.full_name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="block font-headings font-bold text-slate-900 leading-tight">
                            {user.full_name}
                          </span>
                          <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contacto */}
                    <td className="px-5 py-4 font-semibold text-slate-500">{user.phone || "-"}</td>

                    {/* Monto Pagado */}
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      S/. {user.monto_pagado.toFixed(2)}
                    </td>

                    {/* Consumo IA (Soles) */}
                    <td className="px-5 py-4">
                      <span className="block font-bold text-slate-800">S/. {user.consumo_ia_soles.toFixed(2)}</span>
                    </td>

                    {/* Estado */}
                    <td className="px-5 py-4">
                      {user.status === "activo" ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100">
                          activo
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-red-700 bg-red-50 border border-red-100">
                          suspendido
                        </span>
                      )}
                    </td>

                    {/* Créditos */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-amber-500">🪙</span>
                        <span className="font-bold text-slate-800">{user.credits}</span>
                      </div>
                    </td>

                    {/* Registro */}
                    <td className="px-5 py-4 text-slate-400 font-semibold leading-tight">
                      <span className="block text-slate-600">{formatDate(user.created_at)}</span>
                      <span className="block text-[10px] mt-0.5">{formatTime(user.created_at)}</span>
                    </td>

                    {/* Creado Por */}
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
                        {user.created_by}
                      </span>
                    </td>

                    {/* Áreas */}
                    <td className="px-5 py-4 font-bold text-slate-700">{user.areas}</td>

                    {/* Documentos */}
                    <td className="px-5 py-4 text-slate-500 font-semibold leading-tight">
                      <span className="block text-slate-800 font-bold">{user.docs_total} total</span>
                      <span className="block text-[10px] text-blue-500 mt-0.5 font-bold">{user.docs_hoy} hoy</span>
                    </td>

                    {/* Último Acceso */}
                    <td className="px-5 py-4 font-semibold text-slate-500">
                      {user.last_access ? formatDate(user.last_access) : "Nunca"}
                    </td>

                    {/* Acciones */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* Botón Ver Historial (Lupa) */}
                        <button
                          onClick={() => handleViewHistory(user)}
                          title="Ver Historial de Documentos"
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
                        >
                          🔍
                        </button>

                        {/* Botón Ajustar Créditos (Moneda) */}
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setAdjustAmount(500);
                            setIsAdjustOpen(true);
                          }}
                          title="Ajustar Créditos/Balance"
                          className="w-7 h-7 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 flex items-center justify-center cursor-pointer transition-colors"
                        >
                          🪙
                        </button>

                        {/* Botón Alternar Estado (Activar/Suspender) */}
                        <button
                          onClick={() => handleToggleStatus(user)}
                          title={user.status === "activo" ? "Suspender Usuario" : "Activar Usuario"}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                            user.status === "activo"
                              ? "bg-red-50 hover:bg-red-100 text-red-600"
                              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                          }`}
                        >
                          ⚠️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: HISTORIAL DE ACTIVIDAD */}
      {isActivityOpen && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-border-custom shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Cabecera */}
            <div className="px-6 py-4 border-b border-border-custom bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="font-headings font-bold text-slate-900">
                  Historial de Actividad
                </h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase mt-0.5">
                  {selectedUser.full_name}
                </p>
              </div>
              <button
                onClick={() => setIsActivityOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6 max-h-[350px] overflow-y-auto">
              {loadingActivity ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2">
                  <div className="w-8 h-8 border-3 border-morado-ia border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-slate-400 font-bold">Cargando historial...</span>
                </div>
              ) : activityDocs.length === 0 ? (
                <p className="text-center text-slate-400 py-8 text-xs font-semibold">
                  Este docente aún no ha generado documentos en la plataforma.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {activityDocs.map((doc) => (
                    <div key={doc.id} className="p-3 bg-slate-50 border border-border-custom rounded-xl flex justify-between items-center">
                      <div>
                        <span className="block font-headings font-bold text-slate-900 text-xs">
                          {doc.title}
                        </span>
                        <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">
                          {doc.document_type}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold whitespace-nowrap bg-white px-2 py-1 border border-border-custom rounded">
                        {formatDate(doc.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pie de modal */}
            <div className="px-6 py-4 border-t border-border-custom bg-slate-50 flex justify-end">
              <button
                onClick={() => setIsActivityOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: AJUSTAR CRÉDITOS */}
      {isAdjustOpen && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-border-custom shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Cabecera */}
            <div className="px-6 py-4 border-b border-border-custom bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="font-headings font-bold text-slate-900">
                  Modificar Balances
                </h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase mt-0.5">
                  {selectedUser.full_name}
                </p>
              </div>
              <button
                onClick={() => setIsAdjustOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6">
              <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <span className="block text-[11px] text-amber-600 font-bold">Balance Actual:</span>
                <span className="block font-headings font-bold text-slate-900 mt-0.5">
                  🪙 {selectedUser.credits} créditos
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Monto a Ajustar
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold focus:outline-none focus:bg-white focus:border-morado-ia focus:ring-1 focus:ring-morado-ia transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  * Tip: Use valores negativos (ej: <code>-500</code>) para descontar créditos del balance del docente de forma segura.
                </p>
              </div>
            </div>

            {/* Pie de modal */}
            <div className="px-6 py-4 border-t border-border-custom bg-slate-50 flex justify-end gap-2">
              <button
                onClick={() => setIsAdjustOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdjustCredits}
                disabled={adjusting}
                className="px-4 py-2 bg-morado-ia hover:bg-morado-ia/90 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-55"
              >
                {adjusting ? "Guardando..." : "✔️ Ajustar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
