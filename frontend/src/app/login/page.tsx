"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "@/config/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Escribir cookies para el middleware RBAC (Edge Runtime no puede leer localStorage)
      const maxAge = 60 * 60 * 24; // 24 horas
      document.cookie = `avendia_role=${data.user?.role ?? "DOCENTE"}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `avendia_session=1; path=/; max-age=${maxAge}; SameSite=Lax`;

      // Despachar al panel correcto según el rol del usuario (RBAC)
      if (data.user?.role === "ADMIN") {
        router.push("/dashboard/admin");
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
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-6 relative overflow-hidden font-body">
      {/* Background blobs for premium IA styling */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-morado-ia/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-azul-educativo/5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-border-custom rounded-2xl shadow-xl p-8 z-10 flex flex-col gap-6">
        {/* Logo and Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-azul-educativo to-morado-ia flex items-center justify-center text-white font-headings font-bold text-2xl shadow-md">
            A
          </div>
          <h1 className="font-headings font-bold text-2xl text-slate-900 tracking-tight mt-2">
            AVENDIA
          </h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
            Plataforma Administrativa RAG
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold leading-relaxed">
            ⚠️ {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="docente@avendia.edu"
              className="px-4 py-2.5 rounded-lg border border-border-custom bg-bg-main focus:outline-none focus:border-morado-ia text-sm transition-colors text-slate-900 font-body"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="px-4 py-2.5 rounded-lg border border-border-custom bg-bg-main focus:outline-none focus:border-morado-ia text-sm transition-colors text-slate-900 font-body"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-lg bg-gradient-to-r from-azul-educativo to-morado-ia hover:opacity-95 text-white font-headings font-bold text-sm shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Iniciando sesión...</span>
              </>
            ) : (
              <span>Entrar al Sistema</span>
            )}
          </button>
        </form>

        {/* Quick Seeding access for developers */}
        <div className="border-t border-border-custom pt-6">
          <span className="block text-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Acceso Rápido (Desarrollo)
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleQuickLogin("docente")}
              className="px-3 py-2 bg-slate-50 border border-border-custom rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-center"
            >
              👩‍🏫 Docente de Prueba
            </button>
            <button
              onClick={() => handleQuickLogin("admin")}
              className="px-3 py-2 bg-slate-50 border border-border-custom rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-center"
            >
              🛠️ Administrador
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
