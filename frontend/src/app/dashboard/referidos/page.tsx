"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { BACKEND_URL } from "@/config/api";
import {
  Share2,
  Copy,
  Check,
  Gift,
  UserPlus,
  Award,
  Sparkles,
  RefreshCw,
  Clock,
  CheckCircle,
} from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  description: string;
  created_at: string;
}

interface InvitedReferral {
  email: string;
  status: string;
  created_at: string;
}

interface ReferralData {
  referral_code: string;
  credits: number;
  invited_count: number;
  transactions: Transaction[];
  invited_list: InvitedReferral[];
}

export default function ReferidosPage() {
  const { user, refreshUser } = useUser();
  const [data, setData] = useState<ReferralData | null>(null);
  const [activeTab, setActiveTab] = useState<"historial" | "invitados">("historial");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // URL Base dinámica
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3001";
  const referralLink = data ? `${baseUrl}/register?token=${data.referral_code}` : "";

  const fetchReferralStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const response = await fetch(`${BACKEND_URL}/api/v1/referrals/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("No se pudo obtener la información de referidos.");
      }

      const resData = await response.json();
      setData(resData);
    } catch (err: any) {
      console.error("Error al cargar referidos:", err);
      setError(err.message || "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralStats();
  }, []);

  const handleCopyCode = async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.referral_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error("Error al copiar código:", err);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error("Error al copiar enlace:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-[#7C6CF2]" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-8 bg-[#FAFBFC] min-h-screen font-body text-slate-700">
      
      {/* ── Cabecera de Página ── */}
      <div className="flex flex-col gap-1">
        <h1 className="font-headings font-black text-2xl text-slate-900 tracking-tight leading-tight">
          Refiere a un Colega
        </h1>
        <p className="text-sm text-slate-500 font-body">
          Comparte AVENDIA con otros docentes y obtén créditos de inteligencia artificial para planificar sin límites.
        </p>
      </div>

      {/* ── 1. BANNER DE SALDO EN ESTILO PREMIUM AVENDIA ── */}
      <div className="w-full bg-[#7C6CF2] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg relative overflow-hidden text-white">
        {/* Decoraciones de fondo */}
        <div className="absolute top-[-20%] right-[-10%] w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-80 h-80 bg-[#FF7657]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-5 z-10 text-center md:text-left flex-col md:flex-row">
          <div className="w-16 h-16 bg-[#FF7657] rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-md transform rotate-3">
            🎯
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-extrabold font-headings tracking-tight">
              Tienes: {data?.credits ?? user?.credits ?? 0} Créditos
            </h2>
            <p className="text-sm text-purple-100 font-medium">
              Usa tus créditos para generar planes anuales, unidades y sesiones. ¡Sigue planificando con IA!
            </p>
          </div>
        </div>

        <button 
          onClick={fetchReferralStats}
          className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl transition-all shadow-sm z-10"
          title="Actualizar datos"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {/* ── 2. SECCIÓN INTERACTIVA DE ENLACES INDIVIDUALES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-white border border-[#E8EDF3] rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
        {/* Columna Izquierda informativa */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-lg font-bold font-headings text-slate-900 leading-tight">
            Invita a tus amigos y colegas
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed font-body">
            Por cada colega docente que se registre con tu código: <strong className="text-slate-950 font-bold">ambos ganan 5 créditos</strong> de inmediato. ¡Comparte y crezcan juntos!
          </p>
          <button 
            onClick={handleCopyLink}
            className="px-6 py-3 bg-[#FF7657] hover:bg-[#e66345] text-white font-bold font-headings rounded-xl text-sm transition-all duration-200 shadow-md shadow-[#FF7657]/30 transform active:scale-95 cursor-pointer"
          >
            Copiar enlace para invitar
          </button>
        </div>

        {/* Columna Derecha con Inputs de Cajas de Enlaces */}
        <div className="lg:col-span-7 space-y-4">
          {/* Input 1: Código Puro */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Tu Código de Referido
            </label>
            <div className="flex gap-2 items-center">
              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm font-bold text-slate-800 shadow-inner">
                {data?.referral_code}
              </div>
              <button
                onClick={handleCopyCode}
                className="p-3.5 bg-[#7C6CF2] text-white rounded-xl hover:bg-[#6858e0] transition-all shadow-md active:scale-95 cursor-pointer"
                title="Copiar código"
              >
                {copiedCode ? <Check className="h-5 w-5 text-emerald-400 animate-scale" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Input 2: URL Completa */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Enlace Directo de Registro
            </label>
            <div className="flex gap-2 items-center">
              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-500 shadow-inner overflow-x-auto whitespace-nowrap scrollbar-none">
                {referralLink}
              </div>
              <button
                onClick={handleCopyLink}
                className="p-3.5 bg-[#7C6CF2] text-white rounded-xl hover:bg-[#6858e0] transition-all shadow-md active:scale-95 cursor-pointer"
                title="Copiar enlace completo"
              >
                {copiedLink ? <Check className="h-5 w-5 text-emerald-400 animate-scale" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. PASOS EXPLICATIVOS ILUSTRADOS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta Paso 1 */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8EDF3] shadow-[0_4px_12px_rgba(0,0,0,0.01)] space-y-4 hover:scale-[1.02] transition-transform duration-200">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-[#7C6CF2]/10 text-[#7C6CF2] rounded-xl">
              <Share2 className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#FF7657]/10 text-[#FF7657] uppercase tracking-wide">
              Paso 1
            </span>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold font-headings text-slate-900 text-sm">1. Comparte el Enlace</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-body">
              Envía tu código o enlace directo de registro a tus colegas docentes por WhatsApp o redes sociales.
            </p>
          </div>
        </div>

        {/* Tarjeta Paso 2 */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8EDF3] shadow-[0_4px_12px_rgba(0,0,0,0.01)] space-y-4 hover:scale-[1.02] transition-transform duration-200">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-[#FF7657]/10 text-[#FF7657] rounded-xl">
              <UserPlus className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 uppercase tracking-wide">
              +5 Créditos
            </span>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold font-headings text-slate-900 text-sm">2. Gana por Registro</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-body">
              Recibe 5 créditos de regalo cuando se cree su cuenta de docente. Tu invitado también recibe 5 créditos.
            </p>
          </div>
        </div>

        {/* Tarjeta Paso 3 */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8EDF3] shadow-[0_4px_12px_rgba(0,0,0,0.01)] space-y-4 hover:scale-[1.02] transition-transform duration-200">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
              <Award className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wide">
              Premium
            </span>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold font-headings text-slate-900 text-sm">3. Crezcan Juntos</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-body">
              Accede a funciones exclusivas y soporte prioritario a medida que invites a más docentes a la red de AVENDIA.
            </p>
          </div>
        </div>
      </div>

      {/* ── 4. HISTORIAL DE MOVIMIENTOS Y VISTA EN PESTAÑAS ── */}
      <div className="space-y-4 bg-white border border-[#E8EDF3] rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
        {/* Selector de pestañas */}
        <div className="flex gap-2 border-b border-slate-200 pb-3">
          <button 
            onClick={() => setActiveTab("historial")}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-headings transition-all ${
              activeTab === "historial" 
                ? "bg-[#7C6CF2] text-white shadow-md shadow-[#7C6CF2]/20" 
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            Historial de Movimientos
          </button>
          <button 
            onClick={() => setActiveTab("invitados")}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-headings transition-all ${
              activeTab === "invitados" 
                ? "bg-[#7C6CF2] text-white shadow-md shadow-[#7C6CF2]/20" 
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            Colegas Invitados ({data?.invited_count || 0})
          </button>
        </div>

        {/* Contenido según pestaña */}
        <div className="space-y-4 pt-2">
          {activeTab === "historial" ? (
            <div className="divide-y divide-slate-100">
              {data?.transactions && data.transactions.length > 0 ? (
                data.transactions.map((tx) => (
                  <div key={tx.id} className="py-4 flex justify-between items-center text-sm first:pt-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-800 font-body">{tx.description}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 font-body">
                        <Clock className="h-3.5 w-3.5" />
                        {tx.created_at}
                      </p>
                    </div>
                    <span className="font-extrabold font-headings text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl shrink-0">
                      +{tx.amount} créditos
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-sm text-slate-400 font-body">
                  No se registran movimientos de créditos recientes.
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              {data?.invited_list && data.invited_list.length > 0 ? (
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="py-3 px-4 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Correo del Invitado</th>
                      <th className="py-3 px-4 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Fecha de Registro</th>
                      <th className="py-3 px-4 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.invited_list.map((invite, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-800 font-body">{invite.email}</td>
                        <td className="py-3.5 px-4 text-slate-500 font-body">{invite.created_at}</td>
                        <td className="py-3.5 px-4 font-body">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-550/10 text-emerald-600">
                            <CheckCircle className="h-3 w-3" />
                            Registrado
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-8 text-center text-sm text-slate-400 font-body">
                  Aún no has registrado colegas invitados bajo tu red.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
