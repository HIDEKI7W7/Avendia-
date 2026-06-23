"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BACKEND_URL } from "@/config/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("registered") === "true") {
        setRegistered(true);
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al iniciar sesión.");
      }

      const data = await response.json();
      
      // Guardar sesión en localStorage
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Guardar cookies para el middleware RBAC
      const maxAge = 60 * 60 * 24; // 24 horas
      document.cookie = `avendia_role=${data.user?.role ?? "DOCENTE"}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `avendia_session=1; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `avendia_token=${data.access_token}; path=/; max-age=${maxAge}; SameSite=Lax`;

      // Redirigir al panel correspondiente
      if (data.user?.role === "ADMIN") {
        router.push("/admin-panel");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Fallo en la conexión con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (role: "docente" | "admin") => {
    setEmail(role === "docente" ? "docente@avendia.edu" : "admin@avendia.edu");
    setPassword("password123");
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center p-6 relative overflow-hidden font-body text-slate-800">
      {/* Decorative premium background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-[#7C6CF2]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-[#4A90E2]/5 blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl shadow-xl p-8 z-10 flex flex-col gap-6">
        
        {/* Header and Branding */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#4A90E2] to-[#7C6CF2] flex items-center justify-center text-white font-headings font-bold text-2xl shadow-lg shadow-[#7C6CF2]/20">
            A
          </div>
          <h1 className="font-headings font-bold text-2xl text-slate-900 tracking-tight mt-2">
            AVENDIA
          </h1>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">
            Ingreso Manual Seguro
          </p>
        </div>

        {/* Success notification from register */}
        {registered && !error && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl text-xs font-semibold leading-relaxed animate-fadeIn">
            🎉 ¡Tu cuenta ha sido creada exitosamente! Ingresa tu correo y contraseña para activar tus 7 créditos de regalo.
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-xs font-semibold leading-relaxed">
            ⚠️ {error}
          </div>
        )}

        {/* Manual Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          
          {/* Email field with Icon */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Correo Electrónico
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400">
                {/* Envelope SVG Icon */}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="docente@avendia.edu"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-[#FAFBFC] focus:outline-none focus:border-[#7C6CF2] text-sm text-slate-900 font-body transition-colors"
              />
            </div>
          </div>

          {/* Password field with Icon and Toggle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Contraseña
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400">
                {/* Lock SVG Icon */}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-[#FAFBFC] focus:outline-none focus:border-[#7C6CF2] text-sm text-slate-900 font-body transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  /* Eye-off SVG Icon */
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  /* Eye SVG Icon */
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Action Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-3.5 rounded-2xl bg-gradient-to-r from-[#4A90E2] to-[#7C6CF2] hover:opacity-95 text-white font-headings font-bold text-sm shadow-lg shadow-[#7C6CF2]/20 hover:shadow-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Ingresando...</span>
              </>
            ) : (
              <span>Ingresar a mi Cuenta →</span>
            )}
          </button>
        </form>

        {/* Link to Register page */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-500 font-semibold">
            ¿Aún no tienes cuenta?{" "}
            <Link href="/register" className="text-[#7C6CF2] hover:underline font-bold">
              Regístrate Gratis
            </Link>
          </p>
        </div>

        {/* Quick developer login buttons */}
        <div className="border-t border-slate-100 pt-6">
          <span className="block text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Acceso Rápido (Desarrollo)
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleQuickLogin("docente")}
              className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer text-center"
            >
              👩‍🏫 Docente Prueba
            </button>
            <button
              onClick={() => handleQuickLogin("admin")}
              className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer text-center"
            >
              🛠️ Administrador
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
