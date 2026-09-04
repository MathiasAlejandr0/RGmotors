"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Step = "login" | "change";

export default function AdminLoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("login");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (searchParams.get("change") === "1") {
      setStep("change");
      setInfo("Por seguridad debes cambiar el usuario y la contraseña por defecto.");
    }
    fetch("/api/auth")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.authenticated) return;
        if (data.mustChange) {
          setStep("change");
          setUsername(data.username || "admin");
          setInfo("Por seguridad debes cambiar el usuario y la contraseña por defecto.");
        } else {
          router.replace("/admin");
        }
      })
      .catch(() => {});
  }, [router, searchParams]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Credenciales incorrectas");
        return;
      }
      if (data.mustChange) {
        setStep("change");
        setInfo(
          "Primer acceso: crea un usuario y contraseña fuertes. No podrás usar el panel hasta hacerlo.",
        );
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas nuevas no coinciden.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change",
          currentUsername: username,
          currentPassword: password,
          newUsername,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo actualizar");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 text-center bg-black/30 border-b border-neutral-800">
          <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {step === "login" ? "Panel de Administración" : "Cambiar credenciales"}
          </h1>
          <p className="text-neutral-400 text-sm">
            {step === "login"
              ? "Ingresa con tu usuario y contraseña"
              : "Define un usuario y contraseña fuertes para proteger el panel"}
          </p>
        </div>

        {step === "login" ? (
          <form onSubmit={handleLogin} className="p-8 space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Usuario</label>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Contraseña</label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-black font-bold rounded-lg px-4 py-3 hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Validando…" : "Acceder"}
            </button>
            <p className="text-[11px] text-neutral-500 text-center leading-relaxed">
              Primer acceso: usuario <span className="text-neutral-300">admin</span>. Tras ingresar
              se exigirá cambiar usuario y contraseña.
            </p>
          </form>
        ) : (
          <form onSubmit={handleChange} className="p-8 space-y-4">
            {info && (
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 p-3 rounded-lg text-xs leading-relaxed">
                {info}
              </div>
            )}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Contraseña actual</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Nuevo usuario</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 text-white"
                placeholder="Ej: rg.operaciones"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Nueva contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 text-white"
                required
              />
              <p className="text-[10px] text-neutral-500">
                Mín. 10 caracteres, mayúscula, minúscula, número y símbolo. Usuario distinto a
                &quot;admin&quot;.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Confirmar contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 text-white"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-black font-bold rounded-lg px-4 py-3 disabled:opacity-50"
            >
              {loading ? "Guardando…" : "Guardar y entrar al panel"}
            </button>
          </form>
        )}
      </div>
      <div className="mt-8 text-center text-sm text-neutral-500">
        &copy; {new Date().getFullYear()} RG Motors
      </div>
    </div>
  );
}
