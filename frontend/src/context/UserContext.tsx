"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { BACKEND_URL } from "@/config/api";

export interface UserResponse {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  plan_tier: string;
  credits: number;
  credits_total: number;
}

interface UserContextType {
  user: UserResponse | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      // Borrar de forma estricta los tokens y residuos
      localStorage.clear();
      sessionStorage.clear();
      
      // Expira las cookies configurando la fecha de expiración en el pasado
      document.cookie = "avendia_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "avendia_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "avendia_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      
      setUser(null);
      window.location.href = "/login";
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/users/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        console.warn("[AUTH] Sesión expirada o no autorizada (401). Cerrando sesión...");
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error("Error al obtener los datos de perfil.");
      }

      const data: UserResponse = await response.json();
      setUser(data);
      setError(null);
      localStorage.setItem("user", JSON.stringify(data));
    } catch (err: any) {
      console.error("[UserContext] Error al actualizar datos de usuario:", err);
      setError(err.message || "Fallo en la conexión");
      
      // Fallback a localStorage para resiliencia offline/red lenta
      const cached = localStorage.getItem("user");
      if (cached) {
        try {
          setUser(JSON.parse(cached));
        } catch (e) {
          console.error("[UserContext] Error parsing cached user:", e);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <UserContext.Provider value={{ user, loading, error, refreshUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser debe ser usado dentro de un UserProvider");
  }
  return context;
}
