"use client";

import React, { useEffect, useState } from "react";
import { X, User, CreditCard, Shield, LogOut, Sparkles, Check, Flame } from "lucide-react";
import { useUser } from "@/context/UserContext";
import ProfileForm from "./ProfileForm";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeClick?: () => void; // Callback to open the pricing modal
}

type TabType = "perfil" | "plan" | "cuenta";

export default function ProfileModal({ isOpen, onClose, onUpgradeClick }: ProfileModalProps) {
  const [mounted, setMounted] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("perfil");
  const [agentMode, setAgentMode] = useState(true);
  const { user, logout } = useUser();

  // Password fields for mock Change Password under 'Cuenta'
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState("");

  // Handle modal animation mount/unmount
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const timer = setTimeout(() => setAnimate(true), 50);
      document.body.style.overflow = "hidden";
      return () => clearTimeout(timer);
    } else {
      setAnimate(false);
      const timer = setTimeout(() => setMounted(false), 300);
      document.body.style.overflow = "unset";
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError("Por favor complete todos los campos de contraseña.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Las contraseñas nuevas no coinciden.");
      return;
    }
    if (newPassword.length < 6) {
      setPwError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setPwSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPwSuccess(false), 4000);
  };

  // Calculate percentage of credits remaining
  const creditsLeft = user?.credits ?? 0;
  const creditsTotal = user?.credits_total ?? 1000;
  const creditsPercentage = Math.min(100, Math.max(0, (creditsLeft / creditsTotal) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 font-body">
      {/* Backdrop blur overlay */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          animate ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Main modal container */}
      <div
        className={`relative w-full max-w-4xl h-[90vh] md:h-[650px] bg-white rounded-[2rem] shadow-2xl flex flex-col md:flex-row overflow-hidden z-10 transition-all duration-300 ease-out border border-slate-100 ${
          animate ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        {/* LEFT COLUMN: Sidebar menu */}
        <div className="w-full md:w-64 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 p-6 flex flex-col justify-between shrink-0 select-none">
          <div className="space-y-6">
            {/* Logo/Title block */}
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7C6CF2] to-[#FF7657] flex items-center justify-center font-headings font-black text-white text-base">
                A
              </span>
              <div>
                <h2 className="font-headings font-black text-xs text-slate-800 uppercase tracking-widest leading-none">
                  AVENDIA
                </h2>
                <span className="text-[9px] font-extrabold text-slate-400">
                  Configuración
                </span>
              </div>
            </div>

            {/* Tabs List */}
            <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
              <button
                onClick={() => setActiveTab("perfil")}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all w-full shrink-0 ${
                  activeTab === "perfil"
                    ? "bg-white border border-slate-200 text-[#7C6CF2] shadow-sm animate-fade-in"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                <User className="w-4 h-4 shrink-0" />
                <span>Perfil</span>
              </button>

              <button
                onClick={() => setActiveTab("plan")}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all w-full shrink-0 ${
                  activeTab === "plan"
                    ? "bg-white border border-slate-200 text-[#7C6CF2] shadow-sm animate-fade-in"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                <CreditCard className="w-4 h-4 shrink-0" />
                <span>Plan de Suscripción</span>
              </button>

              <button
                onClick={() => setActiveTab("cuenta")}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all w-full shrink-0 ${
                  activeTab === "cuenta"
                    ? "bg-white border border-slate-200 text-[#7C6CF2] shadow-sm animate-fade-in"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                <Shield className="w-4 h-4 shrink-0" />
                <span>Cuenta</span>
              </button>
            </nav>
          </div>

          {/* Bottom Area: Agent Switch & Logout */}
          <div className="space-y-4 mt-6 md:mt-0 pt-4 border-t border-slate-150">
            {/* EduAsesor Switch */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#7C6CF2]" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Asistente Docente
                </span>
              </div>

              <div className="bg-slate-200/60 p-1 rounded-xl flex items-center justify-between gap-1 w-full border border-slate-200/50">
                <button
                  type="button"
                  onClick={() => setAgentMode(true)}
                  className={`flex-1 text-[9px] font-headings font-black uppercase tracking-wider py-1.5 px-1 rounded-lg transition-all duration-200 cursor-pointer ${
                    agentMode
                      ? "bg-[#7C6CF2] text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  EduAsesor IA
                </button>
                <button
                  type="button"
                  onClick={() => setAgentMode(false)}
                  className={`flex-1 text-[9px] font-headings font-black uppercase tracking-wider py-1.5 px-1 rounded-lg transition-all duration-200 cursor-pointer ${
                    !agentMode
                      ? "bg-slate-350 text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-750"
                  }`}
                >
                  Tradicional
                </button>
              </div>
              <p className="text-[8px] font-semibold text-slate-400 leading-tight">
                {agentMode
                  ? "Las respuestas se personalizarán con inteligencia pedagógica adaptada a tu aula."
                  : "Modo tradicional sin personalización RAG contextual de aula."}
              </p>
            </div>

            {/* Cerrar Sesión */}
            <button
              onClick={logout}
              className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-650 hover:bg-red-50 px-3 py-2 rounded-xl transition-all w-full cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Active tab content */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto relative h-full flex flex-col justify-between scrollbar-thin">
          
          {/* Header of Content Area */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div>
              <h1 className="font-headings font-black text-lg text-slate-900 leading-none">
                {activeTab === "perfil" && "Configuración de Perfil"}
                {activeTab === "plan" && "Plan y Créditos"}
                {activeTab === "cuenta" && "Seguridad de la Cuenta"}
              </h1>
              <p className="text-[10px] font-semibold text-slate-400 mt-1.5">
                {activeTab === "perfil" && "Modifica tus datos personales y las directrices RAG de tu asistente."}
                {activeTab === "plan" && "Información sobre tu plan activo, consumo de créditos y recargas."}
                {activeTab === "cuenta" && "Gestiona las credenciales de acceso y mantén segura tu cuenta."}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200 active:scale-95 cursor-pointer shrink-0"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form / Tab Body Container */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1">
            
            {/* TAB 1: PERFIL */}
            {activeTab === "perfil" && (
              <ProfileForm />
            )}

            {/* TAB 2: PLAN */}
            {activeTab === "plan" && (
              <div className="space-y-6">
                
                {/* Active Plan Detail Card */}
                <div className="bg-gradient-to-br from-[#7C6CF2] to-[#5C1D42] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 translate-y-4 translate-x-4 opacity-10">
                    <CreditCard className="w-48 h-48" />
                  </div>

                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                        Plan Actual
                      </span>
                      <h2 className="font-headings font-black text-2xl mt-2 tracking-tight">
                        {user?.plan_tier === "PREMIUM" ? "AVENDIA PREMIUM 👑" : "AVENDIA GRATUITO ⚡"}
                      </h2>
                    </div>
                    {user?.plan_tier !== "PREMIUM" && (
                      <span className="flex items-center gap-1 text-[9px] font-black bg-[#FF7657] text-white px-2 py-1 rounded-full animate-pulse">
                        <Flame className="w-3 h-3" /> AHORRA 45%
                      </span>
                    )}
                  </div>

                  {/* Credits Usage */}
                  <div className="mt-8 space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span>Consumo de Créditos</span>
                      <span>
                        {creditsLeft} / {creditsTotal} Créditos libres
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-white/25 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-[#FF7657] rounded-full transition-all duration-500"
                        style={{ width: `${creditsPercentage}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-white/70 leading-normal pt-1.5">
                      Los créditos se consumen dinámicamente al generar planes anuales, rúbricas de evaluación o chatear con EduAsesor.
                    </p>
                  </div>
                </div>

                {/* Upgrade Invitation / Action */}
                <div className="border border-slate-100 rounded-3xl p-6 bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center md:text-left">
                    <h3 className="font-headings font-black text-sm text-slate-800">
                      ¿Necesitas más créditos o exportación limpia?
                    </h3>
                    <p className="text-[10px] font-semibold text-slate-400 max-w-md">
                      El Plan Premium elimina límites de generación y te permite exportar a Word sin marcas de agua.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      if (onUpgradeClick) onUpgradeClick();
                    }}
                    className="w-full md:w-auto px-6 py-2.5 bg-[#FF7657] hover:bg-[#e66345] text-white font-headings font-black text-xs rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer shrink-0 uppercase tracking-widest text-center"
                  >
                    Ver Planes Premium
                  </button>
                </div>

                {/* Plan Highlights */}
                <div className="space-y-3">
                  <h4 className="font-headings font-black text-xs text-slate-500 uppercase tracking-widest">
                    Beneficios del plan Premium
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-emerald-600" />
                      </div>
                      <span>Créditos ilimitados de generación IA</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-emerald-600" />
                      </div>
                      <span>Exportación limpia a Word (.docx)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-emerald-600" />
                      </div>
                      <span>Inteligencia alineada a CNEB 2026</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-emerald-600" />
                      </div>
                      <span>Soporte prioritario 24/7</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 3: CUENTA */}
            {activeTab === "cuenta" && (
              <div className="space-y-6">
                
                {/* Account Details ReadOnly */}
                <div className="space-y-4">
                  <h3 className="font-headings font-black text-xs text-slate-450 uppercase tracking-widest">
                    Detalles de la Cuenta
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Correo de Registro
                      </span>
                      <span className="text-xs font-bold text-slate-800 mt-1 block">
                        {user?.email || "No especificado"}
                      </span>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Código de Referido
                      </span>
                      <span className="text-xs font-bold text-[#7C6CF2] mt-1 block font-mono uppercase">
                        {(user as any)?.referral_code || "AVENDIA10"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Change Password Mock Form */}
                <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="font-headings font-black text-xs text-slate-450 uppercase tracking-widest">
                    Cambiar Contraseña
                  </h3>

                  {pwSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-bold flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>¡Contraseña actualizada con éxito!</span>
                    </div>
                  )}

                  {pwError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-650 text-xs rounded-xl font-bold flex items-center gap-2">
                      <span className="shrink-0 text-red-500">⚠</span>
                      <span>{pwError}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center">
                      <label className="sm:col-span-4 text-xs font-bold text-slate-500 text-left sm:text-right">
                        Contraseña Actual
                      </label>
                      <div className="sm:col-span-8">
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7C6CF2]/20 focus:border-[#7C6CF2] text-xs text-slate-800 bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center">
                      <label className="sm:col-span-4 text-xs font-bold text-slate-500 text-left sm:text-right">
                        Nueva Contraseña
                      </label>
                      <div className="sm:col-span-8">
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7C6CF2]/20 focus:border-[#7C6CF2] text-xs text-slate-800 bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center">
                      <label className="sm:col-span-4 text-xs font-bold text-slate-500 text-left sm:text-right">
                        Confirmar Nueva Contraseña
                      </label>
                      <div className="sm:col-span-8">
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7C6CF2]/20 focus:border-[#7C6CF2] text-xs text-slate-800 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#FF7657] hover:bg-[#e66345] text-white font-headings font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
                    >
                      Actualizar Contraseña
                    </button>
                  </div>
                </form>

              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
