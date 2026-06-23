"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BACKEND_URL } from "@/config/api";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones básicas
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
          role: "DOCENTE"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error en el registro.");
      }

      // Guardar flag de bienvenida para el onboarding modal en el dashboard
      localStorage.setItem("show_welcome_modal", "true");

      // Redireccionar al login
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message || "Fallo en la conexión con el servidor.");
    } finally {
      setIsLoading(false);
    }
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
            Crear Cuenta de Docente
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold leading-relaxed">
            ⚠️ {error}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              Nombre Completo
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Prof. María Gómez"
              className="px-4 py-2.5 rounded-lg border border-border-custom bg-bg-main focus:outline-none focus:border-morado-ia text-sm transition-colors text-slate-900 font-body"
            />
          </div>

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

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
                <span>Creando cuenta...</span>
              </>
            ) : (
              <span>Registrarse Gratis</span>
            )}
          </button>
        </form>

        {/* Link back to login */}
        <div className="border-t border-border-custom pt-4 text-center">
          <p className="text-xs text-slate-500 font-semibold">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="text-[#7C6CF2] hover:underline font-bold">
              Iniciar Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
