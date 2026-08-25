"use client";

import { useState, useEffect } from "react";
import Logo from "@/components/Logo";

const ADMIN_STORAGE_KEY = "rg_admin_auth";

export default function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (stored === "true") {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Clave predeterminada amigable "rgmotors2026" o "admin"
    if (password === "admin" || password === "rgmotors2026" || password === "1234") {
      try {
        localStorage.setItem(ADMIN_STORAGE_KEY, "true");
      } catch {}
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Contraseña incorrecta. (Prueba con: admin o rgmotors2026)");
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    } catch {}
    setIsAuthenticated(false);
  };

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950 text-white/50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-ink-950 via-black to-ink-900 px-4">
        <div className="w-full max-w-md rounded-3xl border border-white/15 bg-ink-900/80 p-8 backdrop-blur-2xl shadow-2xl animate-fade-up">
          <div className="text-center">
            <div className="inline-block transition-transform hover:scale-105">
              <Logo size={36} />
            </div>
            <h1 className="mt-4 text-xl font-bold tracking-tight text-white">
              Portal de Administración
            </h1>
            <p className="mt-1 text-xs text-white/50">
              Ingresa tu clave de acceso para gestionar el inventario y reservas.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-1.5">
                Clave de Administrador
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Ingresa la contraseña (ej: admin)"
                className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-brand-500 focus:bg-black/70"
                autoFocus
              />
            </div>

            {error && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="apple-btn-primary w-full rounded-xl py-3 text-sm font-bold text-white shadow-glow"
            >
              Ingresar al Panel
            </button>
          </form>

          <div className="mt-6 border-t border-white/10 pt-4 text-center">
            <a href="/" className="text-xs text-white/40 transition hover:text-white">
              ← Volver al sitio web principal
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hidden button or helper to logout if needed */}
      <div className="fixed bottom-4 left-4 z-40 lg:hidden">
        <button
          onClick={handleLogout}
          className="rounded-full bg-black/60 px-3 py-1.5 text-xs text-white/40 backdrop-blur border border-white/10 hover:text-white"
        >
          Cerrar sesión admin
        </button>
      </div>
      {children}
    </div>
  );
}
